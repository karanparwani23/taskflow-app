import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../app/hooks';
import { colors } from '../theme/colors';
import { AuthScreen } from '../screens/AuthScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const phase = useAppSelector((state) => state.auth.phase);

  if (phase === 'checking') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: styles.screen }}>
        {phase === 'signedIn' ? (
          <>
            <Stack.Screen name="Tasks" component={TaskListScreen} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {() => <AuthScreen mode="login" />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {() => <AuthScreen mode="register" />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
