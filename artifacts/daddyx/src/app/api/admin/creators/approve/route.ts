import { NextResponse } from "next/server";
import { db, creatorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { wallet } = await request.json();
    const [creator] = await db
      .update(creatorsTable)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(creatorsTable.wallet, wallet))
      .returning();

    if (!creator) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(creator);
  } catch (err) {
    console.error("Failed to approve creator", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
