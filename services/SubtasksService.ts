import { supabase } from '@/lib/supabase/client'

export class SubtasksService {
  static async getByTask(taskId: string, userId: string) {
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (!task) throw new Error('Tarea no encontrada o no autorizada')

    const { data: subtasks, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)

    if (error) throw new Error(error.message)
    return subtasks
  }

  static async create(taskId: string, userId: string, subtask_name: string) {
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (!task) throw new Error('Tarea no encontrada o no autorizada')

    const { data: subtask, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        subtask_name,
        is_completed: false
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return subtask
  }

  static async update(id: string, userId: string, data: { subtask_name?: string, is_completed?: boolean }) {
    const { data: subtask } = await supabase
      .from('subtasks')
      .select('task_id')
      .eq('subtask_id', id)
      .single()

    if (!subtask) throw new Error('Subtarea no encontrada')

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', subtask.task_id)
      .eq('user_id', userId)
      .single()

    if (!task) throw new Error('No autorizado')

    const { data: updatedSubtask, error } = await supabase
      .from('subtasks')
      .update(data)
      .eq('subtask_id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return updatedSubtask
  }

  static async delete(id: string, userId: string) {
    const { data: subtask } = await supabase
      .from('subtasks')
      .select('task_id')
      .eq('subtask_id', id)
      .single()

    if (!subtask) throw new Error('Subtarea no encontrada')

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', subtask.task_id)
      .eq('user_id', userId)
      .single()

    if (!task) throw new Error('No autorizado')

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('subtask_id', id)

    if (error) throw new Error(error.message)
    return true
  }
}
