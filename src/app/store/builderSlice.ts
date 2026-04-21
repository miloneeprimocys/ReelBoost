import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Types
interface HeroContent {
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
  appStoreLink: string;
  appStoreTarget: '_self' | '_blank';
  googlePlayLink: string;
  googlePlayTarget: '_self' | '_blank';
}

interface SectionConfig {
  id: string;
  type: 'hero' | 'banner' | 'live-streaming' | 'pk-battle' | 'features' | 'admin-panel' | 'benefits' | 'second' | 'third' | 'fourth' | 'fifth' | 'sixth' | 'testimonials' | 'faq' | 'subscription-plan';
  name: string;
  visible: boolean;
  content: any;
  order: number;
}

interface BuilderState {
  isBuilderMode: boolean;
  sections: SectionConfig[];
  activeSection: string | null;
  isPreviewMode: boolean;
  isInlineEditMode: boolean;
  editingSectionId: string | null;
  editingField: string | null;
  // Section-specific undo/redo functionality
  sectionHistory: {
    [sectionId: string]: {
      past: any[];
      present: any;
      future: any[];
    };
  };
  // Section-level operations history (add/delete/reorder) - tracks both builder and banner sections
  sectionsHistory: {
    past: { builderSections: SectionConfig[]; bannerSections: any[] }[];
    present: { builderSections: SectionConfig[]; bannerSections: any[] };
    future: { builderSections: SectionConfig[]; bannerSections: any[] }[];
  };
}

