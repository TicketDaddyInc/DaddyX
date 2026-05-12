import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const tokens = await db.select().from(tokensTable).where(eq(tokensTable.eventId, id));
    const currentMaxPrice = tokens.reduce((max, t) => Math.max(max, t.currentPrice), 0);
    const nextPrice = currentMaxPrice * event.stepFactorBps / 10000;

    const holders = tokens.map((t) => ({
      tokenId: t.tokenId,
      wallet: t.currentOwner,
      entryPrice: t.entryPrice,
      currentPrice: t.currentPrice,
      unrealisedRoiPct: ((nextPrice - t.currentPrice) / t.currentPrice) * 100,
    }));

    return NextResponse.json(holders);
  } catch (err) {
    console.error("Failed to get holders", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
