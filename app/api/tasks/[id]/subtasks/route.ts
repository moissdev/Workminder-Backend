import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { SubtasksService } from '@/services/SubtasksService'
import { z } from 'zod'

const createSubtaskSchema = z.object({
  subtask_name: z.string().min(1, 'El nombre es requerido').max(200)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id: taskId } = await params
    const subtasks = await SubtasksService.getByTask(taskId, userId)
    return NextResponse.json({ success: true, data: subtasks })
  } catch (error: any) {
    const status = error.message.includes('Token') ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id: taskId } = await params
    const body = await request.json()

    const validation = createSubtaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const subtask = await SubtasksService.create(taskId, userId, validation.data.subtask_name)
    return NextResponse.json({ success: true, data: subtask }, { status: 201 })
  } catch (error: any) {
    const status = error.message.includes('Token') ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}