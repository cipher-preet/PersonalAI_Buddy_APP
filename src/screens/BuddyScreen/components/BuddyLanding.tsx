import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CHAT } from '../styles';
import {
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  userName?: string | null;
  spaceName?: string | null;
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
};

const BuddyIcon = () => (
  <View style={styles.iconTile}>
    <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.75A9.25 9.25 0 0 0 2.75 12c0 1.48.35 2.88.97 4.12.25.5.34 1.09.19 1.68l-.6 2.22a.55.55 0 0 0 .67.68l2.23-.6c.5-.13 1.05-.05 1.5.2A9.2 9.2 0 0 0 12 21.25 9.25 9.25 0 0 0 12 2.75Z"
        stroke={CHAT.primary}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"
        stroke={CHAT.primary}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const BuddyLanding = ({
  userName,
  spaceName,
  suggestions,
  onSuggestionPress,
}: Props) => {
  const firstName = userName?.trim()?.split(/\s+/)[0];
  const greetingName = firstName || 'there';
  const scopedToSpace = Boolean(spaceName?.trim());

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <BuddyIcon />
          {scopedToSpace ? (
            <>
              <Text style={styles.title} numberOfLines={2}>
                {spaceName}
              </Text>
              <Text style={styles.subtitle}>
                I can summarize notes, review open tasks, and suggest next
                steps.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Hi {greetingName}</Text>
              <Text style={styles.subtitle}>
                Ask about notes, tasks, reminders, or what to focus on next.
              </Text>
            </>
          )}

          <View style={styles.suggestions}>
            {suggestions.map(suggestion => (
              <Pressable
                key={suggestion}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => onSuggestionPress(suggestion)}
              >
                <Text style={styles.chipText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BuddyLanding;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CHAT.surface,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: ms(120),
    paddingTop: spacing.xl,
  },

  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconTile: {
    width: ms(44),
    height: ms(44),
    borderRadius: radii.sm,
    backgroundColor: CHAT.primarySoft,
    borderWidth: 1,
    borderColor: CHAT.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },

  title: {
    textAlign: 'center',
    color: CHAT.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  subtitle: {
    maxWidth: ms(300),
    textAlign: 'center',
    color: CHAT.textMuted,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  suggestions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  chip: {
    minHeight: ms(32),
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: CHAT.border,
    backgroundColor: CHAT.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipPressed: {
    borderColor: CHAT.primary,
    backgroundColor: CHAT.primarySoft,
  },

  chipText: {
    color: CHAT.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
