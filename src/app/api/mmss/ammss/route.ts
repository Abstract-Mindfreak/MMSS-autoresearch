import { NextRequest, NextResponse } from "next/server"
import { weaveContext } from "@/lib/mmss/context-weaver"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const params = payload.params ?? payload.context_data ?? payload
  return NextResponse.json(weaveContext(params))
}
