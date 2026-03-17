import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { TasksService } from '@/services/TasksService'
import { z } from 'zod'

const createTaskSchema = z.object({
  task_title: z.string().min(1, 'El título es requerido').max(200),
  extra_note: z.string().max(1000).optional().nullable(),
  due_date: z.string().min(1, 'La fecha de entrega es requerida'),
  importance: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().int().min(1).max(5).optional()),
  complexity: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().int().min(1).max(5).optional()),
  subject_id: z.preprocess((val) => (val === '' ? undefined : val), z.string().uuid().optional().nullable()),
  subtasks: z.array(z.object({ subtask_name: z.string() })).optional(),
  reminders: z.array(z.object({ reminder_date: z.string() })).optional()
})

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    const { searchParams } = new URL(request.url)
    const prioritized = searchParams.get('prioritized') === 'true'

    const tasks = prioritized
      ? await TasksService.getPrioritized(userId)
      : await TasksService.getAll(userId)

    return NextResponse.json({ success: true, data: tasks })
  } catch (error: any) {
    console.error('[GET /api/tasks] Error:', error.message)
    const status = error.message.includes('Token') ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    const body = await request.json()

    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      console.error('[POST /api/tasks] Validation Error:', validation.error.issues)
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const task = await TasksService.create(userId, validation.data)
    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/tasks] Error:', error.message)
    const status = error.message.includes('Token') ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
  })
}