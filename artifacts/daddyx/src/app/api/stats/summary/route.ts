import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const totalEventsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventsTable)
      .where(eq(eventsTable.daddyxEnabled, true));

    const totalTokensResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tokensTable);

    const totalEvents = totalEventsResult[0]?.count ?? 0;
    const totalTokensSold = totalTokensResult[0]?.count ?? 0;

    return NextResponse.json({ totalEvents, totalTokensSold });
  } catch (err) {
    console.error("Failed to get stats", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
