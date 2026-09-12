import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';
import type { BillingCycle, UiPlan } from '../planCatalog';
import { getQuarterlyHint } from '../planCatalog';

type Props = {
  plan: UiPlan;
  billingCycle: BillingCycle;
  selected: boolean;
  isCurrent: boolean;
  isBusy: boolean;
  onPress: () => void;
  onCta: () => void;
};

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={ms(13)} height={ms(13)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m5 12 4 4L19 6"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparkleIcon = ({ color }: { color: string }) => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5C9.6 9.6 11.3 7.9 12 3.8Z"
      fill={color}
    />
  </Svg>
);

const ArrowIcon = ({ color }: { color: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M13 6l6 6-6 6"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const formatStat = (value: number) => (value < 0 ? '∞' : String(value));

const PlanCard = ({
  plan,
  billingCycle,
  selected,
  isCurrent,
  isBusy,
  onPress,
  onCta,
}: Props) => {
  const isDark = plan.variant !== 'light';
  const checkColor = isDark ? colors.white : colors.primary;
  const checkBg = isDark ? colors.planChipOnDark : colors.primarySoft;
  const titleColor = isDark ? colors.white : colors.text;
  const mutedColor = isDark ? colors.planMutedOnDark : colors.subText;
  const priceColor = isDark ? colors.white : colors.text;
  const quarterlyHint = billingCycle === 'quarterly' ? getQuarterlyHint(plan) : null;
  const ctaLabel = isCurrent
    ? 'Current plan'
    : plan.id === 'free'
      ? 'Continue with Free'
      : plan.id === 'pro'
        ? 'Upgrade to Pro'
        : 'Get Business';
  const ctaArrowColor =
    plan.variant === 'featured'
      ? colors.planProStart
      : plan.variant === 'premium'
        ? colors.planInk
        : colors.primaryDark;
  const stats = [
    { label: 'Spaces', value: formatStat(plan.limits.spaces) },
    { label: 'Hours', value: formatStat(plan.limits.recordingHours) },
    { label: 'Languages', value: String(plan.languages.length || 0) },
  ];

  const cardInner = (
    <>
      {isDark ? (
        <>
          <View pointerEvents="none" style={styles.orbPrimary} />
          <View
            pointerEvents="none"
            style={[
              styles.orbSecondary,
              plan.variant === 'premium' && styles.orbGold,
            ]}
          />
        </>
      ) : (
        <View pointerEvents="none" style={styles.orbLight} />
      )}

      <View style={styles.topRow}>
        <View style={styles.copy}>
          {plan.badge ? (
            <View
              style={[
                styles.badge,
                plan.variant === 'premium' && styles.badgeGold,
              ]}
            >
              {plan.variant === 'featured' ? (
                <SparkleIcon color={colors.white} />
              ) : (
                <SparkleIcon color={colors.planGold} />
              )}
              <Text
                style={[
                  styles.badgeText,
                  plan.variant === 'premium' && styles.badgeTextGold,
                ]}
              >
                {plan.badge}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.name, { color: titleColor }]}>{plan.name}</Text>
          <Text style={[styles.tagline, { color: mutedColor }]}>
            {plan.tagline}
          </Text>
        </View>

        {isCurrent ? (
          <View
            style={[
              styles.currentBadge,
              isDark && styles.currentBadgeOnDark,
            ]}
          >
            <CheckIcon color={isDark ? colors.planGold : colors.primary} />
            <Text
              style={[
                styles.currentBadgeText,
                { color: isDark ? colors.planGold : colors.primary },
              ]}
            >
              Active
            </Text>
          </View>
        ) : selected ? (
          <View
            style={[
              styles.selectedBadge,
              isDark && styles.selectedBadgeOnDark,
            ]}
          >
            <Text
              style={[
                styles.selectedBadgeText,
                { color: isDark ? colors.white : colors.primary },
              ]}
            >
              Selected
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: priceColor }]}>
          {plan.prices[billingCycle]}
        </Text>
        <Text style={[styles.cadence, { color: mutedColor }]}>
          /{plan.cadenceLabel[billingCycle]}
        </Text>
      </View>
      {quarterlyHint ? (
        <View style={[styles.saveChip, isDark && styles.saveChipOnDark]}>
          <Text style={[styles.saveHint, isDark && styles.saveHintOnDark]}>
            {quarterlyHint}
          </Text>
        </View>
      ) : null}

      <View style={styles.statRow}>
        {stats.map(stat => (
          <View
            key={stat.label}
            style={[styles.statChip, isDark && styles.statChipOnDark]}
          >
            <Text style={[styles.statValue, { color: titleColor }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.featureList}>
        {plan.features.map(feature => (
          <View key={feature.id} style={styles.featureRow}>
            <View style={[styles.featureCheck, { backgroundColor: checkBg }]}>
              <CheckIcon color={checkColor} />
            </View>
            <Text style={[styles.featureText, { color: titleColor }]}>
              {feature.label}
            </Text>
          </View>
        ))}
      </View>

      {plan.languages.length > 2 ? (
        <View style={styles.languageWrap}>
          {plan.languages.map(language => (
            <View key={language.name} style={styles.languageChip}>
              <Text style={styles.languageName}>{language.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.languageSummary}>
          {plan.languages.map(language => (
            <View
              key={language.name}
              style={[styles.coreChip, isDark && styles.coreChipOnDark]}
            >
              <Text
                style={[
                  styles.coreChipText,
                  isDark && styles.coreChipTextOnDark,
                ]}
              >
                {language.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.88}
        disabled={isBusy || isCurrent}
        style={[
          styles.cta,
          plan.variant === 'light' && styles.ctaLight,
          plan.variant === 'featured' && styles.ctaFeatured,
          plan.variant === 'premium' && styles.ctaPremium,
          (isBusy || isCurrent) && styles.ctaDisabled,
        ]}
        onPress={onCta}
      >
        {isBusy && selected ? (
          <ActivityIndicator color={ctaArrowColor} />
        ) : (
          <View style={styles.ctaInner}>
            <Text
              style={[
                styles.ctaText,
                plan.variant === 'light' && styles.ctaTextLight,
                plan.variant === 'premium' && styles.ctaTextPremium,
              ]}
            >
              {ctaLabel}
            </Text>
            {isCurrent ? null : <ArrowIcon color={ctaArrowColor} />}
          </View>
        )}
      </TouchableOpacity>
    </>
  );

  if (plan.variant === 'featured') {
    return (
      <TouchableOpacity
        activeOpacity={0.96}
        onPress={onPress}
        style={[
          styles.shadowWrap,
          selected && styles.shadowWrapSelected,
        ]}
      >
        <LinearGradient
          colors={[
            colors.planProStart,
            colors.planProMid,
            colors.planProEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            styles.cardFeatured,
            selected && styles.cardFeaturedSelected,
          ]}
        >
          {cardInner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (plan.variant === 'premium') {
    return (
      <TouchableOpacity
        activeOpacity={0.96}
        onPress={onPress}
        style={[
          styles.shadowWrap,
          selected && styles.shadowWrapSelected,
        ]}
      >
        <LinearGradient
          colors={[
            colors.planBusinessStart,
            colors.planBusinessMid,
            colors.planBusinessEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            styles.cardPremium,
            selected && styles.cardPremiumSelected,
          ]}
        >
          {cardInner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      onPress={onPress}
      style={[
        styles.card,
        styles.cardLight,
        selected && styles.cardLightSelected,
      ]}
    >
      {cardInner}
    </TouchableOpacity>
  );
};

export default PlanCard;

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radii['3xl'],
    ...shadows.elevated,
  },

  shadowWrapSelected: {
    transform: [{ scale: 1.012 }],
  },

  card: {
    borderRadius: radii['3xl'],
    padding: spacing['3xl'],
    overflow: 'hidden',
  },

  cardLight: {
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },

  cardLightSelected: {
    borderColor: colors.brandBorder,
    borderWidth: 1.5,
    backgroundColor: colors.primarySoft,
  },

  cardFeatured: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  cardFeaturedSelected: {
    borderColor: 'rgba(255,255,255,0.42)',
  },

  cardPremium: {
    borderWidth: 1,
    borderColor: colors.planGoldBorder,
  },

  cardPremiumSelected: {
    borderColor: colors.planGold,
  },

  orbPrimary: {
    position: 'absolute',
    top: -ms(36),
    right: -ms(18),
    width: ms(148),
    height: ms(148),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  orbSecondary: {
    position: 'absolute',
    bottom: -ms(48),
    left: -ms(24),
    width: ms(120),
    height: ms(120),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },

  orbGold: {
    backgroundColor: 'rgba(232, 195, 106, 0.16)',
  },

  orbLight: {
    position: 'absolute',
    top: -ms(42),
    right: -ms(28),
    width: ms(126),
    height: ms(126),
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
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

  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.planChipOnLight,
    marginBottom: spacing.sm,
  },

  badgeGold: {
    backgroundColor: colors.planGoldSoft,
  },

  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  badgeTextGold: {
    color: colors.planGold,
  },

  name: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.5,
  },

  tagline: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },

  currentBadgeOnDark: {
    backgroundColor: colors.planChipOnDark,
  },

  currentBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  selectedBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },

  selectedBadgeOnDark: {
    backgroundColor: colors.planChipOnDark,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  selectedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing['2xl'],
    gap: spacing.xs,
  },

  price: {
    fontSize: fontSize['6xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1.2,
    lineHeight: ms(38),
  },

  cadence: {
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  saveChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
  },

  saveChipOnDark: {
    backgroundColor: 'rgba(134, 239, 172, 0.16)',
  },

  saveHint: {
    color: colors.successText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  saveHintOnDark: {
    color: colors.planSaveOnDark,
  },

  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
  },

  statChip: {
    flex: 1,
    minHeight: ms(58),
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },

  statChipOnDark: {
    backgroundColor: colors.planChipOnDark,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },

  statLabel: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  featureList: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  featureCheck: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureText: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(20),
  },

  languageSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  coreChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },

  coreChipOnDark: {
    backgroundColor: colors.planChipOnDark,
  },

  coreChipText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  coreChipTextOnDark: {
    color: colors.white,
  },

  languageWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  languageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.planGoldSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.planGoldBorderStrong,
  },

  languageName: {
    color: colors.planGold,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  cta: {
    marginTop: spacing['2xl'],
    minHeight: layout.buttonHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  ctaLight: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },

  ctaFeatured: {
    backgroundColor: colors.white,
  },

  ctaPremium: {
    backgroundColor: colors.planGold,
  },

  ctaDisabled: {
    opacity: 0.55,
  },

  ctaText: {
    color: colors.planProStart,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  ctaTextLight: {
    color: colors.primaryDark,
  },

  ctaTextPremium: {
    color: colors.planInk,
  },
});
