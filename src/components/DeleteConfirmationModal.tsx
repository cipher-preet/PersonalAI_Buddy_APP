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

type Props = {
  visible: boolean;
  itemType: 'note' | 'task';
  itemTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const AlertIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
      stroke="#B91C1C"
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
  onCancel,
  onConfirm,
}: Props) => {
  const label = itemType === 'task' ? 'task' : 'note';
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
      <Pressable style={styles.backdrop} onPress={onCancel}>
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
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.deleteButton}
              onPress={onConfirm}
            >
              <Text style={styles.deleteText}>Delete</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  dialog: {
    width: '100%',
    maxWidth: 312,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#0F172A',
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
    gap: 9,
  },

  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#111827',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },

  message: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },

  cancelButton: {
    minWidth: 78,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  deleteButton: {
    minWidth: 78,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  cancelText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },

  deleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
