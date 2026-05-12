import { NextResponse } from "next/server";
import { db, campaignsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { milestoneIndex } = await request.json();

    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, id)).limit(1);
    if (!campaign) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const update: Record<string, string> = {};
    if (milestoneIndex === 0) update.milestone1Released = "true";
    else if (milestoneIndex === 1) update.milestone2Released = "true";
    else if (milestoneIndex === 2) update.milestone3Released = "true";

    const [updated] = await db.update(campaignsTable).set(update).where(eq(campaignsTable.id, id)).returning();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to approve milestone", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
