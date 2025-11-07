import React, { useState, useEffect } from 'react';
import { Team, Membership, User } from '../types';
import { teamService } from '../services/teamService';
import { membershipService } from '../services/membershipService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [myMemberships, setMyMemberships] = useState<Membership[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<'PROPIETARIO' | 'MIEMBRO'>('MIEMBRO');
  const [addingUser, setAddingUser] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadMyTeams();
    loadAllUsers();
  }, []);

  const loadMyTeams = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Obtener equipos del usuario
      const myTeams = await teamService.getMyTeams(user.id);
      console.log('Equipos cargados:', myTeams); // Debug
      setTeams(myTeams);
      
      // Obtener membresías para saber el rol en cada equipo
      const membresias = await membershipService.obtenerMembresiasPorUsuario(user.id);
      console.log('Membresías cargadas:', membresias); // Debug
      setMyMemberships(membresias);
    } catch (err: any) {
      setError('Error al cargar tus equipos');
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await userService.getAll();
      console.log('Usuarios cargados:', users); // Debug
      setAllUsers(users);
    } catch (err: any) {
      console.error('Error loading users:', err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTeamName.trim()) return;

    try {
      await teamService.create(newTeamName, user.id);
      setNewTeamName('');
      setShowCreateForm(false);
      await loadMyTeams();
      alert('✅ Equipo creado exitosamente!');
    } catch (err: any) {
      alert('❌ Error al crear el equipo: ' + (err.response?.data?.message || 'Error desconocido'));
      console.error('Error creating team:', err);
    }
  };

  const handleLeaveTeam = async (teamId: number) => {
    if (!user) return;

    if (!window.confirm('¿Estás seguro de que quieres salir de este equipo?')) {
      return;
    }

    try {
      await membershipService.salirDelEquipo(teamId, user.id);
      alert('✅ Has salido del equipo exitosamente');
      await loadMyTeams();
    } catch (err: any) {
      alert('❌ Error al salir del equipo: ' + (err.response?.data?.message || 'Error desconocido'));
      console.error('Error leaving team:', err);
    }
  };

  const openAddUserModal = (team: Team) => {
    setSelectedTeam(team);
    setSelectedUser(null);
    setSelectedRole('MIEMBRO');
    setShowAddUserModal(true);
  };

  const handleAddUserToTeam = async () => {
    if (!selectedTeam || !selectedUser || !user) return;

    try {
      setAddingUser(true);
      await teamService.addUser(selectedTeam.id, selectedUser, selectedRole, user.id);
      alert('✅ Usuario agregado al equipo exitosamente!');
      setShowAddUserModal(false);
      await loadMyTeams(); // Recargar para ver los cambios
    } catch (err: any) {
      alert('❌ Error al agregar usuario: ' + (err.response?.data?.message || 'Error desconocido'));
      console.error('Error adding user to team:', err);
    } finally {
      setAddingUser(false);
    }
  };

  const getMyRoleInTeam = (teamId: number): string => {
    const membresia = myMemberships.find(m => m.team?.id === teamId);
    return membresia?.rol || 'MIEMBRO';
  };

  const isOwner = (teamId: number): boolean => {
    return getMyRoleInTeam(teamId) === 'PROPIETARIO';
  };

  // Obtener usuarios que no son miembros del equipo seleccionado
  const getAvailableUsers = (): User[] => {
    if (!selectedTeam) return allUsers;

    // Obtener IDs de miembros actuales del equipo
    const currentMemberIds = selectedTeam.memberships?.map(m => m.user?.id).filter(Boolean) || [];
    
    return allUsers.filter(user => 
      !currentMemberIds.includes(user.id) && 
      user.id !== selectedTeam.propietario?.id // Excluir al propietario original
    );
  };

  // Función segura para obtener el nombre del propietario
  const getOwnerName = (team: Team): string => {
    return team?.propietario?.name || 'Propietario no disponible';
  };

  // Función segura para obtener miembros
  const getMembersCount = (team: Team): number => {
    return team?.memberships?.length || 0;
  };

  // Función segura para obtener tareas
  const getTasksCount = (team: Team): number => {
    return team?.tasks?.length || 0;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Cargando tus equipos...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h2>Mis Equipos</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ➕ Crear Equipo
        </button>
      </div>

      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Formulario para crear equipo */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Crear Nuevo Equipo</h3>
            <form onSubmit={handleCreateTeam}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Nombre del equipo:
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                  placeholder="Ingresa el nombre del equipo"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Crear
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)} 
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agregar usuario al equipo */}
      {showAddUserModal && selectedTeam && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>
              Agregar Usuario a {selectedTeam?.name || 'Equipo'}
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Seleccionar Usuario:
              </label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Selecciona un usuario</option>
                {getAvailableUsers().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {getAvailableUsers().length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic', margin: '10px 0 0 0' }}>
                  No hay usuarios disponibles para agregar
                </p>
              )}
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Rol del usuario:
              </label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    value="MIEMBRO"
                    checked={selectedRole === 'MIEMBRO'}
                    onChange={(e) => setSelectedRole(e.target.value as 'MIEMBRO')}
                  />
                  <span>Miembro</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    value="PROPIETARIO"
                    checked={selectedRole === 'PROPIETARIO'}
                    onChange={(e) => setSelectedRole(e.target.value as 'PROPIETARIO')}
                  />
                  <span>Propietario</span>
                </label>
              </div>
              <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
                {selectedRole === 'PROPIETARIO' 
                  ? '⚠️ El usuario tendrá los mismos privilegios que tú en este equipo'
                  : 'El usuario podrá ver y trabajar en las tareas del equipo'
                }
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleAddUserToTeam}
                disabled={!selectedUser || addingUser}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: !selectedUser || addingUser ? '#6c757d' : '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: !selectedUser || addingUser ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {addingUser ? 'Agregando...' : 'Agregar Usuario'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddUserModal(false)} 
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de equipos */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {teams.map(team => {
          if (!team) return null; // Skip undefined teams
          
          const myRole = getMyRoleInTeam(team.id);
          const iAmOwner = isOwner(team.id);
          const membersCount = getMembersCount(team);
          const tasksCount = getTasksCount(team);
          
          return (
            <div key={team.id} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${iAmOwner ? '#28a745' : '#007bff'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>{team.name || 'Equipo sin nombre'}</h3>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: iAmOwner ? '#28a745' : '#6c757d',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {myRole}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <strong>👤 Propietario:</strong> 
                      <div style={{ color: '#666' }}>{getOwnerName(team)}</div>
                    </div>
                    <div>
                      <strong>👥 Miembros:</strong> 
                      <div style={{ color: '#666' }}>{membersCount} usuario(s)</div>
                    </div>
                    <div>
                      <strong>📋 Tareas:</strong> 
                      <div style={{ color: '#666' }}>{tasksCount} tarea(s)</div>
                    </div>
                  </div>

                  <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                    {team.fechaCreacion && `Creado: ${new Date(team.fechaCreacion).toLocaleDateString()}`}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '150px' }}>
                  {iAmOwner && (
                    <>
                      <button
                        onClick={() => openAddUserModal(team)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        👥 Agregar Usuario
                      </button>
                      <span style={{
                        padding: '6px 12px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        Eres Propietario
                      </span>
                    </>
                  )}
                  
                  {!iAmOwner && (
                    <button
                      onClick={() => handleLeaveTeam(team.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      🚪 Salir del Equipo
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de miembros (solo para propietarios) */}
              {iAmOwner && team.memberships && team.memberships.length > 0 && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                    Miembros del equipo:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {team.memberships.map((membership: any) => (
                      <div 
                        key={membership.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          backgroundColor: membership.rol === 'PROPIETARIO' ? '#e7f3ff' : '#f8f9fa',
                          border: `1px solid ${membership.rol === 'PROPIETARIO' ? '#b3d7ff' : '#dee2e6'}`,
                          borderRadius: '20px',
                          fontSize: '12px'
                        }}
                      >
                        <span style={{ 
                          fontWeight: 'bold',
                          color: membership.rol === 'PROPIETARIO' ? '#0066cc' : '#495057'
                        }}>
                          {membership.user?.name || 'Usuario desconocido'}
                        </span>
                        <span style={{ 
                          padding: '2px 6px',
                          backgroundColor: membership.rol === 'PROPIETARIO' ? '#0066cc' : '#6c757d',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '10px'
                        }}>
                          {membership.rol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {teams.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          color: '#666', 
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
          <h3 style={{ color: '#333' }}>No perteneces a ningún equipo</h3>
          <p style={{ marginBottom: '20px' }}>Crea tu primer equipo o pide que te agreguen a uno existente</p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Crear Primer Equipo
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;