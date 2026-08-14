import React from 'react';
import {
  ActivityIndicator,
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
  itemType: 'note' | 'task' | 'space' | 'reminder';
  itemTitle?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const AlertIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
      stroke={colors.errorDark}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DeleteConfirmationModal = ({
  visible,
  itemType,
  itemTitle,
  loading = false,
  onCancel,
  onConfirm,
}: Props) => {
  const label =
    itemType === 'task'
      ? 'task'
      : itemType === 'space'
        ? 'space'
        : itemType === 'reminder'
          ? 'reminder'
          : 'note';
  const title = `Delete ${label}?`;
  const trimmedTitle = itemTitle?.trim();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={loading ? undefined : onCancel}
      >
        <Pressable style={styles.dialog}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <AlertIcon />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.message}>
            Are you sure you want to delete this {label}
            {trimmedTitle ? `, "${trimmedTitle}"` : ''}? This action cannot be
            undone.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.78}
              style={[styles.cancelButton, loading && styles.disabledButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.78}
              style={[styles.deleteButton, loading && styles.disabledButton]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.deleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeleteConfirmationModal;

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
    borderColor: colors.errorSoftBorder,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
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
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    lineHeight: ms(22),
    fontWeight: fontWeight.extrabold,
  },

  message: {
    marginTop: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    fontWeight: fontWeight.semibold,
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

  deleteButton: {
    minWidth: ms(78),
    minHeight: ms(38),
    borderRadius: radii.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  disabledButton: {
    opacity: 0.72,
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
  },

  deleteText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
  },
});
