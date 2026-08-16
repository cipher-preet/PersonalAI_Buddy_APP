import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

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
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
};

const BuddyAvatar = () => (
  <View style={styles.avatarWrap}>
    <View style={styles.avatarInner}>
      <Svg width={ms(54)} height={ms(54)} viewBox="0 0 64 64" fill="none">
        <Circle cx="32" cy="32" r="30" fill={colors.white} />
        <Path
          d="M22 28c1.8-2.4 4.4-3.6 7-3.2"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <Path
          d="M42 28c-1.8-2.4-4.4-3.6-7-3.2"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <Path
          d="M24 40c2.6 3.4 6 5 8 5s5.4-1.6 8-5"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  </View>
);

const ArrowUpIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(13)} height={ms(13)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17 17 7M10 7h7v7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BuddyLanding = ({
  userName,
  suggestions,
  onSuggestionPress,
}: Props) => {
  const firstName = userName?.trim()?.split(/\s+/)[0];
  const greetingName = firstName || 'there';

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <BuddyAvatar />
          <Text style={styles.greeting}>
            Hi! I'm Buddy,{'\n'}your personal assistant
          </Text>
          <Text style={styles.greetingSub}>
            Ask me anything, {greetingName}.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Start a chat</Text>
        </View>

        <View style={styles.chipsWrap}>
          {suggestions.map(suggestion => (
            <Pressable
              key={suggestion}
              style={styles.chip}
              onPress={() => onSuggestionPress(suggestion)}
            >
              <Text style={styles.chipText}>{suggestion}</Text>
              <View style={styles.chipIcon}>
                <ArrowUpIcon />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default BuddyLanding;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: ms(160),
  },

  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },

  avatarWrap: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(44),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },

  avatarInner: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  greeting: {
    textAlign: 'center',
    color: colors.text,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: ms(34),
    letterSpacing: -0.4,
  },

  greetingSub: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  sectionLabel: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#EEF2FF',
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },

  chipText: {
    flexShrink: 1,
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(18),
  },

  chipIcon: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
