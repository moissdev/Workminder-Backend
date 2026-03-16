import { supabase } from '@/lib/supabase/client'
import { calcularUrgencia } from '@/utils/urgency'

export class TasksService {
  static async getAll(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, subjects (id, subject_name, color)`)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (error) throw new Error(error.message)
    return data
  }

  static async getPrioritized(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, subjects (id, subject_name, color)`)
      .eq('user_id', userId)
      .neq('task_status', 'Completada')
      .order('due_date', { ascending: true })

    if (error) throw new Error(error.message)

    return data
      .map(task => ({
        ...task,
        urgency: calcularUrgencia(task.importance ?? 3, task.complexity ?? 3, task.due_date)
      }))
      .sort((a, b) => (b.urgency || 0) - (a.urgency || 0))
  }

  static async getById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subjects (id, subject_name, color),
        subtasks (subtask_id, subtask_name, is_completed),
        reminders (reminder_id, reminder_date)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async create(userId: string, data: {
    task_title: string
    extra_note?: string | null
    due_date: string
    importance?: number
    complexity?: number
    subject_id?: string | null
    subtasks?: { subtask_name: string }[]
    reminders?: { reminder_date: string }[]
  }) {
    const importance = data.importance ?? 3
    const complexity = data.complexity ?? 3
    const urgency = calcularUrgencia(importance, complexity, data.due_date)

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        task_title: data.task_title,
        extra_note: data.extra_note,
        due_date: data.due_date,
        importance,
        complexity,
        urgency,
        subject_id: data.subject_id ?? null,
        task_status: 'Pendiente'
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    if (data.subtasks && data.subtasks.length > 0) {
      const subtasksToInsert = data.subtasks.map(s => ({
        task_id: task.id,
        subtask_name: s.subtask_name,
        is_completed: false
      }))
      await supabase.from('subtasks').insert(subtasksToInsert)
    }

    if (data.reminders && data.reminders.length > 0) {
      const remindersToInsert = data.reminders.map(r => ({
        task_id: task.id,
        reminder_date: r.reminder_date
      }))
      await supabase.from('reminders').insert(remindersToInsert)
    }

    return this.getById(task.id, userId)
  }

  static async update(id: string, userId: string, data: any) {
    let updateData = { ...data }

    if (data.due_date || data.importance || data.complexity) {
      const { data: existing } = await supabase
        .from('tasks')
        .select('importance, complexity, due_date')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (existing) {
        const importance = data.importance ?? existing.importance ?? 3
        const complexity = data.complexity ?? existing.complexity ?? 3
        const dueDate = data.due_date ?? existing.due_date
        updateData.urgency = calcularUrgencia(importance, complexity, dueDate)
      }
    }

    if (data.task_status === 'Completada') {
      updateData.completed_at = new Date().toISOString()
    } else if (data.task_status === 'Pendiente' || data.task_status === 'Atrasada') {
      updateData.completed_at = null
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return task
  }

  static async complete(id: string, userId: string) {
    return this.update(id, userId, { task_status: 'Completada' })
  }

  static async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return true
  }
}