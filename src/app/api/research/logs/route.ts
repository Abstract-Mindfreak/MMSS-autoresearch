import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const logs = await db.researchLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json(logs)
}

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const log = await db.researchLog.create({ data: payload })
  return NextResponse.json(log)
}
