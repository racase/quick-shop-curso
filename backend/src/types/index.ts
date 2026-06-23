export interface User {
  id: string;
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  rol: 'cliente' | 'administrador';
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  sub: string;
  email: string;
  rol: string;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellidos: string;
    rol: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
