import { NextResponse } from "next/server";
import { db, tokensTable, eventsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ wallet: string; eventId: string }> }
) {
  try {
    const { wallet, eventId } = await params;

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
    if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const tokens = await db.select().from(tokensTable).where(eq(tokensTable.eventId, eventId));
    const owned = tokens.filter((t) => t.currentOwner === wallet);
    const alreadyClaimed = owned.every((t) => t.revenueClaimed);
    const tokensClaimed = owned.length;

    const revenueShareSol =
      event.revenueReported && event.settledRevenue
        ? (event.settledRevenue * event.revenueShareBps / 10000) * (tokensClaimed / Math.max(tokens.length, 1))
        : 0;

    // Mark all owned tokens as claimed in the DB
    if (!alreadyClaimed && owned.length > 0) {
      for (const token of owned) {
        if (!token.revenueClaimed) {
          await db
            .update(tokensTable)
            .set({ revenueClaimed: true })
            .where(and(eq(tokensTable.eventId, eventId), eq(tokensTable.tokenId, token.tokenId)));
        }
      }
    }

    return NextResponse.json({
      eventId,
      wallet,
      tokensClaimed,
      revenueShareSol,
      alreadyClaimed,
    });
  } catch (err) {
    console.error("Failed to claim revenue", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
