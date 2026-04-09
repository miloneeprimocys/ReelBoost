import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Phone, 
  UserCircle, 
  MessageSquare, 
  Reply,
  Users, 
  Star, 
  Forward, 
  Copy,
  Trash2,
  UserPlus,
  Eraser,
  Search,
  Contact2,
  UserCog,
  Ban,
  AlertTriangle,
  Archive,
  Moon,
  Volume2,
  Image,
  Video,
  LucideIcon
} from "lucide-react";

// Map of icon names to Lucide components
export const iconMap: Record<string, LucideIcon> = {
  Phone,
  UserCircle,
  MessageSquare,
  Reply,
  Users,
  Star,
  Forward,
  Copy,
  Trash2,
  UserPlus,
  Eraser,
  Search,
  Contact2,
  UserCog,
  Ban,
  AlertTriangle,
  Archive,
  Moon,
  Volume2,
  Image,
  Video,
};

// Benefit item interface
export interface Benefit {
  id: string;
  iconName: string;
  iconImage?: string; // For custom uploaded images
  title: string;
  description: string;
  order: number;
}

// Benefits section content
export interface BenefitsContent {
  dotText: string;
  title: string;
  benefits: Benefit[];
  // Colors
  dotColor: string;
  dotTextColor: string;
  titleColor: string;
  benefitIconColor: string;
  benefitTitleColor: string;
  benefitDescriptionColor: string;
  borderColor: string;
  backgroundColor: string;
}

interface BenefitsState {
  benefitsContent: BenefitsContent;
  activeSection: string | null;
}

// Default benefits matching SixthSection
const defaultBenefits: Benefit[] = [
  { id: 'benefit-1', iconName: 'Phone', title: 'Phone Authentication', description: 'Allows multiple users to chat at the same time. It also supports assigning multiple admins to manage conversations efficiently.', order: 1 },
  { id: 'benefit-2', iconName: 'UserCircle', title: 'Avatar', description: 'Avatar selection lets you choose from predefined avatars instead of uploading an image. Pick an avatar that best represents you instantly.', order: 2 },
  { id: 'benefit-3', iconName: 'MessageSquare', title: 'Single Chat', description: 'Single Chat allows a user to chat with only one person at a time. It ensures focused, one-to-one conversations without interruptions.', order: 3 },
  { id: 'benefit-4', iconName: 'Reply', title: 'Reply', description: 'Reply lets you respond to a specific message by tapping the reply icon. It keeps conversations clear and well-contextualized.', order: 4 },
  { id: 'benefit-5', iconName: 'Users', title: 'Group Chat', description: 'Group Chat allows multiple users to chat together in real time. It also supports assigning multiple admins to manage the group efficiently.', order: 5 },
  { id: 'benefit-6', iconName: 'Star', title: 'Starred Messages', description: 'Tap the star icon to mark important messages. Starred messages are saved for quick and easy access later.', order: 6 },
  { id: 'benefit-7', iconName: 'Forward', title: 'Forward', description: 'Tap the forward icon to share a message. You can forward it to an individual user or a group instantly.', order: 7 },
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
  { id: 'benefit-23', iconName: 'Video', title: 'Video Call', description: 'Video calls support real-time face-to-face conversations. They can be one-on-one or group calls with three or more participants.', order: 23 },
];

const initialState: BenefitsState = {
  benefitsContent: {
    dotText: 'Main Benefits',
    title: 'Many Benefits You Get Using Product',
    benefits: defaultBenefits,
    // Default colors matching SixthSection
    dotColor: '#4A6CF7',
    dotTextColor: '#000000',
    titleColor: '#111827',
    benefitIconColor: '#2563EB',
    benefitTitleColor: '#111827',
    benefitDescriptionColor: '#6B7280',
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  activeSection: null,
};

const benefitsSlice = createSlice({
  name: 'benefits',
  initialState,
  reducers: {
    setActiveBenefitsSection: (state, action: PayloadAction<string | null>) => {
      state.activeSection = action.payload;
    },
    updateBenefitsContent: (state, action: PayloadAction<Partial<BenefitsContent>>) => {
      state.benefitsContent = { ...state.benefitsContent, ...action.payload };
    },
    addBenefit: (state, action: PayloadAction<Benefit>) => {
      state.benefitsContent.benefits.push(action.payload);
    },
    updateBenefit: (state, action: PayloadAction<{ id: string; updates: Partial<Benefit> }>) => {
      const { id, updates } = action.payload;
      const benefitIndex = state.benefitsContent.benefits.findIndex(b => b.id === id);
      if (benefitIndex !== -1) {
        state.benefitsContent.benefits[benefitIndex] = {
          ...state.benefitsContent.benefits[benefitIndex],
          ...updates
        };
      }
    },
    deleteBenefit: (state, action: PayloadAction<string>) => {
      state.benefitsContent.benefits = state.benefitsContent.benefits.filter(b => b.id !== action.payload);
    },
    reorderBenefits: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedBenefit] = state.benefitsContent.benefits.splice(fromIndex, 1);
      state.benefitsContent.benefits.splice(toIndex, 0, movedBenefit);
    },
  }
});

export const {
  setActiveBenefitsSection,
  updateBenefitsContent,
  addBenefit,
  updateBenefit,
  deleteBenefit,
  reorderBenefits,
} = benefitsSlice.actions;

export default benefitsSlice.reducer;
