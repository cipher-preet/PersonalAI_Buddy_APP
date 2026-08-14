export type InsightItem = {
  id: string;
  source: string;
  sourceType: string;
  title: string;
  body: string;
  excerpt: string;
  whyItMatters: string;
  capturedAt: string;
  space: string;
  tags: string[];
};

export const insights: InsightItem[] = [
  {
    id: 'legal',
    source: 'From meeting notes',
    sourceType: 'Meeting notes',
    title: 'Launch date depends on legal review',
    body: 'The team agreed that legal approval is the only remaining dependency before confirming the public launch date.',
    excerpt:
      '“We cannot lock the public launch until Legal finishes review. Everything else is ready, so treat this as the only blocker.”',
    whyItMatters:
      'This helps you prioritize follow-up with Legal before confirming dates with the client or marketing.',
    capturedAt: 'Today · 10:42 AM',
    space: 'Product Launch',
    tags: ['Launch', 'Legal', 'Blocker'],
  },
  {
    id: 'budget',
    source: 'From task update',
    sourceType: 'Task update',
    title: 'Budget review is blocking vendor work',
    body: 'Finance asked to pause new vendor commitments until the quarterly budget is approved.',
    excerpt:
      '“Hold all new vendor POs until the quarterly budget is signed off. Current contracts can continue.”',
    whyItMatters:
      'Avoids starting vendor conversations that cannot move forward until finance approval is complete.',
    capturedAt: 'Yesterday · 4:15 PM',
    space: 'Finance',
    tags: ['Budget', 'Vendors', 'Finance'],
  },
  {
    id: 'client',
    source: 'From call summary',
    sourceType: 'Call summary',
    title: 'Client wants milestone clarity',
    body: 'The client asked for clearer delivery dates and weekly progress checkpoints before Friday.',
    excerpt:
      '“Please send a revised milestone plan with weekly checkpoints so we can track progress more clearly before Friday.”',
    whyItMatters:
      'Preparing a clear milestone plan before Friday keeps the client relationship confident and on track.',
    capturedAt: 'Monday · 2:05 PM',
    space: 'Client Work',
    tags: ['Client', 'Milestones', 'Follow-up'],
  },
];