const initialSections: SectionConfig[] = [
    {
      id: 'hero-1',
      type: 'hero',
      name: 'Hero Section',
      visible: true,
      order: 1,
      content: {
        title: 'Reelboost - Tiktok Clone App',
        description: 'ReelBoost is a modern short-video and live-streaming app inspired by TikTok. It lets users create, edit, and share engaging short videos with a smooth discovery feed. Creators can go live, interact with audiences in real time, and build loyal communities. Designed for performance and scale, ReelBoost supports engagement, growth, and monetization.',
        primaryButtonText: 'Get Started',
        secondaryButtonText: 'Learn More',
        backgroundImage: '/hero.png',
        layout: 'left' as const,
        titleColor: '#2D3134',
                descriptionColor: '#4B5563',
        primaryButtonColor: '#4A72FF',
        secondaryButtonColor: '#6B7280',
        animation: 'fade' as const,
        tags: ["Live Streaming", "PK Battle", "Multiple Payment Gateway", "Video Trimming", "Add Music", "Wallet", "Gits", "Earn Coins"],
        activeTag: "Live Streaming",
        appStoreImage: '/Button1.png',
        googlePlayImage: '/Button2.png',
        dotText: '',
        appStoreLink: '',
        appStoreTarget: '_blank',
        googlePlayLink: '',
        googlePlayTarget: '_blank'
      } as HeroContent
    },
    {
      id: 'second-1',
      type: 'banner',
      name: 'Live Streaming Section',
      visible: true,
      order: 2,
      content: {
        dotText: 'Live Streaming',
        title: 'Start video, interact with the user.',
                description: 'Start live streaming to connect with your audience in real time, where viewers can comment, like the stream, and send virtual gifts to show their support.',
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
        layout: 'right',
        animation: 'fade',
        titleColor: '#111827',
                descriptionColor: '#4B5563',
        featureTitleColor: '#111827',
        featureDescriptionColor: '#4B5563'
      }
    },
    {
      id: 'third-1',
      type: 'banner',
      name: 'PK Battle Section',
      visible: true,
      order: 3,
      content: {
        dotText: 'PK Battle',
        title: 'Live battles to win audience support',
                description: 'The PK battle lasts 5 minutes, with the highest-scoring participant declared the winner, and the host can invite users to join the live stream.',
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
      }
    },
    {
      id: 'fourth-1',
      type: 'fourth',
      name: 'Features Section',
      visible: true,
      order: 4,
      content: {
        dotText: 'Main Features',
        title: 'Achieving More Through Digital Excellence',
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
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-2',
            title: 'Live Streaming',
            description: 'Live streaming supports up to four participants at a time, enabling real-time interaction, collaboration, and audience engagement.',
            image: '/hero.png',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-3',
            title: 'Payment History',
            description: 'View your complete payment history, including funds added for sending gifts and withdrawals made from coins received.',
            image: '/third.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-4',
            title: 'Reelboost',
            description: '',
            image: '/laptop.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-5',
            title: 'Video Trimming',
            description: 'Videos can be trimmed from beginning or end, with a maximum length limit of 30 seconds.',
            image: '/trim.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-6',
            title: 'Add Music for Reels',
            description: 'Add Music to Reels allows users to enhance their short videos by selecting background music from an audio library.',
            image: '/music.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-7',
            title: 'Gift Lists',
            description: 'The gift list includes multiple categories of gift icons that users can send and receive to earn coins.',
            image: '/giftlist.svg',
            backgroundColor: '#F1F3EE'
          }
        ],
        backgroundColor: '#000000',
        textColor: '#ffffff'
      }
    },
    {
      id: 'fifth-1',
      type: 'fifth',
      name: 'Admin Panel Section',
      visible: true,
      order: 5,
      content: {
        // Section-level colors (apply to all tabs)
        labelColor: '#2b49c5',
        subtitleColor: '#2b49c5',
        titleColor: '#111827',
        descriptionColor: '#6b7280',
        pointsColor: '#374151',
        // Layout for content with image
        layout: 'left', // Can be 'left' or 'right'
        tabs: [
          {
            id: 'recharge-plan',
            label: 'RECHARGE PLAN',
                        title: 'Wallet Recharge Plans',
            description: 'Admins can view how many users have purchased each recharge plan and on which date and time. They can easily manage all plans in one place.',
            points: [
              'Track user purchases with date & time',
              'Update pricing and plans instantly'
            ],
            image: '/Admin1.svg',
            order: 1,
            visible: true
          },
          {
            id: 'notification',
            label: 'NOTIFICATION',
                        title: 'Push Notification System',
            description: 'Send targeted push notifications to users. Schedule messages, manage templates, and track delivery status all from one dashboard.',
            points: [
              'Schedule notifications for optimal timing',
              'Create custom notification templates',
            
            ],
            image: '/Admin2.svg',
            order: 2,
            visible: true
          },
          {
            id: 'language',
            label: 'LANGUAGE',
                        title: 'Multi-Language Support',
            description: 'Manage platform translations and language settings. Add new languages, edit translations, and control regional content.',
            points: [
              'Support for 10+ languages',
              'Real-time translation management',
              
            ],
            image: '/Admin3.svg',
            order: 3,
            visible: true
          },
          {
            id: 'admin-settings',
            label: 'ADMIN SETTINGS',
                        title: 'Platform Configuration',
            description: 'Control platform-wide settings, user permissions, feature toggles, and system configurations from the admin dashboard.',
            points: [
              'Manage admin roles and permissions',
              'Toggle features on/off globally',
            
            ],
            image: '/Admin1.svg',
            order: 4,
            visible: true
          }
        ]
      }
    },
    {
      id: 'sixth-1',
      type: 'sixth',
      name: 'Benefits Section',
      visible: true,
      order: 6,
      content: {
        dotText: 'Main Benefits',
        title: 'Many Benefits You Get',
        highlightedTitle: 'Using Product',
        benefits: [
          { id: 'benefit-1', iconName: 'Phone', title: 'Phone Authentication', description: 'Allows multiple users to chat at the same time. It also supports assigning multiple admins to manage conversations efficiently.', order: 1 },
          { id: 'benefit-2', iconName: 'UserCircle', title: 'Avatar', description: 'Avatar selection lets you choose from predefined avatars instead of uploading an image. Pick an avatar that best represents you instantly.', order: 2 },
          { id: 'benefit-3', iconName: 'MessageSquare', title: 'Single Chat', description: 'Single Chat allows a user to chat with only one person at a time. It ensures focused, one-to-one conversations without interruptions.', order: 3 },
          { id: 'benefit-4', iconName: 'Reply', title: 'Reply', description: 'Reply lets you respond to a specific message by tapping on reply icon. It keeps conversations clear and well-contextualized.', order: 4 },
          { id: 'benefit-5', iconName: 'Users', title: 'Group Chat', description: 'Group Chat allows multiple users to chat together in real time. It also supports assigning multiple admins to manage the group efficiently.', order: 5 },
          { id: 'benefit-6', iconName: 'Star', title: 'Starred Messages', description: 'Tap on star icon to mark important messages. Starred messages are saved for quick and easy access later.', order: 6 },
          { id: 'benefit-7', iconName: 'Forward', title: 'Forward', description: 'Tap on forward icon to share a message. You can forward it to an individual user or a group instantly.', order: 7 },
          { id: 'benefit-8', iconName: 'Copy', title: 'Copy', description: 'Copy any text with a single tap. Paste it easily into any chat or group conversation.', order: 8 },
          { id: 'benefit-9', iconName: 'Trash2', title: 'Delete', description: 'You can delete one or multiple messages at once. Messages can be deleted either just for you or for everyone in the chat.', order: 9 },
          { id: 'benefit-10', iconName: 'UserPlus', title: 'Add Participants', description: 'Add multiple participants while creating a new group chat. Select the users you want to include and start the conversation instantly.', order: 10 },
          { id: 'benefit-11', iconName: 'Eraser', title: 'Clear Chat', description: 'Clear all messages from an individual or group chat. This removes the chat history while keeping the conversation intact.', order: 11 },
          { id: 'benefit-12', iconName: 'Search', title: 'Search Chat', description: 'Use the search feature to quickly find specific messages in a chat. It makes accessing conversations easier, even with a large number of messages.', order: 12 },
          { id: 'benefit-13', iconName: 'Contact2', title: 'Contact List', description: 'The contact list includes all WhoXa chat users or synced phone contacts. These options can be configured and managed through the admin panel.', order: 13 },
          { id: 'benefit-14', iconName: 'UserCog', title: 'Edit Profile', description: 'The Edit Profile section displays all user information. Users can update and modify their details anytime.', order: 14 },
          { id: 'benefit-15', iconName: 'Ban', title: 'Block Contacts', description: 'Blocked Contacts shows all users you have blocked. You can view and manage the blocked contacts list easily.', order: 15 },
          { id: 'benefit-16', iconName: 'AlertTriangle', title: 'Report user', description: 'Reported users are listed with the specified reason. These reports are visible and managed through the admin panel.', order: 16 },
          { id: 'benefit-17', iconName: 'Archive', title: 'Archived Chat', description: 'Archived chats let users hide conversations from the main chat list. These chats are stored safely and can be accessed anytime later.', order: 17 },
          { id: 'benefit-18', iconName: 'Moon', title: 'Dark/Light Mode', description: 'Users can switch between light and dark modes anytime. This allows a comfortable viewing experience based on their preference.', order: 18 },
          { id: 'benefit-19', iconName: 'Search', title: 'Search User', description: 'Search User allows admins to quickly find reported users. All reported users and their reasons are visible in the admin panel.', order: 19 },
          { id: 'benefit-20', iconName: 'Volume2', title: 'Ringtone Notification', description: 'Ringtone Notifications let users customize alert sounds for chats. This helps them easily identify and respond to incoming messages.', order: 20 },
          { id: 'benefit-21', iconName: 'Image', title: 'Status', description: 'Status can be shared as text, images, or videos. It automatically disappears after 24 hours.', order: 21 },
          { id: 'benefit-22', iconName: 'Phone', title: 'Audio Call', description: 'Audio calling supports both one-on-one and group conversations. It enables clear voice communication with multiple participants in real time.', order: 22 },
          { id: 'benefit-23', iconName: 'Video', title: 'Video Call', description: 'Video calls support real-time face-to-face conversations. They can be one-on-one or group calls with three or more participants.', order: 23 }
        ],
        dotColor: '#4A6CF7',
        dotTextColor: '#000000',
        titleColor: '#111827',
        highlightedTitleBgColor: 'transparent',
        highlightedTitleColor: '#111827',
        benefitIconColor: '#2563EB',
        benefitTitleColor: '#111827',
        benefitDescriptionColor: '#6B7280',
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF'
      }
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      name: 'Testimonials Section',
      visible: true,
      order: 7,
      content: {
        title: 'Reviews from real people',
        subtitle: 'What our customers are saying',
        backgroundColor: '#f3f4f6',
        textColor: '#111827',
        cardBackgroundColor: '#ffffff',
        cardTextColor: '#1f2937',
        testimonials: [
          {
            id: '1',
            name: 'Sarah Johnson',
            role: 'CEO',
            company: 'TechCorp',
            content: 'ReelBoost has completely transformed how we engage with our audience. The live streaming features are incredible, and our engagement metrics have skyrocketed since we started using the platform.',
            rating: 5
          },
          {
            id: '2',
            name: 'Michael Chen',
            role: 'Marketing Director',
            company: 'Digital Agency',
            content: 'As a marketing agency, we\'re always looking for innovative ways to help our clients stand out. ReelBoost provides everything we need - from short video creation to live streaming. ',
            rating: 5
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            role: 'Content Creator',
            company: 'Media House',
            content: 'The video editing tools are incredibly intuitive and powerful. I can create professional-looking content in minutes, not hours. The built-in music library and effects save me so much time. ',
            rating: 5
          },
          {
            id: '4',
            name: 'David Kim',
            role: 'Product Manager',
            company: 'StartupHub',
            content: 'We integrated ReelBoost into our app ecosystem and the results have been phenomenal. The API is well-documented and the support team is amazing. ',
            rating: 5
          },
          {
            id: '5',
            name: 'Lisa Thompson',
            role: 'Social Media Manager',
            company: 'BrandCo',
            content: 'The scheduling and analytics features have made my job so much easier. I can plan content weeks in advance and track performance in real-time. ',
            rating: 4
          }
        ]
      }
    },
    {
      id: 'faq-1',
      type: 'faq',
      name: 'FAQ Section',
      visible: true,
      order: 8,
      content: {
        title: 'Frequently asked questions',
        subtitle: "Everything you need to know about ReelBoost. Can't find what you're looking for? Contact our support team!",
        backgroundColor: '#ffffff',
        textColor: '#101828',
        accentColor: '#667085',
        borderColor: '#EAECF0',
        dotText: 'FAQ',
        dotTextColor: '#101828',
        showDotText: true,
        categories: ['General', 'Live Streaming', 'Monetization', 'Account'],
        activeCategory: 'General',
        faqs: [
          {
            id: '1',
            question: 'What is ReelBoost and how does it work?',
            answer: 'ReelBoost is a comprehensive live streaming and short video platform that empowers creators to broadcast content, engage with audiences in real-time, and monetize through gifts and subscriptions. Simply sign up, set up your profile, and start streaming or uploading short videos instantly.',
            category: 'General'
          },
          {
            id: '2',
            question: 'How many viewers can join my live stream?',
            answer: 'ReelBoost supports unlimited viewers for your live streams. Our infrastructure scales automatically to handle thousands of concurrent viewers with HD quality streaming and minimal latency.',
            category: 'Live Streaming'
          },
          {
            id: '3',
            question: 'How do I earn money through the platform?',
            answer: 'You can earn through multiple channels: receiving virtual gifts from viewers during live streams, subscription-based fan clubs, brand partnerships, and our creator fund program. Earnings are deposited directly to your connected wallet.',
            category: 'Monetization'
          },
          {
            id: '4',
            question: 'Can I go live with multiple people at once?',
            answer: 'Yes! ReelBoost supports multi-guest live streaming with up to 4 participants in a single stream. You can invite guests, manage their audio/video, and even host PK battles for interactive competitions.',
            category: 'Live Streaming'
          },
          {
            id: '5',
            question: 'How do I withdraw my earnings?',
            answer: 'Withdrawals are simple and secure. Go to your wallet section, link your bank account or payment method, and request a withdrawal. Funds are typically processed within 1-3 business days with a minimum withdrawal amount of $10.',
            category: 'Monetization'
          },
          {
            id: '6',
            question: 'Can I stream from my mobile device?',
            answer: 'Absolutely! ReelBoost is fully optimized for mobile streaming. Download our iOS or Android app, and you can start streaming directly from your phone with professional-grade features and controls.',
            category: 'Live Streaming'
          },
          {
            id: '7',
            question: 'How do I grow my audience on ReelBoost?',
            answer: 'Use our built-in analytics to understand your audience, collaborate with other creators, participate in trending challenges, and leverage our recommendation algorithm by posting consistently and engaging with your community.',
            category: 'General'
          },
          {
            id: '8',
            question: 'Is there a subscription model for my fans?',
            answer: 'Yes! You can set up tiered subscription plans for your fans with exclusive perks like special badges, subscriber-only content, private streams, and direct messaging access. You control the pricing and benefits.',
            category: 'Monetization'
          },
          {
            id: '9',
            question: 'How do I report inappropriate content?',
            answer: 'We have robust moderation tools. Click the three-dot menu on any content and select "Report" to flag violations. Our team reviews reports within 24 hours. You can also block users and set content filters.',
            category: 'Account'
          },
          {
            id: '10',
            question: 'Can I schedule my live streams in advance?',
            answer: 'Yes! Use our scheduling feature to announce upcoming streams, set reminders for your followers, and create anticipation posts. Scheduled streams get priority placement in the discover section.',
            category: 'Account'
          }
        ]
      }
    },
    {
      id: 'subscription-plan-1',
      type: 'subscription-plan',
      name: 'Subscription Plan Section',
      visible: true,
      order: 9,
      content: {
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
        plans: [
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
            isPopular: false,
            buttonLink: '',
            buttonTarget: '_blank'
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
            badgeText: 'Most Popular',
            buttonLink: '',
            buttonTarget: '_blank'
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
            isPopular: false,
            buttonLink: '',
            buttonTarget: '_blank'
          }
        ]
      }
    }
  ];

