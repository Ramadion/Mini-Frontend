import { api } from './api';
import { Team } from '../types';

export const teamService = {
  async getAll(): Promise<Team[]> {
    const response = await api.get('/teams');
    return response.data;
  },

  async getMyTeams(userId: number): Promise<Team[]> {
  try {
    console.log('Solicitando equipos para usuario:', userId); // DEBUG
    const response = await api.get(`/teams?userid=${userId}`);
    console.log('Respuesta de equipos:', response.data); // DEBUG
    
    // Procesar los equipos para asegurar que las membresías estén bien formadas
    const processedTeams = response.data.map((team: any) => ({
      ...team,
      memberships: team.memberships || [],
      tasks: team.tasks || []
    }));
    
    return processedTeams;
  } catch (error) {
    console.error('Error en getMyTeams:', error);
    throw error;
  }
},

  async getById(id: number): Promise<Team> {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  async create(name: string, propietarioId: number): Promise<Team> {
    const response = await api.post('/teams', { name, propietarioId });
    return response.data;
  },

  async update(id: number, name: string, actorUserId: number): Promise<Team> {
    const response = await api.put(`/teams/${id}`, { name, actorUserId });
    return response.data;
  },

  async delete(id: number, actorUserId: number): Promise<void> {
    await api.delete(`/teams/${id}`, { data: { actorUserId } });
  },

  async addUser(teamId: number, userId: number, rol: string, actorUserId: number): Promise<any> {
    const response = await api.post(`/teams/${teamId}/miembros`, { 
      userId, 
      rol, 
      actorUserId 
    });
    return response.data;
  },

  async listMembers(teamId: number): Promise<any[]> {
    const response = await api.get(`/teams/${teamId}/miembros`);
    return response.data;
  },

  async removeMember(teamId: number, userId: number, actorUserId: number): Promise<void> {
    await api.delete(`/teams/${teamId}/miembros/${userId}`, { 
      data: { actorUserId } 
    });
  },

  async changeMemberRole(teamId: number, userId: number, nuevoRol: string, actorUserId: number): Promise<any> {
    const response = await api.put(`/teams/${teamId}/miembros/${userId}`, { 
      nuevoRol, 
      actorUserId 
    });
    return response.data;
  },
  
  async salirDelEquipo(teamId: number, userId: number): Promise<void> {
  await api.delete(`/teams/${teamId}/miembros/${userId}`, { 
    data: { actorUserId: userId } 
  });
}

};