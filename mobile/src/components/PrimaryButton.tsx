import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableProps,
  StyleSheet,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../theme/colors';

interface Props extends Omit<PressableProps, 'style'> {
  label: string;
  busy?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  busy,
  disabled,
  variant = 'primary',
  compact,
  style,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const available = !disabled && !busy;

  useEffect(() => {
    if (variant !== 'primary' || !available) return;
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.delay(1250),
        Animated.timing(shine, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(shine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    sweep.start();
    return () => sweep.stop();
  }, [available, shine, variant]);

  const animatePress = (pressed: boolean) => {
    Animated.spring(pressScale, {
      toValue: pressed ? 0.955 : 1,
      speed: pressed ? 32 : 22,
      bounciness: pressed ? 0 : 13,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: pressScale }] }]}>
      <Pressable
        accessibilityRole="button"
        disabled={!available}
        onPressIn={event => {
          animatePress(true);
          onPressIn?.(event);
        }}
        onPressOut={event => {
          animatePress(false);
          onPressOut?.(event);
        }}
        android_ripple={{
          color:
            variant === 'primary'
              ? 'rgba(23, 35, 10, 0.12)'
              : 'rgba(242, 246, 252, 0.08)',
        }}
        style={[
          styles.base,
          styles[variant],
          compact && styles.compact,
          !available && styles.disabled,
        ]}
        {...props}
      >
        {variant === 'primary' && available && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shine,
              {
                opacity: shine.interpolate({
                  inputRange: [0, 0.45, 1],
                  outputRange: [0, 0.34, 0],
                }),
                transform: [
                  {
                    translateX: shine.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-180, 300],
                    }),
                  },
                  { rotate: '18deg' },
                ],
              },
            ]}
          />
        )}
        {busy ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.accentInk : colors.text}
          />
        ) : (
          <View style={[styles.content, compact && styles.contentCompact]}>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                variant === 'primary' && styles.primaryLabel,
              ]}
            >
              {label}
            </Text>
            {variant === 'primary' && (
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.arrowBadge, compact && styles.arrowBadgeCompact]}
              >
                <Text style={[styles.arrow, compact && styles.arrowCompact]}>
                  â†’
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    width: '100%',
  },
  compact: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: 13 },
  primary: {
    backgroundColor: colors.accent,
    elevation: 3,
    shadowColor: colors.accent,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  secondary: {
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quiet: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: 'rgba(255, 125, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 125, 129, 0.35)',
  },
  disabled: { opacity: 0.58 },
  shine: {
    position: 'absolute',
    top: -18,
    bottom: -18,
    left: 0,
    width: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  content: {
    width: '100%',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contentCompact: { minHeight: 40 },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  primaryLabel: { color: colors.accentInk },
  arrowBadge: {
    position: 'absolute',
    right: 0,
    top: 11,
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: 'rgba(23, 35, 10, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBadgeCompact: { top: 8, width: 24, height: 24, borderRadius: 9 },
  arrow: {
    color: colors.accentInk,
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },
  arrowCompact: { fontSize: 17 },
});
