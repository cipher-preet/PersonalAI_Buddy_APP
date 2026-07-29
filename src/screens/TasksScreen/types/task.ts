export type TaskSection = {
  title: string;
  content: string;
};

export type TaskItem = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  status: string;
  priority: string;
  dueDate: string;
  updatedAt: string;
  createdAt: string;
  project: string;
  assignee: string;
  summary: string;
  subtasks: string[];
  sections: TaskSection[];
  description: string;
  actionItems: string[];
  relatedTasks: string[];
};
