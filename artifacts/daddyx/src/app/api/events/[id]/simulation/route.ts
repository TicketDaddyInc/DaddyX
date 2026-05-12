import { NextResponse } from "next/server";
import { db, eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function buildSimulation(
  initialPrice: number,
  stepFactorBps: number,
  payoutFactorBps: number,
  platformFeeBps = 300,
  rounds = 20
) {
  const points = [];
  let price = initialPrice;
  let orgCumulative = 0;
  for (let i = 0; i < rounds; i++) {
    const buyerPays = price * stepFactorBps / 10000;
    const sellerGets = price * payoutFactorBps / 10000;
    const platformFee = buyerPays * platformFeeBps / 10000;
    const orgGets = buyerPays - sellerGets - platformFee;
    orgCumulative += orgGets;
    const investorROI = (payoutFactorBps / 10000 - 1) * 100;
    points.push({ n: i + 1, price: buyerPays, organizerCumulative: orgCumulative, investorROI });
    price = buyerPays;
  }
  return points;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json(buildSimulation(event.initialPriceSol, event.stepFactorBps, event.payoutFactorBps));
  } catch (err) {
    console.error("Failed to get simulation", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
