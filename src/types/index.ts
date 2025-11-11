export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  rol: "admin" | "user";
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  propietario: User;
  fechaCreacion: string;
  memberships?: Membership[];
  tasks?: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  estado: "PENDIENTE" | "EN_CURSO" | "FINALIZADA" | "CANCELADA";
  priority: "alta" | "media" | "baja";
  dueDate?: string;
  user: User;
  team: Team;
  fechaCreacion: string;
  etiquetas: Etiqueta[];
  historialEstados?: HistorialEstado[];
}

export interface Comment {
  id: number;
  contenido: string;
  usuario: User;
  tarea: Task;
  fechaCreacion: string;
}

export interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
  tareas?: Task[];
}

export interface HistorialEstado {
  id: number;
  tarea: Task;
  estadoAnterior: string;
  estadoNuevo: string;
  usuario: User;
  fecha: string;
}

export interface Membership {
  id: number;
  user: User;
  team: Team;
  rol: "PROPIETARIO" | "MIEMBRO";
  fechaIngreso: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateTeamData {
  name: string;
  propietarioId: number;
}

export interface CreateTaskData {
  title: string;
  description: string;
  teamId: number;
  userId: number;
  priority?: "alta" | "media" | "baja";
  dueDate?: string;  
  etiquetasIds?: number[];
}

export interface HistorialEstado {
  id: number;
  estadoAnterior: string;
  estadoNuevo: string;
  usuario: User;
  fecha: string;
  tarea: Task;
}