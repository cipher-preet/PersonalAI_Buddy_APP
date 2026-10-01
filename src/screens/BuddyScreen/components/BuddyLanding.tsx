import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BrandLogo from '../../../components/BrandLogo';
import { CHAT } from '../styles';
import {
  colors,
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
    <BrandLogo size={ms(56)} />
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
    borderRadius: ms(16),
    backgroundColor: colors.brandNavy,
    shadowColor: CHAT.primary,
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.22,
    shadowRadius: ms(12),
    elevation: 6,
    marginBottom: spacing.sm,
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
