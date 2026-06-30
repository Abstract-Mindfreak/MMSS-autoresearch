import { NextRequest, NextResponse } from "next/server"
import { navigateScenario } from "@/lib/mmss/frp-navigator"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const params = payload.params ?? payload.scenario_data ?? payload
  return NextResponse.json(navigateScenario(params))
}
