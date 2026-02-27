// types/api.ts

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    nombre_completo: string;
    correo_electronico: string;
  };
}

export interface LoginRequest {
  correo_electronico: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombre_completo: string;
  correo_electronico: string;
  contrasena: string;
}

export interface CreateTaskRequest {
  materia_id?: string;
  titulo: string;
  descripcion?: string;
  fecha_entrega: string;
  peso_calificacion: number;
  nivel_complejidad?: number;
  tipo_tarea?: string;
  horas_estimadas?: number;
}