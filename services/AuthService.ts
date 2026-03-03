// services/AuthService.ts
import bcrypt from 'bcrypt';
import { db } from '@/lib/db/mysql';
import { generateToken } from '@/lib/middleware/auth';
import type { Usuario } from '@/types/database';

export class AuthService {
  
  /**
   * Registrar nuevo usuario
   */
  static async register(
    nombreCompleto: string,
    correoElectronico: string,
    contrasena: string
  ) {
    // Verificar si el usuario ya existe
    const existingUser = await db.queryOne<Usuario>(
      'SELECT id FROM usuarios WHERE correo_electronico = ?',
      [correoElectronico]
    );

    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    // Insertar usuario
    const result = await db.execute(
      `INSERT INTO usuarios (nombre_completo, correo_electronico, contrasena_hash) 
       VALUES (?, ?, ?)`,
      [nombreCompleto, correoElectronico, contrasenaHash]
    );

    const userId = (result as any).insertId;

    // Obtener usuario creado
    const user = await db.queryOne<Usuario>(
      'SELECT id, nombre_completo, correo_electronico FROM usuarios WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('Error al crear usuario');
    }

    // Generar token
    const token = generateToken(user.id, user.correo_electronico);

    return {
      token,
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        correo_electronico: user.correo_electronico
      }
    };
  }

  /**
   * Login de usuario
   */
  static async login(correoElectronico: string, contrasena: string) {
    // Buscar usuario
    const user = await db.queryOne<Usuario>(
      'SELECT id, nombre_completo, correo_electronico, contrasena_hash FROM usuarios WHERE correo_electronico = ?',
      [correoElectronico]
    );

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(contrasena, user.contrasena_hash);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken(user.id, user.correo_electronico);

    return {
      token,
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        correo_electronico: user.correo_electronico
      }
    };
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(userId: string) {
    const user = await db.queryOne<Usuario>(
      'SELECT id, nombre_completo, correo_electronico, foto_perfil, notificaciones_activas FROM usuarios WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }
}