import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { RemindersService } from '@/services/RemindersService'
import { z } from 'zod'

const createReminderSchema = z.object({
  reminder_date: z.string().datetime({ message: 'Formato de fecha inválido, usa ISO 8601' })
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id: taskId } = await params
    const reminders = await RemindersService.getByTask(taskId, userId)
    return NextResponse.json({ success: true, data: reminders })
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

    const validation = createReminderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const reminder = await RemindersService.create(taskId, userId, validation.data.reminder_date)
    return NextResponse.json({ success: true, data: reminder }, { status: 201 })
  } catch (error: any) {
    const status = error.message.includes('Token') ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}