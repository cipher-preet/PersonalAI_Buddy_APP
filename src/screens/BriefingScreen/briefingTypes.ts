export type AgendaKind = 'meeting' | 'reminder' | 'focus';

export type AgendaItem = {
  id: string;
  kind: AgendaKind;
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  prep?: string;
};

export type BriefingTaskPriority = 'High' | 'Medium' | 'Low';

export type BriefingTask = {
  id: string;
  title: string;
  space: string;
  priority: BriefingTaskPriority;
  done: boolean;
  reason?: string;
  due?: string;
  overdue?: boolean;
};

export type BriefingNote = {
  id: string;
  title: string;
  detail?: string;
};

export type BriefingView = {
  headline: string;
  summary: string;
  planDateKey: string;
  focus: BriefingNote[];
  agenda: AgendaItem[];
  tasks: BriefingTask[];
  followUps: BriefingNote[];
  risks: BriefingNote[];
  yesterday: {
    dateLabel: string;
    summary: string;
    stats: { completed: number; meetings: number; notes: number };
    highlights: BriefingNote[];
    decisions: BriefingNote[];
    completed: BriefingNote[];
    people: string[];
  };
};
