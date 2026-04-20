import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  badgeText?: string;
}

export interface SubscriptionPlanContent {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  cardBackgroundColor: string;
  cardTextColor: string;
  cardBorderColor: string;
  popularCardBackgroundColor: string;
  popularCardBorderColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  popularButtonBackgroundColor: string;
  popularButtonTextColor: string;
  badgeTextColor?: string;
  badgeBackgroundColor?: string;
  dotText?: string;
  dotTextColor?: string;
  showDotText?: boolean;
  tickColor?: string;
  plans: SubscriptionPlan[];
}

interface SubscriptionPlanState {
  subscriptionPlanContent: SubscriptionPlanContent;
  activeSubscriptionPlanSection: string | null;
  isLoading: boolean;
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Basic',
    price: '$9',
    period: '/month',
    description: 'Perfect for individuals getting started',
    features: [
      '5 Projects',
      '10GB Storage',
      'Basic Analytics',
      'Email Support',
      'API Access'
    ],
    buttonText: 'Get Started',
    isPopular: false
  },
  {
    id: '2',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for growing businesses',
    features: [
      'Unlimited Projects',
      '100GB Storage',
      'Advanced Analytics',
      'Priority Support',
      'API Access',
      'Custom Integrations',
      'Team Collaboration'
    ],
    buttonText: 'Start Pro Trial',
    isPopular: true,
    badgeText: 'Most Popular'
  },
  {
    id: '3',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large scale operations',
    features: [
      'Unlimited Everything',
      '1TB Storage',
      'Custom Analytics',
      '24/7 Phone Support',
      'Dedicated Manager',
      'SLA Guarantee',
      'White Label Option'
    ],
    buttonText: 'Contact Sales',
    isPopular: false
  }
];

const initialState: SubscriptionPlanState = {
  subscriptionPlanContent: {
    title: 'Choose Your Plan',
    subtitle: 'Flexible pricing options for every stage of your journey',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    cardBackgroundColor: '#ffffff',
    cardTextColor: '#374151',
    cardBorderColor: '#e5e7eb',
    popularCardBackgroundColor: '#f0f9ff',
    popularCardBorderColor: '#3b82f6',
    buttonBackgroundColor: '#111827',
    buttonTextColor: '#ffffff',
    popularButtonBackgroundColor: '#3b82f6',
    popularButtonTextColor: '#ffffff',
    dotText: 'Pricing',
    dotTextColor: '#111827',
    showDotText: true,
    tickColor: '#10b981',
    plans: defaultPlans
  },
  activeSubscriptionPlanSection: null,
  isLoading: false
};

const subscriptionPlanSlice = createSlice({
  name: 'subscriptionPlan',
  initialState,
  reducers: {
    updateSubscriptionPlanContent: (state, action: PayloadAction<Partial<SubscriptionPlanContent>>) => {
      state.subscriptionPlanContent = { ...state.subscriptionPlanContent, ...action.payload };
    },
    setActiveSubscriptionPlanSection: (state, action: PayloadAction<string | null>) => {
      state.activeSubscriptionPlanSection = action.payload;
    },
    addPlan: (state, action: PayloadAction<SubscriptionPlan>) => {
      state.subscriptionPlanContent.plans.push(action.payload);
    },
    updatePlan: (state, action: PayloadAction<{ id: string; plan: Partial<SubscriptionPlan> }>) => {
      const { id, plan } = action.payload;
      const index = state.subscriptionPlanContent.plans.findIndex(p => p.id === id);
      if (index !== -1) {
        state.subscriptionPlanContent.plans[index] = {
          ...state.subscriptionPlanContent.plans[index],
          ...plan
        };
      }
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.subscriptionPlanContent.plans = state.subscriptionPlanContent.plans.filter(
        p => p.id !== action.payload
      );
    },
    reorderPlans: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.subscriptionPlanContent.plans.splice(fromIndex, 1);
      state.subscriptionPlanContent.plans.splice(toIndex, 0, removed);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const {
  updateSubscriptionPlanContent,
  setActiveSubscriptionPlanSection,
  addPlan,
  updatePlan,
  deletePlan,
  reorderPlans,
  setLoading
} = subscriptionPlanSlice.actions;

export default subscriptionPlanSlice.reducer;
