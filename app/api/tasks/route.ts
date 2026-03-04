// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TasksService } from '@/services/TasksService';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * GET /api/tasks
 * Obtener todas las tareas del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') || undefined;
    const materiaId = searchParams.get('materia_id') || undefined;

    const tasks = await TasksService.getTasks(userId, {
      estado,
      materiaId
    });

    return NextResponse.json({
      success: true,
      data: tasks
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.message === 'Token inválido o expirado' ? 401 : 500 });
  }
}

/**
 * POST /api/tasks
 * Crear nueva tarea
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    const body = await request.json();

    // Validación básica
    if (!body.titulo || !body.fecha_entrega || !body.peso_calificacion) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos: titulo, fecha_entrega, peso_calificacion'
      }, { status: 400 });
    }

    const task = await TasksService.createTask(userId, body);

    return NextResponse.json({
      success: true,
      data: task
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.message === 'Token inválido o expirado' ? 401 : 400 });
  }
}