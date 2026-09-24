import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types';

const TOKEN_KEY = 'taskflow.accessToken';
const USER_KEY = 'taskflow.user';

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, session.accessToken);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export async function loadSession(): Promise<Session | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const serializedUser = await AsyncStorage.getItem(USER_KEY);
  if (!token || !serializedUser) return null;

  try {
    const user = JSON.parse(serializedUser) as Session['user'];
    if (typeof user.id !== 'string' || typeof user.email !== 'string') {
      await clearSession();
      return null;
    }
    return { accessToken: token, user };
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}
