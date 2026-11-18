import { StyleSheet, TextStyle } from 'react-native';

import { fonts } from './fonts';

const TEXT_HINTS = new Set([
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textDecorationLine',
  'includeFontPadding',
]);

const familyForWeight = (weight: TextStyle['fontWeight']) => {
  switch (weight) {
    case '500':
    case 'medium':
      return fonts.medium;
    case '600':
    case 'semibold':
      return fonts.semibold;
    case '700':
    case 'bold':
    case '800':
    case '900':
      return fonts.bold;
    default:
      return fonts.regular;
  }
};

const withFont = (style: object) => {
  if (!style || typeof style !== 'object' || Array.isArray(style)) {
    return style;
  }

  const record = style as TextStyle;

  if (record.fontFamily === 'monospace' || record.fontFamily) {
    return style;
  }

  const isText = Object.keys(record).some(key => TEXT_HINTS.has(key));

  if (!isText) {
    return style;
  }

  return {
    ...record,
    fontFamily: familyForWeight(record.fontWeight),
  };
};

const originalCreate = StyleSheet.create.bind(StyleSheet);

StyleSheet.create = ((styles: Record<string, object>) => {
  const next: Record<string, object> = {};

  Object.keys(styles).forEach(key => {
    next[key] = withFont(styles[key]);
  });

  return originalCreate(next);
}) as typeof StyleSheet.create;
