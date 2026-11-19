export const AVATAR_TONE = {
  mint: { bg: '#C3FDDC', fg: '#072A16' },
  soft: { bg: '#E7F8EE', fg: '#0A7A34' },
  cream: { bg: '#FFF2D4', fg: '#111111' },
  cloud: { bg: '#F0F0F0', fg: '#111111' },
} as const;

export type AvatarTone = keyof typeof AVATAR_TONE;

export type PhoneContact = {
  id: string;
  name: string;
  number: string;
  initial: string;
  tone: AvatarTone;
};

export const CONTACTS: PhoneContact[] = [
  { id: 'c1', name: '093566#', number: '093566#', initial: '0', tone: 'soft' },
  { id: 'c2', name: '24/7 Chat', number: '247', initial: '2', tone: 'mint' },
  { id: 'c3', name: '805-347-0534', number: '8053470534', initial: '8', tone: 'mint' },
  { id: 'c4', name: '866-644-0323', number: '8666440323', initial: '8', tone: 'soft' },
  { id: 'c5', name: '981-355-7487', number: '9813557487', initial: '9', tone: 'cream' },
  { id: 'c6', name: 'Aaryan Bhalu Psquare', number: '9810011122', initial: 'A', tone: 'cloud' },
  { id: 'c7', name: 'Pankaj P2', number: '9306754201', initial: 'P', tone: 'soft' },
];

export type CallKind = 'incoming' | 'outgoing' | 'missed' | 'spam';

export type CallRecord = {
  id: string;
  name: string;
  number: string;
  initial: string;
  tone: AvatarTone;
  ago: string;
  when: string;
  section: 'Recent' | 'Last week';
  kind: CallKind;
};

export const CALLS: CallRecord[] = [
  {
    id: 'h1',
    name: 'Ayush Psquare',
    number: '9811122233',
    initial: 'A',
    tone: 'soft',
    ago: '32m',
    when: 'Yesterday',
    section: 'Recent',
    kind: 'incoming',
  },
  {
    id: 'h2',
    name: 'Pankaj P2',
    number: '9306754201',
    initial: 'P',
    tone: 'cloud',
    ago: '18m',
    when: 'Yesterday',
    section: 'Recent',
    kind: 'incoming',
  },
  {
    id: 'h3',
    name: 'Equal AI Assistant',
    number: '1800123456',
    initial: 'E',
    tone: 'mint',
    ago: '',
    when: 'Yesterday',
    section: 'Recent',
    kind: 'missed',
  },
  {
    id: 'h4',
    name: 'Sundan Psquare',
    number: '9844455566',
    initial: 'S',
    tone: 'cream',
    ago: '2h',
    when: 'Tue',
    section: 'Last week',
    kind: 'outgoing',
  },
  {
    id: 'h5',
    name: 'Lovely Khu',
    number: '9900011122',
    initial: 'L',
    tone: 'soft',
    ago: '',
    when: 'Tue',
    section: 'Last week',
    kind: 'incoming',
  },
  {
    id: 'h6',
    name: '805-347-0534',
    number: '8053470534',
    initial: '8',
    tone: 'cream',
    ago: '',
    when: 'Mon',
    section: 'Last week',
    kind: 'spam',
  },
];

export const digitsOf = (value: string) => value.replace(/\D/g, '');
