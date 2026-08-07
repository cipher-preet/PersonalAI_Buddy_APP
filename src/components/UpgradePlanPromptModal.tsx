import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  shadows,
  spacing,
} from '../theme';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onUpgrade: () => void;
};

const SparkIcon = () => (
  <View style={styles.iconWrap}>
    <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Z"
        fill={colors.primary}
      />
      <Path
        d="M19 15.5 19.7 18.3 22.5 19 19.7 19.7 19 22.5 18.3 19.7 15.5 19 18.3 18.3 19 15.5Z"
        fill={colors.accentCyan}
      />
    </Svg>
  </View>
);

const UpgradePlanPromptModal = ({
  visible,
  title = 'Free plan limit reached',
  message = 'Upgrade to Pro to create more spaces and keep your workflow moving.',
  onClose,
  onUpgrade,
}: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    hardwareAccelerated
    presentationStyle="overFullScreen"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.dialog}>
        <View style={styles.headerRow}>
          <SparkIcon />
          <Text style={styles.title}>{title}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.upgradeButton}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradeText}>Upgrade Plan</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

export default UpgradePlanPromptModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
  },

  dialog: {
    width: '100%',
    maxWidth: ms(326),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },

  iconWrap: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xl,
    lineHeight: ms(24),
    fontWeight: fontWeight.extrabold,
  },

  message: {
    marginTop: spacing.lg,
    color: colors.subText,
    fontSize: fontSize.base,
    lineHeight: ms(21),
    fontWeight: fontWeight.semibold,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing['3xl'],
  },

  closeButton: {
    minWidth: ms(78),
    minHeight: ms(42),
    borderRadius: radii.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  upgradeButton: {
    minWidth: ms(126),
    minHeight: ms(42),
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    ...shadows.primary,
  },

  closeText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
  },

  upgradeText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
  },
});
