import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const aiProvider = payload.provider ?? "ollama"
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: { aiProvider },
    create: { id: "main", aiProvider },
  })
  return NextResponse.json(config)
}
