"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Calendar, 
  Layers, 
  MousePointer2, 
  Layout, 
  ShieldCheck, 
  Grid2X2, 
  Cpu, 
  Zap, 
  Rocket,
  // New icons added below
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
  Video
} from "lucide-react";

interface BenefitCard {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const benefits: BenefitCard[] = [
  { id: 1, icon: Phone, title: "Phone Authentication", description: "Allows multiple users to chat at the same time. It also supports assigning multiple admins to manage conversations efficiently." },
  { id: 2, icon: UserCircle, title: "Avatar", description: "Avatar selection lets you choose from predefined avatars instead of uploading an image. Pick an avatar that best represents you instantly." },
  { id: 3, icon: MessageSquare, title: "Single Chat", description: "Single Chat allows a user to chat with only one person at a time. It ensures focused, one-to-one conversations without interruptions." },
  { id: 4, icon: Reply, title: "Reply", description: "Reply lets you respond to a specific message by tapping the reply icon. It keeps conversations clear and well-contextualized." },
  { id: 5, icon: Users, title: "Group Chat", description: "Group Chat allows multiple users to chat together in real time. It also supports assigning multiple admins to manage the group efficiently." },
  { id: 6, icon: Star, title: "Starred Messages", description: "Tap the star icon to mark important messages. Starred messages are saved for quick and easy access later." },
  { id: 7, icon: Forward, title: "Forward", description: "Tap the forward icon to share a message. You can forward it to an individual user or a group instantly." },
  { id: 8, icon: Copy, title: "Copy", description: "Copy any text with a single tap. Paste it easily into any chat or group conversation." },
  { id: 9, icon: Trash2, title: "Delete", description: "You can delete one or multiple messages at once. Messages can be deleted either just for you or for everyone in the chat." },
  { id: 10, icon: UserPlus, title: "Add Participants", description: "Add multiple participants while creating a new group chat. Select the users you want to include and start the conversation instantly."},
  { id: 11, icon: Eraser, title: "Clear Chat", description: "Clear all messages from an individual or group chat. This removes the chat history while keeping the conversation intact."},
  { id: 12, icon: Search, title: "Search Chat", description: "Use the search feature to quickly find specific messages in a chat. It makes accessing conversations easier, even with a large number of messages."},
  { id: 13, icon: Contact2, title: "Contact List", description: "The contact list includes all WhoXa chat users or synced phone contacts. These options can be configured and managed through the admin panel."},
  { id: 14, icon: UserCog, title: "Edit Profile", description: "The Edit Profile section displays all user information. Users can update and modify their details anytime." },
  { id: 15, icon: Ban, title: "Block Contacts", description: "Blocked Contacts shows all users you have blocked. You can view and manage the blocked contacts list easily." },
  { id: 16, icon: AlertTriangle, title: "Report user", description: "Reported users are listed with the specified reason. These reports are visible and managed through the admin panel." },
  { id: 17, icon: Archive, title: "Archived Chat", description: "Archived chats let users hide conversations from the main chat list. These chats are stored safely and can be accessed anytime later." },
  { id: 18, icon: Moon, title: "Dark/Light Mode", description: "Users can switch between light and dark modes anytime. This allows a comfortable viewing experience based on their preference." },
  { id: 19, icon: Search, title: "Search User", description: "Search User allows admins to quickly find reported users. All reported users and their reasons are visible in the admin panel." },
  { id: 20, icon: Volume2, title: "Ringtone Notification", description: "Ringtone Notifications let users customize alert sounds for chats. This helps them easily identify and respond to incoming messages." },
  { id: 21, icon: Image, title: "Status", description: "Status can be shared as text, images, or videos. It automatically disappears after 24 hours." },
  { id: 22, icon: Phone, title: "Audio Call", description: "Audio calling supports both one-on-one and group conversations. It enables clear voice communication with multiple participants in real time." },
  { id: 23, icon: Video, title: "Video Call", description: "Video calls support real-time face-to-face conversations. They can be one-on-one or group calls with three or more participants." },
];

const SixthSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const horizontalDashedStyle = {
    backgroundImage: `linear-gradient(to right, #d1d5db 60%, rgba(255,255,255,0) 0%)`,
    backgroundPosition: 'bottom',
    backgroundSize: '15px 1px',
    backgroundRepeat: 'repeat-x',
    marginLeft: '3rem',
    marginRight: '3rem',
  };

  const verticalDashedStyle = {
    backgroundImage: `linear-gradient(to bottom, #d1d5db 60%, rgba(255,255,255,0) 0%)`,
    backgroundPosition: 'right',
    backgroundSize: '1px 15px',
    backgroundRepeat: 'repeat-y',
  };

  // Calculate number of rows for desktop (3 columns)
  const totalRows = Math.ceil(benefits.length / 3);

  return (
    <section ref={sectionRef} id="benefits" className="w-full bg-white py-4 md:py-14 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className={`text-center mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-black text-[14px] font-medium tracking-widest uppercase mb-2 sm:mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A6CF7]" />
            Main Benefits
          </div>
          <h2 className="text-[28px] md:text-5xl lg:text-5xl font-semibold tracking-normal leading-[1.1] mb-4 sm:mb-6 text-[#111827]">
            Many Benefits You Get <br className="hidden md:block" /> Using Product
          </h2>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 relative gap-x-0 gap-y-0">
          
          {/* Continuous Horizontal Dashed Lines (Desktop Only) */}
          {Array.from({ length: totalRows - 1 }).map((_, i) => (
            <div 
              key={`line-${i}`}
              className="hidden md:block absolute left-0 right-0 h-px z-0" 
              style={{ 
                ...horizontalDashedStyle, 
                top: `${((i + 1) / totalRows) * 100}%` 
              }}
            />
          ))}

          {benefits.map((benefit, index) => {
            const isLastInRow = (index + 1) % 3 === 0;
            const rowIndex = Math.floor(index / 3);
            const rowDelay = rowIndex * 250; 
            const isActive = activeCard === benefit.id;
            const IconComponent = benefit.icon;

            return (
              <div 
                key={benefit.id} 
                onClick={() => setActiveCard(benefit.id)}
                className={`relative group p-2  pb-7 md:p-6 lg:p-10 transition-all duration-1000 ease-out z-10`}
                style={{ 
                    transitionDelay: isVisible ? `${rowDelay}ms` : "0ms",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(50px)'
                }}
              >
                {/* Vertical Dashed Divider */}
                {!isLastInRow && (
                  <div className="hidden md:block absolute right-0 top-12 bottom-12 w-px" style={verticalDashedStyle} />
                )}

                {/* Content */}
                <div className="flex flex-col items-start">
                  <div className={`mb-2.5 py-3 transition-colors duration-300 group-hover:text-black ${
                    isActive ? "text-black" : "text-blue-600"
                  }`}>
                    <IconComponent size={28} />
                  </div>
                  
                  <h3 className="text-xl md:text-[22px] lg:text-2xl font-bold text-[#111827] group-hover:text-blue-600 mb-3 sm:mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-500 text-[15px] lg:text-[17px] tracking-wide leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Mobile-only Divider */}
                {index !== benefits.length - 1 && (
                  <div className="block md:hidden absolute bottom-0 left-2 right-2 h-px" style={horizontalDashedStyle} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SixthSection;