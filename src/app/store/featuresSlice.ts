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
  dotTextColor?: string;
  dotColor?: string;
  cardTitleColor?: string;
  cardDescriptionColor?: string;
}

interface FeaturesState {
  featuresContent: FeaturesContent;
  activeSection: string | null;
}

// Note: Features content is now managed exclusively by builderSlice
// This slice is kept for backwards compatibility but all data comes from builderSlice
const initialState: FeaturesState = {
  featuresContent: {
    dotText: '',
    title: '',
    subtitle: '',
    description: '',
    features: [],
    cards: [],
    backgroundColor: '#000000',
    textColor: '#ffffff',
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    descriptionColor: '#ffffff',
    dotTextColor: '#ffffff',
    dotColor: '#a8aff5',
    cardTitleColor: '#000000',
    cardDescriptionColor: '#6B7280'
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
    updateFeatureField: (state, action: PayloadAction<{ id: string; updates: Partial<Feature> }>) => {
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
  updateFeatureField,
  deleteFeature,
  reorderFeatures,
  updateCard,
  reorderCards
} = featuresSlice.actions;

export default featuresSlice.reducer;
