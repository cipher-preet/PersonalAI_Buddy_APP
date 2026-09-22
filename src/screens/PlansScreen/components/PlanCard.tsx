import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';
import type { BillingCycle, UiPlan } from '../planCatalog';
import { getQuarterlyHint } from '../planCatalog';

type Props = {
  plan: UiPlan;
  billingCycle: BillingCycle;
  selected: boolean;
  isCurrent: boolean;
  onPress: () => void;
};

const CrownIcon = ({ color }: { color: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 17.5 5.2 8.8l4.1 3.4L12 6.5l2.7 5.7 4.1-3.4 1.7 8.7H3.5Z"
      fill={color}
    />
    <Path
      d="M4 19.2h16"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={ms(11)} height={ms(11)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m5 12 4 4L19 6"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlanCard = ({
  plan,
  billingCycle,
  selected,
  isCurrent,
  onPress,
}: Props) => {
  const isFeatured = plan.variant === 'featured';
  const isPremium = plan.variant === 'premium';
  const quarterlyHint =
    billingCycle === 'quarterly' ? getQuarterlyHint(plan) : null;
  const cadence =
    plan.id === 'free'
      ? 'forever'
      : `per ${plan.cadenceLabel[billingCycle]}`;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${plan.name} plan, ${plan.prices[billingCycle]} ${cadence}`}
      style={[
        styles.card,
        selected && styles.cardSelected,
        isFeatured && selected && styles.cardFeaturedSelected,
        isPremium && selected && styles.cardPremiumSelected,
      ]}
    >
      {plan.badge ? (
        <View
          style={[
            styles.badge,
            isFeatured && styles.badgeFeatured,
            isPremium && styles.badgePremium,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isPremium && styles.badgeTextPremium,
            ]}
            numberOfLines={1}
          >
            {plan.badge}
          </Text>
        </View>
      ) : null}

      <View style={styles.topMeta}>
        {isCurrent ? (
          <View style={styles.currentDot}>
            <CheckIcon color={colors.primary} />
          </View>
        ) : isFeatured || isPremium ? (
          <View style={styles.crownWrap}>
            <CrownIcon
              color={isPremium ? colors.planGold : colors.primaryMid}
            />
          </View>
        ) : (
          <View style={styles.crownSpacer} />
        )}
      </View>

      <Text
        style={[styles.name, selected && styles.nameSelected]}
        numberOfLines={1}
      >
        {plan.name}
      </Text>

      <Text
        style={[styles.price, selected && styles.priceSelected]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
      >
        {plan.prices[billingCycle]}
      </Text>

      <Text style={[styles.cadence, selected && styles.cadenceSelected]}>
        {cadence}
      </Text>

      {quarterlyHint && selected ? (
        <Text style={styles.saveHint} numberOfLines={1}>
          {quarterlyHint.replace(' vs monthly', '')}
        </Text>
      ) : (
        <View style={styles.saveSpacer} />
      )}

      {selected ? (
        <LinearGradient
          colors={[
            colors.upgradeGradientStart,
            colors.upgradeGradientMid,
            colors.upgradeGradientEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectedBar}
        />
      ) : null}
    </TouchableOpacity>
  );
};

export default PlanCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: ms(148),
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },

  cardSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },

  cardFeaturedSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: colors.primaryMid,
  },

  cardPremiumSelected: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.planGold,
  },

  badge: {
    position: 'absolute',
    top: -ms(1),
    left: -ms(1),
    maxWidth: '92%',
    paddingHorizontal: spacing.sm,
    paddingVertical: ms(3),
    borderTopLeftRadius: radii['2xl'],
    borderBottomRightRadius: radii.sm,
    backgroundColor: colors.primary,
    zIndex: 2,
  },

  badgeFeatured: {
    backgroundColor: colors.primaryMid,
  },

  badgePremium: {
    backgroundColor: colors.planInk,
  },

  badgeText: {
    color: colors.white,
    fontSize: ms(9),
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  badgeTextPremium: {
    color: colors.planGold,
  },

  topMeta: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    minHeight: ms(18),
    marginBottom: spacing.xs,
  },

  crownWrap: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  crownSpacer: {
    width: ms(22),
    height: ms(22),
  },

  currentDot: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  nameSelected: {
    color: colors.primaryDark,
  },

  price: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.6,
    textAlign: 'center',
  },

  priceSelected: {
    color: colors.text,
  },

  cadence: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  cadenceSelected: {
    color: colors.subText,
  },

  saveHint: {
    marginTop: spacing.xs,
    color: colors.successText,
    fontSize: ms(9),
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  saveSpacer: {
    height: ms(14),
    marginTop: spacing.xs,
  },

  selectedBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: ms(3),
  },
});
