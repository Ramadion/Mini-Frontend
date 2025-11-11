import { api } from './api';

export interface HistorialEstado {
  id: number;
  estadoAnterior: string;
  estadoNuevo: string;
  usuario: {
    id: number;
    name: string;
    email: string;
  };
  fecha: string;
  tarea?: {
    id: number;
    title: string;
  };
}

export const historialEstadoService = {
  async getByTask(taskId: number): Promise<HistorialEstado[]> {
    try {
      console.log('📊 Obteniendo historial para tarea:', taskId);
      const response = await api.get(`/tareas/${taskId}/historial`);
      console.log('📊 Historial recibido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo historial:', error);
      throw error;
    }
  }
};