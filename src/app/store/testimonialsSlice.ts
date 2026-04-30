import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsContent {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  cardBackgroundColor: string;
  cardTextColor: string;
  starColor: string;
  quoteIconColor: string;
  carouselPosition: 'left' | 'right';
  testimonials: Testimonial[];
  rating?: string;
  reviewCount?: string;
  dotText?: string;
  dotTextColor?: string;
  showDotText?: boolean;
}

interface TestimonialsState {
  testimonialsContent: TestimonialsContent;
  activeTestimonialSection: string | null;
  isLoading: boolean;
}

// Note: Testimonials content is now managed exclusively by builderSlice
// This slice is kept for backwards compatibility but all data comes from builderSlice
const initialState: TestimonialsState = {
  testimonialsContent: {
    title: '',
    subtitle: '',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
    cardBackgroundColor: '#ffffff',
    cardTextColor: '#374151',
    starColor: '#10b981',
    quoteIconColor: '#9ca3af',
    carouselPosition: 'right',
    testimonials: [],
    dotText: 'Testimonials',
    dotTextColor: '#111827',
    showDotText: true
  },
  activeTestimonialSection: null,
  isLoading: false
};

const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {
    updateTestimonialsContent: (state, action: PayloadAction<Partial<TestimonialsContent>>) => {
      state.testimonialsContent = { ...state.testimonialsContent, ...action.payload };
    },
    setActiveTestimonialSection: (state, action: PayloadAction<string | null>) => {
      state.activeTestimonialSection = action.payload;
    },
    addTestimonial: (state, action: PayloadAction<Testimonial>) => {
      state.testimonialsContent.testimonials.push(action.payload);
    },
    updateTestimonial: (state, action: PayloadAction<{ id: string; testimonial: Partial<Testimonial> }>) => {
      const { id, testimonial } = action.payload;
      const index = state.testimonialsContent.testimonials.findIndex(t => t.id === id);
      if (index !== -1) {
        state.testimonialsContent.testimonials[index] = { 
          ...state.testimonialsContent.testimonials[index], 
          ...testimonial 
        };
      }
    },
    deleteTestimonial: (state, action: PayloadAction<string>) => {
      state.testimonialsContent.testimonials = state.testimonialsContent.testimonials.filter(
        t => t.id !== action.payload
      );
    },
    reorderTestimonials: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.testimonialsContent.testimonials.splice(fromIndex, 1);
      state.testimonialsContent.testimonials.splice(toIndex, 0, removed);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const {
  updateTestimonialsContent,
  setActiveTestimonialSection,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  setLoading
} = testimonialsSlice.actions;

export default testimonialsSlice.reducer;
