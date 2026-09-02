import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  screenHeight,
  shadows,
  spacing,
} from '../../../theme';

type Props = {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onDone: () => void;
};

const ReminderPickerPopup = ({
  visible,
  title,
  children,
  onClose,
  onDone,
}: Props) => {
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      appear.setValue(0);
      return;
    }

    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, visible]);

  const translateY = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(18), 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      hardwareAccelerated
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.card,
            {
              opacity: appear,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.doneButton}
            onPress={onDone}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ReminderPickerPopup;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    maxHeight: Math.min(mvs(560), screenHeight * 0.78),
    zIndex: 2,
    ...shadows.elevated,
  },

  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  doneButton: {
    marginTop: spacing.lg,
    minHeight: ms(46),
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
