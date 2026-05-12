import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    const tokens = await db.select().from(tokensTable).where(eq(tokensTable.currentOwner, wallet));

    const portfolio = await Promise.all(
      tokens.map(async (t) => {
        const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, t.eventId)).limit(1);
        if (!event) return null;

        const allEventTokens = await db.select().from(tokensTable).where(eq(tokensTable.eventId, t.eventId));
        const maxPrice = allEventTokens.reduce((max, tok) => Math.max(max, tok.currentPrice), 0);
        const nextPrice = maxPrice * event.stepFactorBps / 10000;
        const unrealisedRoiPct = t.currentPrice > 0 ? ((nextPrice - t.currentPrice) / t.currentPrice) * 100 : 0;

        return {
          tokenId: t.tokenId,
          eventId: t.eventId,
          eventName: event.name,
          eventDate: event.eventDate.toISOString(),
          entryPrice: t.entryPrice,
          currentPrice: t.currentPrice,
          unrealisedRoiPct,
          revenueClaimed: t.revenueClaimed,
          settled: event.revenueReported,
          settledRevenue: event.settledRevenue,
          revenueShareBps: event.revenueShareBps,
          tokenCount: event.tokenCount,
        };
      })
    );

    return NextResponse.json(portfolio.filter(Boolean));
  } catch (err) {
    console.error("Failed to get portfolio", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
