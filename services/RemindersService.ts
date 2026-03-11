import { supabase } from '@/lib/supabase/client'

export class RemindersService {
  static async getByTask(taskId: string, userId: string) {
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (!task) throw new Error('Tarea no encontrada o no autorizada')

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('task_id', taskId)

    if (error) throw new Error(error.message)
    return reminders
  }

  static async create(taskId: string, userId: string, reminder_date: string) {
    const { data: task } = await supabase
      .from('tasks')
      .select('id, due_date, created_at')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (!task) throw new Error('Tarea no encontrada o no autorizada')

    const remDate = new Date(reminder_date)
    const dueDate = new Date(task.due_date)
    const createdAt = task.created_at ? new Date(task.created_at) : new Date()

    if (remDate <= createdAt) {
      throw new Error('El recordatorio no puede ser antes de la creación de la tarea')
    }
    if (remDate >= dueDate) {
      throw new Error('El recordatorio no puede ser después de la fecha de entrega')
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        task_id: taskId,
        reminder_date
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return reminder
  }

  static async delete(id: string, userId: string) {
    const { data: reminder } = await supabase
      .from('reminders')
      .select('task_id')
      .eq('reminder_id', id)
      .single()

    if (!reminder) throw new Error('Recordatorio no encontrado')

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', reminder.task_id)
      .eq('user_id', userId)
      .single()

    if (!task) throw new Error('No autorizado')

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('reminder_id', id)

    if (error) throw new Error(error.message)
    return true
  }
}
