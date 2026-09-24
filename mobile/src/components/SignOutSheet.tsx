import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  PanResponderGestureState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '../theme/colors';

interface Props {
  visible: boolean;
  email?: string;
  onStay: () => void;
  onSignOut: () => void;
}

export function SignOutSheet({ visible, email, onStay, onSignOut }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    if (!visible) return;
    const entrance = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 190,
        useNativeDriver: true,
      }),
      Animated.spring(rise, {
        toValue: 0,
        speed: 16,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [opacity, rise, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onStay}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sign out options"
          onPress={onStay}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity,
              transform: [{ translateY: rise }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerMark}>
              <Text style={styles.headerMarkText}>↔</Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>YOUR SESSION</Text>
              <Text style={styles.title}>What would you like to do?</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onStay}
              hitSlop={8}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <Text numberOfLines={1} style={styles.email}>
            {email ?? 'Your tasks are saved to your account.'}
          </Text>

          <View style={styles.choices}>
            <SwipeChoice
              direction="left"
              title="Stay here"
              hint="Swipe left to stay"
              glyph="←"
              onChoose={onStay}
            />
            <SwipeChoice
              direction="right"
              title="Sign out"
              hint="Swipe right to leave"
              glyph="→"
              onChoose={onSignOut}
            />
          </View>
          <Text style={styles.footer}>You can swipe a choice or tap it.</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SwipeChoice({
  direction,
  title,
  hint,
  glyph,
  onChoose,
}: {
  direction: 'left' | 'right';
  title: string;
  hint: string;
  glyph: string;
  onChoose: () => void;
}) {
  const offset = useRef(new Animated.Value(0)).current;
  const isSwipe = useCallback(
    (gesture: PanResponderGestureState) =>
      direction === 'left'
        ? gesture.dx < -9 && Math.abs(gesture.dx) > Math.abs(gesture.dy)
        : gesture.dx > 9 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    [direction],
  );

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => isSwipe(gesture),
        onPanResponderMove: (_, gesture) => {
          const next =
            direction === 'left'
              ? Math.max(-52, Math.min(0, gesture.dx))
              : Math.max(0, Math.min(52, gesture.dx));
          offset.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          if (isSwipe(gesture) && Math.abs(gesture.dx) >= 38) {
            Animated.timing(offset, {
              toValue: direction === 'left' ? -78 : 78,
              duration: 130,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (finished) onChoose();
            });
            return;
          }
          Animated.spring(offset, {
            toValue: 0,
            speed: 22,
            bounciness: 9,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(offset, {
            toValue: 0,
            speed: 22,
            bounciness: 9,
            useNativeDriver: true,
          }).start();
        },
      }),
    [direction, isSwipe, offset, onChoose],
  );

  return (
    <Animated.View
      {...panHandlers.panHandlers}
      style={[
        styles.choiceShell,
        direction === 'left' ? styles.stayChoice : styles.signOutChoice,
        { transform: [{ translateX: offset }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={hint}
        onPress={onChoose}
        android_ripple={{ color: 'rgba(242, 246, 252, 0.08)' }}
        style={styles.choiceButton}
      >
        <View
          style={[
            styles.choiceGlyphWrap,
            direction === 'right' && styles.signOutGlyphWrap,
          ]}
        >
          <Text
            style={[
              styles.choiceGlyph,
              direction === 'right' && styles.signOutGlyph,
            ]}
          >
            {glyph}
          </Text>
        </View>
        <Text
          style={[
            styles.choiceTitle,
            direction === 'right' && styles.signOutTitle,
          ]}
        >
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.choiceHint}>
          {hint}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(3, 8, 16, 0.74)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: spacing.md,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 22,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  headerMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 243, 107, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(184, 243, 107, 0.24)',
  },
  headerMarkText: { color: colors.accent, fontSize: 22, fontWeight: '800' },
  headerCopy: { flex: 1 },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 3 },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
  },
  closeText: {
    color: colors.muted,
    fontSize: 24,
    lineHeight: 27,
    marginTop: -2,
  },
  email: { color: colors.muted, fontSize: 11, marginTop: 13, marginLeft: 53 },
  choices: { flexDirection: 'row', gap: spacing.sm, marginTop: 18 },
  choiceShell: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stayChoice: {
    backgroundColor: 'rgba(184, 243, 107, 0.08)',
    borderColor: 'rgba(184, 243, 107, 0.25)',
  },
  signOutChoice: {
    backgroundColor: 'rgba(255, 125, 129, 0.08)',
    borderColor: 'rgba(255, 125, 129, 0.27)',
  },
  choiceButton: {
    minHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  choiceGlyphWrap: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 243, 107, 0.15)',
    marginBottom: 8,
  },
  signOutGlyphWrap: { backgroundColor: 'rgba(255, 125, 129, 0.14)' },
  choiceGlyph: { color: colors.accent, fontSize: 18, fontWeight: '900' },
  signOutGlyph: { color: colors.danger },
  choiceTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  signOutTitle: { color: colors.danger },
  choiceHint: { color: colors.muted, fontSize: 9, marginTop: 5 },
  footer: {
    color: '#71839A',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 13,
  },
});
