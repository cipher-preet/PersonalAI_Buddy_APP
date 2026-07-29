export type NoteSection = {
  title: string;
  content: string;
};

export type NoteItem = {
  id: string;
  tag: string;
  title: string;
  desc: string;
  time: string;
  updatedAt: string;
  createdAt: string;
  workspace: string;
  readTime: string;
  tags: string[];
  summary: string;
  highlights: string[];
  sections: NoteSection[];
  actionItems: string[];
  body: string;
  relatedNotes: string[];
};
