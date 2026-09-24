import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiErrorMessage } from '../../api/client';
import * as authApi from '../../api/authApi';
import {
  clearSession,
  loadSession,
  saveSession,
} from '../../storage/sessionStorage';
import { Session, User } from '../../types';

type AuthPhase = 'checking' | 'signedOut' | 'signedIn';

interface AuthState {
  phase: AuthPhase;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  phase: 'checking',
  user: null,
  loading: false,
  error: null,
};

function persist(session: Session): Promise<Session> {
  return saveSession(session).then(() => session);
}

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async () => loadSession(),
);

export const registerAccount = createAsyncThunk<
  Session,
  authApi.Credentials,
  { rejectValue: string }
>('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    return await persist(await authApi.register(credentials));
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const signIn = createAsyncThunk<
  Session,
  authApi.Credentials,
  { rejectValue: string }
>('auth/signIn', async (credentials, { rejectWithValue }) => {
  try {
    return await persist(await authApi.login(credentials));
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await clearSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.phase = action.payload ? 'signedIn' : 'signedOut';
        state.user = action.payload?.user ?? null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.phase = 'signedOut';
      })
      .addCase(registerAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.phase = 'signedIn';
        state.user = action.payload.user;
      })
      .addCase(registerAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Could not create your account.';
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.phase = 'signedIn';
        state.user = action.payload.user;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Could not sign in.';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.phase = 'signedOut';
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
