import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { MainTabParamList } from '../../navigation/types';
import { useSubmitFeedbackMutation } from '../../store/api/home';
import { useToast } from '../../store/context/ToastContext';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';

type Step = 'topic' | 'details' | 'success';

type FeedbackTopic = {
  id: string;
  label: string;
};

const FEEDBACK_TOPICS: FeedbackTopic[] = [
  { id: 'app_bug', label: 'Something is wrong with the app' },
  { id: 'reminder_issue', label: 'Issue with reminders or alerts' },
  { id: 'ai_issue', label: 'Buddy / AI is not working right' },
  { id: 'billing', label: 'Billing or plan question' },
  { id: 'other', label: 'Other feedback' },
];

const CloseIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={colors.subText}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const ChevronDownIcon = ({ color = colors.muted }: { color?: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 9 6 6 6-6"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m5.5 12.5 4 4L18.5 7.5"
      stroke={colors.primary}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowRightIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M13 6l6 6-6 6"
      stroke={colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HelpHeroArt = () => (
  <View style={styles.heroArt}>
    <View style={styles.heroBlob} />
    <Svg width={ms(92)} height={ms(92)} viewBox="0 0 96 96" fill="none">
      <Circle cx={48} cy={48} r={28} fill={colors.primaryLight} />
      <Circle
        cx={48}
        cy={48}
        r={20}
        stroke={colors.primary}
        strokeWidth={5}
        fill={colors.white}
      />
      <Circle cx={48} cy={48} r={8} fill={colors.primaryPurple} />
      <Path
        d="M48 18v8M48 70v8M18 48h8M70 48h8"
        stroke={colors.brandBorder}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M27 27l5 5M64 64l5 5M64 27l-5 5M32 64l-5 5"
        stroke={colors.primaryMid}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const ThanksHeroArt = () => (
  <View style={styles.heroArt}>
    <View style={[styles.heroBlob, styles.heroBlobSuccess]} />
    <Svg width={ms(110)} height={ms(96)} viewBox="0 0 120 100" fill="none">
      <Path
        d="M34 78V42"
        stroke={colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M78 78V36"
        stroke={colors.primaryPurple}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Rect x={18} y={24} width={34} height={22} rx={8} fill={colors.primary} />
      <Rect
        x={62}
        y={18}
        width={34}
        height={22}
        rx={8}
        fill={colors.primaryPurple}
      />
      <Path
        d="M28 35h14"
        stroke={colors.white}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M79 26c1.6-1.8 4.4-1.8 6 0l.8.9.8-.9c1.6-1.8 4.4-1.8 6 0 1.8 2 1.5 5.1-.8 6.9L85.8 40 79.8 33c-2.3-1.8-2.6-4.9-.8-6.9Z"
        fill={colors.white}
      />
      <Circle cx={98} cy={52} r={7} fill={colors.primarySoft} />
      <Circle cx={22} cy={56} r={5} fill={colors.primaryLight} />
    </Svg>
  </View>
);

const FeedbackScreen = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('topic');
  const [topicOpen, setTopicOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

  const selectedTopic = useMemo(
    () => FEEDBACK_TOPICS.find(topic => topic.id === selectedTopicId) ?? null,
    [selectedTopicId],
  );

  const canContinueFromTopic = Boolean(selectedTopicId);
  const canSubmit =
    Boolean(selectedTopicId) && message.trim().length >= 8 && !isLoading;

  const resetFlow = useCallback(() => {
    setStep('topic');
    setTopicOpen(false);
    setSelectedTopicId(null);
    setMessage('');
  }, []);

  const handleClose = useCallback(() => {
    resetFlow();
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.jumpTo('Home');
  }, [navigation, resetFlow]);

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setTopicOpen(false);
  };

  const handleContinue = async () => {
    if (step === 'topic') {
      if (!canContinueFromTopic) {
        return;
      }
      setStep('details');
      return;
    }

    if (step === 'details') {
      if (!canSubmit || !selectedTopic) {
        return;
      }

      try {
        await submitFeedback({
          topicId: selectedTopic.id,
          topicLabel: selectedTopic.label,
          message: message.trim(),
        }).unwrap();
        setStep('success');
      } catch (error: any) {
        const apiMessage =
          error?.data?.message ||
          error?.data?.data?.message ||
          error?.error ||
          error?.message;
        showToast({
          message:
            typeof apiMessage === 'string' && apiMessage.trim()
              ? apiMessage
              : 'Unable to send feedback. Please try again.',
          type: 'error',
        });
      }
    }
  };

  const handleGoHome = useCallback(() => {
    // Jump first so we leave Feedback before local state resets to the topic step.
    navigation.jumpTo('Home');
    resetFlow();
  }, [navigation, resetFlow]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close feedback"
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.flex}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {step === 'success' ? <ThanksHeroArt /> : <HelpHeroArt />}

            {step !== 'success' ? (
              <>
                <Text style={styles.title}>Help us improve</Text>
                <Text style={styles.subtitle}>
                  Please select a topic below and tell us about your concern.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[
                    styles.topicField,
                    topicOpen && styles.topicFieldOpen,
                  ]}
                  onPress={() => setTopicOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Select topic"
                >
                  <Text
                    style={[
                      styles.topicFieldText,
                      !selectedTopic && styles.topicFieldPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedTopic?.label || 'Select topic'}
                  </Text>
                  <ChevronDownIcon
                    color={topicOpen ? colors.primary : colors.muted}
                  />
                </TouchableOpacity>

                {step === 'details' ? (
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Share a few details so we can help..."
                    placeholderTextColor={colors.muted}
                    style={styles.messageInput}
                    multiline
                    textAlignVertical="top"
                    maxLength={1200}
                    autoFocus
                  />
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.title}>Thank you!</Text>
                <Text style={styles.subtitle}>
                  Thank you for sharing your thoughts. We appreciate your
                  feedback!
                </Text>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step === 'success' ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.goHomeLink}
                onPress={handleGoHome}
                accessibilityRole="button"
                accessibilityLabel="Go to main"
                hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
              >
                <Text style={styles.goHomeText}>Go to main</Text>
                <ArrowRightIcon />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={
                  step === 'topic' ? !canContinueFromTopic : !canSubmit
                }
                style={[
                  styles.continueButton,
                  (step === 'topic'
                    ? !canContinueFromTopic
                    : !canSubmit) && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.continueText,
                      (step === 'topic'
                        ? !canContinueFromTopic
                        : !canSubmit) && styles.continueTextDisabled,
                    ]}
                  >
                    {step === 'details' ? 'Send feedback' : 'Continue'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={topicOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setTopicOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setTopicOpen(false)}
        >
          <Pressable
            style={styles.pickerCard}
            onPress={event => event.stopPropagation()}
          >
            <Text style={styles.pickerTitle}>Select topic</Text>
            {FEEDBACK_TOPICS.map((topic, index) => {
              const selected = topic.id === selectedTopicId;
              return (
                <View key={topic.id}>
                  {index > 0 ? <View style={styles.pickerDivider} /> : null}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.pickerRow}
                    onPress={() => handleSelectTopic(topic.id)}
                  >
                    <Text
                      style={[
                        styles.pickerRowText,
                        selected && styles.pickerRowTextSelected,
                      ]}
                    >
                      {topic.label}
                    </Text>
                    {selected ? <CheckIcon /> : null}
                  </TouchableOpacity>
                </View>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    minHeight: ms(44),
  },
  topBarSpacer: {
    flex: 1,
  },
  closeButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing['4xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  heroArt: {
    width: ms(160),
    height: ms(140),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  heroBlob: {
    position: 'absolute',
    width: ms(132),
    height: ms(118),
    borderRadius: ms(60),
    backgroundColor: colors.primarySoft,
    transform: [{ rotate: '-8deg' }],
  },
  heroBlobSuccess: {
    backgroundColor: colors.primaryLight,
  },
  title: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: ms(26),
  },
  subtitle: {
    marginTop: spacing.md,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: ms(20),
    maxWidth: ms(300),
    marginBottom: spacing['4xl'],
  },
  topicField: {
    width: '100%',
    minHeight: ms(56),
    borderRadius: radii['2xl'],
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topicFieldOpen: {
    borderColor: colors.borderFocus,
  },
  topicFieldText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  topicFieldPlaceholder: {
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
  messageInput: {
    width: '100%',
    minHeight: ms(160),
    marginTop: spacing.xl,
    borderRadius: radii['2xl'],
    borderWidth: 1.5,
    borderColor: colors.brandBorder,
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
  },
  footer: {
    paddingHorizontal: spacing['4xl'],
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.md,
  },
  continueButton: {
    minHeight: layout.buttonHeight,
    borderRadius: radii['2xl'],
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  continueText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  continueTextDisabled: {
    color: colors.muted,
  },
  goHomeLink: {
    minHeight: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  goHomeText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  pickerCard: {
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    overflow: 'hidden',
  },
  pickerTitle: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.md,
  },
  pickerRow: {
    minHeight: ms(52),
    paddingHorizontal: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerRowText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(20),
  },
  pickerRowTextSelected: {
    color: colors.primaryDark,
    fontWeight: fontWeight.bold,
  },
  pickerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing['2xl'],
  },
});
