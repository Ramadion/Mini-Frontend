// Utilidades para manejar fechas y avisos

export interface DueDateWarning {
  type: 'overdue' | 'due-today' | 'due-tomorrow' | 'due-soon' | 'none';
  message: string;
  color: string;
  backgroundColor: string;
}

export const getDueDateWarning = (dueDate: string | undefined, estado: string): DueDateWarning => {
  if (!dueDate || estado === 'FINALIZADA' || estado === 'CANCELADA') {
    return {
      type: 'none',
      message: '',
      color: '',
      backgroundColor: ''
    };
  }

  const today = new Date();
  const due = new Date(dueDate);
  const timeDiff = due.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Si la tarea está vencida
  if (daysDiff < 0) {
    return {
      type: 'overdue',
      message: `⚠️ Vencida hace ${Math.abs(daysDiff)} día${Math.abs(daysDiff) !== 1 ? 's' : ''}`,
      color: '#721c24',
      backgroundColor: '#f8d7da'
    };
  }

  // Si vence hoy
  if (daysDiff === 0) {
    return {
      type: 'due-today',
      message: '⚠️ Vence hoy',
      color: '#856404',
      backgroundColor: '#fff3cd'
    };
  }

  // Si vence mañana
  if (daysDiff === 1) {
    return {
      type: 'due-tomorrow',
      message: '⏳ Vence mañana',
      color: '#0c5460',
      backgroundColor: '#d1ecf1'
    };
  }

  // Si vence en los próximos 3 días
  if (daysDiff <= 3) {
    return {
      type: 'due-soon',
      message: `⏳ Vence en ${daysDiff} días`,
      color: '#155724',
      backgroundColor: '#d4edda'
    };
  }

  return {
    type: 'none',
    message: '',
    color: '',
    backgroundColor: ''
  };
};

export const isTaskUrgent = (dueDate: string | undefined, estado: string): boolean => {
  if (!dueDate || estado === 'FINALIZADA' || estado === 'CANCELADA') {
    return false;
  }

  const today = new Date();
  const due = new Date(dueDate);
  const timeDiff = due.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysDiff <= 3; // Considerar urgente si vence en 3 días o menos
};