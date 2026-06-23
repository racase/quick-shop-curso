export interface User {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: User;
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

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
