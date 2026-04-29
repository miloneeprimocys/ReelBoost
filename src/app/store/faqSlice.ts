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
    question: 'What is included in the basic plan?',
    answer: 'The basic plan includes all essential features to get you started, including 5 projects, 10GB storage, and email support.',
    category: 'General'
  },
  {
    id: '2',
    question: 'Can I upgrade my plan later?',
    answer: 'Yes, you can upgrade your plan at any time. The new pricing will be prorated based on your billing cycle.',
    category: 'Pricing'
  },
  {
    id: '3',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription from your account settings. Your access will continue until the end of your billing period.',
    category: 'General'
  }
];

const initialState: FAQState = {
  faqContent: {
    title: 'Frequently asked questions',
    subtitle: "Can't find what you're looking for? Chat to our friendly team!",
    backgroundColor: '#ffffff',
    textColor: '#101828',
    accentColor: '#667085',
    borderColor: '#EAECF0',
    dotText: 'FAQ',
    dotTextColor: '#101828',
    showDotText: true,
    categories: ['General', 'Features', 'Pricing'],
    activeCategory: 'General',
    faqs: defaultFAQs,
    accordionBgColor: 'transparent',
    activeAccordionBgColor: 'transparent',
    plusIconColor: '#98A2B3',
    minusIconColor: '#98A2B3'
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
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.faqContent.activeCategory = action.payload;
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
