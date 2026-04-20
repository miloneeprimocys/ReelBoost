import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQContent {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  faqs: FAQItem[];
  categories: string[];
  activeCategory: string;
  dotText?: string;
  dotTextColor?: string;
  showDotText?: boolean;
  // Tab/Category styling
  tabContainerBgColor?: string;
  tabContainerBorderColor?: string;
  tabActiveBgColor?: string;
  tabActiveTextColor?: string;
  tabActiveBorderColor?: string;
  tabInactiveTextColor?: string;
  // Accordion styling
  accordionBgColor?: string;
  activeAccordionBgColor?: string;
  // Icon colors
  plusIconColor?: string;
  minusIconColor?: string;
}

interface FAQState {
  faqContent: FAQContent;
  activeFAQSection: string | null;
  isLoading: boolean;
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'What is ReelBoost and how does it work?',
    answer: 'ReelBoost is a comprehensive live streaming and short video platform that empowers creators to broadcast content, engage with audiences in real-time, and monetize through gifts and subscriptions.',
    category: 'General'
  },
  {
    id: '2',
    question: 'How many viewers can join my live stream?',
    answer: 'ReelBoost supports unlimited viewers for your live streams. Our infrastructure scales automatically to handle thousands of concurrent viewers with HD quality streaming.',
    category: 'Live Streaming'
  },
  {
    id: '3',
    question: 'How do I earn money through the platform?',
    answer: 'You can earn through virtual gifts from viewers, subscription-based fan clubs, brand partnerships, and our creator fund program.',
    category: 'Monetization'
  },
  {
    id: '4',
    question: 'Can I go live with multiple people at once?',
    answer: 'Yes! ReelBoost supports multi-guest live streaming with up to 4 participants in a single stream.',
    category: 'Live Streaming'
  },
  {
    id: '5',
    question: 'How do I withdraw my earnings?',
    answer: 'Withdrawals are simple and secure. Go to your wallet section, link your bank account, and request a withdrawal. Funds are processed within 1-3 business days.',
    category: 'Monetization'
  }
];

const initialState: FAQState = {
  faqContent: {
    title: 'Frequently asked questions',
    subtitle: 'Can\'t find what you\'re looking for? Chat to our friendly team!',
    backgroundColor: '#ffffff',
    textColor: '#101828',
    accentColor: '#667085',
    borderColor: '#EAECF0',
    faqs: defaultFAQs,
    categories: ['General', 'Live Streaming', 'Monetization', 'Account'],
    activeCategory: 'General',
    dotText: 'FAQ',
    dotTextColor: '#101828',
    showDotText: true
  },
  activeFAQSection: null,
  isLoading: false
};

const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    updateFAQContent: (state, action: PayloadAction<Partial<FAQContent>>) => {
      state.faqContent = { ...state.faqContent, ...action.payload };
    },
    setActiveFAQSection: (state, action: PayloadAction<string | null>) => {
      state.activeFAQSection = action.payload;
    },
    addFAQ: (state, action: PayloadAction<FAQItem>) => {
      state.faqContent.faqs.push(action.payload);
    },
    updateFAQ: (state, action: PayloadAction<{ id: string; faq: Partial<FAQItem> }>) => {
      const { id, faq } = action.payload;
      const index = state.faqContent.faqs.findIndex(f => f.id === id);
      if (index !== -1) {
        state.faqContent.faqs[index] = { 
          ...state.faqContent.faqs[index], 
          ...faq 
        };
      }
    },
    deleteFAQ: (state, action: PayloadAction<string>) => {
      state.faqContent.faqs = state.faqContent.faqs.filter(f => f.id !== action.payload);
    },
    reorderFAQs: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.faqContent.faqs.splice(fromIndex, 1);
      state.faqContent.faqs.splice(toIndex, 0, removed);
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.faqContent.categories.includes(action.payload)) {
        state.faqContent.categories.push(action.payload);
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.faqContent.categories = state.faqContent.categories.filter(c => c !== action.payload);
      if (state.faqContent.activeCategory === action.payload) {
        state.faqContent.activeCategory = state.faqContent.categories[0] || 'General';
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const {
  updateFAQContent,
  setActiveFAQSection,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
  addCategory,
  deleteCategory,
  setLoading
} = faqSlice.actions;

export default faqSlice.reducer;
