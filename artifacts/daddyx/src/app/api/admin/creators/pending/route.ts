import { NextResponse } from "next/server";
import { db, creatorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const pending = await db.select().from(creatorsTable).where(eq(creatorsTable.status, "pending"));
    return NextResponse.json(pending);
  } catch (err) {
    console.error("Failed to list pending creators", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
