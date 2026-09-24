import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppDispatch } from './src/app/hooks';
import { store } from './src/app/store';
import { restoreSession } from './src/features/auth/authSlice';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
