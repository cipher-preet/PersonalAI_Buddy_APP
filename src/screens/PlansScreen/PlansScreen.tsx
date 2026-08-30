import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
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
  PlanCode,
  useActivateFreePlanMutation,
  useCreatePaymentOrderMutation,
  useGetPlanStatusQuery,
  useGetPlansQuery,
  useVerifyPaymentMutation,
} from '../../store/api/payments';

type UiPlanId = 'free' | 'pro' | 'pro_plus';
type BillingCycle = 'monthly' | 'quarterly' | 'annually';

type UiPlan = {
  id: UiPlanId;
  backendCode: PlanCode | null;
  name: string;
  tagline: string;
  prices: Record<BillingCycle, string>;
  accent: string;
  accentSoft: string;
  features: string[];
  comingSoon?: boolean;
};

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BILLING_OPTIONS: { id: BillingCycle; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'annually', label: 'Annually' },
];

const CYCLE_CADENCE: Record<BillingCycle, string> = {
  monthly: 'month',
  quarterly: 'quarter',
  annually: 'year',
};

const CYCLE_HINT: Record<BillingCycle, string | null> = {
  monthly: null,
  quarterly: 'Save 11% vs monthly',
  annually: 'Best value · Save 16%',
};

const UI_PLANS: UiPlan[] = [
  {
    id: 'free',
    backendCode: 'free',
    name: 'Starter',
    tagline: 'Best for getting started',
    prices: {
      monthly: 'Free',
      quarterly: 'Free',
      annually: 'Free',
    },
    accent: '#F59E0B',
    accentSoft: '#FEF3C7',
    features: [
      '5 memory spaces',
      '100 captured notes',
      'Basic task extraction',
      'Daily voice capture',
      'Standard AI summaries',
    ],
  },
  {
    id: 'pro',
    backendCode: 'pro',
    name: 'Buddy Pro',
    tagline: 'Best for daily capture',
    prices: {
      monthly: '₹299',
      quarterly: '₹799',
      annually: '₹2,999',
    },
    accent: colors.accentIndigo,
    accentSoft: colors.primaryLight,
    features: [
      'Everything in Starter',
      'Unlimited memory spaces',
      'Advanced notes and task extraction',
      'Priority voice processing',
      'Smarter reminders and follow-ups',
    ],
  },
  {
    id: 'pro_plus',
    backendCode: null,
    name: 'Buddy Pro Plus',
    tagline: 'Best for power users',
    prices: {
      monthly: '₹499',
      quarterly: '₹1,299',
      annually: '₹4,999',
    },
    accent: colors.primaryPurple,
    accentSoft: colors.primarySoft,
    comingSoon: true,
    features: [
      'Everything in Buddy Pro',
      'Team-ready shared spaces',
      'Longer voice sessions',
      'Custom briefing styles',
      'Priority support',
    ],
  },
];

const BackIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 7l10 10M17 7 7 17"
      stroke={colors.text}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparkIcon = () => (
  <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Z"
      fill={colors.primary}
    />
  </Svg>
);

