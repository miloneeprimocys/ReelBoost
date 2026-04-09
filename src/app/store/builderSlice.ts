import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

interface SectionConfig {
  id: string;
  type: 'hero' | 'banner' | 'live-streaming' | 'pk-battle' | 'features' | 'admin-panel' | 'benefits' | 'second' | 'third' | 'fourth' | 'fifth' | 'sixth';
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
}

const initialState: BuilderState = {
  isBuilderMode: false,
  sections: [
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
        dotText: ''
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
            image: '',
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
    }
  ],
  activeSection: null,
  isPreviewMode: false
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
    updateSectionContent: (state, action: PayloadAction<{ id: string; content: any }>) => {
      const { id, content } = action.payload;
      const section = state.sections.find(s => s.id === id);
      if (section) {
        section.content = { ...section.content, ...content };
      }
    },
    toggleSectionVisibility: (state, action: PayloadAction<string>) => {
      const section = state.sections.find(s => s.id === action.payload);
      if (section) {
        section.visible = !section.visible;
      }
    },
    deleteSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(s => s.id !== action.payload);
      if (state.activeSection === action.payload) {
        state.activeSection = null;
      }
    },
    addSection: (state, action: PayloadAction<{ type: SectionConfig['type']; name?: string }>) => {
      const { type, name } = action.payload;
      const isNewFifth = type === 'fifth';
      const newSection: SectionConfig = {
        id: `${type}-${Date.now()}`,
        type,
        name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
        visible: true,
        order: state.sections.length + 1,
        content: getDefaultContent(type, isNewFifth)
      };
      state.sections.push(newSection);
    },
    addSectionAndSetActive: (state, action: PayloadAction<{ type: SectionConfig['type']; name?: string }>) => {
      const { type, name } = action.payload;
      console.log('Redux addSectionAndSetActive called with:', { type, name });
      
      const isNewFifth = type === 'fifth';
      const newSection: SectionConfig = {
        id: `${type}-${Date.now()}`,
        type,
        name: name || (type === 'hero' ? 'Text and Image' : `${type.charAt(0).toUpperCase() + type.slice(1)} Section`),
        visible: true,
        order: state.sections.length + 1,
        content: getDefaultContent(type, isNewFifth)
      };
      
      console.log('Creating new section:', newSection);
      state.sections.push(newSection);
      // Set the new section as active
      state.activeSection = newSection.id;
      console.log('Set activeSection to:', newSection.id);
    },
    reorderSections: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
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
    }
  }
});

// Helper function to get default content for different section types
// isNew parameter determines if this is a new section (2 tabs) vs default (4 tabs)
const getDefaultContent = (type: SectionConfig['type'], isNew: boolean = false) => {
  switch (type) {
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
    case 'banner':
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
        backgroundImage: '/api/placeholder/600/400', // Default image for new banners
        backgroundColor: '#ffffff',
        layout: 'left',
        animation: 'fade',
        dotTextColor: '#3B82F6',
        titleColor: '#111827',
                descriptionColor: '#4B5563',
        featureTitleColor: '#111827',
        featureDescriptionColor: '#4B5563'
      };
    case 'features':
      return {
        dotText: 'Main Features',
        title: 'Achieving More Through Digital Excellence',
                description: '',
        features: [
          { id: 'feature-1', title: 'New Demo Feature 1', icon: '/video.svg', backgroundImage: '/laptop.svg' },
          { id: 'feature-2', title: 'New Demo Feature 2', icon: '/notification.svg', backgroundImage: '/laptop.svg' }
        ],
        cards: [
          {
            id: 'card-1',
            title: 'New Demo Card 1',
            description: 'Demo description for card 1 with sample content text.',
            image: '/wallet.svg',
            backgroundColor: '#F1F3EE',
            layout: 'default'
          },
          {
            id: 'card-2',
            title: 'New Demo Card 2',
            description: 'Demo description for card 2 with sample content text.',
            image: '/hero.png',
            backgroundColor: '#F1F3EE',
            layout: 'centered'
          },
          {
            id: 'card-3',
            title: 'New Demo Card 3',
            description: 'Demo description for card 3 with sample content text.',
            image: '',
            backgroundColor: '#F1F3EE',
            layout: 'default'
          },
          {
            id: 'card-4',
            title: 'New Demo Card 4',
            description: 'Demo description for card 4 with sample content text.',
            image: '/laptop.svg',
            backgroundColor: '#F1F3EE',
            layout: 'full-image'
          },
          {
            id: 'card-5',
            title: 'New Demo Card 5',
            description: 'Demo description for card 5 with sample content text.',
            image: '/trim.svg',
            backgroundColor: '#F1F3EE',
            layout: 'default'
          },
          {
            id: 'card-6',
            title: 'New Demo Card 6',
            description: 'Demo description for card 6 with sample content text.',
            image: '/music.svg',
            backgroundColor: '#F1F3EE',
            layout: 'default'
          },
          {
            id: 'card-7',
            title: 'New Demo Card 7',
            description: 'Demo description for card 7 with sample content text.',
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
            image: '',
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
          { id: 'benefit-1', iconName: 'Star', iconImage: undefined, title: 'Benefit 1', description: 'Description for benefit 1', order: 1 },
          { id: 'benefit-2', iconName: 'Star', iconImage: undefined, title: 'Benefit 2', description: 'Description for benefit 2', order: 2 },
          { id: 'benefit-3', iconName: 'Star', iconImage: undefined, title: 'Benefit 3', description: 'Description for benefit 3', order: 3 }
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
      };
    case 'second':
      return {
        dotText: 'Live Streaming',
        title: 'Broadcast Your Content',
        subtitle: 'Connect with Audience',
        description: 'Engage your audience with real-time streaming features.',
        features: [
          {
            title: 'HD Quality',
            description: 'Crystal clear video streaming',
            icon: 'Video'
          },
          {
            title: 'Real-time Chat',
            description: 'Interactive audience engagement',
            icon: 'MessageCircle'
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
    case 'third':
      return {
        dotText: 'PK Battle',
        title: 'Compete with Creators',
                description: 'Challenge other creators in real-time battles.',
        features: [
          {
            title: 'Live Competition',
            description: 'Real-time creator battles',
            icon: 'Sword'
          },
          {
            title: 'Audience Voting',
            description: 'Let your audience decide the winner',
            icon: 'Star'
          }
        ],
        backgroundImage: '/third.svg',
        backgroundColor: '#ffffff',
        layout: 'right',
        animation: 'fade',
        titleColor: '#111827',
                descriptionColor: '#4B5563',
        featureTitleColor: '#111827',
        featureDescriptionColor: '#4B5563'
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
  togglePreviewMode,
  doneSection,
  markSectionAsReady
} = builderSlice.actions;

export default builderSlice.reducer;
