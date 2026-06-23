import { getDatabase } from '../config/database';
import { User } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM users WHERE email = ?', email);
    return row ? this.mapRowToUser(row) : null;
  }

  static async findById(id: string): Promise<User | null> {
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM users WHERE id = ?', id);
    return row ? this.mapRowToUser(row) : null;
  }

  static async create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT INTO users (id, email, password, nombre, apellidos, rol, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userData.id, userData.email, userData.password, userData.nombre, userData.apellidos, userData.rol, now, now]
    );

    return {
      ...userData,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      nombre: row.nombre,
      apellidos: row.apellidos,
      rol: row.rol,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}
