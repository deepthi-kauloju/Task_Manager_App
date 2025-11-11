

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  priority?: Priority;
  subtasks?: Subtask[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type FilterType = 'all' | 'completed' | 'pending';

export type SortType = 'date-asc' | 'date-desc' | 'due-date-asc' | 'due-date-desc';