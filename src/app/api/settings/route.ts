import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })
  return NextResponse.json(config)
}

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: payload,
    create: { id: "main", ...payload },
  })
  return NextResponse.json(config)
}
