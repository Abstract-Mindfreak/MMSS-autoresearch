import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const tasks = await db.task.findMany({
    include: { comments: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const task = await db.task.create({
    data: {
      title: payload.title,
      description: payload.description ?? payload.title,
      status: payload.status ?? "pending",
      order: payload.order ?? 0,
    },
    include: { comments: true },
  })
  return NextResponse.json(task)
}
