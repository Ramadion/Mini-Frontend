import { api } from './api';
import { Task, CreateTaskData } from '../types';

export const taskService = {
  async getAll(userId: number): Promise<Task[]> {
    const response = await api.get(`/tasks/${userId}`);
    return response.data;
  },

  async create(taskData: CreateTaskData): Promise<Task> {
  const response = await api.post('/tasks', taskData);
  return response.data;
  },

  async update(id: number, userId: number, data: { 
    title?: string; 
    description?: string; 
    priority?: string;
    dueDate?: string;
  }): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, { userId, ...data });
    return response.data;
  },

  async delete(id: number, userId: number): Promise<void> {
    await api.delete(`/tasks/${id}`, { data: { userId } });
  },

  async changeState(taskId: number, estado: string, usuarioId: number): Promise<Task> {
    const response = await api.put(`/tareas/${taskId}/estado`, { estado, usuarioId });
    return response.data;
  },

  async getStateHistory(taskId: number): Promise<any[]> {
    const response = await api.get(`/tareas/${taskId}/historial`);
    return response.data;
  },

  async getByState(equipoId: number, estado: string): Promise<Task[]> {
    const response = await api.get(`/equipos/${equipoId}/tareas/${estado}`);
    return response.data;
  },
  
  async getTaskById(taskId: number): Promise<Task> {
  // Necesitarás crear este endpoint en el backend si no existe
  // Por ahora, podemos obtenerlo de la lista de tareas
  const allTasks = await this.getAll(1); // userId temporal
  const task = allTasks.find(t => t.id === taskId);
  if (!task) throw new Error("Tarea no encontrada");
  return task;
}

};