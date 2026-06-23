import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/User';
import { hashPassword, verifyPassword } from '../utils/password';
import { JWT_CONFIG } from '../config/jwt';
import { User, JWTPayload, LoginResponse, RegisterRequest, LoginRequest } from '../types';

export class AuthService {
  static async register(data: RegisterRequest): Promise<User> {
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('EMAIL_EXISTS');
    }

    const hashedPassword = await hashPassword(data.password);
    
    const user = await UserModel.create({
      id: uuidv4(),
      email: data.email,
      password: hashedPassword,
      nombre: data.nombre,
      apellidos: data.apellidos,
      rol: 'cliente'
    });

    return user;
  }

  static async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValidPassword = await verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      token_type: 'Bearer',
      usuario: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        rol: user.rol
      }
    };
  }

  static async refresh(userId: string): Promise<{ access_token: string; token_type: string }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      token_type: 'Bearer'
    };
  }

  private static generateToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      rol: user.rol
    };

    return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
  }
}
