import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'), // Load token from localStorage on startup
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('Auth loading state:', action.payload);
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('Auth error state:', action.payload);
      state.loading = false;
      state.error = action.payload;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      console.log('Setting auth credentials:', { 
        userId: action.payload.user.id,
        email: action.payload.user.email,
        tokenLength: action.payload.token.length 
      });
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Store token in localStorage for persistence
      localStorage.setItem('token', action.payload.token);
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      console.log('Logging out user:', state.user?.email);
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;

export const { setLoading, setError, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
