import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';
import type { UiPlan } from '../planCatalog';

type Props = {
  plan: UiPlan;
  priceLabel: string;
};

const GlobeIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8.2" stroke={colors.primary} strokeWidth={1.7} />
    <Path
      d="M4.5 12h15M12 3.8c2.2 2.2 3.3 4.8 3.3 8.2S14.2 18 12 20.2C9.8 18 8.7 15.4 8.7 12S9.8 6 12 3.8Z"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const LanguagePackCard = ({ plan, priceLabel }: Props) => {
  const languages = plan.languages;
  const count = languages.length;
  const isPremium = plan.variant === 'premium';
  const isFeatured = plan.variant === 'featured';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <View style={styles.eyebrowRow}>
            <View style={styles.iconWrap}>
              <GlobeIcon />
            </View>
            <Text style={styles.eyebrow}>Languages included</Text>
          </View>
          <Text style={styles.title}>
            {plan.name}
            <Text style={styles.titleMuted}> · {priceLabel}</Text>
          </Text>
          <Text style={styles.subtitle}>
            {count > 0
              ? `${count} language${count === 1 ? '' : 's'} available on this plan`
              : 'Language details will appear once plans load'}
          </Text>
        </View>

        {count > 0 ? (
          <View
            style={[
              styles.countPill,
              isFeatured && styles.countPillFeatured,
              isPremium && styles.countPillPremium,
            ]}
          >
            <Text
              style={[
                styles.countText,
                isPremium && styles.countTextPremium,
              ]}
            >
              {count}
            </Text>
          </View>
        ) : null}
      </View>

      {count > 0 ? (
        <View style={styles.chipWrap}>
          {languages.map(language => (
            <View
              key={language.name}
              style={[
                styles.chip,
                isFeatured && styles.chipFeatured,
                isPremium && styles.chipPremium,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isFeatured && styles.chipTextFeatured,
                  isPremium && styles.chipTextPremium,
                ]}
                numberOfLines={1}
              >
                {language.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default LanguagePackCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.lg,
    ...shadows.card,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  copy: {
    flex: 1,
    minWidth: 0,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconWrap: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyebrow: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  title: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
  },

  titleMuted: {
    color: colors.subText,
    fontWeight: fontWeight.semibold,
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  countPill: {
    minWidth: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countPillFeatured: {
    backgroundColor: colors.primaryLight,
  },

  countPillPremium: {
    backgroundColor: colors.planGoldSoft,
    borderColor: colors.planGoldBorder,
  },

  countText: {
    color: colors.primaryDark,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },

  countTextPremium: {
    color: colors.warningText,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  chipFeatured: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.brandBorder,
  },

  chipPremium: {
    backgroundColor: colors.planGoldSoft,
    borderColor: colors.planGoldBorder,
  },

  chipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  chipTextFeatured: {
    color: colors.primaryDark,
  },

  chipTextPremium: {
    color: colors.warningText,
  },
});
