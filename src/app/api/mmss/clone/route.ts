import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const sourceSystemId = String(payload.sourceSystemId ?? "").trim()
  const domain = String(payload.domain ?? payload.newTopicName ?? "").trim()

  if (!sourceSystemId || !domain) {
    return NextResponse.json({ error: "sourceSystemId and domain are required" }, { status: 400 })
  }

  const source = await db.mMSSSpec.findUnique({
    where: { systemId: sourceSystemId },
  })

  if (!source) {
    return NextResponse.json({ error: "Source MMSS spec not found" }, { status: 404 })
  }

  const clonedSystemId = `MMSS_${domain.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_v1_0`
  const spec = await db.mMSSSpec.create({
    data: {
      systemId: clonedSystemId,
      title: `${source.title} - ${domain}`,
      domain,
      purpose: `Cloned from ${source.systemId} for ${domain}`,
      version: source.version,
      specJson: source.specJson,
      bestScore: Number((source.bestScore * 0.92).toFixed(4)),
    },
  })

  return NextResponse.json(spec)
}
