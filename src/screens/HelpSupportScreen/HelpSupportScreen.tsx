import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
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

import { SUPPORT_CONFIG } from '../../config/supportConfig';
import type { MainTabParamList } from '../../navigation/types';
import { useRaiseSupportTicketMutation } from '../../store/api/home';
import { useToast } from '../../store/context/ToastContext';
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

type ViewMode = 'hub' | 'ticket' | 'success';

type TicketCategory = {
  id: string;
  label: string;
};

const TICKET_CATEGORIES: TicketCategory[] = [
  { id: 'account', label: 'Account or login issue' },
  { id: 'billing', label: 'Billing or subscription' },
  { id: 'technical', label: 'App bug or crash' },
  { id: 'reminder', label: 'Reminders or calling' },
  { id: 'other', label: 'Something else' },
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

const ChevronRightIcon = ({ color = colors.muted }: { color?: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 6 6 6-6 6"
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

const MailIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
      stroke={color}
      strokeWidth={1.7}
    />
    <Path
      d="m5.5 8 6.5 5 6.5-5"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TicketIcon = ({ color = colors.primaryPurpleDark }: { color?: string }) => (
  <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 9.5V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5a2 2 0 1 0 0 5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5a2 2 0 1 0 0-5Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path
      d="M12 8v8"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeDasharray="2 3"
    />
  </Svg>
);

const SupportHeroArt = () => (
  <View style={styles.heroArt}>
    <View style={styles.heroBlob} />
    <Svg width={ms(108)} height={ms(96)} viewBox="0 0 120 100" fill="none">
      <Circle cx={60} cy={52} r={30} fill={colors.primaryLight} />
      <Circle
        cx={60}
        cy={52}
        r={22}
        stroke={colors.primary}
        strokeWidth={4}
        fill={colors.white}
      />
      <Path
        d="M52 48c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3-1.6 5.5-4 6.9V58"
        stroke={colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx={60} cy={64} r={2.2} fill={colors.primary} />
      <Circle cx={88} cy={34} r={8} fill={colors.primarySoft} />
      <Circle cx={32} cy={36} r={6} fill={colors.primaryLight} />
      <Rect x={78} y={62} width={22} height={14} rx={7} fill={colors.primaryPurple} />
      <Path
        d="M84 69h10"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const SuccessHeroArt = () => (
  <View style={styles.heroArt}>
    <View style={[styles.heroBlob, styles.heroBlobSuccess]} />
    <Svg width={ms(110)} height={ms(96)} viewBox="0 0 120 100" fill="none">
      <Circle cx={60} cy={50} r={28} fill={colors.primaryLight} />
      <Circle cx={60} cy={50} r={20} fill={colors.white} />
      <Path
        d="m48 51 7.5 7.5L73 41"
        stroke={colors.primary}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={92} cy={34} r={7} fill={colors.primarySoft} />
      <Circle cx={28} cy={62} r={5} fill={colors.primaryLight} />
    </Svg>
  </View>
);

const HelpSupportScreen = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { showToast } = useToast();
  const [view, setView] = useState<ViewMode>('hub');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [raiseTicket, { isLoading }] = useRaiseSupportTicketMutation();

  const selectedCategory = useMemo(
    () =>
      TICKET_CATEGORIES.find(item => item.id === selectedCategoryId) ?? null,
    [selectedCategoryId],
  );

  const canSubmit =
    Boolean(selectedCategoryId) &&
    subject.trim().length >= 4 &&
    message.trim().length >= 12 &&
    !isLoading;

  const resetTicketForm = useCallback(() => {
    setCategoryOpen(false);
    setSelectedCategoryId(null);
    setSubject('');
    setMessage('');
    setTicketId(null);
  }, []);

  const resetAll = useCallback(() => {
    setView('hub');
    resetTicketForm();
  }, [resetTicketForm]);

  const leaveScreen = useCallback(() => {
    resetAll();
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.jumpTo('Profile');
  }, [navigation, resetAll]);

  const handleBack = () => {
    if (view === 'ticket') {
      resetTicketForm();
      setView('hub');
      return;
    }
    if (view === 'success') {
      resetAll();
      return;
    }
    leaveScreen();
  };

  const handleEmailSupport = async () => {
    const url = `mailto:${SUPPORT_CONFIG.email}?subject=${encodeURIComponent(
      SUPPORT_CONFIG.emailSubject,
    )}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        showToast({
          message: `Email us at ${SUPPORT_CONFIG.email}`,
          type: 'info',
        });
        return;
      }
      await Linking.openURL(url);
    } catch {
      showToast({
        message: `Email us at ${SUPPORT_CONFIG.email}`,
        type: 'info',
      });
    }
  };

  const handleSubmitTicket = async () => {
    if (!canSubmit || !selectedCategory) {
      return;
    }

    try {
      const response = await raiseTicket({
        categoryId: selectedCategory.id,
        categoryLabel: selectedCategory.label,
        subject: subject.trim(),
        message: message.trim(),
      }).unwrap();

      setTicketId(response?.data?.ticketId ?? null);
      setView('success');
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
            : 'Unable to raise ticket. Please try again.',
        type: 'error',
      });
    }
  };

  const handleGoHome = useCallback(() => {
    navigation.jumpTo('Home');
    resetAll();
  }, [navigation, resetAll]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            {view === 'hub' ? <CloseIcon /> : <BackIcon />}
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>
            {view === 'ticket'
              ? 'Raise a ticket'
              : view === 'success'
                ? 'Ticket sent'
                : 'Help & Support'}
          </Text>
          <View style={styles.topBarSpacer} />
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
            {view === 'success' ? <SuccessHeroArt /> : <SupportHeroArt />}

            {view === 'hub' ? (
              <>
                <Text style={styles.title}>We’re here to help</Text>
                <Text style={styles.subtitle}>
                  Reach the Buddy team by email, or raise a ticket and we’ll
                  follow up.
                </Text>

                <View style={styles.responseChip}>
                  <View style={styles.responseDot} />
                  <Text style={styles.responseText}>
                    {SUPPORT_CONFIG.responseHint}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.optionCard}
                  onPress={handleEmailSupport}
                  accessibilityRole="button"
                  accessibilityLabel="Email support"
                >
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <MailIcon color={colors.primary} />
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>Email us</Text>
                    <Text style={styles.optionSubtitle}>
                      {SUPPORT_CONFIG.email}
                    </Text>
                  </View>
                  <ChevronRightIcon color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.optionCard, styles.optionCardSpaced]}
                  onPress={() => setView('ticket')}
                  accessibilityRole="button"
                  accessibilityLabel="Raise a ticket"
                >
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <TicketIcon />
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>Raise a ticket</Text>
                    <Text style={styles.optionSubtitle}>
                      Tracked support for account, billing, and bugs
                    </Text>
                  </View>
                  <ChevronRightIcon color={colors.primaryPurpleDark} />
                </TouchableOpacity>

                <Text style={styles.footerNote}>
                  Include your account email and what you were doing when the
                  issue happened — it helps us resolve things faster.
                </Text>
              </>
            ) : null}

            {view === 'ticket' ? (
              <>
                <Text style={styles.title}>Tell us what’s wrong</Text>
                <Text style={styles.subtitle}>
                  Choose a category and share enough detail for our team to
                  investigate.
                </Text>

                <Text style={styles.fieldLabel}>Category</Text>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[
                    styles.field,
                    categoryOpen && styles.fieldFocused,
                  ]}
                  onPress={() => setCategoryOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Select category"
                >
                  <Text
                    style={[
                      styles.fieldText,
                      !selectedCategory && styles.fieldPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedCategory?.label || 'Select category'}
                  </Text>
                  <ChevronDownIcon
                    color={categoryOpen ? colors.primary : colors.muted}
                  />
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>Subject</Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Short summary of the issue"
                  placeholderTextColor={colors.muted}
                  style={styles.subjectInput}
                  maxLength={120}
                  returnKeyType="next"
                />

                <Text style={styles.fieldLabel}>Details</Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="What happened, and what did you expect instead?"
                  placeholderTextColor={colors.muted}
                  style={styles.messageInput}
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <Text style={styles.charCount}>
                  {message.trim().length}/2000
                </Text>
              </>
            ) : null}

            {view === 'success' ? (
              <>
                <Text style={styles.title}>Ticket raised</Text>
                <Text style={styles.subtitle}>
                  Thanks for reaching out. Our support team will review your
                  request and get back to you soon.
                </Text>
                {ticketId ? (
                  <View style={styles.ticketBadge}>
                    <Text style={styles.ticketBadgeLabel}>Ticket ID</Text>
                    <Text style={styles.ticketBadgeValue} numberOfLines={1}>
                      {ticketId}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            {view === 'ticket' ? (
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!canSubmit}
                style={[
                  styles.primaryButton,
                  !canSubmit && styles.primaryButtonDisabled,
                ]}
                onPress={handleSubmitTicket}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.primaryButtonText,
                      !canSubmit && styles.primaryButtonTextDisabled,
                    ]}
                  >
                    Submit ticket
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}

            {view === 'success' ? (
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
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setCategoryOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setCategoryOpen(false)}
        >
          <Pressable
            style={styles.pickerCard}
            onPress={event => event.stopPropagation()}
          >
            <Text style={styles.pickerTitle}>Select category</Text>
            {TICKET_CATEGORIES.map((category, index) => {
              const selected = category.id === selectedCategoryId;
              return (
                <View key={category.id}>
                  {index > 0 ? <View style={styles.pickerDivider} /> : null}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.pickerRow}
                    onPress={() => {
                      setSelectedCategoryId(category.id);
                      setCategoryOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerRowText,
                        selected && styles.pickerRowTextSelected,
                      ]}
                    >
                      {category.label}
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

export default HelpSupportScreen;

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
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    minHeight: ms(48),
    gap: spacing.md,
  },
  iconButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  topBarTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  topBarSpacer: {
    width: ms(36),
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing['4xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  heroArt: {
    width: ms(160),
    height: ms(140),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
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
    maxWidth: ms(320),
    marginBottom: spacing['3xl'],
  },
  responseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing['3xl'],
  },
  responseDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.success,
  },
  responseText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  optionCard: {
    width: '100%',
    minHeight: ms(84),
    borderRadius: radii['2xl'],
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.soft,
  },
  optionCardSpaced: {
    marginTop: spacing.lg,
  },
  optionIcon: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  optionTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  optionSubtitle: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },
  footerNote: {
    marginTop: spacing['4xl'],
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: ms(20),
    maxWidth: ms(300),
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  field: {
    width: '100%',
    minHeight: ms(54),
    borderRadius: radii['2xl'],
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  fieldFocused: {
    borderColor: colors.borderFocus,
  },
  fieldText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  fieldPlaceholder: {
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
  subjectInput: {
    width: '100%',
    minHeight: ms(54),
    borderRadius: radii['2xl'],
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xl,
  },
  messageInput: {
    width: '100%',
    minHeight: ms(150),
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
  charCount: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  ticketBadge: {
    width: '100%',
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.brandBorder,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  ticketBadgeLabel: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  ticketBadgeValue: {
    color: colors.primaryDark,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  footer: {
    paddingHorizontal: spacing['4xl'],
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.md,
  },
  primaryButton: {
    minHeight: layout.buttonHeight,
    borderRadius: radii['2xl'],
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  primaryButtonTextDisabled: {
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
