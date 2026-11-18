import type { Space } from '../store/api/home';

let queuedSpace: Space | null = null;

export const queueSpaceOpen = (space: Space) => {
  queuedSpace = space;
};

export const readQueuedSpace = () => queuedSpace;

export const clearQueuedSpace = () => {
  queuedSpace = null;
};
