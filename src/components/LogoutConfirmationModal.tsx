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
  spacing,
} from '../theme';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const LogoutIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2"
      stroke={colors.errorDark}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 12H4M7.5 8.5 4 12l3.5 3.5"
      stroke={colors.errorDark}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LogoutConfirmationModal = ({ visible, onCancel, onConfirm }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.dialog}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <LogoutIcon />
            </View>
            <Text style={styles.title}>Log out?</Text>
          </View>

          <Text style={styles.message}>
            Are you sure you want to log out of your Buddy account?
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.confirmButton}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LogoutConfirmationModal;

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
    maxWidth: ms(312),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },

  iconWrap: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    lineHeight: ms(22),
    fontWeight: fontWeight.bold,
  },

  message: {
    marginTop: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    fontWeight: fontWeight.medium,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },

  cancelButton: {
    minWidth: ms(78),
    minHeight: ms(38),
    borderRadius: radii.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  confirmButton: {
    minWidth: ms(78),
    minHeight: ms(38),
    borderRadius: radii.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },

  confirmText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
