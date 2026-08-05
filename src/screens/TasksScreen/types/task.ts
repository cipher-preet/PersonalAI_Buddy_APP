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
  createdTime?: string;
  project: string;
  assignee: string;
  summary: string;
  evidence: unknown;
};
