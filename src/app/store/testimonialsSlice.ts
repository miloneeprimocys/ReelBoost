import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
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
}

interface TestimonialsState {
  testimonialsContent: TestimonialsContent;
  activeTestimonialSection: string | null;
  isLoading: boolean;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'CEO',
    company: 'TechCorp',
    content: 'This platform has transformed how we manage our digital presence. The results have been outstanding.',
    avatar: '/avatar1.jpg',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Marketing Director',
    company: 'Growth Inc',
    content: 'The best investment we\'ve made for our business. User-friendly and incredibly powerful.',
    avatar: '/avatar2.jpg',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Product Manager',
    company: 'StartupHub',
    content: 'Exceptional service and support. Our team productivity has increased significantly.',
    avatar: '/avatar3.jpg',
    rating: 5
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'CTO',
    company: 'Innovation Labs',
    content: 'A game-changer for our development workflow. Highly recommend to any tech team.',
    avatar: '/avatar4.jpg',
    rating: 5
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    role: 'Operations Manager',
    company: 'Global Solutions',
    content: 'Streamlined our entire operation process. The ROI has been incredible.',
    avatar: '/avatar5.jpg',
    rating: 5
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Founder',
    company: 'Creative Agency',
    content: 'Perfect solution for our creative needs. Intuitive and feature-rich platform.',
    avatar: '/avatar6.jpg',
    rating: 5
  }
];

const initialState: TestimonialsState = {
  testimonialsContent: {
    title: 'Reviews from real people',
    subtitle: 'What our customers are saying',
    backgroundColor: '#f3f4f6',
    textColor: '#111827',
    cardBackgroundColor: '#ffffff',
    cardTextColor: '#374151',
    starColor: '#10b981',
    quoteIconColor: '#9ca3af',
    carouselPosition: 'right',
    testimonials: defaultTestimonials
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
