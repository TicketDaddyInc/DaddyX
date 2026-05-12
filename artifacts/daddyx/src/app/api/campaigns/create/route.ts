import { NextResponse } from "next/server";
import { db, campaignsTable, creatorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { creatorWallet, eventId, name, tokenCount, campaignDetailsUri } = await request.json();

    const [creator] = await db.select().from(creatorsTable).where(eq(creatorsTable.wallet, creatorWallet)).limit(1);
    if (!creator) return NextResponse.json({ error: "creator_not_found" }, { status: 404 });

    const [campaign] = await db
      .insert(campaignsTable)
      .values({
        creatorId: creator.id,
        eventId,
        name,
        tokenCount,
        campaignDetailsUri,
        status: "active",
        capitalRaisedSol: "0",
        milestone1Released: "false",
        milestone2Released: "false",
        milestone3Released: "false",
        milestone1Requested: "false",
        milestone2Requested: "false",
      })
      .returning();

    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    console.error("Failed to create campaign", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
