import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { revenue } = await request.json();

    const [event] = await db
      .update(eventsTable)
      .set({ revenueReported: true, settledRevenue: revenue })
      .where(eq(eventsTable.id, id))
      .returning();

    if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const tokensForEvent = await db.select().from(tokensTable).where(eq(tokensTable.eventId, id));
    const soldCount = tokensForEvent.length;
    const nextTokenPriceSol = soldCount === 0 ? event.initialPriceSol : soldCount * event.stepFactorBps / 10000;

    return NextResponse.json({ ...event, tokensRemaining: event.tokenCount - soldCount, nextTokenPriceSol });
  } catch (err) {
    console.error("Failed to report revenue", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
