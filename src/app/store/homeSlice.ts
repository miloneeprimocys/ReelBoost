import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HeroContent {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
  layout: 'left' | 'right' | 'center';
  titleColor: string;
  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  tags: string[];
  activeTag: string;
  appStoreImage: string;
  googlePlayImage: string;
  dotText: string;
  topAccentColor: string;
  bottomAccentColor: string;
}

interface HomeState {
  // Note: Hero content is now managed exclusively by builderSlice
  // This slice is kept for backwards compatibility but all data comes from builderSlice
  heroContent: HeroContent;
  isHeroEdited: boolean;
}

const initialState: HomeState = {
  heroContent: {
    title: '',
    description: '',
    primaryButtonText: '',
    secondaryButtonText: '',
    backgroundImage: '',
    layout: 'left',
    titleColor: '#2D3134',
    descriptionColor: '#6B7280',
    primaryButtonColor: '#4A72FF',
    secondaryButtonColor: '#6B7280',
    animation: 'fade',
    tags: [],
    activeTag: '',
    appStoreImage: '',
    googlePlayImage: '',
    dotText: '',
    topAccentColor: '#2B59FF',
    bottomAccentColor: '#FFB800',
  },
  isHeroEdited: false
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    updateHeroContent: (state, action: PayloadAction<Partial<HeroContent>>) => {
      state.heroContent = { ...state.heroContent, ...action.payload };
      state.isHeroEdited = true;
    },
    resetHeroContent: (state) => {
      state.heroContent = initialState.heroContent;
      state.isHeroEdited = false;
    },
    setHeroEdited: (state, action: PayloadAction<boolean>) => {
      state.isHeroEdited = action.payload;
    },
    updateHeroField: (state, action: PayloadAction<{ field: keyof HeroContent; value: string | string[] }>) => {
      const { field, value } = action.payload;
      state.heroContent = { ...state.heroContent, [field]: value };
      state.isHeroEdited = true;
    }
  }
});

export const {
  updateHeroContent,
  resetHeroContent,
  setHeroEdited,
  updateHeroField
} = homeSlice.actions;

export default homeSlice.reducer;
