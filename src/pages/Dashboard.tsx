import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #ccc'
      }}>
        <h1>Mini Kanban - Dashboard</h1>
        <div>
          <span>Hola, {user?.name} </span>
          <button 
            onClick={logout}
            style={{ 
              marginLeft: '10px', 
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <div>
        <h2>Bienvenido al sistema Kanban</h2>
        <p>Esta es la vista principal. Aquí implementaremos el tablero Kanban.</p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px',
          marginTop: '30px'
        }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>PENDIENTE</h3>
            <p>Tareas pendientes aparecerán aquí</p>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
            <h3>EN CURSO</h3>
            <p>Tareas en progreso aparecerán aquí</p>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
            <h3>FINALIZADA</h3>
            <p>Tareas completadas aparecerán aquí</p>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
            <h3>CANCELADA</h3>
            <p>Tareas canceladas aparecerán aquí</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;