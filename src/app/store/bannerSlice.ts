import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import second from "../../../public/second.svg";
export interface BannerFeature {
  title: string;
  description: string;
  icon: string; // URL or path to icon
}

export interface BannerContent {
  dotText?: string;
  title: string;
  description: string;
  features: BannerFeature[];
  backgroundImage?: string;
  backgroundColor?: string;
  layout: 'left' | 'right' | 'center';
  animation: 'none' | 'fade' | 'slide' | 'bounce';
  titleColor?: string;
  descriptionColor?: string;
  featureTitleColor?: string;
  featureDescriptionColor?: string;
  dotTextColor?: string;
  dotColor?: string;
}

export interface BannerSection {
  id: string;
  type: 'banner';
  name: string;
  visible: boolean;
  order: number;
  content: BannerContent;
}

interface BannerSliceState {
  sections: BannerSection[];
  activeSection: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BannerSliceState = {
  sections: [],
  activeSection: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBannerSections = createAsyncThunk(
  'banner/fetchSections',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, return empty array
      return [];
    } catch (error) {
      return rejectWithValue('Failed to fetch banner sections');
    }
  }
);

export const saveBannerSection = createAsyncThunk(
  'banner/saveSection',
  async (section: BannerSection, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      return section;
    } catch (error) {
      return rejectWithValue('Failed to save banner section');
    }
  }
);

