export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  createdAt: number;
  dueDate?: number;
  subtasks: SubTask[];
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string; // ISO string YYYY-MM-DD
}

export type FilterType = 'all' | 'todo' | 'completed';
