/**
 * REDUX STORE CONFIGURATION
 *
 * NOTE ON API PERSISTENCE (Future Implementation):
 * -----------------------------------------------
 * Currently, all website data (builder, navbar, pages, sections, etc.) is stored
 * in Redux state and will be lost on page refresh. When the API/database is implemented:
 *
 * 1. ON APP LOAD: Fetch all website data from API and hydrate Redux store
 *    - GET /api/website/config -> Load builder, navbar, pages, sections data
 *    - Dispatch actions to populate each slice with API data
 *
 * 2. ON EDITOR CHANGES: Debounce save changes to API
 *    - POST/PUT /api/website/config -> Save updated state
 *    - Implement auto-save with debounce (e.g., 2 seconds after last change)
 *
 * 3. ON PUBLISH: Mark current state as "published" in database
 *    - POST /api/website/publish -> Save snapshot of current state as published version
 *    - This published version is what the live website will display
 *
 * 4. LIVE WEBSITE: Load from published snapshot instead of Redux
 *    - GET /api/website/published -> Get the published website data
 *    - Use this data to render DynamicNavbar, sections, etc. on the actual website
 *
 * 5. IMPLEMENTATION STEPS:
 *    - Add redux-persist or custom API middleware for auto-save
 *    - Create API service layer (src/services/api.ts)
 *    - Add loading states for API operations
 *    - Add error handling and retry logic
 */

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
import pagesReducer from './pagesSlice';

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
    pages: pagesReducer,
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
