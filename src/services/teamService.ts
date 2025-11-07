import { api } from './api';
import { Team } from '../types';

export const teamService = {
  async getAll(): Promise<Team[]> {
    const response = await api.get('/teams');
    return response.data;
  },

  async getMyTeams(userId: number): Promise<Team[]> {
    // Primero obtenemos todos los equipos
    const allTeams = await this.getAll();
    const myTeams: Team[] = [];
    
    // Para cada equipo, verificamos si el usuario es miembro
    for (const team of allTeams) {
      try {
        const members = await this.listMembers(team.id);
        const isMember = members.some((member: any) => member.user.id === userId);
        if (isMember) {
          myTeams.push(team);
        }
      } catch (error) {
        console.error(`Error verificando membresía en equipo ${team.id}:`, error);
      }
    }
    
    return myTeams;
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
  }
};