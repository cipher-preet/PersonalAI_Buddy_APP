import { normalizePhoneNumber } from '../callSyncService';

describe('normalizePhoneNumber', () => {
  it.each([
    ['+91 98765-43210', '919876543210'],
    ['(987) 654-3210', '9876543210'],
    [' 020 1234 5678 ', '02012345678'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });

  it.each(['', '12345', '+1234567890123456'])(
    'rejects invalid number %s',
    input => {
      expect(normalizePhoneNumber(input)).toBeNull();
    },
  );
});
