import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    const events = await db.select().from(eventsTable).where(eq(eventsTable.organizerWallet, wallet));

    const enriched = await Promise.all(
      events.map(async (event) => {
        const tokens = await db.select().from(tokensTable).where(eq(tokensTable.eventId, event.id));
        const soldCount = tokens.length;
        const capitalRaised = tokens.reduce((sum, t) => sum + t.currentPrice, 0);
        const maxPrice = tokens.reduce((max, t) => Math.max(max, t.currentPrice), 0);
        const nextTokenPriceSol =
          soldCount === 0 ? event.initialPriceSol : maxPrice * event.stepFactorBps / 10000;

        return {
          ...event,
          tokensRemaining: event.tokenCount - soldCount,
          nextTokenPriceSol,
          capitalRaisedSol: capitalRaised,
          tokensSold: soldCount,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Failed to get organizer events", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
