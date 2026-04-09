import { configureStore } from '@reduxjs/toolkit';
import builderReducer from './builderSlice';
import homeReducer from './homeSlice';
import editorReducer from './editorSlice';
import bannerReducer from './bannerSlice';
import featuresReducer from './featuresSlice';
import adminReducer from './adminSlice';
import benefitsReducer from './benefitsSlice';

export const store = configureStore({
  reducer: {
    builder: builderReducer,
    home: homeReducer,
    editor: editorReducer,
    banner: bannerReducer,
    features: featuresReducer,
    admin: adminReducer,
    benefits: benefitsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
