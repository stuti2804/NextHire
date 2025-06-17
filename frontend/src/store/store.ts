import { configureStore } from '@reduxjs/toolkit';
import builderReducer from './builderSlice';

export const store = configureStore({
  reducer: {
    builder: builderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
