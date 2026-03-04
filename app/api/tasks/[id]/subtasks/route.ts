// app/api/tasks/[id]/subtasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { db } from '@/lib/db/mysql';
import { z } from 'zod';

const createSubtaskSchema = z.object({
  titulo: z.string().min(1).max(200),
  indice_orden: z.number().int().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id: tareaId } = await params;  // ← await aquí

    const tareas = await db.query<any>(
      'SELECT id FROM tareas WHERE id = ? AND usuario_id = ?',
      [tareaId, userId]
    );

    if (!tareas.length) {
      return NextResponse.json({ success: false, error: 'Tarea no encontrada' }, { status: 404 });
    }

    const subtareas = await db.query<any>(
      'SELECT * FROM subtareas WHERE tarea_id = ? ORDER BY indice_orden',
      [tareaId]
    );

    return NextResponse.json({ success: true, data: subtareas });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id: tareaId } = await params;  

    const tareas = await db.query<any>(
      'SELECT id FROM tareas WHERE id = ? AND usuario_id = ?',
      [tareaId, userId]
    );

    if (!tareas.length) {
      return NextResponse.json({ success: false, error: 'Tarea no encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const validation = createSubtaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { titulo, indice_orden = 0 } = validation.data;

    await db.execute(
      `INSERT INTO subtareas (id, tarea_id, titulo, indice_orden)
       VALUES (UUID(), ?, ?, ?)`,
      [tareaId, titulo, indice_orden]
    );

    const subtareas = await db.query<any>(
      'SELECT * FROM subtareas WHERE tarea_id = ? ORDER BY indice_orden',
      [tareaId]
    );

    return NextResponse.json({ success: true, data: subtareas }, { status: 201 });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}