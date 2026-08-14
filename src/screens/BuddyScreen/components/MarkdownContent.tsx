import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; text: string }
  | { type: 'hr' }
  | { type: 'tags'; items: string[] };

type InlinePart =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string }
  | { type: 'tag'; value: string };

const INLINE_REGEX =
  /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+?`|\*[^*\n]+?\*|_[^_\n]+?_|#[A-Za-z][\w-]{1,24}|\[[A-Za-z][\w\s-]{0,24}\])/g;

const parseInline = (input: string): InlinePart[] => {
  const parts: InlinePart[] = [];
  let lastIndex = 0;
  const matches = input.matchAll(INLINE_REGEX);

  for (const match of matches) {
    const raw = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ type: 'text', value: input.slice(lastIndex, index) });
    }

    if (
      (raw.startsWith('**') && raw.endsWith('**')) ||
      (raw.startsWith('__') && raw.endsWith('__'))
    ) {
      parts.push({ type: 'bold', value: raw.slice(2, -2) });
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      parts.push({ type: 'code', value: raw.slice(1, -1) });
    } else if (
      (raw.startsWith('*') && raw.endsWith('*')) ||
      (raw.startsWith('_') && raw.endsWith('_'))
    ) {
      parts.push({ type: 'italic', value: raw.slice(1, -1) });
    } else if (raw.startsWith('#')) {
      parts.push({ type: 'tag', value: raw.slice(1) });
    } else if (raw.startsWith('[') && raw.endsWith(']')) {
      parts.push({ type: 'tag', value: raw.slice(1, -1) });
    } else {
      parts.push({ type: 'text', value: raw });
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < input.length) {
    parts.push({ type: 'text', value: input.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: input }];
};

const InlineText = ({
  text,
  style,
}: {
  text: string;
  style?: object | object[];
}) => {
  const parts = useMemo(() => parseInline(text), [text]);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.type === 'bold') {
          return (
            <Text key={`${index}-b`} style={styles.bold}>
              {part.value}
            </Text>
          );
        }
        if (part.type === 'italic') {
          return (
            <Text key={`${index}-i`} style={styles.italic}>
              {part.value}
            </Text>
          );
        }
        if (part.type === 'code') {
          return (
            <Text key={`${index}-c`} style={styles.inlineCode}>
              {part.value}
            </Text>
          );
        }
        if (part.type === 'tag') {
          return (
            <Text key={`${index}-t`} style={styles.inlineTag}>
              {' '}
              {part.value}{' '}
            </Text>
          );
        }
        return <Text key={`${index}-x`}>{part.value}</Text>;
      })}
    </Text>
  );
};

const parseBlocks = (markdown: string): Block[] => {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', text: codeLines.join('\n') });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ type: 'quote', text: quoteLines.join(' ') });
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'bullet', items });
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'numbered', items });
      continue;
    }

    // Pure tag row like: #Priority [Focus] #Today
    if (/^((#[A-Za-z][\w-]{1,24}|\[[A-Za-z][\w\s-]{0,24}\])\s*)+$/.test(trimmed)) {
      const tags =
        trimmed.match(/#[A-Za-z][\w-]{1,24}|\[[A-Za-z][\w\s-]{0,24}\]/g) || [];
      blocks.push({
        type: 'tags',
        items: tags.map(tag =>
          tag.startsWith('#') ? tag.slice(1) : tag.slice(1, -1),
        ),
      });
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|```|>\s?|[-*•]\s+|\d+[.)]\s+|(-{3,}|\*{3,}|_{3,})$)/.test(
        lines[i].trim(),
      )
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
  }

  return blocks;
};

type Props = {
  content: string;
};

const MarkdownContent = ({ content }: Props) => {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          return (
            <View key={key} style={styles.headingWrap}>
              {block.level === 1 ? <View style={styles.headingAccent} /> : null}
              <InlineText
                text={block.text}
                style={[
                  styles.heading,
                  block.level === 1 && styles.heading1,
                  block.level === 2 && styles.heading2,
                  block.level === 3 && styles.heading3,
                ]}
              />
            </View>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={key} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <View key={`${key}-${itemIndex}`} style={styles.listItem}>
                  <View style={styles.bulletDot} />
                  <InlineText text={item} style={styles.listText} />
                </View>
              ))}
            </View>
          );
        }

        if (block.type === 'numbered') {
          return (
            <View key={key} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <View key={`${key}-${itemIndex}`} style={styles.listItem}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{itemIndex + 1}</Text>
                  </View>
                  <InlineText text={item} style={styles.listText} />
                </View>
              ))}
            </View>
          );
        }

        if (block.type === 'quote') {
          return (
            <View key={key} style={styles.quote}>
              <InlineText text={block.text} style={styles.quoteText} />
            </View>
          );
        }

        if (block.type === 'code') {
          return (
            <View key={key} style={styles.codeBlock}>
              <Text style={styles.codeLabel}>CODE</Text>
              <Text style={styles.codeText}>{block.text}</Text>
            </View>
          );
        }

        if (block.type === 'hr') {
          return <View key={key} style={styles.hr} />;
        }

        if (block.type === 'tags') {
          return (
            <View key={key} style={styles.tagsRow}>
              {block.items.map(tag => (
                <View key={`${key}-${tag}`} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <InlineText key={key} text={block.text} style={styles.paragraph} />
        );
      })}
    </View>
  );
};

export default MarkdownContent;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  paragraph: {
    color: colors.text,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    fontWeight: fontWeight.medium,
  },

  bold: {
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  italic: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },

  inlineCode: {
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },

  inlineTag: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    overflow: 'hidden',
  },

  headingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  headingAccent: {
    width: ms(3),
    alignSelf: 'stretch',
    minHeight: ms(16),
    borderRadius: ms(2),
    backgroundColor: colors.primary,
  },

  heading: {
    flex: 1,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },

  heading1: {
    fontSize: fontSize.xl,
    lineHeight: ms(26),
    letterSpacing: -0.3,
  },

  heading2: {
    fontSize: fontSize.lg,
    lineHeight: ms(24),
  },

  heading3: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: colors.primaryDark,
  },

  list: {
    gap: spacing.sm,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  bulletDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.primary,
    marginTop: ms(8),
  },

  numberBadge: {
    minWidth: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(1),
  },

  numberText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  listText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    fontWeight: fontWeight.medium,
  },

  quote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryPurple,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  quoteText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    lineHeight: ms(21),
    fontStyle: 'italic',
    fontWeight: fontWeight.medium,
  },

  codeBlock: {
    backgroundColor: '#0F172A',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    overflow: 'hidden',
  },

  codeLabel: {
    color: '#94A3B8',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  codeText: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    lineHeight: ms(20),
  },

  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  tagChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C7D2FE',
  },

  tagChipText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
