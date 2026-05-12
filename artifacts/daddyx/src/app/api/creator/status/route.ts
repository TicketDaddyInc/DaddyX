import { NextRequest, NextResponse } from "next/server";
import { db, creatorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

    const [creator] = await db.select().from(creatorsTable).where(eq(creatorsTable.wallet, wallet)).limit(1);
    if (!creator) return NextResponse.json({ error: "not_found", message: "No application found for this wallet" }, { status: 404 });

    return NextResponse.json(creator);
  } catch (err) {
    console.error("Failed to get creator status", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
