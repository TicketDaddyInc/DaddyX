import { NextResponse } from "next/server";
import { db, eventsTable, tokensTable, priceHistoryTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tokenId, buyerWallet, priceSol, txSignature } = await request.json();

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const existing = await db
      .select()
      .from(tokensTable)
      .where(and(eq(tokensTable.eventId, id), eq(tokensTable.tokenId, tokenId)))
      .limit(1);

    let token;
    if (existing.length > 0) {
      [token] = await db
        .update(tokensTable)
        .set({ currentOwner: buyerWallet, currentPrice: priceSol, entryPrice: priceSol, txSignature })
        .where(and(eq(tokensTable.eventId, id), eq(tokensTable.tokenId, tokenId)))
        .returning();
    } else {
      [token] = await db
        .insert(tokensTable)
        .values({ eventId: id, tokenId, currentOwner: buyerWallet, currentPrice: priceSol, entryPrice: priceSol, txSignature })
        .returning();
    }

    const round = existing.length + 1;
    await db.insert(priceHistoryTable).values({ eventId: id, tokenId, wallet: buyerWallet, price: priceSol, round });

    return NextResponse.json(token);
  } catch (err) {
    console.error("Failed to record purchase", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