// Slice
const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  reducers: {
    // Section management
    addBannerSection: (state, action: PayloadAction<{ type: string; id?: string; maxOrder?: number }>) => {
      const { type, maxOrder } = action.payload;
      let content;
      
      if (type === 'pk-battle') {
        content = getPKBattleBannerContent();
      } else if (type === 'live-streaming') {
        content = getDefaultBannerContent();
      } else {
        // For new banner sections, use empty content
        content = getEmptyBannerContent();
      }
      
      const newSection: BannerSection = {
        id: `banner-${Date.now()}-${Math.random()}`,
        type: 'banner',
        name: type === 'pk-battle' ? 'PK Battle' : type === 'live-streaming' ? 'Live Streaming' : 'Banner Section',
        visible: true,
        order: maxOrder !== undefined ? maxOrder + 1 : state.sections.length + 1, // Use provided maxOrder or fallback
        content
      };
      state.sections.push(newSection);
      // Store the ID for the reducer to return
      action.payload.id = newSection.id;
    },
    
    reorderBannerSections: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return;
      
      const draggedSection = state.sections[fromIndex];
      state.sections.splice(fromIndex, 1);
      state.sections.splice(toIndex, 0, draggedSection);
      
      // Update order property
      state.sections.forEach((section, index) => {
        section.order = index + 1;
      });
    },
    
    updateBannerSection: (state, action: PayloadAction<{ id: string; content: Partial<BannerContent> }>) => {
      const { id, content } = action.payload;
      const section = state.sections.find(s => s.id === id);
      if (section) {
        section.content = { ...section.content, ...content };
      }
    },
    
    deleteBannerSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(s => s.id !== action.payload);
      if (state.activeSection === action.payload) {
        state.activeSection = null;
      }
    },
    
    // Visibility and ordering
    toggleBannerSectionVisibility: (state, action: PayloadAction<string>) => {
      const section = state.sections.find(s => s.id === action.payload);
      if (section) {
        section.visible = !section.visible;
      }
    },
    
    setBannerSectionOrder: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedSection] = state.sections.splice(fromIndex, 1);
      state.sections.splice(toIndex, 0, movedSection);
      
      // Update order values
      state.sections.forEach((section, index) => {
        section.order = index;
      });
    },
    
    // Active section management
    setActiveBannerSection: (state, action: PayloadAction<string | null>) => {
      state.activeSection = action.payload;
    },
    
    // Content management
    updateBannerContent: (state, action: PayloadAction<{ id: string; content: Partial<BannerContent> }>) => {
      const { id, content } = action.payload;
      const section = state.sections.find(s => s.id === id);
      if (section) {
        section.content = { ...section.content, ...content };
      }
    },
    
    addBannerFeature: (state, action: PayloadAction<{ id: string; feature: BannerFeature }>) => {
      const { id, feature } = action.payload;
      const section = state.sections.find(s => s.id === id);
      if (section) {
        section.content.features.push(feature);
      }
    },
    
    updateBannerFeature: (state, action: PayloadAction<{ id: string; featureIndex: number; feature: Partial<BannerFeature> }>) => {
      const { id, featureIndex, feature } = action.payload;
      const section = state.sections.find(s => s.id === id);
      if (section && section.content.features[featureIndex]) {
        section.content.features[featureIndex] = { ...section.content.features[featureIndex], ...feature };
      }
    },
    
    deleteBannerFeature: (state, action: PayloadAction<{ id: string; featureIndex: number }>) => {
      const { id, featureIndex } = action.payload;
      const section = state.sections.find(s => s.id === id);
      if (section) {
        section.content.features.splice(featureIndex, 1);
      }
    },
    
    // Clear all
    clearBannerSections: (state) => {
      state.sections = [];
      state.activeSection = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBannerSections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBannerSections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload;
      })
      .addCase(fetchBannerSections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveBannerSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveBannerSection.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.sections.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
      })
      .addCase(saveBannerSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Helper function to get default banner content
export function getDefaultBannerContent(): BannerContent {
  return {
    dotText: 'Live Streaming',
    title: 'Start video, interact with the user.',
    description: 'Start live streaming to connect with your audience in real time, where viewers can comment, like the stream, and send virtual gifts to show their support.',
    dotTextColor: '#2b49c5',
    dotColor: '#3b82f6',
    features: [
      {
        title: 'List of Live Streamers',
        description: 'You can check the list of live streamers, and can view the likes and audience connected to the stream',
        icon: '/list.svg'
      },
      {
        title: 'Live Streaming Interaction',
        description: 'Viewers can comment, send virtual gifts, like the stream, and follow the streamer to stay connected.',
        icon: '/livestream.svg'
      }
    ],
    backgroundImage: '/second.svg',
    backgroundColor: '#4A72FF',
    layout: 'left',
    animation: 'fade',
    titleColor: '#111827',
        descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };
}

// Helper function to get demo banner content for new sections
export function getEmptyBannerContent(): BannerContent {
  return {
    dotText: 'Demo Live Streaming',
    title: 'Demo Title',
    description: 'Demo Description: This is a demonstration banner section with sample content that showcases layout and styling capabilities of banner editor. You can customize all elements including text, colors, and features.',
    dotTextColor: '#2b49c5',
    dotColor: '#3b82f6',
    features: [
      {
        title: 'Demo Feature One',
        description: 'Demo description for the first feature that demonstrates the feature layout and styling.',
        icon: 'Video'
      },
      {
        title: 'Demo Feature Two',
        description: 'Demo description for the second feature showing how multiple features are displayed.',
        icon: 'MessageCircle'
      }
    ],
    backgroundImage: '/second.svg', // Default image for new banners
    backgroundColor: '#FFB800',
    layout: 'right',
    animation: 'fade',
    titleColor: '#111827',
        descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };
}

// Helper function to get PK Battle banner content
export function getPKBattleBannerContent(): BannerContent {
  return {
    dotText: 'PK Battle',
    title: 'Live battles to win audience support',
    description: 'The PK battle lasts 5 minutes, with the highest-scoring participant declared the winner, and the host can invite users to join the live stream.',
    dotTextColor: '#2b49c5',
    dotColor: '#3b82f6',
    features: [
      {
        title: 'Loss and Win Battle',
        description: 'In a PK battle, the streamer with the higher score wins the match, while the one with the lower score loses the battle.',
        icon: '/sword.svg'
      },
      {
        title: 'Send Gifts during the Battle',
        description: 'The winner and loser are determined based on the number of gifts received during the battle.',
        icon: '/gift.svg'
      },
      {
        title: 'Audience Engagement',
        description: 'Audience gets interaction through likes, comments, and virtual gift sending.',
        icon: '/audience.svg'
      }
    ],
    backgroundImage: '/third.svg',
    backgroundColor: '#FFB800',
    layout: 'left',
    animation: 'fade',
    titleColor: '#111827',
        descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };
}

export default bannerSlice.reducer;

// Actions
export const {
  addBannerSection,
  updateBannerSection,
  deleteBannerSection,
  toggleBannerSectionVisibility,
  setBannerSectionOrder,
  setActiveBannerSection,
  updateBannerContent,
  addBannerFeature,
  updateBannerFeature,
  deleteBannerFeature,
  reorderBannerSections,
  clearBannerSections
} = bannerSlice.actions;
