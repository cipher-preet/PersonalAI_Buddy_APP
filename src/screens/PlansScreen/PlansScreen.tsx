import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';
import { useToast } from '../../store/context/ToastContext';
import { useAppSelector } from '../../store/hooks';
import {
  Plan as BackendPlan,
  PlanCode,
  useActivateFreePlanMutation,
  useCreatePaymentOrderMutation,
  useGetPlanStatusQuery,
  useGetPlansQuery,
  useVerifyPaymentMutation,
} from '../../store/api/payments';

type Plan = {
  id: PlanCode;
  backendPlan?: BackendPlan;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  recommended?: boolean;
  ctaLabel: string;
};

const fallbackPlans: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 'Free',
    cadence: 'forever',
    description:
      'Start organizing conversations, notes, and tasks with a focused AI memory workspace.',
    features: [
      '5 memory spaces',
      '100 captured notes',
      'Basic task extraction',
      'Daily voice capture',
      'Standard AI summaries',
    ],
    ctaLabel: 'Continue with Free',
  },
  {
    id: 'pro',
    name: 'Buddy Pro',
    price: '₹299',
    cadence: 'per month',
    description:
      'Unlock deeper recall, faster processing, unlimited spaces, and advanced AI summaries.',
    features: [
      'Everything in Starter',
      'Unlimited memory spaces',
      'Advanced notes and task extraction',
      'Priority voice processing',
      'Early access to new AI tools',
    ],
    recommended: true,
    ctaLabel: 'Upgrade to Pro',
  },
];

const CloseIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6l12 12M18 6 6 18"
      stroke={colors.textSecondary}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <View style={styles.featureIcon}>
    <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12 4 4L19 6"
        stroke={colors.primary}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const SparkFeatureIcon = () => (
  <View style={styles.featureIcon}>
    <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Z"
        fill={colors.primary}
      />
    </Svg>
  </View>
);

