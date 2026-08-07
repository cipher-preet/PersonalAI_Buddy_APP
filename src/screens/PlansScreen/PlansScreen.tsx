import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  shadows,
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

const CheckIcon = ({ accent = false }: { accent?: boolean }) => (
  <View style={[styles.checkIconWrap, accent && styles.checkIconAccent]}>
    <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12 4 4L19 6"
        stroke={accent ? colors.white : colors.primary}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const BackIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={colors.text}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"
      stroke={colors.subText}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="m9.5 12 1.8 1.8L15 10"
      stroke={colors.subText}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparkIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Z"
      fill={colors.white}
    />
  </Svg>
);

const PlansScreen = () => {
  const navigation = useNavigation();
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const name = useAppSelector(state => state.auth.name);
  const email = useAppSelector(state => state.auth.email);
  const phone = useAppSelector(state => state.auth.phone);
  const { showToast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanCode>('pro');
  const hasSyncedCurrentPlan = useRef(false);
  const { data: plansData, isFetching: isFetchingPlans } = useGetPlansQuery();
  const { data: planStatus, isFetching: isFetchingPlanStatus, refetch: refetchPlanStatus } =
    useGetPlanStatusQuery({ userId }, { skip: !userId });
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
          : `${plan.currency} ${Math.round(plan.amount / 100)}`,
      cadence: plan.interval === 'forever' ? 'forever' : 'per month',
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

  const isBusy =
    isActivatingFree ||
    isCreatingOrder ||
    isVerifyingPayment;
  const ctaLabel =
    currentPlanCode === selectedPlan.id
      ? 'Current Plan'
      : isBusy
        ? 'Please wait...'
        : selectedPlan.ctaLabel;

  const priceHint =
    selectedPlan.id === 'free'
      ? 'No charge · Switch anytime'
      : `${selectedPlan.price}/month · Cancel anytime`;

  const displayPriceHint = priceHint.replace(/Â·/g, '.');

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.white]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Choose your plan</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <SparkIcon />
              <Text style={styles.heroBadgeText}>Upgrade</Text>
            </View>
            <Text style={styles.heroTitle}>Unlock more from Buddy</Text>
            <Text style={styles.heroSubtitle}>
              Pick the plan that fits your workflow. Upgrade anytime for
              unlimited memory and priority AI.
            </Text>
          </View>

          {isLoadingInitialPlan ? (
            <View style={styles.planLoaderCard}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.planLoaderTitle}>Loading your plan</Text>
              <Text style={styles.planLoaderText}>
                Checking your current subscription...
              </Text>
            </View>
          ) : (
            <View style={styles.plansList}>
              {plans.map(plan => {
              const selected = plan.id === selectedPlanId;
              const isPro = Boolean(plan.recommended);
              const isCurrent = currentPlanCode === plan.id;

              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.9}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${plan.name} plan, ${plan.price} ${plan.cadence}`}
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={[
                    styles.planCard,
                    styles.planCardWithRadio,
                    selected && styles.planCardSelected,
                    isPro && selected && styles.planCardProSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>

                  {isPro || isCurrent ? (
                    <View style={styles.badgeRow}>
                      {isPro ? (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>
                            Most popular
                          </Text>
                        </View>
                      ) : null}
                      {isCurrent ? (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={styles.planCardTop}>
                    <View style={styles.planIdentity}>
                      <View style={styles.planNameRow}>
                        <Text
                          style={[
                            styles.planName,
                            selected && styles.planNameSelected,
                          ]}
                        >
                          {plan.name}
                        </Text>
                        {isPro ? (
                          <View style={styles.proPill}>
                            <Text style={styles.proPillText}>PRO</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.planDescription} numberOfLines={2}>
                        {plan.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceBlock}>
                    <Text
                      style={[
                        styles.price,
                        selected && styles.priceSelected,
                      ]}
                    >
                      {plan.price}
                    </Text>
                    <Text style={styles.cadence}>/{plan.cadence}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.featureList}>
                    {plan.features.map(feature => (
                      <View key={feature} style={styles.featureRow}>
                        <CheckIcon accent={selected && isPro} />
                        <Text
                          style={[
                            styles.featureText,
                            selected && styles.featureTextSelected,
                          ]}
                        >
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
              })}
            </View>
          )}

          {isFetchingPlans && !isLoadingInitialPlan ? (
            <Text style={styles.loadingText}>Loading latest plans...</Text>
          ) : null}

          <View style={styles.trustRow}>
            <ShieldIcon />
            <Text style={styles.trustText}>
              Secure checkout · Cancel anytime · Instant access
            </Text>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
          <View style={styles.bottomBar}>
            <View style={styles.bottomSummary}>
              <Text style={styles.bottomPlanName}>{selectedPlan.name}</Text>
              <Text style={styles.bottomPriceHint}>{displayPriceHint}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.ctaButton, isBusy && styles.ctaButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              onPress={handlePlanAction}
              disabled={isBusy}
            >
              <LinearGradient
                colors={
                  selectedPlan.recommended
                    ? [colors.primary, colors.primaryMid]
                    : [colors.accent, colors.accentCyan]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>{ctaLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    backgroundColor: colors.background,
  },

  safeArea: {
    flex: 1,
  },

  headerBar: {
    minHeight: layout.iconButton,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  headerSpacer: {
    width: layout.iconButtonSm,
  },

  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: ms(140),
  },

  hero: {
    marginBottom: spacing['4xl'],
  },

  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    marginBottom: spacing.xl,
  },

  heroBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  heroTitle: {
    color: colors.text,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.6,
    lineHeight: ms(34),
    marginBottom: spacing.md,
  },

  heroSubtitle: {
    color: colors.subText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
    maxWidth: ms(320),
  },

  plansList: {
    gap: spacing['2xl'],
  },

  planLoaderCard: {
    minHeight: ms(184),
    borderRadius: radii['3xl'],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing['4xl'],
    ...shadows.soft,
  },

  planLoaderTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
  },

  planLoaderText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  planCard: {
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    padding: spacing['4xl'],
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.soft,
  },

  planCardWithRadio: {
    position: 'relative',
    paddingRight: spacing['4xl'] + ms(34),
  },

  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    ...shadows.card,
  },

  planCardProSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FAFAFF',
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },

  popularBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },

  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },

  currentBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },

  planCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },

  planIdentity: {
    flex: 1,
    gap: spacing.sm,
  },

  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  planName: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },

  planNameSelected: {
    color: colors.primary,
  },

  proPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },

  proPillText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 0.6,
  },

  planDescription: {
    color: colors.subText,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  radioOuter: {
    position: 'absolute',
    top: spacing['4xl'],
    right: spacing['4xl'],
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  radioOuterSelected: {
    borderColor: colors.primary,
  },

  radioInner: {
    width: ms(12),
    height: ms(12),
    borderRadius: ms(6),
    backgroundColor: colors.primary,
  },

  priceBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing['2xl'],
  },

  price: {
    color: colors.text,
    fontSize: ms(36),
    lineHeight: ms(40),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1,
  },

  priceSelected: {
    color: colors.primaryDark,
  },

  cadence: {
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
    marginBottom: ms(6),
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing['2xl'],
  },

  featureList: {
    gap: spacing.xl,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  checkIconWrap: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },

  checkIconAccent: {
    backgroundColor: colors.primary,
  },

  featureText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(20),
  },

  featureTextSelected: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },

  trustRow: {
    marginTop: spacing['4xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },

  trustText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  loadingText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xl,
    textAlign: 'center',
  },

  bottomSafe: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  bottomBar: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },

  bottomSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomPlanName: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  bottomPriceHint: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  ctaButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.primary,
  },

  ctaButtonDisabled: {
    opacity: 0.65,
  },

  ctaGradient: {
    minHeight: ms(54),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
});
