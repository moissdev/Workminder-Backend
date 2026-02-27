// types/database.ts

export interface Usuario {
  id: string;
  nombre_completo: string;
  correo_electronico: string;
  contrasena_hash: string;
  foto_perfil?: string;
  notificaciones_activas: boolean;
  creado_en: Date;
  actualizado_en: Date;
}

export interface PeriodoAcademico {
  id: string;
  usuario_id: string;
  nombre: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  es_activo: boolean;
  creado_en: Date;
}

export interface Materia {
  id: string;
  periodo_id: string;
  nombre: string;
  nombre_profesor?: string;
  creditos: number;
  color_hex: string;
  creado_en: Date;
}

export type TipoTarea = 'examen' | 'proyecto' | 'tarea' | 'laboratorio' | 'presentacion' | 'otro';
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'tarde';
export type NivelPrioridad = 'urgent' | 'important' | 'normal';

export interface Tarea {
  id: string;
  materia_id?: string;
  usuario_id: string;
  titulo: string;
  descripcion?: string;
  fecha_entrega: Date;
  peso_calificacion: number;
  nivel_complejidad: number;
  tipo_tarea: TipoTarea;
  horas_estimadas?: number;
  estado: EstadoTarea;
  completada_en?: Date;
  creado_en: Date;
  actualizado_en: Date;
}

export interface TareaPriorizada extends Tarea {
  materia_nombre?: string;
  materia_color?: string;
  dias_restantes: number;
  importancia: number;
  urgencia: number;
  prioridad_calculada: number;
  nivel_prioridad: NivelPrioridad;
}

export interface Subtarea {
  id: string;
  tarea_id: string;
  titulo: string;
  esta_completada: boolean;
  indice_orden: number;
  creado_en: Date;
}