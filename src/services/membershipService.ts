import { api } from './api';

export const membershipService = {
  async obtenerMembresiasPorUsuario(userId: number): Promise<any[]> {
    // Obtenemos todos los equipos
    const teamsResponse = await api.get('/teams');
    const allTeams = teamsResponse.data;
    
    const userMemberships: any[] = [];
    
    // Para cada equipo, verificamos si el usuario es miembro
    for (const team of allTeams) {
      try {
        const membersResponse = await api.get(`/teams/${team.id}/miembros`);
        const userMember = membersResponse.data.find((member: any) => 
          member.user.id === userId
        );
        
        if (userMember) {
          userMemberships.push({
            ...userMember,
            team: team
          });
        }
      } catch (error) {
        console.error(`Error obteniendo miembros del equipo ${team.id}:`, error);
      }
    }
    
    return userMemberships;
  },

  async salirDelEquipo(teamId: number, userId: number): Promise<void> {
    await api.delete(`/teams/${teamId}/miembros/${userId}`, { 
      data: { actorUserId: userId } 
    });
  },

  async obtenerMiembrosDelEquipo(teamId: number): Promise<any[]> {
    const response = await api.get(`/teams/${teamId}/miembros`);
    return response.data;
  }
};