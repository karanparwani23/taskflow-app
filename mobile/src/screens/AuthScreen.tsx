import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TextInputInstance } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearAuthError,
  registerAccount,
  signIn,
} from '../features/auth/authSlice';
import { PrimaryButton } from '../components/PrimaryButton';
import { BouncePressable } from '../components/BouncePressable';
import { colors, spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

interface Props {
  mode: 'login' | 'register';
}

export function AuthScreen({ mode }: Props) {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loading, error } = useAppSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [localError, setLocalError] = useState('');
  const passwordRef = useRef<TextInputInstance>(null);
  const brandEntrance = useRef(new Animated.Value(0)).current;
  const heroEntrance = useRef(new Animated.Value(0)).current;
  const formEntrance = useRef(new Animated.Value(0)).current;
  const noteEntrance = useRef(new Animated.Value(0)).current;
  const registering = mode === 'register';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, mode]);

  useEffect(() => {
    brandEntrance.setValue(0);
    heroEntrance.setValue(0);
    formEntrance.setValue(0);
    noteEntrance.setValue(0);
    const entrance = Animated.stagger(105, [
      Animated.spring(brandEntrance, {
        toValue: 1,
        speed: 15,
        bounciness: 12,
        useNativeDriver: true,
      }),
      Animated.spring(heroEntrance, {
        toValue: 1,
        speed: 14,
        bounciness: 9,
        useNativeDriver: true,
      }),
      Animated.spring(formEntrance, {
        toValue: 1,
        speed: 13,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.timing(noteEntrance, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [brandEntrance, formEntrance, heroEntrance, mode, noteEntrance]);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setLocalError('');
    if (!cleanEmail.includes('@')) {
      setLocalError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Use a password with at least 8 characters.');
      return;
    }

    try {
      const credentials = { email: cleanEmail, password };
      if (registering) {
        await dispatch(registerAccount(credentials)).unwrap();
      } else {
        await dispatch(signIn(credentials)).unwrap();
      }
    } catch {
      // The rejected action stores its readable message in the auth slice.
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.brandRow,
            {
              opacity: brandEntrance,
              transform: [
                {
                  translateY: brandEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-14, 0],
                  }),
                },
                {
                  scale: brandEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.86, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>✓</Text>
          </View>
          <Text style={styles.brandName}>
            taskflow<Text style={styles.brandDot}>.</Text>
          </Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>01</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.hero,
            {
              opacity: heroEntrance,
              transform: [
                {
                  translateY: heroEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.eyebrowPill}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrow}>YOUR DAY, IN GOOD HANDS</Text>
          </View>
          <Text style={styles.title}>
            {registering ? (
              <>
                Make space for{'\n'}
                <Text style={styles.titleAccent}>what matters.</Text>
              </>
            ) : (
              <>
                A calmer way{'\n'}
                <Text style={styles.titleAccent}>to get it done.</Text>
              </>
            )}
          </Text>
          <Text style={styles.subtitle}>
            {registering
              ? 'Create your account and start with a clear plan.'
              : 'Bring your priorities together, one thoughtful step at a time.'}
          </Text>
          <View style={styles.featureLine}>
            <Text style={styles.featureText}>PLAN</Text>
            <View style={styles.featureDivider} />
            <Text style={styles.featureText}>FOCUS</Text>
            <View style={styles.featureDivider} />
            <Text style={styles.featureText}>FINISH</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: formEntrance,
              transform: [
                {
                  translateY: formEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
                {
                  scale: formEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.formHeadingRow}>
            <View style={styles.formHeadingMark} />
            <Text style={styles.formHeading}>
              {registering ? 'CREATE YOUR SPACE' : 'WELCOME BACK'}
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputShell}>
              <View style={styles.inputIcon}>
                <Text style={styles.inputIconText}>@</Text>
              </View>
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                selectionColor={colors.accent}
                underlineColorAndroid="transparent"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputShell}>
              <View style={styles.inputIcon}>
                <Text style={styles.passwordIconText}>••</Text>
              </View>
              <TextInput
                ref={passwordRef}
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoComplete={registering ? 'new-password' : 'current-password'}
                placeholder={
                  registering ? 'At least 8 characters' : 'Your password'
                }
                placeholderTextColor={colors.muted}
                secureTextEntry={!passwordVisible}
                returnKeyType="go"
                value={password}
                onChangeText={value => {
                  setPassword(value);
                  if (localError) setLocalError('');
                }}
                onSubmitEditing={submit}
                selectionColor={colors.accent}
                underlineColorAndroid="transparent"
                style={styles.input}
              />
              <BouncePressable
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? 'Hide password' : 'Show password'
                }
                accessibilityHint={
                  passwordVisible
                    ? 'Hides the password characters.'
                    : 'Shows the password characters.'
                }
                accessibilityState={{ selected: passwordVisible }}
                hitSlop={8}
                onPress={() => setPasswordVisible(visible => !visible)}
                style={[
                  styles.visibilityButton,
                  passwordVisible && styles.visibilityButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.visibilityText,
                    passwordVisible && styles.visibilityTextActive,
                  ]}
                >
                  {passwordVisible ? 'HIDE' : 'SHOW'}
                </Text>
              </BouncePressable>
            </View>
          </View>

          {(localError || error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorMark}>!</Text>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          <PrimaryButton
            label={registering ? 'Create account' : 'Sign in'}
            busy={loading}
            onPress={submit}
            style={styles.submit}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {registering ? 'Already have an account?' : 'New to TaskFlow?'}
            </Text>
            <BouncePressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate(registering ? 'Login' : 'Register')
              }
              style={({ pressed }) => [
                styles.switchAction,
                pressed && styles.switchActionPressed,
              ]}
            >
              <Text style={styles.switchLink}>
                {registering ? 'Sign in' : 'Create account'}
              </Text>
              <Text style={styles.switchArrow}>↗</Text>
            </BouncePressable>
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.footnote,
            {
              opacity: noteEntrance,
              transform: [
                {
                  translateY: noteEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.footnoteAccent}>✦ </Text>
          Made for the work that matters — and the life around it.
        </Animated.Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'flex-start',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    transform: [{ rotate: '-7deg' }],
    elevation: 3,
  },
  brandMarkText: {
    color: colors.accentInk,
    fontSize: 23,
    fontWeight: '900',
    transform: [{ rotate: '7deg' }],
  },
  brandName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.6,
  },
  brandDot: { color: colors.accent },
  brandBadge: {
    marginLeft: 'auto',
    width: 36,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hero: { marginTop: 38, marginBottom: 21 },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 11,
    backgroundColor: 'rgba(184, 243, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(184, 243, 107, 0.12)',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    letterSpacing: 1.55,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.45,
    lineHeight: 43,
    marginTop: 15,
  },
  titleAccent: { color: colors.accent },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
    maxWidth: 315,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  featureText: {
    color: '#6F8198',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  featureDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  formCard: {
    gap: 14,
    padding: 17,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(121, 184, 255, 0.13)',
    backgroundColor: 'rgba(18, 29, 46, 0.82)',
  },
  formHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 1,
  },
  formHeadingMark: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.blue,
  },
  formHeading: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  fieldGroup: { gap: 7 },
  fieldLabel: {
    color: '#C4D0DF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.15,
  },
  inputShell: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
  },
  inputIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(121, 184, 255, 0.10)',
  },
  inputIconText: { color: colors.blue, fontSize: 16, fontWeight: '900' },
  passwordIconText: {
    color: colors.blue,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    includeFontPadding: false,
  },
  visibilityButton: {
    minWidth: 54,
    minHeight: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    backgroundColor: 'rgba(145, 163, 184, 0.10)',
  },
  visibilityButtonActive: { backgroundColor: 'rgba(184, 243, 107, 0.15)' },
  visibilityText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  visibilityTextActive: { color: colors.accent },
  submit: { marginTop: 1 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 125, 129, 0.35)',
    backgroundColor: 'rgba(255, 125, 129, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorMark: {
    width: 19,
    height: 19,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 125, 129, 0.18)',
    color: colors.danger,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 19,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 12, lineHeight: 17 },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 1,
  },
  switchText: { color: colors.muted, fontSize: 12 },
  switchAction: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(121, 184, 255, 0.07)',
    paddingHorizontal: 11,
  },
  switchActionPressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  switchLink: { color: colors.blue, fontSize: 11, fontWeight: '800' },
  switchArrow: { color: colors.blue, fontSize: 14, fontWeight: '800' },
  footnote: {
    textAlign: 'center',
    color: '#708198',
    fontSize: 10,
    marginTop: 22,
    letterSpacing: 0.1,
  },
  footnoteAccent: { color: colors.accent },
});
