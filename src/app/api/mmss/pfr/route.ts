import { NextRequest, NextResponse } from "next/server"
import { fullReassemblyCycle } from "@/lib/mmss/pfr-engine"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const domain = payload.domain ?? "general"
  const params = payload.params ?? payload.problem_data ?? {}
  return NextResponse.json(fullReassemblyCycle(domain, params))
}
