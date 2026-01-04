export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  category: string;
  notes: string;
  createdAt: string;
  completedAt: string | null;
}

export interface TimeBlock {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  color: string;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  milestones: Milestone[];
  createdAt: string;
  completedAt: string | null;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}
