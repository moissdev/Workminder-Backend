// app/api/tasks/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { db } from '@/lib/db/mysql';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id } = await params;  

    const tareas = await db.query<any>(
      'SELECT id, estado FROM tareas WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (!tareas.length) {
      return NextResponse.json({ success: false, error: 'Tarea no encontrada' }, { status: 404 });
    }

    if (tareas[0].estado === 'completada') {
      return NextResponse.json({ success: false, error: 'La tarea ya está completada' }, { status: 400 });
    }

    await db.execute(
      `UPDATE tareas 
       SET estado = 'completada', completada_en = NOW(), actualizado_en = NOW()
       WHERE id = ? AND usuario_id = ?`,
      [id, userId]
    );

    return NextResponse.json({ success: true, message: 'Tarea marcada como completada' });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}