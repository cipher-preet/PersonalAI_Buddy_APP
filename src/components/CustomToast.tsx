import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

export interface CustomToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

const backgroundColors: Record<ToastType, string> = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#0992f2',
};

const CustomToast = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: CustomToastProps) => {
  const animation = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toastStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: backgroundColors[type],
    }),
    [type],
  );

  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }).start();

      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }

      hideTimeout.current = setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [animation, duration, onHide, visible]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const opacity = animation;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.toastContainer,
        toastStyle,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default CustomToast;
