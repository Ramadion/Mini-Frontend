import React, { useState, useEffect } from 'react';
import { Task, Team, Etiqueta } from '../types';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { etiquetaService } from '../services/etiquetaService';
import { useAuth } from '../contexts/AuthContext';
import AsignarEtiquetasModal from './AsignarEtiquetasModal';
import TaskDetailsModal from './TaskDetailsModal';
import { getDueDateWarning, isTaskUrgent } from '../utils/dateUtils';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedEtiqueta, setSelectedEtiqueta] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'priority' | 'date'>('priority');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [showEtiquetasModal, setShowEtiquetasModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);

  const estados = ['PENDIENTE', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];

  useEffect(() => {
    loadTeams();
    loadEtiquetas();
    loadTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, selectedTeam, selectedEtiqueta, sortOrder]);

  const loadTeams = async () => {
    if (!user) return;

    try {
      const myTeams = await teamService.getMyTeams(user.id);
      setTeams(myTeams);
      
      if (myTeams.length > 0) {
        setSelectedTeam(myTeams[0].id);
      }
    } catch (err: any) {
      console.error('Error loading teams:', err);
    }
  };

  const loadEtiquetas = async () => {
    try {
      const etiquetasData = await etiquetaService.getAll();
      setEtiquetas(etiquetasData);
    } catch (err: any) {
      console.error('Error loading etiquetas:', err);
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

  const filterAndSortTasks = () => {
    let filtered = [...tasks];

    // Filtrar por equipo
    if (selectedTeam) {
      filtered = filtered.filter(task => task.team.id === selectedTeam);
    }

    // Filtrar por etiqueta
    if (selectedEtiqueta) {
      filtered = filtered.filter(task => 
        task.etiquetas?.some(etiqueta => etiqueta.id === selectedEtiqueta)
      );
    }

    // Ordenar tareas
    filtered = filtered.sort((a, b) => {
      if (sortOrder === 'priority') {
        const priorityOrder = { alta: 3, media: 2, baja: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else {
        // Ordenar por fecha de creación (más reciente primero)
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
      }
    });

    setFilteredTasks(filtered);
  };

  const handleStateChange = async (taskId: number, newState: string) => {
    if (!user) return;

    try {
      await taskService.changeState(taskId, newState, user.id);
      await loadTasks();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return '#dc3545';
      case 'media': return '#ffc107';
      case 'baja': return '#28a745';
      default: return '#6c757d';
    }
  };

  const openDetailsModal = (task: Task) => {
  setSelectedTaskForDetails(task);
  setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTaskForDetails(null);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'alta': return '🔴 Alta';
      case 'media': return '🟡 Media';
      case 'baja': return '🟢 Baja';
      default: return priority;
    }
  };

  const openEtiquetasModal = (task: Task) => {
    setSelectedTask(task);
    setShowEtiquetasModal(true);
  };

  const closeEtiquetasModal = () => {
    setShowEtiquetasModal(false);
    setSelectedTask(null);
  };

  const handleEtiquetasUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const getSelectedTeamName = () => {
    if (!selectedTeam) return 'Todos los equipos';
    const team = teams.find(t => t.id === selectedTeam);
    return team ? team.name : 'Equipo no encontrado';
  };

  const getSelectedEtiquetaName = () => {
    if (!selectedEtiqueta) return 'Todas las etiquetas';
    const etiqueta = etiquetas.find(e => e.id === selectedEtiqueta);
    return etiqueta ? etiqueta.nombre : 'Etiqueta no encontrada';
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
        alignItems: 'flex-start',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Tablero Kanban</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Mostrando: <strong>{getSelectedTeamName()}</strong> | {getSelectedEtiquetaName()}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {/* Selector de equipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>Equipo:</label>
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
          
          {/* Selector de etiqueta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>Etiqueta:</label>
            <select
              value={selectedEtiqueta || ''}
              onChange={(e) => setSelectedEtiqueta(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '10px 15px',
                borderRadius: '6px',
                border: '2px solid #28a745',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '200px',
                fontSize: '14px'
              }}
            >
              <option value="">Todas las etiquetas</option>
              {etiquetas.map(etiqueta => (
                <option key={etiqueta.id} value={etiqueta.id}>
                  {etiqueta.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de orden */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>Ordenar por:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'priority' | 'date')}
              style={{
                padding: '10px 15px',
                borderRadius: '6px',
                border: '2px solid #6c757d',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <option value="priority">Prioridad</option>
              <option value="date">Más reciente</option>
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
              minHeight: '600px',
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
            
            <div style={{ minHeight: '500px' }}>
              {getTasksByState(estado).map(task => (
                <div 
                  key={task.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    marginBottom: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${getEstadoBorderColor(estado)}`,
                    borderTop: `3px solid ${getPriorityColor(task.priority)}`
                  }}
                >
                  {/* Header de la tarea */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: '#333',
                      fontSize: '16px',
                      lineHeight: '1.3'
                    }}>
                      {task.title}
                    </h4>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                  {/* Fecha límite */}
                  {task.dueDate && (
                  <div style={{ 
                    marginBottom: '10px',
                    padding: '6px 10px',
                    backgroundColor: getDueDateWarning(task.dueDate, task.estado).backgroundColor,
                    borderRadius: '4px',
                    border: `1px solid ${getDueDateWarning(task.dueDate, task.estado).color}20`
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: getDueDateWarning(task.dueDate, task.estado).color,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                      {getDueDateWarning(task.dueDate, task.estado).message && (
                        <span style={{ 
                          marginLeft: '8px',
                          fontSize: '11px'
                        }}>
                          {getDueDateWarning(task.dueDate, task.estado).message}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                  {/* Descripción */}
                  {task.description && (
                    <p style={{ 
                      margin: '0 0 10px 0', 
                      fontSize: '13px', 
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      {task.description}
                    </p>
                  )}

                  {/* Etiquetas */}
                  {task.etiquetas && task.etiquetas.length > 0 && (
                    <div style={{ 
                      marginBottom: '12px', 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '5px' 
                    }}>
                      {task.etiquetas.map(etiqueta => (
                        <span
                          key={etiqueta.id}
                          style={{
                            padding: '3px 8px',
                            backgroundColor: etiqueta.color,
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}
                        >
                          {etiqueta.nombre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Información adicional */}
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#666', 
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    <div><strong>👥 Equipo:</strong> {task.team.name}</div>
                    <div><strong>👤 Asignado por:</strong> {task.user.name}</div>
                    <div><strong>📅 Creado:</strong> {new Date(task.fechaCreacion).toLocaleDateString()}</div>
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
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {estados.map(estadoOption => (
                      <option key={estadoOption} value={estadoOption}>
                        {estadoOption}
                      </option>
                    ))}
                  </select>
                  {/* Botón para asignar etiquetas */}
                  <button
                    onClick={() => openEtiquetasModal(task)}
                    style={{
                    width: '100%',
                    padding: '6px',
                    marginTop: '8px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold'
                    }}>
                    🏷️ Gestionar Etiquetas
                  </button>
                  <button
                  onClick={() => openDetailsModal(task)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginTop: '8px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  👁️ Ver Detalles
                </button>
                </div>
              ))}
              {/* Modal para asignar etiquetas */}
              {showEtiquetasModal && selectedTask && (
                <AsignarEtiquetasModal
                  isOpen={showEtiquetasModal}
                  onClose={closeEtiquetasModal}
                  task={selectedTask}
                  onEtiquetasUpdated={handleEtiquetasUpdated}
                />
              )}   
              {showDetailsModal && selectedTaskForDetails && (
              <TaskDetailsModal
                isOpen={showDetailsModal}
                onClose={closeDetailsModal}
                task={selectedTaskForDetails}
                onTaskUpdated={handleTaskUpdated}
              />
            )}    
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