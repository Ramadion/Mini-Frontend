import React, { useState, useEffect } from 'react';
import { Team, Etiqueta, Membership } from '../types';
import { teamService } from '../services/teamService';
import { taskService } from '../services/taskService';
import { etiquetaService } from '../services/etiquetaService';
import { useAuth } from '../contexts/AuthContext';

const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [priority, setPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [dueDate, setDueDate] = useState('');
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<number[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [newEtiquetaNombre, setNewEtiquetaNombre] = useState('');
  const [newEtiquetaColor, setNewEtiquetaColor] = useState('#FF5733');
  const [showNewEtiqueta, setShowNewEtiqueta] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadTeams();
    loadEtiquetas();
  }, []);

  const loadTeams = async () => {
  if (!user) return;

  try {
    setLoading(true);
    const myTeams = await teamService.getMyTeams(user.id);
    
    // Cambio importante: Mostrar todos los equipos donde el usuario es miembro
    // const myTeams = teamsData.filter(team => 
    //   team.memberships?.some((m: Membership) => m.id === user.id)
    // );
    
  
    setTeams(myTeams);
    
    if (myTeams.length > 0) {
      setSelectedTeam(myTeams[0].id);
    }
  } catch (err: any) {
    console.error('Error loading teams:', err);
  } finally {
    setLoading(false);
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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !selectedTeam || !title.trim()) return;

  try {
    setSubmitLoading(true);
    
    // Primero, si hay una nueva etiqueta, crearla
    let etiquetasIds = [...selectedEtiquetas];
    if (showNewEtiqueta && newEtiquetaNombre.trim()) {
      try {
        const nuevaEtiqueta = await etiquetaService.create(newEtiquetaNombre, newEtiquetaColor);
        etiquetasIds.push(nuevaEtiqueta.id);
      } catch (err: any) {
        console.error('Error creando etiqueta:', err);
      }
    }

    // Crear la tarea CON dueDate
    const taskData = {
      title,
      description,
      teamId: selectedTeam,
      userId: user.id,
      priority,
      dueDate: dueDate || undefined,  // AGREGAR: Incluir dueDate
      etiquetasIds: etiquetasIds.length > 0 ? etiquetasIds : undefined
    };

    console.log('📤 Enviando datos al backend:', taskData); 

    await taskService.create(taskData);

    // Limpiar formulario
    setTitle('');
    setDescription('');
    setPriority('media');
    setDueDate('');  // AGREGAR: Limpiar fecha
    setSelectedEtiquetas([]);
    setNewEtiquetaNombre('');
    setNewEtiquetaColor('#FF5733');
    setShowNewEtiqueta(false);
    
    alert('✅ Tarea creada exitosamente!');
  } catch (err: any) {
    alert('❌ Error al crear la tarea: ' + (err.response?.data?.message || 'Error desconocido'));
    console.error('Error creating task:', err);
  } finally {
    setSubmitLoading(false);
  }
};

  const toggleEtiqueta = (etiquetaId: number) => {
    setSelectedEtiquetas(prev =>
      prev.includes(etiquetaId)
        ? prev.filter(id => id !== etiquetaId)
        : [...prev, etiquetaId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return '#dc3545';
      case 'media': return '#ffc107';
      case 'baja': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Cargando equipos...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2>Crear Nueva Tarea</h2>
      
      <form onSubmit={handleSubmit} style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Título: *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ingresa el título de la tarea"
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Descripción:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe la tarea (opcional)"
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Prioridad: *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'alta' | 'media' | 'baja')}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Fecha Límite:
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Equipo: *
          </label>
          <select
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(Number(e.target.value))}
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Seleccionar equipo</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

     

<div style={{ marginBottom: '30px' }}>
  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
    🏷️ Etiquetas:
  </label>
  
  {/* Etiquetas existentes */}
  <div style={{ marginBottom: '15px' }}>
    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
      Selecciona etiquetas existentes:
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {etiquetas.map(etiqueta => (
        <button
          key={etiqueta.id}
          type="button"
          onClick={() => toggleEtiqueta(etiqueta.id)}
          style={{
            padding: '8px 12px',
            backgroundColor: selectedEtiquetas.includes(etiqueta.id) ? etiqueta.color : '#f8f9fa',
            color: selectedEtiquetas.includes(etiqueta.id) ? 'white' : '#333',
            border: `2px solid ${etiqueta.color}`,
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          {etiqueta.nombre}
        </button>
      ))}
    </div>
  </div>

  {/* Crear nueva etiqueta */}
  <div>
    <button
      type="button"
      onClick={() => setShowNewEtiqueta(!showNewEtiqueta)}
      style={{
        padding: '10px 16px',
        backgroundColor: showNewEtiqueta ? '#6c757d' : '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '15px'
      }}
    >
      {showNewEtiqueta ? '❌ Cancelar nueva etiqueta' : '➕ Crear Nueva Etiqueta'}
    </button>

    {showNewEtiqueta && (
      <div style={{ 
        marginTop: '15px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Crear Nueva Etiqueta</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Nombre:
            </label>
            <input
              type="text"
              value={newEtiquetaNombre}
              onChange={(e) => setNewEtiquetaNombre(e.target.value)}
              placeholder="Nombre de la etiqueta"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Color:
            </label>
            <input
              type="color"
              value={newEtiquetaColor}
              onChange={(e) => setNewEtiquetaColor(e.target.value)}
              style={{ 
                width: '100%', 
                height: '42px',
                padding: '2px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
        
        {newEtiquetaNombre && (
          <div style={{ 
            padding: '10px',
            backgroundColor: newEtiquetaColor,
            color: 'white',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '15px'
          }}>
            Vista previa: {newEtiquetaNombre}
          </div>
        )}

        <button
          type="button"
          onClick={async () => {
            if (!newEtiquetaNombre.trim()) {
              alert('Por favor ingresa un nombre para la etiqueta');
              return;
            }

            try {
              const nuevaEtiqueta = await etiquetaService.create(newEtiquetaNombre, newEtiquetaColor);
              setEtiquetas(prev => [...prev, nuevaEtiqueta]);
              setSelectedEtiquetas(prev => [...prev, nuevaEtiqueta.id]);
              setNewEtiquetaNombre('');
              setNewEtiquetaColor('#FF5733');
              setShowNewEtiqueta(false);
              alert('✅ Etiqueta creada exitosamente!');
            } catch (err: any) {
              alert('❌ Error al crear la etiqueta: ' + (err.response?.data?.message || 'Error desconocido'));
              console.error('Error creating etiqueta:', err);
            }
          }}
          disabled={!newEtiquetaNombre.trim()}
          style={{
            padding: '10px 16px',
            backgroundColor: !newEtiquetaNombre.trim() ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !newEtiquetaNombre.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ✅ Crear y Seleccionar Etiqueta
        </button>
      </div>
    )}
  </div>
</div>
        
        <button 
          type="submit" 
          disabled={submitLoading || !selectedTeam}
          style={{ 
            width: '100%',
            padding: '15px', 
            backgroundColor: submitLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: submitLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease'
          }}
        >
          {submitLoading ? '⏳ Creando...' : '🚀 Crear Tarea'}
        </button>
      </form>

      {teams.length === 0 && (
        <div style={{ 
          marginTop: '30px', 
          padding: '30px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '12px',
          color: '#856404',
          textAlign: 'center',
          border: '1px solid #ffeaa7'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>📝 Primero crea un equipo</h3>
          <p style={{ margin: 0 }}>
            Necesitas crear al menos un equipo antes de poder crear tareas. 
            Ve a la pestaña "Equipos" para crear tu primer equipo.
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskForm;