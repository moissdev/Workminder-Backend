// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TasksService } from '@/services/TasksService';
import { verifyAuth } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id: taskId } = await params;

    const task = await TasksService.getTaskById(userId, taskId);

    if (!task) {
      return NextResponse.json({
        success: false,
        error: 'Tarea no encontrada'
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 401 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id: taskId } = await params;
    const body = await request.json();

    const task = await TasksService.updateTask(userId, taskId, body);

    return NextResponse.json({ success: true, data: task });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.message === 'Tarea no encontrada' ? 404 : 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id: taskId } = await params;

    await TasksService.deleteTask(userId, taskId);

    return NextResponse.json({
      success: true,
      message: 'Tarea eliminada correctamente'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.message === 'Tarea no encontrada' ? 404 : 400 });
  }
}