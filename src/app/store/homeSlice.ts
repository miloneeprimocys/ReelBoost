import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
  layout: 'left' | 'right' | 'center';
  titleColor: string;
  subtitleColor: string;
  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  tags: string[];
  activeTag: string;
  appStoreImage: string;
  googlePlayImage: string;
  dotText: string;
}

interface HomeState {
  heroContent: HeroContent;
  isHeroEdited: boolean;
}

const initialState: HomeState = {
  heroContent: {
    title: 'Reelboost - Tiktok Clone App',
    subtitle: '',
    description: 'ReelBoost is a modern short-video and live-streaming app inspired by TikTok. It lets users create, edit, and share engaging short videos with a smooth discovery feed. Creators can go live, interact with audiences in real time, and build loyal communities. Designed for performance and scale, ReelBoost supports engagement, growth, and monetization.',
    primaryButtonText: 'Get Started',
    secondaryButtonText: 'Learn More',
    backgroundImage: '/hero.png',
    layout: 'left',
    titleColor: '#2D3134',
    subtitleColor: '#2D3134',
    descriptionColor: '#6B7280',
    primaryButtonColor: '#4A72FF',
    secondaryButtonColor: '#6B7280',
    animation: 'fade',
    tags: ["Live Streaming", "PK Battle", "Multiple Payment Gateway", "Video Trimming", "Add Music", "Wallet", "Gits", "Earn Coins"],
    activeTag: "Live Streaming",
    appStoreImage: '/Button1.png',
    googlePlayImage: '/Button2.png',
    dotText: ''
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
