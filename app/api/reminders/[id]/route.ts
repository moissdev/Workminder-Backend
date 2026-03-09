import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { supabase } from '@/lib/supabase/client'
import { z } from 'zod'

const createReminderSchema = z.object({
  reminder_datetime: z.string().datetime({ message: 'Formato de fecha inválido, usa ISO 8601' })
})

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
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // Verificar que la tarea pertenece al usuario
    const { data: task } = await supabase
      .from('tasks')
      .select('id, due_date, created_at')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    const reminderDate = new Date(validation.data.reminder_datetime)
    const dueDate = new Date(task.due_date) 
    const createdAt = task.created_at ? new Date(task.created_at) : new Date()

    // Validar que el recordatorio no sea antes de la creación de la tarea
    if (reminderDate <= createdAt) {
      return NextResponse.json(
        { success: false, error: 'El recordatorio no puede ser antes de la fecha de creación de la tarea' },
        { status: 400 }
      )
    }

    // Validar que el recordatorio no sea después de la fecha de entrega
    if (reminderDate >= dueDate) {
      return NextResponse.json(
        { success: false, error: 'El recordatorio no puede ser después de la fecha de entrega' },
        { status: 400 }
      )
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        task_id: taskId,
        reminder_datetime: validation.data.reminder_datetime
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data: reminder }, { status: 201 })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params

    // Verificar propiedad via tarea padre
    const { data: reminder } = await supabase
      .from('reminders')
      .select('reminder_id, task_id')
      .eq('reminder_id', id)
      .single()

    if (!reminder) {
      return NextResponse.json(
        { success: false, error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', reminder.task_id)
      .eq('user_id', userId)
      .single()

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('reminder_id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, message: 'Recordatorio eliminado' })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}