const SelectedCheck = () => (
  <View style={styles.selectedCheck}>
    <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12 4 4L19 6"
        stroke={colors.white}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const PlansScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const name = useAppSelector(state => state.auth.name);
  const email = useAppSelector(state => state.auth.email);
  const phone = useAppSelector(state => state.auth.phone);
  const { showToast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanCode>('pro');
  const hasSyncedCurrentPlan = useRef(false);
  const { data: plansData, isFetching: isFetchingPlans } = useGetPlansQuery();
  const {
    data: planStatus,
    isFetching: isFetchingPlanStatus,
    refetch: refetchPlanStatus,
  } = useGetPlanStatusQuery({ userId }, { skip: !userId });
  const [activateFreePlan, { isLoading: isActivatingFree }] =
    useActivateFreePlanMutation();
  const [createPaymentOrder, { isLoading: isCreatingOrder }] =
    useCreatePaymentOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] =
    useVerifyPaymentMutation();

  const plans = useMemo<Plan[]>(() => {
    if (!plansData?.plans?.length) {
      return fallbackPlans;
    }

    return plansData.plans.map(plan => ({
      id: plan.code,
      backendPlan: plan,
      name: plan.name,
      price:
        plan.amount === 0
          ? 'Free'
          : `₹${Math.round(plan.amount / 100)}`,
      cadence: plan.interval === 'forever' ? 'forever' : 'month',
      description: plan.description,
      features: plan.features,
      recommended: plan.code === 'pro',
      ctaLabel: plan.code === 'pro' ? 'Upgrade to Pro' : 'Continue with Free',
    }));
  }, [plansData]);

  const selectedPlan = useMemo(
    () =>
      plans.find(plan => plan.id === selectedPlanId) ??
      plans.find(plan => plan.id === 'pro') ??
      plans[0],
    [plans, selectedPlanId],
  );
  const currentPlanCode = planStatus?.plan?.code;
  const isLoadingInitialPlan =
    !currentPlanCode && (isFetchingPlans || isFetchingPlanStatus);

  useEffect(() => {
    if (!currentPlanCode || hasSyncedCurrentPlan.current) {
      return;
    }

    setSelectedPlanId(currentPlanCode);
    hasSyncedCurrentPlan.current = true;
  }, [currentPlanCode]);

  const isBusy = isActivatingFree || isCreatingOrder || isVerifyingPayment;
  const isCurrentPlan = currentPlanCode === selectedPlan.id;
  const ctaLabel = isCurrentPlan
    ? 'Current Plan'
    : isBusy
      ? 'Please wait...'
      : selectedPlan.ctaLabel;

  const handlePlanAction = async () => {
    if (!userId || !selectedPlan) {
      showToast({ message: 'Please login again to continue.', type: 'error' });
      return;
    }

    if (currentPlanCode === selectedPlan.id) {
      showToast({ message: 'This is already your active plan.', type: 'info' });
      return;
    }

    try {
      if (selectedPlan.id === 'free') {
        const response = await activateFreePlan({ userId }).unwrap();
        showToast({
          message: response.message || 'Free plan activated.',
          type: 'success',
        });
        refetchPlanStatus();
        return;
      }

      const order = await createPaymentOrder({
        userId,
        planCode: selectedPlan.id,
      }).unwrap();

      if (!order.requiresPayment) {
        showToast({
          message: order.message || 'Plan updated successfully.',
          type: 'success',
        });
        refetchPlanStatus();
        return;
      }

      let checkoutResponse;

      try {
        checkoutResponse = await RazorpayCheckout.open({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Buddy',
          description: `${order.plan.name} subscription`,
          order_id: order.orderId,
          prefill: {
            name,
            email,
            contact: phone,
          },
          theme: {
            color: colors.primary,
          },
        });
      } catch (checkoutError: any) {
        if (/open.*null|native module/i.test(String(checkoutError?.message))) {
          showToast({
            message:
              'Razorpay SDK is not linked in this Android build. Rebuild and reinstall the app, then try again.',
            type: 'error',
          });
          return;
        }

        throw checkoutError;
      }

      const verification = await verifyPayment({
        userId,
        razorpay_order_id: checkoutResponse.razorpay_order_id,
        razorpay_payment_id: checkoutResponse.razorpay_payment_id,
        razorpay_signature: checkoutResponse.razorpay_signature,
      }).unwrap();

      showToast({
        message: verification.message || 'Payment verified. Pro is active.',
        type: 'success',
      });
      refetchPlanStatus();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Payment could not be completed. Please try again.';

      showToast({ message, type: 'error' });
      console.log('Payment flow failed:', error);
    }
  };

  const renderFeatureIcon = (feature: string, index: number) => {
    const isVoice = /voice|ai/i.test(feature);
    if (isVoice || index === 1) {
      return <SparkFeatureIcon />;
    }
    return <CheckIcon />;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FBF7FF', '#F3EEFF', colors.white, colors.white]}
        locations={[0, 0.28, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          bounces
        >
          <View style={styles.hero}>
            <Text
              style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}
            >
              Unlock your{' '}
              <Text style={styles.heroTitleAccent}>Pro</Text>
              ductivity
            </Text>
          </View>

          {isLoadingInitialPlan ? (
            <View style={styles.loaderCard}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loaderTitle}>Loading your plan</Text>
              <Text style={styles.loaderText}>
                Checking your current subscription...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.planToggle}>
                {plans.map(plan => {
                  const selected = plan.id === selectedPlanId;
                  const isCurrent = currentPlanCode === plan.id;
                  const label =
                    plan.id === 'pro' ? 'Buddy Pro' : `${plan.name} plan`;

                  return (
                    <TouchableOpacity
                      key={plan.id}
                      activeOpacity={0.85}
                      style={[
                        styles.planToggleItem,
                        selected && styles.planToggleItemSelected,
                      ]}
                      onPress={() => setSelectedPlanId(plan.id)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[
                          styles.planToggleText,
                          selected && styles.planToggleTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                      {isCurrent ? (
                        <View style={styles.currentDot} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.featureList}>
                {selectedPlan.features.map((feature, index) => (
                  <View key={feature} style={styles.featureRow}>
                    {renderFeatureIcon(feature, index)}
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.squiggleWrap}>
                <View style={styles.squiggle} />
              </View>

              <Text style={styles.moreHint}>
                {selectedPlan.description}
              </Text>
            </>
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
          <View style={styles.bottomPanel}>
            <View
              style={[
                styles.priceCardsRow,
                isCompact && styles.priceCardsColumn,
              ]}
            >
              {plans.map(plan => {
                const selected = plan.id === selectedPlanId;
                const priceLabel =
                  plan.id === 'free' ? 'Free' : plan.price;
                const cadenceLabel =
                  plan.id === 'free' ? '/forever' : `/${plan.cadence}`;

                return (
                  <TouchableOpacity
                    key={`price-${plan.id}`}
                    activeOpacity={0.88}
                    style={[
                      styles.priceCard,
                      selected && styles.priceCardSelected,
                      isCompact && styles.priceCardFull,
                    ]}
                    onPress={() => setSelectedPlanId(plan.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <View style={styles.priceCardTop}>
                      <Text
                        style={[
                          styles.priceCardLabel,
                          selected && styles.priceCardLabelSelected,
                        ]}
                      >
                        {plan.id === 'pro' ? 'Pro' : 'Starter'}
                        {plan.recommended ? (
                          <Text style={styles.saveBadge}> · Popular</Text>
                        ) : null}
                      </Text>
                      {selected ? (
                        <SelectedCheck />
                      ) : (
                        <View style={styles.radioEmpty} />
                      )}
                    </View>

                    <View style={styles.priceValueRow}>
                      <Text
                        style={[
                          styles.priceValue,
                          selected && styles.priceValueSelected,
                          isCompact && styles.priceValueCompact,
                        ]}
                      >
                        {priceLabel}
                      </Text>
                      <Text style={styles.priceCadence}>{cadenceLabel}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.ctaButton, isBusy && styles.ctaButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              onPress={handlePlanAction}
              disabled={isBusy || isLoadingInitialPlan}
            >
              {isBusy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.ctaText}>{ctaLabel}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerHint}>
              {isCurrentPlan
                ? 'This is your active plan'
                : 'Secure checkout · Cancel anytime · Instant access'}
            </Text>

            {isFetchingPlans && !isLoadingInitialPlan ? (
              <Text style={styles.loadingText}>Refreshing plans...</Text>
            ) : null}
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
};

export default PlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  safeArea: {
    flex: 1,
  },

  headerBar: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  closeButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },

  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
  },

  hero: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    paddingHorizontal: spacing.md,
  },

  heroTitle: {
    color: colors.text,
    fontSize: ms(30),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.8,
    lineHeight: ms(38),
    textAlign: 'center',
  },

  heroTitleCompact: {
    fontSize: ms(26),
    lineHeight: ms(34),
  },

  heroTitleAccent: {
    color: colors.primaryMid,
  },

  loaderCard: {
    minHeight: ms(160),
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4xl'],
  },

  loaderTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
  },

  loaderText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  planToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing['4xl'],
  },

  planToggleItem: {
    flex: 1,
    minHeight: ms(42),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  planToggleItemSelected: {
    backgroundColor: '#EEF0F5',
  },

  planToggleText: {
    color: colors.subText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  planToggleTextSelected: {
    color: colors.text,
    fontWeight: fontWeight.bold,
  },

  currentDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.success,
  },

  featureList: {
    gap: spacing['2xl'],
    paddingHorizontal: spacing.xs,
    marginBottom: spacing['3xl'],
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },

  featureIcon: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(1),
  },

  featureText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
  },

  squiggleWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  squiggle: {
    width: ms(72),
    height: ms(3),
    borderRadius: radii.pill,
    backgroundColor: '#E2E8F0',
  },

  moreHint: {
    color: colors.subText,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: ms(20),
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  bottomSafe: {
    backgroundColor: 'transparent',
  },

  bottomPanel: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
    borderRadius: ms(28),
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing['2xl'],
    gap: spacing.xl,
  },

  priceCardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  priceCardsColumn: {
    flexDirection: 'column',
  },

  priceCard: {
    flex: 1,
    minHeight: ms(92),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: spacing.xl,
  },

  priceCardFull: {
    flex: 0,
    width: '100%',
  },

  priceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F8F7FF',
  },

  priceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  priceCardLabel: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    flex: 1,
    paddingRight: spacing.sm,
  },

  priceCardLabelSelected: {
    color: colors.primary,
  },

  saveBadge: {
    color: colors.primaryMid,
    fontWeight: fontWeight.bold,
  },

  radioEmpty: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  selectedCheck: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    backgroundColor: colors.successBright,
    alignItems: 'center',
    justifyContent: 'center',
  },

  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },

  priceValue: {
    color: colors.text,
    fontSize: ms(26),
    lineHeight: ms(30),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.6,
  },

  priceValueCompact: {
    fontSize: ms(24),
    lineHeight: ms(28),
  },

  priceValueSelected: {
    color: colors.text,
  },

  priceCadence: {
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
    marginBottom: ms(4),
  },

  ctaButton: {
    minHeight: ms(54),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  ctaButtonDisabled: {
    opacity: 0.65,
  },

  ctaText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },

  footerHint: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  loadingText: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});
