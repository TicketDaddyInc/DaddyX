import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable, priceHistoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const tokens = await db
      .select()
      .from(tokensTable)
      .where(eq(tokensTable.eventId, id))
      .orderBy(tokensTable.tokenId);

    const history = await db
      .select()
      .from(priceHistoryTable)
      .where(eq(priceHistoryTable.eventId, id))
      .orderBy(priceHistoryTable.round);

    const priceHistory = history.map((h) => ({
      round: h.round,
      price: h.price,
      wallet: h.wallet,
      timestamp: h.timestamp.toISOString(),
    }));

    const simulation = buildSimulation(event.initialPriceSol, event.stepFactorBps, event.payoutFactorBps);

    const soldCount = tokens.length;
    const tokensRemaining = event.tokenCount - soldCount;
    const nextTokenPriceSol =
      soldCount === 0
        ? event.initialPriceSol
        : tokens.reduce((max, t) => Math.max(max, t.currentPrice), 0) * event.stepFactorBps / 10000;
    const currentPriceLamports = Math.round(nextTokenPriceSol * 1_000_000_000);

    return NextResponse.json({
      event: { ...event, tokensRemaining, nextTokenPriceSol, currentPriceLamports },
      tokens,
      priceHistory,
      simulation,
    });
  } catch (err) {
    console.error("Failed to get event", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
