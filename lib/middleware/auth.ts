import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function verifyAuth(request: NextRequest): Promise<string> {
  // 1. Mostrar las cabeceras EXACTAS que está recibiendo Vercel
  const allHeaders = Object.fromEntries(request.headers.entries())
  console.log('[verifyAuth] Cabeceras entrantes completas:', JSON.stringify(allHeaders, null, 2))

  // 2. Extraer el header sin depender de mayúsculas o minúsculas
  const header = request.headers.get('Authorization') || request.headers.get('authorization')

  if (!header) {
    throw new Error('Token no proporcionado. Cabeceras recibidas: ' + Object.keys(allHeaders).join(', '))
  }

  if (!header.toLowerCase().startsWith('bearer ')) {
    throw new Error(`Formato de token incorrecto. Se recibió: ${header.substring(0, 15)}...`)
  }

  // 3. Extraer el JWT eliminando la palabra "Bearer " sin importar mayúsculas
  const token = header.substring(7).trim()

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.error('[verifyAuth] Error Supabase:', error?.message || 'No user')
    throw new Error(`Token inválido o expirado: ${error?.message || 'No user'}`)
  }

  return user.id
}