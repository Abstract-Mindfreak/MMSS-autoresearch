import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const specs = await db.mMSSSpec.findMany({
    include: { evaluations: true },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(specs)
}

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const spec = await db.mMSSSpec.create({
    data: {
      systemId: payload.systemId,
      title: payload.title,
      domain: payload.domain,
      purpose: payload.purpose,
      version: payload.version ?? "v1.0",
      specJson: payload.specJson,
      bestScore: payload.bestScore ?? 0,
    },
  })
  return NextResponse.json(spec)
}
