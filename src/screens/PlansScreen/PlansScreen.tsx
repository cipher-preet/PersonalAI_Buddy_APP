import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const plans = [
  {
    id: 'starter',
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
  },
  {
    id: 'pro',
    name: 'Buddy Pro',
    price: '$9',
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
  },
];

const CheckIcon = () => (
  <View style={styles.checkIconWrap}>
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12 4 4L19 6"
        stroke="#5B5FF8"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const CrownIcon = () => (
  <View style={styles.crownWrap}>
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 16-1-9 5 4 3-6 3 6 5-4-1 9H5Z"
        fill="#FFFFFF"
      />
      <Path
        d="M5 19h14"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const BackIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke="#111827"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlansScreen = () => {
  const navigation = useNavigation();
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const selectedPlanIndex = plans.findIndex(plan => plan.id === selectedPlanId);
  const selectedPlan = useMemo(
    () => plans.find(plan => plan.id === selectedPlanId) ?? plans[1],
    [selectedPlanId],
  );

  return (
    <LinearGradient
      colors={['#F9F7FF', '#EFF3FF', '#F7FAFF', '#FFFFFF']}
      locations={[0, 0.45, 0.78, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Choose your plan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <LinearGradient
            colors={
              selectedPlan.recommended
                ? ['#C8D6FF', '#7C4DFF', '#15C7E8']
                : ['#DDE5FF', '#E8EDF9', '#BFD7FF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planBorder}
          >
            <View style={styles.planCard}>
              <View style={styles.priceHeader}>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{selectedPlan.price}</Text>
                  <Text style={styles.cadence}>/{selectedPlan.cadence}</Text>
                </View>
                {selectedPlan.recommended ? <CrownIcon /> : null}
              </View>

              <View style={styles.planIntro}>
                <Text style={styles.planName}>{selectedPlan.name}</Text>
                {selectedPlan.recommended ? (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.planDescription}>
                {selectedPlan.description}
              </Text>

              <Text style={styles.sectionLabel}>What you get</Text>

              <View style={styles.featurePanel}>
                {selectedPlan.features.map(feature => (
                  <View key={feature} style={styles.featureRow}>
                    <CheckIcon />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>

          <View style={styles.dotsRow}>
            {plans.map((plan, index) => {
              const selected = index === selectedPlanIndex;

              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${plan.name} plan`}
                  style={[styles.dot, selected && styles.activeDot]}
                  onPress={() => setSelectedPlanId(plan.id)}
                />
              );
            })}
          </View>

          <View style={styles.planSwitchRow}>
            {plans.map(plan => {
              const selected = plan.id === selectedPlanId;

              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.82}
                  style={[
                    styles.planChip,
                    selected && styles.selectedPlanChip,
                  ]}
                  onPress={() => setSelectedPlanId(plan.id)}
                >
                  <Text
                    style={[
                      styles.planChipText,
                      selected && styles.selectedPlanChipText,
                    ]}
                  >
                    {plan.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity activeOpacity={0.86} style={styles.subscribeButton}>
            <LinearGradient
              colors={['#5B5FF8', '#15C7E8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.subscribeGradient}
            >
              <Text style={styles.subscribeText}>
                {selectedPlan.id === 'starter' ? 'Start Free' : 'Subscribe'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7FF',
  },

  safeArea: {
    flex: 1,
  },

  headerBar: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFFA8',
  },

  headerTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 126,
  },

  planBorder: {
    borderRadius: 30,
    padding: 1.6,
    shadowColor: '#5B5FF8',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
  },

  planCard: {
    minHeight: 560,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },

  priceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  price: {
    color: '#111827',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
  },

  cadence: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '700',
    marginLeft: 2,
  },

  crownWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B5FF8',
    shadowColor: '#5B5FF8',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },

  planIntro: {
    marginTop: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  planName: {
    color: '#5B5FF8',
    fontSize: 18,
    fontWeight: '900',
  },

  recommendedBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#F0F2FF',
  },

  recommendedText: {
    color: '#5B5FF8',
    fontSize: 11,
    fontWeight: '900',
  },

  planDescription: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },

  sectionLabel: {
    marginTop: 34,
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
  },

  featurePanel: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: '#FAF8FF',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#C8D6FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  featureText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    flex: 1,
  },

  dotsRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },

  activeDot: {
    width: 34,
    backgroundColor: '#5B5FF8',
  },

  planSwitchRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },

  planChip: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedPlanChip: {
    backgroundColor: '#F0F2FF',
    borderColor: '#5B5FF8',
  },

  planChipText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '900',
  },

  selectedPlanChipText: {
    color: '#5B5FF8',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2FF',
  },

  subscribeButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#5B5FF8',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },

  subscribeGradient: {
    minHeight: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subscribeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
