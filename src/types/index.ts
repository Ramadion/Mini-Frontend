export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  rol: "admin" | "user";
}

//export interface Team {
//  id: number;
//  name: string;
//  description?: string;
//  propietario: User;
//  fechaCreacion: string;
 // memberships?: any[];
 // tasks?: Task[];
//}
export interface Team {
  id: number;
  name: string;
  description?: string;
  propietario: User;
  fechaCreacion: string;
  memberships?: Membership[];  // ← Asegúrate de que esta propiedad esté definida
  tasks?: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  estado: "PENDIENTE" | "EN_CURSO" | "FINALIZADA" | "CANCELADA";
  priority: string;
  dueDate?: string;
  user: User;
  team: Team;
  fechaCreacion: string;
  etiquetas: Etiqueta[];
  historialEstados?: HistorialEstado[];
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
}