const initialState: BuilderState = {
  isBuilderMode: false,
  isInlineEditMode: false,
  editingSectionId: null,
  editingField: null,
  sectionHistory: {},
  isPreviewMode: false,
  activeSection: null,
  sectionsHistory: {
    past: [],
    present: { builderSections: initialSections, bannerSections: [] },
    future: []
  },
  sections: initialSections
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    toggleBuilderMode: (state) => {
      state.isBuilderMode = !state.isBuilderMode;
    },
    setBuilderMode: (state, action: PayloadAction<boolean>) => {
      state.isBuilderMode = action.payload;
    },
    setActiveSection: (state, action: PayloadAction<string | null>) => {
      state.activeSection = action.payload;
    },
    togglePreviewMode: (state) => {
      state.isPreviewMode = !state.isPreviewMode;
    },
    setInlineEditMode: (state, action: PayloadAction<boolean>) => {
      state.isInlineEditMode = action.payload;
    },
    setEditingSection: (state, action: PayloadAction<{ sectionId: string | null; field: string | null }>) => {
      state.editingSectionId = action.payload.sectionId;
      state.editingField = action.payload.field;
    },
    setSections: (state, action: PayloadAction<SectionConfig[]>) => {
      state.sections = action.payload;
      // Clear history when loading published data
      state.sectionHistory = {};
      state.sectionsHistory = {
        past: [],
        present: { builderSections: action.payload, bannerSections: [] },
        future: []
      };
    },
    updateSectionContent: (state, action: PayloadAction<{ id: string; content: any }>) => {
      const { id, content } = action.payload;
      const section = state.sections.find(s => s.id === id);
      if (section) {
        console.log('=== builderSlice updateSectionContent ===');
        console.log('Section ID:', id);
        console.log('Section Type:', section.type);
        console.log('Is Banner Section (second/third):', id.startsWith('second-') || id.startsWith('third-'));
        console.log('Updating fields:', Object.keys(content));
        console.log('New values:', content);
        // Initialize section history if it doesn't exist
        if (!state.sectionHistory[id]) {
          state.sectionHistory[id] = {
            past: [],
            present: { ...section.content },
            future: []
          };
        }
        
        // Save current content to history before updating
        state.sectionHistory[id].past = [...state.sectionHistory[id].past, state.sectionHistory[id].present];
        state.sectionHistory[id].future = [];
        
        // Update the section content with deep merge for nested objects and arrays
        // Always create a new content object to trigger re-renders
        const newContent = content.features && Array.isArray(content.features)
          ? { ...section.content, features: content.features }
          : { ...section.content, ...content };
        
        // Special handling for subscription-plan sections to preserve backgroundColor
        if (section.type === 'subscription-plan') {
          // Always preserve backgroundColor from original section if not being updated
          if (!content.hasOwnProperty('backgroundColor') && section.content.backgroundColor) {
            newContent.backgroundColor = section.content.backgroundColor;
          }
          // Ensure we never set backgroundColor to undefined/null/empty
          if (!newContent.backgroundColor || 
              newContent.backgroundColor === 'undefined' || 
              newContent.backgroundColor === 'null' || 
              newContent.backgroundColor === '' ||
              typeof newContent.backgroundColor !== 'string') {
            newContent.backgroundColor = section.content.backgroundColor || '#ffffff';
          }
        } else {
          // Ensure critical style properties are preserved if not explicitly set in update
          // This prevents background from becoming dark/undefined
          if (!content.hasOwnProperty('backgroundColor') && section.content.backgroundColor) {
            newContent.backgroundColor = section.content.backgroundColor;
          }
          // Ensure we never set backgroundColor to undefined/null
          if (newContent.backgroundColor === undefined || newContent.backgroundColor === null) {
            newContent.backgroundColor = section.content.backgroundColor || '#ffffff';
          }
        }
        
        // Assign the new content object
        section.content = newContent;
        
        // Update present state with the same logic
        state.sectionHistory[id].present = newContent;
      }
    },
    toggleSectionVisibility: (state, action: PayloadAction<string>) => {
      const section = state.sections.find(s => s.id === action.payload);
      if (section) {
        section.visible = !section.visible;
      }
    },
    deleteSection: (state, action: PayloadAction<string>) => {
      console.log('Delete section called with id:', action.payload);
      console.log('Before delete - sections count:', state.sections.length, 'history past length:', state.sectionsHistory.past.length);
      
      // Save current state to history before deleting
      state.sectionsHistory.past = [...state.sectionsHistory.past, { ...state.sectionsHistory.present }];
      state.sectionsHistory.future = [];
      
      state.sections = state.sections.filter(s => s.id !== action.payload);
      if (state.activeSection === action.payload) {
        state.activeSection = null;
      }
      
      // Clean up section history for deleted section
      delete state.sectionHistory[action.payload];
      
      // Update present state with both builder and banner sections
      state.sectionsHistory.present = {
        builderSections: [...state.sections],
        bannerSections: state.sectionsHistory.present.bannerSections
      };
      console.log('After delete - sections count:', state.sections.length, 'history past length:', state.sectionsHistory.past.length);
    },
    addSection: (state, action: PayloadAction<{ type: SectionConfig['type']; name?: string }>) => {
      const { type, name } = action.payload;
      const isNewFifth = type === 'fifth';

      // Generate semantic IDs for special sections based on type and name
      let sectionId: string;
      let sectionName: string;

      // Check if this is a Live Streaming section (from name or type)
      if (name?.toLowerCase().includes('live streaming') || type === 'live-streaming' || type === 'second') {
        sectionId = `banner-${Date.now()}`;
        sectionName = name || 'Live Streaming Section';
      }
      // Check if this is a PK Battle section (from name or type)
      else if (name?.toLowerCase().includes('pk battle') || type === 'pk-battle' || type === 'third') {
        sectionId = `banner-${Date.now()}`;
        sectionName = name || 'PK Battle Section';
      }
      // Check if this is a Features section (from name or type)
      else if (name?.toLowerCase().includes('features') || type === 'features' || type === 'fourth') {
        sectionId = `fourth-${Date.now()}`;
        sectionName = name || 'Features Section';
      }
      // Check if this is a Benefits section
      else if (name?.toLowerCase().includes('benefits') || type === 'benefits' || type === 'sixth') {
        sectionId = `sixth-${Date.now()}`;
        sectionName = name || 'Benefits Section';
      }
      // Check if this is an Admin Panel section
      else if (name?.toLowerCase().includes('admin') || type === 'admin-panel' || type === 'fifth') {
        sectionId = `fifth-${Date.now()}`;
        sectionName = name || 'Admin Panel Section';
      }
      // Default case: use type-based ID
      else {
        sectionId = `${type}-${Date.now()}`;
        sectionName = name || `${type.charAt(0).toUpperCase() + type.slice(1)} Section`;
      }

      const newSection: SectionConfig = {
        id: sectionId,
        type: type === 'live-streaming' ? 'banner' : type === 'pk-battle' ? 'banner' : type === 'features' ? 'fourth' : type,
        name: sectionName,
        visible: true,
        order: state.sections.length + 1,
        content: getDefaultContent(type, isNewFifth)
      };
      
      // Save current state to history before adding
      state.sectionsHistory.past = [...state.sectionsHistory.past, { ...state.sectionsHistory.present }];
      state.sectionsHistory.future = [];
      
      state.sections.push(newSection);
      state.sectionsHistory.present = {
        builderSections: [...state.sections],
        bannerSections: state.sectionsHistory.present.bannerSections
      };
    },
    addSectionAndSetActive: (state, action: PayloadAction<{ type: SectionConfig['type']; name?: string }>) => {
      const { type, name } = action.payload;
      console.log('Redux addSectionAndSetActive called with:', { type, name });

      const isNewFifth = type === 'fifth';

      // Generate semantic IDs for special sections based on type and name
      let sectionId: string;
      let sectionName: string;

      // Check if this is a Live Streaming section (from name or type)
      if (name?.toLowerCase().includes('live streaming') || type === 'live-streaming' || type === 'second') {
        sectionId = `banner-${Date.now()}`;
        sectionName = name || 'Live Streaming Section';
      }
      // Check if this is a PK Battle section (from name or type)
      else if (name?.toLowerCase().includes('pk battle') || type === 'pk-battle' || type === 'third') {
        sectionId = `banner-${Date.now()}`;
        sectionName = name || 'PK Battle Section';
      }
      // Check if this is a Features section (from name or type)
      else if (name?.toLowerCase().includes('features') || type === 'features' || type === 'fourth') {
        sectionId = `fourth-${Date.now()}`;
        sectionName = name || 'Features Section';
      }
      // Check if this is a Benefits section
      else if (name?.toLowerCase().includes('benefits') || type === 'benefits' || type === 'sixth') {
        sectionId = `sixth-${Date.now()}`;
        sectionName = name || 'Benefits Section';
      }
      // Check if this is an Admin Panel section
      else if (name?.toLowerCase().includes('admin') || type === 'admin-panel' || type === 'fifth') {
        sectionId = `fifth-${Date.now()}`;
        sectionName = name || 'Admin Panel Section';
      }
      // Default case: use type-based ID
      else {
        sectionId = `${type}-${Date.now()}`;
        sectionName = name || (type === 'hero' ? 'Text and Image' : `${type.charAt(0).toUpperCase() + type.slice(1)} Section`);
      }

      const newSection: SectionConfig = {
        id: sectionId,
        type: type === 'live-streaming' ? 'banner' : type === 'pk-battle' ? 'banner' : type === 'features' ? 'fourth' : type,
        name: sectionName,
        visible: true,
        order: state.sections.length + 1,
        content: getDefaultContent(type, isNewFifth)
      };
      
      console.log('Creating new section:', newSection);
      console.log('Before add - sections count:', state.sections.length, 'history past length:', state.sectionsHistory.past.length);
      
      // Save current state to history before adding
      state.sectionsHistory.past = [...state.sectionsHistory.past, { ...state.sectionsHistory.present }];
      state.sectionsHistory.future = [];
      
      state.sections.push(newSection);
      // Set the new section as active
      state.activeSection = newSection.id;
      console.log('Set activeSection to:', newSection.id);
      
      // Update present state with both builder and banner sections
      state.sectionsHistory.present = {
        builderSections: [...state.sections],
        bannerSections: state.sectionsHistory.present.bannerSections
      };
      console.log('After add - sections count:', state.sections.length, 'history past length:', state.sectionsHistory.past.length);
    },
    reorderSections: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return;
      
      // Save current state to history before reordering
      state.sectionsHistory.past = [...state.sectionsHistory.past, { ...state.sectionsHistory.present }];
      state.sectionsHistory.future = [];
      
      const draggedSection = state.sections[fromIndex];
      state.sections.splice(fromIndex, 1);
      state.sections.splice(toIndex, 0, draggedSection);
      
      // Update order property
      state.sections.forEach((section, index) => {
        section.order = index + 1;
      });
      
      // Update present state with both builder and banner sections
      state.sectionsHistory.present = {
        builderSections: [...state.sections],
        bannerSections: state.sectionsHistory.present.bannerSections
      };
    },
    updateHeroContent: (state, action: PayloadAction<Partial<HeroContent>>) => {
      const heroSection = state.sections.find(s => s.type === 'hero');
      if (heroSection) {
        heroSection.content = { ...heroSection.content, ...action.payload };
      }
    },
    doneSection: (state, action: PayloadAction<string>) => {
      const section = state.sections.find(s => s.id === action.payload);
      if (section) {
        section.visible = true;
      }
    },
    markSectionAsReady: (state, action: PayloadAction<{ id: string; content?: any }>) => {
      const section = state.sections.find(s => s.id === action.payload.id);
      if (section) {
        section.visible = true;
        // If it's a hero section and content is provided, update it
        if (section.type === 'hero' && action.payload.content) {
          section.content = { ...section.content, ...action.payload.content };
        }
      }
    },
    // Section-specific undo/redo actions
    undoSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      const sectionHistory = state.sectionHistory[sectionId];
      
      if (sectionHistory && sectionHistory.past.length > 0) {
        const previous = sectionHistory.past[sectionHistory.past.length - 1];
        sectionHistory.past = sectionHistory.past.slice(0, sectionHistory.past.length - 1);
        sectionHistory.future = [sectionHistory.present, ...sectionHistory.future];
        sectionHistory.present = previous;
        
        // Update the actual section content
        const section = state.sections.find(s => s.id === sectionId);
        if (section) {
          section.content = { ...previous };
        }
      }
    },
    redoSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      const sectionHistory = state.sectionHistory[sectionId];
      
      if (sectionHistory && sectionHistory.future.length > 0) {
        const next = sectionHistory.future[0];
        sectionHistory.future = sectionHistory.future.slice(1);
        sectionHistory.past = [...sectionHistory.past, sectionHistory.present];
        sectionHistory.present = next;
        
        // Update the actual section content
        const section = state.sections.find(s => s.id === sectionId);
        if (section) {
          section.content = { ...next };
        }
      }
    },
    // Legacy undo/redo for backward compatibility (now uses active section)
    undo: (state) => {
      if (state.editingSectionId && state.sectionHistory[state.editingSectionId]) {
        const sectionHistory = state.sectionHistory[state.editingSectionId];
        if (sectionHistory.past.length > 0) {
          const previous = sectionHistory.past[sectionHistory.past.length - 1];
          sectionHistory.past = sectionHistory.past.slice(0, sectionHistory.past.length - 1);
          sectionHistory.future = [sectionHistory.present, ...sectionHistory.future];
          sectionHistory.present = previous;
          
          const section = state.sections.find(s => s.id === state.editingSectionId);
          if (section) {
            section.content = { ...previous };
          }
        }
      }
    },
    redo: (state) => {
      if (state.editingSectionId && state.sectionHistory[state.editingSectionId]) {
        const sectionHistory = state.sectionHistory[state.editingSectionId];
        if (sectionHistory.future.length > 0) {
          const next = sectionHistory.future[0];
          sectionHistory.future = sectionHistory.future.slice(1);
          sectionHistory.past = [...sectionHistory.past, sectionHistory.present];
          sectionHistory.present = next;
          
          const section = state.sections.find(s => s.id === state.editingSectionId);
          if (section) {
            section.content = { ...next };
          }
        }
      }
    },
    // Section-level undo/redo for add/delete/reorder operations
    undoSections: (state) => {
      console.log('undoSections called - past length:', state.sectionsHistory.past.length, 'current sections:', state.sections.length);
      if (state.sectionsHistory.past.length > 0) {
        const previous = state.sectionsHistory.past[state.sectionsHistory.past.length - 1];
        console.log('Undo - restoring from previous state with', previous.builderSections.length, 'builder sections and', previous.bannerSections?.length || 0, 'banner sections');
        state.sectionsHistory.past = state.sectionsHistory.past.slice(0, state.sectionsHistory.past.length - 1);
        state.sectionsHistory.future = [state.sectionsHistory.present, ...state.sectionsHistory.future];
        state.sectionsHistory.present = previous;
        state.sections = [...previous.builderSections];
        // Store banner sections for external restoration
        (state as any)._pendingBannerSections = previous.bannerSections || [];
        console.log('Undo completed - new sections count:', state.sections.length, 'future length:', state.sectionsHistory.future.length, 'pending banner sections:', (state as any)._pendingBannerSections.length);
      } else {
        console.log('Undo called but no past states available');
      }
    },
    redoSections: (state) => {
      console.log('redoSections called - future length:', state.sectionsHistory.future.length, 'current sections:', state.sections.length);
      if (state.sectionsHistory.future.length > 0) {
        const next = state.sectionsHistory.future[0];
        console.log('Redo - restoring from next state with', next.builderSections.length, 'builder sections and', next.bannerSections?.length || 0, 'banner sections');
        state.sectionsHistory.future = state.sectionsHistory.future.slice(1);
        state.sectionsHistory.past = [...state.sectionsHistory.past, state.sectionsHistory.present];
        state.sectionsHistory.present = next;
        state.sections = [...next.builderSections];
        // Store banner sections for external restoration
        (state as any)._pendingBannerSections = next.bannerSections || [];
        console.log('Redo completed - new sections count:', state.sections.length, 'past length:', state.sectionsHistory.past.length, 'pending banner sections:', (state as any)._pendingBannerSections.length);
      } else {
        console.log('Redo called but no future states available');
      }
    },
    // Action to update sections history when banner/admin sections are added/removed (since they're in separate slices)
    updateSectionsHistory: (state, action: PayloadAction<{ bannerSections?: any[] }>) => {
      // This action is called when banner/admin sections change to sync the history
      // Save current state to history - this captures both builder and banner sections state
      state.sectionsHistory.past = [...state.sectionsHistory.past, { ...state.sectionsHistory.present }];
      state.sectionsHistory.future = [];
      
      // Update present state with current builder sections and provided banner sections
      state.sectionsHistory.present = {
        builderSections: [...state.sections],
        bannerSections: action.payload?.bannerSections || state.sectionsHistory.present.bannerSections || []
      };
      console.log('Sections history updated - builder sections:', state.sectionsHistory.present.builderSections.length, 'banner sections:', state.sectionsHistory.present.bannerSections.length);
    },
  }
});