const CheckIcon = ({ color = colors.primary }: { color?: string }) => (
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

const animateCards = () => {
  LayoutAnimation.configureNext({
    duration: 220,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
};

const PlansScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const subscribeSheetRef = useRef<BottomSheetModal>(null);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const name = useAppSelector(state => state.auth.name);
  const email = useAppSelector(state => state.auth.email);
  const phone = useAppSelector(state => state.auth.phone);
  const { showToast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<UiPlanId>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  const plans = useMemo<UiPlan[]>(() => {
    return UI_PLANS.map(plan => {
      const backend = plansData?.plans?.find(
        item => item.code === plan.backendCode,
      );

      if (!backend || plan.comingSoon) {
        return plan;
      }

      const monthly =
        backend.amount === 0 ? 'Free' : `₹${Math.round(backend.amount / 100)}`;

      return {
        ...plan,
        prices: {
          ...plan.prices,
          monthly,
        },
      };
    });
  }, [plansData]);

  const selectedPlan =
    plans.find(plan => plan.id === selectedPlanId) ?? plans[1] ?? plans[0];
  const currentPlanCode = planStatus?.plan?.code;
  const isLoadingInitialPlan =
    !currentPlanCode && (isFetchingPlans || isFetchingPlanStatus);
  const isBusy = isActivatingFree || isCreatingOrder || isVerifyingPayment;

  useEffect(() => {
    if (!currentPlanCode || hasSyncedCurrentPlan.current) {
      return;
    }

    if (currentPlanCode === 'free' || currentPlanCode === 'pro') {
      setSelectedPlanId(currentPlanCode);
    }
    hasSyncedCurrentPlan.current = true;
  }, [currentPlanCode]);

  useEffect(() => {
    if (!isSheetOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isBusy) {
          return true;
        }
        subscribeSheetRef.current?.dismiss();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isBusy, isSheetOpen]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={isBusy ? 'none' : 'close'}
        opacity={0.45}
      />
    ),
    [isBusy],
  );

  const handleSelectCard = useCallback((planId: UiPlanId) => {
    animateCards();
    setSelectedPlanId(planId);
  }, []);

  const startCheckout = useCallback(
    async (plan: UiPlan) => {
      if (!userId) {
        showToast({ message: 'Please login again to continue.', type: 'error' });
        return;
      }

      if (plan.comingSoon || !plan.backendCode) {
        showToast({
          message: 'Buddy Pro Plus is coming soon.',
          type: 'info',
        });
        return;
      }

      if (billingCycle !== 'monthly') {
        showToast({
          message:
            'Quarterly and annual billing will be available soon. You can subscribe monthly for now.',
          type: 'info',
        });
        return;
      }

      if (currentPlanCode === plan.backendCode) {
        showToast({ message: 'This is already your active plan.', type: 'info' });
        return;
      }

      try {
        if (plan.backendCode === 'free') {
          const response = await activateFreePlan({ userId }).unwrap();
          showToast({
            message: response.message || 'Starter plan activated.',
            type: 'success',
          });
          refetchPlanStatus();
          return;
        }

        const order = await createPaymentOrder({
          userId,
          planCode: plan.backendCode,
        }).unwrap();

        if (!order.requiresPayment) {
          showToast({
            message: order.message || 'Plan updated successfully.',
            type: 'success',
          });
          refetchPlanStatus();
          subscribeSheetRef.current?.dismiss();
          return;
        }

        let checkoutResponse;

        try {
          checkoutResponse = await RazorpayCheckout.open({
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: 'Buddy',
            description: `${plan.name} ${billingCycle} subscription`,
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
        subscribeSheetRef.current?.dismiss();
      } catch (error: any) {
        const message =
          error?.data?.message ||
          error?.message ||
          'Payment could not be completed. Please try again.';

        showToast({ message, type: 'error' });
      }
    },
    [
      activateFreePlan,
      billingCycle,
      createPaymentOrder,
      currentPlanCode,
      email,
      name,
      phone,
      refetchPlanStatus,
      showToast,
      userId,
      verifyPayment,
    ],
  );

  const handleSelectThisPlan = useCallback(
    (plan: UiPlan) => {
      if (plan.id === 'free') {
        startCheckout(plan);
        return;
      }

      setSelectedPlanId(plan.id);
      setBillingCycle('monthly');
      requestAnimationFrame(() => {
        subscribeSheetRef.current?.present();
      });
    },
    [startCheckout],
  );

  const displayPrice = selectedPlan.prices[billingCycle];
  const displayCadence = CYCLE_CADENCE[billingCycle];
  const subscribeLabel = isBusy
    ? 'Please wait...'
    : selectedPlan.comingSoon
      ? 'Notify me when it launches'
      : billingCycle !== 'monthly'
        ? 'Coming soon'
        : `Subscribe to ${selectedPlan.name}`;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.white]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.headerButton}
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
        >
          <View style={styles.hero}>
            <View style={styles.haloOuter}>
              <LinearGradient
                colors={[colors.primarySoft, colors.white]}
                style={styles.haloInner}
              >
                <SparkIcon />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>Choose your Buddy plan</Text>
            <Text style={styles.heroSubtitle}>
              Capture more, remember more. Switch anytime.
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
            <View style={styles.planStack}>
              {plans.map(plan => {
                const selected = plan.id === selectedPlanId;
                const isCurrent =
                  plan.backendCode != null &&
                  currentPlanCode === plan.backendCode;
                const priceText =
                  plan.id === 'free'
                    ? 'Free'
                    : `${plan.prices.monthly}/month`;

                return (
                  <Pressable
                    key={plan.id}
                    onPress={() => handleSelectCard(plan.id)}
                    style={[
                      styles.planCard,
                      selected && styles.planCardSelected,
                      selected && { borderColor: plan.accent },
                    ]}
                  >
                    <View
                      style={[styles.accentBar, { backgroundColor: plan.accent }]}
                    />

                    <View style={styles.planCardBody}>
                      <View style={styles.planCardTop}>
                        <View style={styles.planCopy}>
                          <Text style={styles.planName}>{plan.name}</Text>
                          <Text style={styles.planTagline}>{plan.tagline}</Text>
                        </View>

                        {isCurrent ? (
                          <View
                            style={[
                              styles.currentBadge,
                              { backgroundColor: plan.accentSoft },
                            ]}
                          >
                            <CheckIcon color={plan.accent} />
                            <Text
                              style={[
                                styles.currentBadgeText,
                                { color: plan.accent },
                              ]}
                            >
                              Current
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.planPrice}>{priceText}</Text>
                        )}
                      </View>

                      {selected ? (
                        <View style={styles.expandedBlock}>
                          <View style={styles.featureList}>
                            {plan.features.map(feature => (
                              <View key={feature} style={styles.featureRow}>
                                <View
                                  style={[
                                    styles.featureCheck,
                                    { backgroundColor: plan.accentSoft },
                                  ]}
                                >
                                  <CheckIcon color={plan.accent} />
                                </View>
                                <Text style={styles.featureText}>{feature}</Text>
                              </View>
                            ))}
                          </View>

                          <TouchableOpacity
                            activeOpacity={0.88}
                            disabled={isBusy || isCurrent}
                            style={[
                              styles.selectButton,
                              { backgroundColor: plan.accent },
                              (isBusy || isCurrent) &&
                                styles.selectButtonDisabled,
                            ]}
                            onPress={() => handleSelectThisPlan(plan)}
                          >
                            {isBusy && selected && plan.id === 'free' ? (
                              <ActivityIndicator color={colors.white} />
                            ) : (
                              <Text style={styles.selectButtonText}>
                                {isCurrent
                                  ? 'Current plan'
                                  : plan.comingSoon
                                    ? 'Join waitlist'
                                    : `Select ${plan.name}`}
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomSheetModal
        ref={subscribeSheetRef}
        enableDynamicSizing
        enablePanDownToClose={!isBusy}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
        onChange={index => setIsSheetOpen(index >= 0)}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: spacing['2xl'] + insets.bottom },
          ]}
        >
          <Text style={styles.sheetTitle}>{selectedPlan.name}</Text>
          <Text style={styles.sheetPrice}>
            {displayPrice}
            {selectedPlan.id !== 'free' ? (
              <Text style={styles.sheetCadence}>/{displayCadence}</Text>
            ) : null}
          </Text>
          {CYCLE_HINT[billingCycle] ? (
            <Text style={styles.sheetHint}>{CYCLE_HINT[billingCycle]}</Text>
          ) : null}

          <View style={styles.billingToggle}>
            {BILLING_OPTIONS.map(option => {
              const active = billingCycle === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.85}
                  style={[
                    styles.billingChip,
                    active && styles.billingChipActive,
                    active && shadows.soft,
                  ]}
                  onPress={() => setBillingCycle(option.id)}
                >
                  <Text
                    style={[
                      styles.billingChipText,
                      active && styles.billingChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.featuresBox}>
            <View style={styles.featuresBoxHeader}>
              <Text style={styles.featuresBoxLabel}>Features</Text>
            </View>
            <View style={styles.featuresBoxBody}>
              {selectedPlan.features.map(feature => (
                <View key={feature} style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureCheck,
                      { backgroundColor: selectedPlan.accentSoft },
                    ]}
                  >
                    <CheckIcon color={selectedPlan.accent} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={isBusy}
            style={[
              styles.subscribeButton,
              { backgroundColor: selectedPlan.accent },
              isBusy && styles.selectButtonDisabled,
            ]}
            onPress={() => startCheckout(selectedPlan)}
          >
            {isBusy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.selectButtonText}>{subscribeLabel}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.legalText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </BottomSheetScrollView>
      </BottomSheetModal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  headerButton: {
    width: layout.headerButton,
    height: layout.headerButton,
    borderRadius: layout.headerButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: spacing['6xl'],
    flexGrow: 1,
  },

  hero: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },

  haloOuter: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.lg,
  },

  haloInner: {
    width: ms(54),
    height: ms(54),
    borderRadius: ms(27),
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    color: colors.text,
    fontSize: ms(26),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.6,
    textAlign: 'center',
  },

  heroSubtitle: {
    marginTop: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  loaderCard: {
    minHeight: ms(140),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  loaderTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
  },

  loaderText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  planStack: {
    gap: spacing.sm,
  },

  planCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  planCardSelected: {
    borderWidth: 1.5,
  },

  accentBar: {
    width: ms(5),
  },

  planCardBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  planCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  planCopy: {
    flex: 1,
    minWidth: 0,
  },

  planName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.2,
  },

  planTagline: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  planPrice: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xxs,
  },

  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },

  currentBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  expandedBlock: {
    marginTop: spacing.lg,
  },

  featureList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  featureCheck: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(1),
  },

  featureText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(20),
  },

  selectButton: {
    minHeight: ms(48),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectButtonDisabled: {
    opacity: 0.55,
  },

  selectButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },

  sheetIndicator: {
    backgroundColor: colors.border,
    width: ms(48),
    height: ms(5),
    borderRadius: radii.pill,
  },

  sheetContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
  },

  sheetTitle: {
    color: colors.text,
    fontSize: ms(22),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },

  sheetPrice: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },

  sheetHint: {
    marginTop: spacing.xs,
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  sheetCadence: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  billingToggle: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: radii.pill,
    padding: spacing.xs,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  billingChip: {
    flex: 1,
    minHeight: ms(38),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  billingChipActive: {
    backgroundColor: colors.white,
  },

  billingChipText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  billingChipTextActive: {
    color: colors.text,
    fontWeight: fontWeight.bold,
  },

  featuresBox: {
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },

  featuresBoxHeader: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  featuresBoxLabel: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  featuresBoxBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  subscribeButton: {
    minHeight: ms(52),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  legalText: {
    marginTop: spacing.md,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: ms(16),
  },
});
