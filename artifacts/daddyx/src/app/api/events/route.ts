import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

function buildEnriched(event: typeof eventsTable.$inferSelect, tokens: (typeof tokensTable.$inferSelect)[]) {
  const soldCount = tokens.length;
  const tokensRemaining = event.tokenCount - soldCount;
  const nextTokenPriceSol =
    soldCount === 0
      ? event.initialPriceSol
      : Math.max(...tokens.map((t) => t.currentPrice)) * event.stepFactorBps / 10000;
  const currentPriceLamports = Math.round(nextTokenPriceSol * 1_000_000_000);
  return { ...event, tokensRemaining, nextTokenPriceSol, currentPriceLamports };
}

export async function GET() {
  try {
    const events = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.daddyxEnabled, true))
      .orderBy(desc(eventsTable.eventDate));

    const enriched = await Promise.all(
      events.map(async (event) => {
        const tokens = await db
          .select()
          .from(tokensTable)
          .where(eq(tokensTable.eventId, event.id))
          .orderBy(desc(tokensTable.currentPrice));
        return buildEnriched(event, tokens);
      })
    );

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Failed to list events", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      eventConfigPda, name, venueName, eventDate, organizerWallet,
      revenueShareBps, initialPriceSol, stepFactorBps, payoutFactorBps,
      tokenCount, daddyxEnabled, description, imageUrl, endDate,
    } = await request.json();

    const [event] = await db
      .insert(eventsTable)
      .values({
        eventConfigPda,
        name,
        venueName,
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
        organizerWallet,
        revenueShareBps: revenueShareBps ?? 2000,
        initialPriceSol: initialPriceSol ?? 0.05,
        stepFactorBps: stepFactorBps ?? 15000,
        payoutFactorBps: payoutFactorBps ?? 12000,
        tokenCount: tokenCount ?? 100,
        daddyxEnabled: daddyxEnabled ?? true,
        description,
        imageUrl,
      })
      .returning();

    return NextResponse.json(
      { ...event, tokensRemaining: event.tokenCount, nextTokenPriceSol: event.initialPriceSol },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create event", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