// Helper function to get default content for different section types
// isNew parameter determines if this is a new section (2 tabs) vs default (4 tabs)
const getDefaultContent = (type: SectionConfig['type'], isNew: boolean = false) => {
  switch (type) {
    case 'banner':
      return {
        dotText: 'Live Streaming',
        title: 'Start video, interact with your user.',
        description: 'Start live streaming to connect with your audience in real time, where viewers can comment, like, stream, and send virtual gifts to show their support.',
        features: [
          {
            title: 'List of Live Streamers',
            description: 'You can check the list of live streamers, and can view likes and audience connected to the stream',
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
        dotTextColor: '#3B82F6',
        dotColor: '#3B82F6',
        titleColor: '#111827',
        descriptionColor: '#4B5563',
        featureTitleColor: '#111827',
        featureDescriptionColor: '#4B5563'
      };
case 'live-streaming':
  return {
    dotText: 'Demo Data ',
    title: 'Demo Title ',
    description: 'This is a demo description for live streaming feature. This is sample content for demonstration purposes only.',
    features: [
      {
        title: 'Demo Feature 1',
        description: 'This is a demo feature description for testing purposes.',
        icon: '/list.svg'
      },
      {
        title: 'Demo Feature 2',
        description: 'This is another demo feature description for testing purposes.',
        icon: '/livestream.svg'
      }
    ],
    backgroundImage: '/second.svg',
    backgroundColor: '#4A72FF',
    layout: 'left',
    animation: 'fade',
    dotTextColor: '#3B82F6',
    dotColor: '#3B82F6',
    titleColor: '#111827',
    descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };
case 'pk-battle':
  return {
    dotText: 'Demo Data ',
    title: 'Demo Title ',
    description: 'This is a demo description for PK battle feature. This is sample content for demonstration purposes only.',
    features: [
      {
        title: 'Demo Feature 1',
        description: 'This is a demo feature description for testing purposes.',
        icon: '/sword.svg'
      },
      {
        title: 'Demo Feature 2',
        description: 'This is another demo feature description for testing purposes.',
        icon: '/gift.svg'
      }
    ],
    backgroundImage: '/third.svg',
    backgroundColor: '#FF6B4A',
    layout: 'right',
    animation: 'slide',
    dotTextColor: '#FF6B4A',
    dotColor: '#FF6B4A',
    titleColor: '#111827',
    descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };
      return {
        dotText: 'PK Battle',
        title: 'Live battles to win audience support',
        description: 'The PK battle lasts 5 minutes, with the highest-scoring participant declared the winner, and the host can invite users to join the live stream.',
        features: [
          {
            title: 'Loss and Win Battle',
            description: 'In a PK battle, the streamer with the higher score wins the match, while the one with the lower score loses the battle.',
            icon: '/sword.svg'
          },
          {
            title: 'Send Gifts during Battle',
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
        layout: 'right',
        animation: 'fade',
        dotTextColor: '#FFB800',
        dotColor: '#FFB800',
        titleColor: '#111827',
        descriptionColor: '#4B5563',
        featureTitleColor: '#111827',
        featureDescriptionColor: '#4B5563'
      };
    case 'second':
      return {
        dotText: 'Live Streaming',
        title: 'Start video, interact with your user.',
        description: 'Start live streaming to connect with your audience in real time, where viewers can comment, like, stream, and send virtual gifts to show their support.',
        features: [
          {
            title: 'List of Live Streamers',
            description: 'You can check the list of live streamers, and can view likes and audience connected to the stream',
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
        dotTextColor: '#3B82F6',
        dotColor: '#3B82F6',
        titleColor: '#111827',
        descriptionColor: '#4B5563',
        featureTitleColor: '#111827',
        featureDescriptionColor: '#4B5563'
      };
    case 'hero':
      return {
        title: 'New Section',
        description: 'Description text goes here.',
        primaryButtonText: 'Get Started',
        secondaryButtonText: 'Learn More',
        backgroundImage: '/hero.png',
        layout: 'left',
        titleColor: '#2D3134',
                descriptionColor: '#4B5563',
        primaryButtonColor: '#4A72FF',
        secondaryButtonColor: '#6B7280',
        animation: 'fade',
        tags: ["Feature 1", "Feature 2", "Feature 3"],
        activeTag: "Feature 1",
        appStoreImage: '/Button1.png',
        googlePlayImage: '/Button2.png',
        topAccentColor: '#2B59FF',
        bottomAccentColor: '#FFB800'
      };
    case 'second':
      return {
        dotText: 'Live Streaming Platform',
        title: 'Connect with Your Audience',
        description: 'Transform your content creation with our comprehensive live streaming platform. Engage your audience in real-time with crystal-clear video quality, interactive features, and powerful analytics.',
        features: [
          {
            title: 'HD Streaming',
            description: 'Broadcast in crystal-clear 1080p quality with adaptive bitrate technology',
            icon: 'Video'
          },
          {
            title: 'Real-time Chat',
            description: 'Engage with your audience through live chat and interactive features',
            icon: 'MessageCircle'
          }
        ],
        backgroundImage: '/second.svg', // Default image for new banners
        backgroundColor: '#ffffff',
        layout: 'left',
        animation: 'fade',
        dotTextColor: '#3B82F6',
        titleColor: '#111827',
                descriptionColor: '#4B5563',
        featureTitleColor: '#111827',
        featureDescriptionColor: '#4B5563'
      };
    case 'third':
      return {
        dotText: 'Main Features',
        title: 'Achieving More Through Digital Excellence',
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
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-2',
            title: 'Live Streaming',
            description: 'Live streaming supports up to four participants at a time, enabling real-time interaction, collaboration, and audience engagement.',
            image: '/hero.png',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-3',
            title: 'Payment History',
            description: 'View your complete payment history, including funds added for sending gifts and withdrawals made from coins received.',
            image: '/third.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-4',
            title: 'Reelboost',
            description: '',
            image: '/laptop.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-5',
            title: 'Video Trimming',
            description: 'Videos can be trimmed from beginning or end, with a maximum length limit of 30 seconds.',
            image: '/trim.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-6',
            title: 'Add Music for Reels',
            description: 'Add Music to Reels allows users to enhance their short videos by selecting background music from an audio library.',
            image: '/music.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-7',
            title: 'Gift Lists',
            description: 'The gift list includes multiple categories of gift icons that users can send and receive to earn coins.',
            image: '/giftlist.svg',
            backgroundColor: '#F1F3EE'
          }
        ],
        backgroundColor: '#000000',
        textColor: '#ffffff',
        titleColor: '#ffffff',
        subtitleColor: '#ffffff',
        descriptionColor: '#ffffff'
      };
    case 'fourth':
      return {
        dotText: 'Main Features',
        title: 'Achieving More Through Digital Excellence',
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
            description: 'The wallet allows users to securely manage their balance.',
            image: '/wallet.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-2',
            title: 'Live Streaming',
            description: 'Live streaming supports up to four participants.',
            image: '/hero.png',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-3',
            title: 'Payment History',
            description: 'View your complete payment history.',
            image: '/third.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-4',
            title: 'Reelboost',
            description: '',
            image: '/laptop.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-5',
            title: 'Video Trimming',
            description: 'Videos can be trimmed from beginning or end.',
            image: '/trim.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-6',
            title: 'Add Music for Reels',
            description: 'Add Music to Reels allows users to enhance their short videos.',
            image: '/music.svg',
            backgroundColor: '#F1F3EE'
          },
          {
            id: 'card-7',
            title: 'Gift Lists',
            description: 'The gift list includes multiple categories of gift icons.',
            image: '/giftlist.svg',
            backgroundColor: '#F1F3EE'
          }
        ],
        backgroundColor: '#000000',
        textColor: '#ffffff'
      };
    case 'fifth':
      // For new sections, return generic demo tabs. For default, return all 4.
      const allTabs = [
        {
          id: 'recharge-plan',
          label: 'RECHARGE PLAN',
                    title: 'Wallet Recharge Plans',
          description: 'Admins can view how many users have purchased each recharge plan and on which date and time. They can easily manage all plans in one place.',
          points: [
            'Track user purchases with date & time',
            'Update pricing and plans instantly'
          ],
          image: '/Admin1.svg',
          order: 1,
          visible: true
        },
        {
          id: 'notification',
          label: 'NOTIFICATION',
                    title: 'Push Notification System',
          description: 'Send targeted push notifications to users. Schedule messages, manage templates, and track delivery status all from one dashboard.',
          points: [
            'Schedule notifications for optimal timing',
            'Create custom notification templates',
          ],
          image: '/Admin2.svg',
          order: 2,
          visible: true
        },
        {
          id: 'language',
          label: 'LANGUAGE',
                    title: 'Multi-Language Support',
          description: 'Manage platform translations and language settings. Add new languages, edit translations, and control regional content.',
          points: [
            'Support for 10+ languages',
            'Real-time translation management',
          ],
          image: '/Admin3.svg',
          order: 3,
          visible: true
        },
        {
          id: 'admin-settings',
          label: 'ADMIN SETTINGS',
                    title: 'Platform Configuration',
          description: 'Control platform-wide settings, user permissions, feature toggles, and system configurations from the admin dashboard.',
          points: [
            'Manage admin roles and permissions',
            'Toggle features on/off globally',
          ],
          image: '/Admin1.svg',
          order: 4,
          visible: true
        }
      ];
      
      // For new sections, return generic demo tabs with different content
      const demoTabs = [
        {
          id: `feature-1`,
          label: 'FEATURE 1',
                    title: 'Feature Management Tool',
          description: 'Manage and configure this feature from the admin dashboard. Customize settings and monitor performance.',
          points: [
            'Configure feature settings',
            'Monitor performance metrics'
          ],
          image: '/Admin1.svg',
          order: 1,
          visible: true
        },
        {
          id: `feature-2`,
          label: 'FEATURE 2',
                    title: 'Advanced Management System',
          description: 'Control and manage advanced settings for this feature. Track usage and optimize performance.',
          points: [
            'Track usage statistics',
            'Optimize system performance'
          ],
          image: '/Admin2.svg',
          order: 2,
          visible: true
        }
      ];
      
      return {
        tabs: isNew ? demoTabs : allTabs
      };
    case 'sixth':
    case 'benefits':
      return {
        dotText: 'Main Benefits',
        title: 'Many Benefits You Get',
        highlightedTitle: 'Using Product',
        benefits: [
          { id: 'benefit-1', iconName: 'Star', title: 'Demo Data 1', description: 'This is demo data for first benefit. You can customize this text to match your specific product or service features.', order: 1 },
          { id: 'benefit-2', iconName: 'CheckCircle', title: 'Demo Data 2', description: 'This is demo data for second benefit. Replace this with actual benefits that your customers will receive.', order: 2 },
          { id: 'benefit-3', iconName: 'Zap', title: 'Demo Data 3', description: 'This is demo data for third benefit. Make sure to highlight the unique value propositions of your offering.', order: 3 }
        ],
        backgroundColor: '#000000',
        textColor: '#ffffff'
      };
    case 'testimonials':
      return {
        title: 'Reviews from real people',
        subtitle: 'What our customers are saying',
        backgroundColor: '#f9fafb',
        textColor: '#111827',
        cardBackgroundColor: '#ffffff',
        cardTextColor: '#1f2937',
        starColor: '#10b981',
        quoteIconColor: '#9ca3af',
        carouselPosition: 'right',
        testimonials: [
          {
            id: '1',
            name: 'Ryan Almeida',
            role: 'CEO',
            company: 'TechCorp',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
            avatar: '',
            rating: 5
          },
          {
            id: '2',
            name: 'Blossom Menezes',
            role: 'Marketing Director',
            company: 'Growth Inc',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
            avatar: '',
            rating: 5
          },
          {
            id: '3',
            name: 'Jason Wong',
            role: 'Product Manager',
            company: 'StartupHub',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
            avatar: '',
            rating: 5
          }
        ]
      };
    case 'faq':
      return {
        title: 'Frequently asked questions',
        subtitle: "Everything you need to know about ReelBoost. Can't find what you're looking for? Contact our support team!",
        backgroundColor: '#ffffff',
        textColor: '#101828',
        accentColor: '#667085',
        borderColor: '#EAECF0',
        dotText: 'FAQ',
        dotTextColor: '#101828',
        showDotText: true,
        categories: ['General', 'Live Streaming', 'Monetization', 'Account'],
        activeCategory: 'General',
        faqs: [
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
          }
        ]
      };
    case 'subscription-plan':
      return {
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
        badgeTextColor: '#ffffff',
        badgeBackgroundColor: '#3b82f6',
        dotText: 'Pricing',
        dotTextColor: '#111827',
        showDotText: true,
        tickColor: '#10b981',
        plans: [
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
        ]
      };
    default:
      return {};
  }
};

export const {
  toggleBuilderMode,
  setActiveSection,
  toggleSectionVisibility,
  deleteSection,
  addSection,
  addSectionAndSetActive,
  reorderSections,
  updateSectionContent,
  updateHeroContent,
  undo,
  redo,
  undoSection,
  redoSection,
  undoSections,
  redoSections,
  updateSectionsHistory,
  togglePreviewMode,
  doneSection,
  markSectionAsReady,
  setInlineEditMode,
  setEditingSection,
  setSections
} = builderSlice.actions;

// Selectors
export const selectCanUndo = (state: { builder: BuilderState } | RootState) => {
  const { editingSectionId, sectionHistory } = state.builder;
  return !!(editingSectionId && sectionHistory[editingSectionId]?.past.length > 0);
};
export const selectCanRedo = (state: { builder: BuilderState } | RootState) => {
  const { editingSectionId, sectionHistory } = state.builder;
  return !!(editingSectionId && sectionHistory[editingSectionId]?.future.length > 0);
};
export const selectSectionCanUndo = (sectionId: string) => (state: { builder: BuilderState }) => 
  state.builder.sectionHistory[sectionId]?.past.length > 0;
export const selectSectionCanRedo = (sectionId: string) => (state: { builder: BuilderState }) => 
  state.builder.sectionHistory[sectionId]?.future.length > 0;

// Selectors for sections-level undo/redo (for SectionList)
export const selectSectionsCanUndo = (state: { builder: BuilderState }) => {
  const canUndo = state.builder.sectionsHistory.past.length > 0;
  console.log('selectSectionsCanUndo - past length:', state.builder.sectionsHistory.past.length, 'canUndo:', canUndo);
  return canUndo;
};
export const selectSectionsCanRedo = (state: { builder: BuilderState }) => {
  const canRedo = state.builder.sectionsHistory.future.length > 0;
  console.log('selectSectionsCanRedo - future length:', state.builder.sectionsHistory.future.length, 'canRedo:', canRedo);
  return canRedo;
};
// Selector to get pending banner sections for restoration after undo/redo
export const selectPendingBannerSections = (state: { builder: BuilderState }) => {
  return (state.builder as any)._pendingBannerSections;
};

export default builderSlice.reducer;
