"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";
import Image1 from "../../../../public/laptop.svg";
import HeroImage from "../../../../public/hero.png";
import liveB from "../../../../public/liveB.svg";
import Battle from "../../../../public/Battle.svg";
import notification from "../../../../public/notification.svg";
import video from "../../../../public/video.svg";
import user from "../../../../public/user.svg";
import message from "../../../../public/message.svg";
import giftlist from "../../../../public/giftlist.svg";
import wallet from "../../../../public/wallet.svg";
import music from "../../../../public/music.svg";
import trim from "../../../../public/trim.svg";
import shortVideos from "../../../../public/video.svg";
import notificationIcon from "../../../../public/notification.svg";
import realtimeChat from "../../../../public/message.svg";
import exploreUsers from "../../../../public/user.svg";
import liveStreaming from "../../../../public/liveB.svg";
import pkBattle from "../../../../public/Battle.svg";
import { Edit } from "lucide-react";

interface FourthSectionProps {
    sectionId?: string;
    onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'image', elementId: string) => void;
}

const FourthSection: React.FC<FourthSectionProps> = ({ sectionId, onEdit }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [counts, setCounts] = useState({ users: 0, progress: 0 });
    const sectionRef = useRef<HTMLDivElement>(null);
    const userCounterRef = useRef(null);
    const [userVisible, setUserVisible] = useState(false);
    const progressRef = useRef(null);
    const [progressVisible, setProgressVisible] = useState(false);
    
    // Check if we're in preview mode
    const isPreviewMode = useAppSelector(state => state.builder.isPreviewMode);

    // Get this specific section's content from Redux store using the passed sectionId
    const section = useAppSelector(state => 
      state.builder.sections.find(s => s.id === sectionId)
    );

    // Get features content from Redux store as fallback
    const { featuresContent } = useAppSelector(state => state.features);

    // Use section content if available, otherwise use features content
    const content = section?.content || featuresContent;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setProgressVisible(true);
                    observer.disconnect(); // run once
                }
            },
            { threshold: 0.3 }
        );

        if (progressRef.current) {
            observer.observe(progressRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setUserVisible(true);
                    observer.disconnect(); // trigger only once
                }
            },
            { threshold: 0.3 } // "bit visible"
        );

        if (userCounterRef.current) {
            observer.observe(userCounterRef.current);
        }

        return () => observer.disconnect();
    }, []);

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

    useEffect(() => {
        if (isVisible) {
            const duration = 4000;
            const frameRate = 1000 / 60;
            const totalFrames = Math.round(duration / frameRate);

            let frame = 0;
            const timer = setInterval(() => {
                frame++;
                const progress = frame / totalFrames;

                setCounts({
                    users: Math.min(Math.floor(progress * 34), 34),
                    progress: Math.min(Math.floor(progress * 40), 40),
                });

                if (frame === totalFrames) clearInterval(timer);
            }, frameRate);

            return () => clearInterval(timer);
        }
    }, [isVisible]);

    // Use dynamic features from content
    const mainFeatures = content?.features || [
        { title: "Short Videos", icon: shortVideos },
        { title: "Notification", icon: notificationIcon },
        { title: "Real-time chat", icon: realtimeChat },
        { title: "Explore Users & Hashtags", icon: exploreUsers },
        { title: "Live Streaming", icon: liveStreaming },
        { title: "PK Battle", icon: pkBattle },
    ];

    return (
        <section
            id={sectionId || "features"}
            ref={sectionRef}
            className="text-white py-16 md:py-24 px-4 md:px-8 lg:px-12 xl:px-24 overflow-hidden relative cursor-pointer"
            style={{ backgroundColor: content?.backgroundColor || '#000000' }}
            onClick={() => onEdit && onEdit(sectionId || "features", 'text', 'features-header')}
        >
            {/* Edit Icon - Top Right Corner - Only visible in builder mode */}
            {onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(sectionId || "features", 'text', 'features-header');
                    }}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all z-10 hover:bg-gray-50"
                    title="Edit Features Section"
                >
                    <Edit size={16} className="text-gray-600" />
                </button>
            )}

            <div className="max-w-7xl mx-auto">
                {/* 1. Header Section */}
                <div
                    className={`text-center mb-10 sm:mb-16 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    {content?.dotText && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[14px] font-medium tracking-widest uppercase mb-2" style={{ color: content?.dotTextColor || '#FFFFFF' }}>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: content?.dotColor || '#a8aff5' }} />
                            {content.dotText}
                        </div>
                    )}
                    <h2 
                        className="text-[28px] md:text-5xl lg:text-5xl font-semibold tracking-normal leading-[1.1] mb-4 sm:mb-6"
                        style={{ color: content?.titleColor || '#ffffff' }}
                    >
                        {content?.title || 'Achieving More Through Digital Excellence'}
                    </h2>
                </div>

                {/* 2. Secondary Features (Carousel for all screens) */}
                <div
                    className={`mb-20 transition-all px-2 duration-1000 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    {/* Outer Container: Hidden overflow for smooth animation */}
                    <div className="w-full overflow-hidden">
                        {/* Outer Wrapper - Handles centering and visibility */}
                        <div className="flex xl:justify-center">
                            
                            {/* Inner Track - Animated carousel for all screens */}
                            <div 
                                className="flex flex-row animate-scroll gap-3 md:gap-3 lg:gap-2"
                                style={{ 
                                    animationDuration: '40s', 
                                    animationIterationCount: 'infinite',
                                    animationTimingFunction: 'linear',
                                    minWidth: 'fit-content'
                                }}
                            >
                                {[
  ...mainFeatures,
  ...mainFeatures,
  ...mainFeatures,
  ...mainFeatures
].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="shrink-0 w-40 md:w-44 lg:w-48 flex flex-col items-center group cursor-pointer"
                                    >
                                        <div className="w-full h-36 md:h-40 lg:h-44 bg-[#ad8fe5] rounded-[24px] flex items-center justify-center mb-4 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-40">
                                                {item.backgroundImage && (
                                                    <Image
                                                        src={item.backgroundImage}
                                                        alt="bg"
                                                        fill
                                                        className="object-cover grayscale group-hover:scale-105 transition-all duration-300"
                                                    />
                                                )}
                                            </div>
                                            <span className="relative z-10">
                                                {item.icon && (
                                                    <Image 
                                                        src={item.icon} 
                                                        alt={item.title} 
                                                        width={80} 
                                                        height={80}
                                                        className="text-white"
                                                    />
                                                )}
                                            </span>
                                        </div>
                                        <span 
                                            className="text-[16px] md:text-[18px] font-medium text-center leading-tight break-words max-w-[160px] px-2"
                                            style={{ color: content?.textColor || '#ffffff' }}
                                        >
                                            {item.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Top Bento Grid - Fixed spacing for all screen sizes */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-6">
                    
                    {/* Wallet Card - Side by side on md, 3-cols on lg */}
                    {(content?.cards?.[0] || true) && (
                        <div 
                            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')} 
                            className="transition-all duration-300 hover:-translate-y-2 md:col-span-6 lg:col-span-3 text-black rounded-[32px] p-6 2xl:p-8 flex flex-col justify-between overflow-hidden"
                            style={{ backgroundColor: content?.cards?.[0]?.backgroundColor || '#F1F3EE' }}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex-1 flex items-center justify-center min-h-[200px] mb-4">
                                    {(content?.cards[0]?.image) && (
                                        <div 
                                            className="w-full h-full bg-contain bg-no-repeat bg-center"
                                            style={{ 
                                                backgroundImage: `url(${content?.cards[0].image})`,
                                                backgroundSize: 'contain',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-[26px] xl:text-[28px] font-medium tracking-tight" style={{ color: content?.cardTitleColor || '#111827' }}>
                                        {content?.cards[0]?.title || 'Wallet'}
                                    </h3>
                                    <p className="text-[13px] md:text-[14px] mt-2" style={{ color: content?.cardDescriptionColor || '#4B5563' }}>
                                        {content?.cards[0]?.description || 'The wallet allows users to securely manage their balance.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Live Streaming Card - Side by side on md, 3-cols on lg */}
                    {(content?.cards?.[1] || true) && (
                        <div 
                            className="md:col-span-6 lg:col-span-3 text-black rounded-[32px] p-6 2xl:p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 overflow-hidden md:order-2 lg:order-3" 
                            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}
                            style={{ backgroundColor: content?.cards[1]?.backgroundColor || '#F1F3EE' }}
                        >
                            <div className="flex flex-col h-full">
                                <div className="text-center mb-4">
                                    <h3 
                                        className="text-[26px] xl:text-[28px] font-medium tracking-tight"
                                        style={{ color: content?.cardTitleColor || '#111827' }}
                                    >
                                        {content?.cards[1]?.title || 'Live Streaming'}
                                    </h3>
                                    <p 
                                        className="text-[13px] md:text-[14px] mt-2"
                                        style={{ color: content?.cardDescriptionColor || '#4B5563' }}
                                    >
                                        {content?.cards[1]?.description || 'Live streaming supports up to four participants.'}
                                    </p>
                                </div>
                                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                                    {content?.cards[1]?.image && (
                                        <Image 
                                            src={content?.cards[1].image} 
                                            alt="Image" 
                                            width={400} 
                                            height={400} 
                                            className="object-contain w-full h-auto max-h-[250px]" 
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Middle Column Group - Full width on md, center on lg */}
                    <div className="md:col-span-12 lg:col-span-6 flex flex-col gap-4 md:gap-6 md:order-3 lg:order-2">
                        {/* Payment History Card */}
                        <div 
                            className="text-black rounded-[32px] transition-all duration-300 hover:-translate-y-2 p-6 2xl:p-8 flex flex-row justify-between items-center relative overflow-hidden min-h-[180px] md:min-h-[220px]" 
                            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}
                            style={{ backgroundColor: content?.cards[2]?.backgroundColor || '#F1F3EE' }}
                        >
                            <div className="relative z-10 flex-1">
                                <h3 
                                    className="text-[22px] md:text-[28px] font-medium tracking-tight mb-2"
                                    style={{ color: content?.cardTitleColor || '#111827' }}
                                >
                                    {content?.cards[2]?.title || 'Payment History'}
                                </h3>
                                <p 
                                    className="text-[13px] md:text-[14px]"
                                    style={{ color: content?.cardDescriptionColor || '#4B5563' }}
                                >
                                    {content?.cards[2]?.description || 'View your complete payment history.'}
                                </p>
                            </div>
                            {/* Payment History Card Image - Right Side */}
                            {content?.cards[2]?.image && (
                                <div className="w-20 h-20 md:w-24 md:h-24 xl:w-40 xl:h-40 flex-shrink-0 -mr-6 md:-mr-8 ml-4 relative">
                                    <Image 
                                        src={content?.cards[2].image} 
                                        alt="Payment History" 
                                        width={160} 
                                        height={160} 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Reelboost Card - Responsive aspect ratio for consistent height */}
                        <div
                            className="rounded-[32px] overflow-hidden relative group transition-all duration-300 hover:-translate-y-2"
                            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}
                            style={{ backgroundColor: content?.cards[3]?.backgroundColor || '#F1F3EE' }}
                        >
                            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] min-h-[200px]">
                                {content?.cards[3]?.image && (
                                    <Image
                                        src={content?.cards[3].image}
                                        alt="Team working"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                                    <div className="relative px-4">
                                        <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-center">
                                            {content?.cards[3]?.title || 'Reelboost'}
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

             {/* 4. Bottom Grid - 3 cards stacked on md, side by side on lg */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
    
    {/* Video Trimming Card */}
    <div 
        className="text-black rounded-[32px] p-6 2xl:p-8 flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-3 shadow-lg group overflow-hidden"
        style={{ backgroundColor: content?.cards[4]?.backgroundColor || '#F1F3EE' }}
    >
        <div className="w-full mb-4 overflow-hidden">
            {content?.cards[4]?.image && (
                <Image 
                    src={content?.cards[4].image} 
                    alt="Video Trimming" 
                    width={250}
                    height={180}
                    className="w-full h-auto object-contain" 
                />
            )}
        </div>
        <div className="text-center w-full">
            <h3 
                className="text-[22px] md:text-[26px] font-medium tracking-tight"
                style={{ color: content?.cardTitleColor || '#111827' }}
            >
                {content?.cards[4]?.title || 'Video Trimming'}
            </h3>
            <p 
                className="text-[13px] md:text-[14px] mt-2 leading-relaxed"
                style={{ color: content?.cardDescriptionColor || '#4B5563' }}
            >
                {content?.cards[4]?.description || 'Videos can be trimmed from beginning or end.'}
            </p>
        </div>
    </div>

    {/* Add Music Card */}
    <div 
        className="text-black rounded-[32px] p-6 2xl:p-8 flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-3 shadow-lg group overflow-hidden"
        style={{ backgroundColor: content?.cards[5]?.backgroundColor || '#F1F3EE' }}
    >
        <div className="w-full mb-4 overflow-hidden">
            {content?.cards[5]?.image && (
                <Image 
                    src={content?.cards[5].image} 
                    alt="Add Music for Reels" 
                    width={250}
                    height={180}
                    className="w-full h-auto object-contain" 
                />
            )}
        </div>
        <div className="text-center w-full">
            <h3 
                className="text-[22px] md:text-[26px] font-medium tracking-tight"
                style={{ color: content?.cardTitleColor || '#111827' }}
            >
                {content?.cards[5]?.title || 'Add Music for Reels'}
            </h3>
            <p 
                className="text-[13px] md:text-[14px] mt-2 leading-relaxed"
                style={{ color: content?.cardDescriptionColor || '#4B5563' }}
            >
                {content?.cards[5]?.description || 'Add Music to Reels allows users to enhance their short videos.'}
            </p>
        </div>
    </div>

    {/* Gift Lists Card */}
    <div 
        className="text-black rounded-[32px] p-6 2xl:p-8 flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-3 shadow-lg group overflow-hidden"
        style={{ backgroundColor: content?.cards[6]?.backgroundColor || '#F1F3EE' }}
    >
        <div className="w-full mb-4 overflow-hidden">
            {content?.cards[6]?.image && (
                <Image 
                    src={content?.cards[6].image} 
                    alt="Gift Lists" 
                    width={250}
                    height={180}
                    className="w-full h-auto object-contain" 
                />
            )}
        </div>
        <div className="text-center w-full">
            <h3 
                className="text-[22px] md:text-[26px] font-medium tracking-tight"
                style={{ color: content?.cardTitleColor || '#111827' }}
            >
                {content?.cards[6]?.title || 'Gift Lists'}
            </h3>
            <p 
                className="text-[13px] md:text-[14px] mt-2 leading-relaxed"
                style={{ color: content?.cardDescriptionColor || '#4B5563' }}
            >
                {content?.cards[6]?.description || 'The gift list includes multiple categories of gift icons.'}
            </p>
        </div>
    </div>

</div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-25%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
                
                /* Stop animation only on 2XL screens and above */
                @media (min-width: 1536px) {
                    .animate-scroll {
                        animation: none;
                    }
                }
                
                /* Ensure carousel works on all screens smaller than 2XL */
                @media (max-width: 1535px) {
                    .animate-scroll {
                        animation: scroll 40s linear infinite;
                    }
                }
            `}</style>
        </section>
    );
};

export default FourthSection;