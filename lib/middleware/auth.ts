import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function verifyAuth(request: NextRequest): Promise<string> {
  const header = request.headers.get('Authorization')

  if (!header || !header.startsWith('Bearer ')) {
    throw new Error('Token no proporcionado')
  }

  const token = header.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('Token inválido o expirado')
  }

  return user.id
}