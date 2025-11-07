import { api } from './api';

export const testService = {
  async testConnection(): Promise<boolean> {
    try {
      const response = await api.get('/');
      console.log('Conexión exitosa con el backend:', response.data);
      return true;
    } catch (error) {
      console.error('No se pudo conectar con el backend:', error);
      return false;
    }
  }
};