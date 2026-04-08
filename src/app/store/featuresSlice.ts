import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface Feature {
  id: string;
  title: string;
  icon: string;
  backgroundImage?: string;
}

interface Card {
  id: string;
  title: string;
  description: string;
  image: string;
  backgroundColor?: string;
  layout?: 'default' | 'centered' | 'full-image';
}

interface FeaturesContent {
  dotText?: string;
  title: string;
  subtitle?: string;
  description?: string;
  features: Feature[];
  cards: Card[];
  backgroundColor?: string;
  textColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
}

interface FeaturesState {
  featuresContent: FeaturesContent;
  activeSection: string | null;
}

const initialState: FeaturesState = {
  featuresContent: {
    dotText: 'Main Features',
    title: 'Achieving More Through Digital Excellence',
    subtitle: '',
    description: '',
    features: [
      { id: 'feature-1', title: 'Short Videos', icon: '/video.svg', backgroundImage: '/laptop.svg' },
      { id: 'feature-2', title: 'Notification', icon: '/notification.svg', backgroundImage: '/laptop.svg' },
      { id: 'feature-3', title: 'Real-time chat', icon: '/message.svg', backgroundImage: '/laptop.svg' },
      { id: 'feature-4', title: 'Explore Users & Hashtags', icon: '/user.svg', backgroundImage: '/laptop.svg' },
      { id: 'feature-5', title: 'Live Streaming', icon: '/liveB.svg', backgroundImage: '/laptop.svg' },
      { id: 'feature-6', title: 'PK Battle', icon: '/Battle.svg', backgroundImage: '/laptop.svg' },
    ],
    cards: [
      {
        id: 'card-1',
        title: 'Wallet',
        description: 'The wallet allows users to securely manage their balance, add funds, receive gifts, and withdraw payments from coin balance.',
        image: '/wallet.svg',
        backgroundColor: '#F1F3EE',
        layout: 'default'
      },
      {
        id: 'card-2',
        title: 'Live Streaming',
        description: 'Live streaming supports up to four participants at a time, enabling real-time interaction, collaboration, and audience engagement.',
        image: '/hero.png',
        backgroundColor: '#F1F3EE',
        layout: 'centered'
      },
      {
        id: 'card-3',
        title: 'Payment History',
        description: 'View your complete payment history, including funds added for sending gifts and withdrawals made from coins received.',
        image: '',
        backgroundColor: '#F1F3EE',
        layout: 'default'
      },
      {
        id: 'card-4',
        title: 'Reelboost',
        description: '',
        image: '/laptop.svg',
        backgroundColor: '#F1F3EE',
        layout: 'full-image'
      },
      {
        id: 'card-5',
        title: 'Video Trimming',
        description: 'Videos can be trimmed from beginning or end, with a maximum length limit of 30 seconds.',
        image: '/trim.svg',
        backgroundColor: '#F1F3EE',
        layout: 'default'
      },
      {
        id: 'card-6',
        title: 'Add Music for Reels',
        description: 'Add Music to Reels allows users to enhance their short videos by selecting background music from an audio library.',
        image: '/music.svg',
        backgroundColor: '#F1F3EE',
        layout: 'default'
      },
      {
        id: 'card-7',
        title: 'Gift Lists',
        description: 'The gift list includes multiple categories of gift icons that users can send and receive to earn coins.',
        image: '/giftlist.svg',
        backgroundColor: '#F1F3EE',
        layout: 'default'
      }
    ],
    backgroundColor: '#000000',
    textColor: '#ffffff',
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    descriptionColor: '#ffffff'
  },
  activeSection: null
};

const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    setActiveFeaturesSection: (state, action: PayloadAction<string | null>) => {
      state.activeSection = action.payload;
    },
    updateFeaturesContent: (state, action: PayloadAction<Partial<FeaturesContent>>) => {
      state.featuresContent = { ...state.featuresContent, ...action.payload };
    },
    addFeature: (state, action: PayloadAction<Feature>) => {
      if (state.featuresContent.features.length < 6) {
        state.featuresContent.features.push(action.payload);
      }
    },
    updateFeature: (state, action: PayloadAction<{ id: string; updates: Partial<Feature> }>) => {
      const { id, updates } = action.payload;
      const featureIndex = state.featuresContent.features.findIndex(f => f.id === id);
      if (featureIndex !== -1) {
        state.featuresContent.features[featureIndex] = { 
          ...state.featuresContent.features[featureIndex], 
          ...updates 
        };
      }
    },
    deleteFeature: (state, action: PayloadAction<string>) => {
      const updatedFeatures = state.featuresContent.features.filter(f => f.id !== action.payload);
      
      // Auto-center remaining features if this is a default section
      // Check if we have less than 6 features after deletion
      if (updatedFeatures.length < 6 && updatedFeatures.length > 0) {
        // For features section, maintain even spacing by re-centering
        // This ensures the horizontal scroll layout stays balanced when features are removed
        console.log('Auto-centering features after deletion - remaining features:', updatedFeatures.length);
        
        // Optionally, we could add placeholder logic here if needed
        // For now, the existing CSS placeholder logic should handle centering
      }
      
      state.featuresContent.features = updatedFeatures;
    },
    reorderFeatures: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedFeature] = state.featuresContent.features.splice(fromIndex, 1);
      state.featuresContent.features.splice(toIndex, 0, movedFeature);
    },
    updateCard: (state, action: PayloadAction<{ id: string; updates: Partial<Card> }>) => {
      const { id, updates } = action.payload;
      const cardIndex = state.featuresContent.cards.findIndex(c => c.id === id);
      if (cardIndex !== -1) {
        state.featuresContent.cards[cardIndex] = { 
          ...state.featuresContent.cards[cardIndex], 
          ...updates 
        };
      }
    },
    reorderCards: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedCard] = state.featuresContent.cards.splice(fromIndex, 1);
      state.featuresContent.cards.splice(toIndex, 0, movedCard);
    }
  }
});

export const {
  setActiveFeaturesSection,
  updateFeaturesContent,
  addFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
  updateCard,
  reorderCards
} = featuresSlice.actions;

export default featuresSlice.reducer;
