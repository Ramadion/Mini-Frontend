import { api } from './api';
import { LoginData, AuthResponse, User } from '../types';

export const authService = {
  async login(loginData: LoginData): Promise<AuthResponse> {
    console.log('Enviando petición de login:', loginData); // Debug
    try {
      const response = await api.post('/auth/login', loginData);
      console.log('Respuesta del login:', response.data); // Debug
      return response.data;
    } catch (error: any) {
      console.error('Error en authService.login:', error); // Debug
      throw error;
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    console.log('Datos de autenticación guardados'); // Debug
  }
};