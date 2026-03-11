import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { RemindersService } from '@/services/RemindersService'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params
    await RemindersService.delete(id, userId)
    return NextResponse.json({ success: true, message: 'Recordatorio eliminado' })
  } catch (error: any) {
    const status = error.message.includes('Token') ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}