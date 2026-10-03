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

import { colors, fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
  onDelete?: () => void;
};

const TrashIcon = () => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke={colors.error}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OpenIcon = () => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17 17 7M10 7h7v7"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SpaceTileMenu = ({ visible, onClose, onOpen, onDelete }: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => {
            onClose();
            onOpen();
          }}
        >
          <OpenIcon />
          <Text style={styles.itemText}>Open space</Text>
        </TouchableOpacity>

        {onDelete ? (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.item}
              onPress={() => {
                onClose();
                onDelete();
              }}
            >
              <TrashIcon />
              <Text style={styles.deleteText}>Delete space</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </Pressable>
    </Pressable>
  </Modal>
);

export default SpaceTileMenu;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
  },

  card: {
    width: '100%',
    maxWidth: ms(260),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: ms(52),
  },

  itemText: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  deleteText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
