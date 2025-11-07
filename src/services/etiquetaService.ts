import { api } from './api';
import { Etiqueta } from '../types';

export const etiquetaService = {
  async getAll(): Promise<Etiqueta[]> {
    const response = await api.get('/etiquetas');
    return response.data;
  },

  async getById(id: number): Promise<Etiqueta> {
    const response = await api.get(`/etiquetas/${id}`);
    return response.data;
  },

  async create(nombre: string, color: string): Promise<Etiqueta> {
    const response = await api.post('/etiquetas', { nombre, color });
    return response.data;
  },

  async update(id: number, nombre: string, color: string): Promise<Etiqueta> {
    const response = await api.put(`/etiquetas/${id}`, { nombre, color });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/etiquetas/${id}`);
  },

  async assignToTask(tareaId: number, etiquetasIds: number[], usuarioId: number): Promise<any> {
    const response = await api.put(`/tareas/${tareaId}/etiquetas`, { 
      etiquetasIds, 
      usuarioId 
    });
    return response.data;
  },

  async removeFromTask(tareaId: number, etiquetaId: number, usuarioId: number): Promise<any> {
    const response = await api.delete(`/tareas/${tareaId}/etiquetas/${etiquetaId}`, { 
      data: { usuarioId } 
    });
    return response.data;
  },

  async getTaskEtiquetas(tareaId: number): Promise<Etiqueta[]> {
    const response = await api.get(`/tareas/${tareaId}/etiquetas`);
    return response.data;
  },

  async getTareasByEtiqueta(etiquetaId: number, usuarioId: number): Promise<any[]> {
    const response = await api.post(`/etiquetas/${etiquetaId}/tareas`, { usuarioId });
    return response.data;
  }
};