import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { testService } from '../services/testService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar conexión con el backend al cargar el componente
    const checkBackendConnection = async () => {
      const connected = await testService.testConnection();
      setBackendConnected(connected);
    };
    
    checkBackendConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Intentando login con:', { email, password });
      await login({ email, password });
      console.log('Login exitoso');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Error del servidor'}`);
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setError('Error inesperado: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestUser = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>Iniciar Sesión</h2>
      
      {/* Estado de conexión con el backend */}
      {backendConnected !== null && (
        <div style={{ 
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: backendConnected ? '#d4edda' : '#f8d7da',
          color: backendConnected ? '#155724' : '#721c24',
          border: `1px solid ${backendConnected ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {backendConnected ? '✅ Conectado al backend' : '❌ No se puede conectar al backend'}
        </div>
      )}

      {/* Botón para llenar datos de prueba */}
      <button 
        type="button" 
        onClick={fillTestUser}
        style={{ 
          marginBottom: '15px', 
          padding: '8px 12px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Usuario de Prueba
      </button>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || backendConnected === false}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: (loading || backendConnected === false) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || backendConnected === false) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default Login;