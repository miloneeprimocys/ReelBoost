import { configureStore } from '@reduxjs/toolkit';
import builderReducer from './builderSlice';
import homeReducer from './homeSlice';
import editorReducer from './editorSlice';
import bannerReducer from './bannerSlice';
import featuresReducer from './featuresSlice';
import adminReducer from './adminSlice';
import benefitsReducer from './benefitsSlice';
import navbarReducer from './navbarSlice';
import modalReducer from './modalSlice';
import footerReducer, { selectFooterContent } from './footerSlice';

export const store = configureStore({
  reducer: {
    builder: builderReducer,
    home: homeReducer,
    editor: editorReducer,
    banner: bannerReducer,
    features: featuresReducer,
    admin: adminReducer,
    benefits: benefitsReducer,
    navbar: navbarReducer,
    modal: modalReducer,
    footer: footerReducer,
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

// Re-export footer selector
export { selectFooterContent };
