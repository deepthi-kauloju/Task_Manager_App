import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'), // Load token from ls on initial load
  isAuthenticated: false,
  loading: 'idle',
  error: null,
};

// Helper for API calls
const callApi = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};


// Async Thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: Omit<User, 'id'> & { password: string }) => {
    const response = await callApi('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: Pick<User, 'email'> & { password: string }) => {
    const response = await callApi('/api/auth/login', {
       method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response;
  }
);

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { getState }) => {
  const token = (getState() as { auth: AuthState }).auth.token;
  if (token) {
    const user = await callApi('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // The token is still valid, return user and existing token
    return { user, token };
  }
  throw new Error('No token found');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = 'pending';
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<{ user: User; token: string }> => 
          action.type === login.fulfilled.type || action.type === signup.fulfilled.type || action.type === loadUser.fulfilled.type,
        (state, action) => {
          localStorage.setItem('token', action.payload.token);
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.loading = 'succeeded';
        }
      )
      .addMatcher(
        (action: AnyAction) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action: AnyAction) => {
          localStorage.removeItem('token');
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.loading = 'failed';
          state.error = action.error?.message || 'An authentication error occurred.';
        }
      );
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;