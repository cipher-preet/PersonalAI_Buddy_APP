import React, { memo, useState } from 'react';
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

import SpaceFolderIcon from './SpaceFolderIcon';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  title: string;
  subtitle: string;
  isListening?: boolean;
  isDeleting?: boolean;
  onPress: () => void;
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

const SpaceFolderTile = ({
  title,
  subtitle,
  isListening = false,
  isDeleting = false,
  onPress,
  onDelete,
}: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.82}
        style={[styles.tile, isDeleting && styles.tileDeleting]}
        onPress={onPress}
        onLongPress={() => {
          if (onDelete && !isDeleting) {
            setMenuVisible(true);
          }
        }}
        delayLongPress={320}
        disabled={isDeleting}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {isDeleting ? (
          <View style={styles.iconSlot}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <SpaceFolderIcon size={ms(80)} listening={isListening} />
        )}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete?.();
              }}
            >
              <TrashIcon />
              <Text style={styles.menuItemText}>Delete space</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default memo(SpaceFolderTile);

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },

  tileDeleting: {
    opacity: 0.7,
  },

  iconSlot: {
    width: ms(80),
    height: ms(69),
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    lineHeight: ms(16),
  },

  subtitle: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  menuBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
  },

  menuCard: {
    width: '100%',
    maxWidth: ms(260),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },

  menuItemText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
