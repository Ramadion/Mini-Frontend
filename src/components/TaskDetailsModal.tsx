import React, { useState, useEffect } from 'react';
import { Task, Comment, User } from '../types';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import { getDueDateWarning, isTaskUrgent } from '../utils/dateUtils';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onTaskUpdated
}) => {
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const { user } = useAuth();

  // Estados para edición
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [editEstado, setEditEstado] = useState(task.estado);

  useEffect(() => {
    if (isOpen) {
      loadComments();
      setCurrentTask(task);
      resetEditFields();
    }
  }, [isOpen, task]);

  const loadComments = async () => {
  if (!user) return;
  
  try {
    setCommentLoading(true);
    console.log('🔄 Cargando comentarios para tarea:', task.id);
    
    const commentsData = await commentService.getByTask(task.id, user.id);
    console.log('✅ Comentarios cargados:', commentsData);
    
    setComments(commentsData);
  } catch (err: any) {
    console.error('❌ Error loading comments:', err);
    
    // Mostrar información detallada del error
    if (err.response) {
      console.error('❌ Error response:', err.response.data);
      console.error('❌ Error status:', err.response.status);
      alert(`Error ${err.response.status}: ${err.response.data?.message || 'Error del servidor'}`);
    } else if (err.request) {
      console.error('❌ No response received:', err.request);
      alert('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    } else {
      console.error('❌ Error configurando la petición:', err.message);
      alert('Error inesperado: ' + err.message);
    }
    
    // En caso de error, establecer comentarios vacíos
    setComments([]);
  } finally {
    setCommentLoading(false);
  }
  };

  const resetEditFields = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditEstado(task.estado);
    setEditing(false);
  };

  const handleSaveTask = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const updatedTask = await taskService.update(
        task.id, 
        user.id, 
        {
          title: editTitle,
          description: editDescription,
          priority: editPriority
        }
      );

      // Actualizar estado también si cambió
      if (editEstado !== task.estado) {
        await taskService.changeState(task.id, editEstado, user.id);
        // Recargar la tarea completa para tener el estado actualizado
        const fullUpdatedTask = await taskService.getAll(user.id).then(tasks => 
          tasks.find(t => t.id === task.id)
        );
        if (fullUpdatedTask) {
          setCurrentTask(fullUpdatedTask);
          onTaskUpdated(fullUpdatedTask);
        }
      } else {
        setCurrentTask(updatedTask);
        onTaskUpdated(updatedTask);
      }

      setEditing(false);
      alert('✅ Tarea actualizada exitosamente');
    } catch (err: any) {
      alert('❌ Error al actualizar la tarea: ' + (err.response?.data?.message || 'Error desconocido'));
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
  if (!user || !newComment.trim()) return;

  try {
    setCommentLoading(true);
    console.log('🔄 Agregando comentario:', newComment);
    
    await commentService.create(task.id, newComment, user.id);
    console.log('✅ Comentario agregado exitosamente');
    
    setNewComment('');
    await loadComments(); // Recargar comentarios
  } catch (err: any) {
    console.error('❌ Error al agregar comentario:', err);
    
    if (err.response) {
      alert('❌ Error al agregar comentario: ' + (err.response.data?.message || 'Error del servidor'));
    } else if (err.request) {
      alert('❌ No se pudo conectar con el servidor');
    } else {
      alert('❌ Error inesperado: ' + err.message);
    }
  } finally {
    setCommentLoading(false);
  }
};

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;

    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await commentService.delete(commentId, user.id);
      await loadComments(); // Recargar comentarios
      alert('✅ Comentario eliminado exitosamente');
    } catch (err: any) {
      alert('❌ Error al eliminar comentario: ' + (err.response?.data?.message || 'Error desconocido'));
      console.error('Error deleting comment:', err);
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'alta': return '🔴 Alta';
      case 'media': return '🟡 Media';
      case 'baja': return '🟢 Baja';
      default: return priority;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '#6c757d';
      case 'EN_CURSO': return '#17a2b8';
      case 'FINALIZADA': return '#28a745';
      case 'CANCELADA': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            {editing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  border: '2px solid #007bff',
                  borderRadius: '6px'
                }}
              />
            ) : (
              <h2 style={{ margin: 0, color: '#333' }}>{currentTask.title}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Columna izquierda - Información de la tarea */}
          <div>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Información de la Tarea</h3>
            
            {/* Descripción */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción:</label>
              {editing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #007bff',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#666', whiteSpace: 'pre-wrap' }}>
                  {currentTask.description || 'Sin descripción'}
                </p>
              )}
            </div>

            {/* Estado */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado:</label>
              {editing ? (
                <select
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value as "PENDIENTE" | "EN_CURSO" | "FINALIZADA" | "CANCELADA")}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #007bff',
                        borderRadius: '6px'
                    }}
                    >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="EN_CURSO">EN_CURSO</option>
                  <option value="FINALIZADA">FINALIZADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              ) : (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: getEstadoColor(currentTask.estado),
                  color: 'white',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {currentTask.estado}
                </span>
              )}
            </div>

            {/* Prioridad */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prioridad:</label>
              {editing ? (
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #007bff',
                    borderRadius: '6px'
                  }}
                >
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🔴 Alta</option>
                </select>
              ) : (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: getPriorityColor(currentTask.priority),
                  color: 'white',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {getPriorityText(currentTask.priority)}
                </span>
              )}
            </div>

            {/* Fecha límite */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Fecha Límite:
                {isTaskUrgent(currentTask.dueDate, currentTask.estado) && (
                  <span style={{ 
                    marginLeft: '8px',
                    color: '#dc3545',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ⚠️ ATENCIÓN
                  </span>
                )}
              </label>
              {editing ? (
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #007bff',
                    borderRadius: '6px'
                  }}
                />
              ) : (
                <div>
                  <div style={{ 
                    color: '#666',
                    marginBottom: currentTask.dueDate ? '8px' : '0'
                  }}>
                    {currentTask.dueDate 
                      ? new Date(currentTask.dueDate).toLocaleDateString() 
                      : 'Sin fecha límite'
                    }
                  </div>
                  
                  {/* Aviso de fecha límite */}
                  {currentTask.dueDate && getDueDateWarning(currentTask.dueDate, currentTask.estado).message && (
                    <div style={{
                      padding: '10px',
                      backgroundColor: getDueDateWarning(currentTask.dueDate, currentTask.estado).backgroundColor,
                      color: getDueDateWarning(currentTask.dueDate, currentTask.estado).color,
                      border: `1px solid ${getDueDateWarning(currentTask.dueDate, currentTask.estado).color}40`,
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {getDueDateWarning(currentTask.dueDate, currentTask.estado).message}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Información del equipo y usuario */}
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>👥 Equipo:</strong> 
                <div style={{ color: '#666' }}>{currentTask.team.name}</div>
              </div>
              <div>
                <strong>👤 Creada por:</strong> 
                <div style={{ color: '#666' }}>{currentTask.user.name}</div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                <strong>📅 Creada:</strong> {new Date(currentTask.fechaCreacion).toLocaleDateString()}
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✏️ Editar Tarea
                  </button>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveTask}
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: loading ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                  <button
                    onClick={resetEditFields}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Columna derecha - Comentarios */}
          <div>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Comentarios</h3>
            
            {/* Lista de comentarios */}
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              marginBottom: '20px',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '15px'
            }}>
              {commentLoading ? (
                <div style={{ textAlign: 'center', color: '#666' }}>Cargando comentarios...</div>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  No hay comentarios aún
                </div>
              ) : (
                comments.map(comment => (
                  <div 
                    key={comment.id}
                    style={{
                      padding: '12px',
                      marginBottom: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      borderLeft: '4px solid #007bff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ color: '#333' }}>{comment.usuario.name}</strong>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(comment.fechaCreacion).toLocaleDateString()} a las {new Date(comment.fechaCreacion).toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#333', whiteSpace: 'pre-wrap' }}>
                      {comment.contenido}
                    </p>
                    
                    {/* Botón eliminar comentario (solo para el autor) */}
                    {comment.usuario.id === user?.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{
                          marginTop: '8px',
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Formulario para nuevo comentario */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nuevo Comentario:
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Escribe tu comentario..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  resize: 'vertical',
                  marginBottom: '10px'
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || commentLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !newComment.trim() || commentLoading ? '#6c757d' : '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !newComment.trim() || commentLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {commentLoading ? 'Enviando...' : '💬 Enviar Comentario'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;