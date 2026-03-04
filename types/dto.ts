// types/dto.ts

/**
 * DTOs para respuestas al frontend
 * Compatible con el modelo de Ayelen (Android/Kotlin)
 */

export type TaskStatusDTO = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'LATE';
export type TaskUrgencyDTO = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskComplexityDTO = 'Alta' | 'Media' | 'Baja';

/**
 * Tarea en formato frontend (simplificado)
 */
export interface TaskResponseDTO {
  id: string;
  title: string;
  subject: string;              // Nombre de la materia
  dueDate: string;              // Formato: "dd/MM/yyyy"
  status: TaskStatusDTO;
  urgency: TaskUrgencyDTO;      // Calculado por prioridad
  complexity: TaskComplexityDTO;
  notes: string;
  subtasks: string[];           // Array de títulos de subtareas
}

/**
 * Usuario en formato frontend
 */
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
}

/**
 * Estadísticas del dashboard
 */
export interface DashboardStatsDTO {
  userName: string;
  pendingCount: number;
  lateCount: number;
  completedCount: number;
  suggestedTasks: TaskResponseDTO[];
  thisWeekTasks: TaskResponseDTO[];
  nextWeekTasks: TaskResponseDTO[];
  laterTasks: TaskResponseDTO[];
}

/**
 * Request para crear tarea (completo - backend)
 */
export interface CreateTaskDTO {
  materia_id?: string;
  titulo: string;
  descripcion?: string;
  fecha_entrega: string;        // ISO 8601
  peso_calificacion: number;
  nivel_complejidad: number;    // 1-5
  tipo_tarea?: string;
  horas_estimadas?: number;
}

/**
 * Request para actualizar tarea
 */
export interface UpdateTaskDTO {
  titulo?: string;
  descripcion?: string;
  fecha_entrega?: string;
  peso_calificacion?: number;
  nivel_complejidad?: number;
  tipo_tarea?: string;
  horas_estimadas?: number;
  estado?: string;
}

/**
 * Response con metadata
 */
export interface ApiResponseWithMeta<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}