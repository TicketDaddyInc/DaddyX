import { NextResponse } from "next/server";
import { db, eventsTable } from "@workspace/db";
import { eq, and, lt } from "drizzle-orm";

export async function GET() {
  try {
    const now = new Date();
    const events = await db
      .select()
      .from(eventsTable)
      .where(
        and(
          eq(eventsTable.revenueReported, false),
          eq(eventsTable.cancelled, false),
          eq(eventsTable.daddyxEnabled, true),
          lt(eventsTable.eventDate, now)
        )
      );
    return NextResponse.json(
      events.map((e) => ({ ...e, tokensRemaining: e.tokenCount, nextTokenPriceSol: e.initialPriceSol }))
    );
  } catch (err) {
    console.error("Failed to get oracle pending", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
