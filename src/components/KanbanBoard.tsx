import React, { useState, useEffect } from 'react';
import { Task, Team } from '../types';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const estados = ['PENDIENTE', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];

  useEffect(() => {
    loadTeams();
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasksByTeam();
  }, [tasks, selectedTeam]);

  const loadTeams = async () => {
    if (!user) return;

    try {
      const myTeams = await teamService.getMyTeams(user.id);
      setTeams(myTeams);
      
      // Seleccionar el primer equipo por defecto si hay equipos
      if (myTeams.length > 0) {
        setSelectedTeam(myTeams[0].id);
      }
    } catch (err: any) {
      console.error('Error loading teams:', err);
    }
  };

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const tasksData = await taskService.getAll(user.id);
      setTasks(tasksData);
    } catch (err: any) {
      setError('Error al cargar las tareas');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTasksByTeam = () => {
    if (selectedTeam) {
      const filtered = tasks.filter(task => task.team.id === selectedTeam);
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  };

  const handleStateChange = async (taskId: number, newState: string) => {
    if (!user) return;

    try {
      await taskService.changeState(taskId, newState, user.id);
      await loadTasks(); // Recargar las tareas después del cambio
    } catch (err: any) {
      console.error('Error changing task state:', err);
      alert('Error al cambiar el estado de la tarea');
    }
  };

  const getTasksByState = (estado: string) => {
    return filteredTasks.filter(task => task.estado === estado);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '#f8f9fa';
      case 'EN_CURSO': return '#fff3cd';
      case 'FINALIZADA': return '#d1ecf1';
      case 'CANCELADA': return '#f8d7da';
      default: return '#f8f9fa';
    }
  };

  const getEstadoBorderColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '#6c757d';
      case 'EN_CURSO': return '#ffc107';
      case 'FINALIZADA': return '#17a2b8';
      case 'CANCELADA': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getSelectedTeamName = () => {
    if (!selectedTeam) return 'Todos los equipos';
    const team = teams.find(t => t.id === selectedTeam);
    return team ? team.name : 'Equipo no encontrado';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Cargando tareas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: 'red', 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header con filtros */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Tablero Kanban</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Mostrando: <strong>{getSelectedTeamName()}</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {/* Selector de equipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#333' }}>Filtrar por equipo:</label>
            <select
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '10px 15px',
                borderRadius: '6px',
                border: '2px solid #007bff',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '200px',
                fontSize: '14px'
              }}
            >
              <option value="">Todos los equipos</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={loadTasks}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {estados.map(estado => (
          <div key={estado} style={{
            backgroundColor: getEstadoColor(estado),
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            border: `2px solid ${getEstadoBorderColor(estado)}`
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: getEstadoBorderColor(estado) }}>
              {getTasksByState(estado).length}
            </div>
            <div style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
              {estado}
            </div>
          </div>
        ))}
      </div>
      
      {/* Tablero Kanban */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {estados.map(estado => (
          <div 
            key={estado}
            style={{ 
              padding: '15px', 
              backgroundColor: getEstadoColor(estado),
              borderRadius: '8px',
              minHeight: '500px',
              border: `2px solid ${getEstadoBorderColor(estado)}`
            }}
          >
            <h3 style={{ 
              margin: '0 0 15px 0',
              padding: '10px',
              backgroundColor: getEstadoBorderColor(estado),
              color: 'white',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              {estado} ({getTasksByState(estado).length})
            </h3>
            
            <div style={{ minHeight: '400px' }}>
              {getTasksByState(estado).map(task => (
                <div 
                  key={task.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    marginBottom: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${getEstadoBorderColor(estado)}`
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{task.title}</h4>
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '14px', 
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {task.description}
                  </p>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    <div><strong>Equipo:</strong> {task.team.name}</div>
                    <div><strong>Asignado a:</strong> {task.user.name}</div>
                    <div><strong>Prioridad:</strong> 
                      <span style={{ 
                        color: task.priority === 'alta' ? '#dc3545' : 
                               task.priority === 'media' ? '#ffc107' : '#28a745',
                        marginLeft: '5px'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  {/* Selector de estado */}
                  <select
                    value={task.estado}
                    onChange={(e) => handleStateChange(task.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {estados.map(estadoOption => (
                      <option key={estadoOption} value={estadoOption}>
                        {estadoOption}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              
              {getTasksByState(estado).length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  fontStyle: 'italic',
                  padding: '40px 20px',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  borderRadius: '4px'
                }}>
                  No hay tareas en este estado
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;