import { NextResponse } from "next/server";
import { db, creatorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { wallet, name, organization, country, city, website, email, pastEvents, expectedUse } = await request.json();

    const existing = await db.select().from(creatorsTable).where(eq(creatorsTable.wallet, wallet)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "already_applied", message: "Wallet already has an application" }, { status: 409 });
    }

    const [creator] = await db
      .insert(creatorsTable)
      .values({ wallet, name, organization, country, city, website, email, pastEvents, expectedUse, status: "pending" })
      .returning();

    return NextResponse.json(creator, { status: 201 });
  } catch (err) {
    console.error("Failed to apply as creator", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
