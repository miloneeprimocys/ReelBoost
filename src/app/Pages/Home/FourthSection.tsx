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

interface FourthSectionProps {
    sectionId?: string;
}

const FourthSection: React.FC<FourthSectionProps> = ({ sectionId }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [counts, setCounts] = useState({ users: 0, progress: 0 });
    const sectionRef = useRef(null);
    const userCounterRef = useRef(null);
    const [userVisible, setUserVisible] = useState(false);
    const progressRef = useRef(null);
    const [progressVisible, setProgressVisible] = useState(false);

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
            id="features"
            ref={sectionRef}
            className="text-white py-16 md:py-24 px-4 md:px-12 lg:px-24 overflow-hidden"
            style={{ backgroundColor: content?.backgroundColor || '#000000' }}
        >
            <div className="max-w-7xl mx-auto">
                {/* 1. Header Section */}
                <div
                    className={`text-center mb-10 sm:mb-16 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    {content?.dotText && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-white text-[14px] font-medium tracking-widest uppercase mb-2 sm:mb-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#a8aff5]" />
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

                {/* 2. Secondary Features (Mobile Carousel / Desktop Grid) */}
                <div
                    className={`mb-20 transition-all duration-1000 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    {/* Mobile Container: Flex with Animation | Desktop: Standard Grid */}
                    <div className="flex lg:grid lg:grid-cols-6 gap-3 md:gap-4 overflow-hidden">
                        <div className="flex lg:contents animate-scroll lg:animate-none space-x-3 lg:space-x-0">
                            {/* Duplicate items for a seamless infinite scroll effect on mobile */}
                            {[...mainFeatures, ...mainFeatures, ...mainFeatures, ...mainFeatures].map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`shrink-0 w-40 md:w-auto flex flex-col items-center group cursor-pointer 
                        ${idx >= mainFeatures.length && idx < mainFeatures.length * 2 ? 'lg:hidden' : ''}
                        ${idx >= mainFeatures.length * 2 ? 'hidden lg:hidden' : ''}`}
                                >
                                    <div className="w-40 h-40 lg:w-full lg:h-auto aspect-square bg-[#ad8fe5] rounded-[24px] flex items-center justify-center mb-4 relative overflow-hidden">
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
                                                    width={90} 
                                                    height={90}
                                                    className="text-white"
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <span 
                                        className="text-[16px] md:text-[18px] font-medium text-center leading-tight"
                                        style={{ color: content?.textColor || '#ffffff' }}
                                    >
                                        {item.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Top Bento Grid (MD View: Integrations/Reports Side-by-Side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-6">
                    {/* Use dynamic cards from content */}
                    {content?.cards?.[0] && (
                        <div 
                            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')} 
                            className="transition-all duration-300 hover:-translate-y-2 md:col-span-1 lg:col-span-3 text-black rounded-[32px] p-8 flex flex-col justify-between min-h-[580px]"
                            style={{ backgroundColor: content.cards[0].backgroundColor || '#F1F3EE' }}
                        >
                            <div className="mt-auto h-[350px] relative overflow-hidden flex justify-center items-start mb-4">
                                {content.cards[0].image && (
                                    <Image src={content.cards[0].image} alt="Image" className="object-cover w-full" />
                                )}
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-[32px] font-medium tracking-tight text-gray-900">
                                    {content.cards[0].title}
                                </h3>
                                <p className="text-gray-500 text-[16px] mt-1">
                                    {content.cards[0].description}
                                </p>
                            </div>
                        </div>
                    )}

                    {content?.cards?.[1] && (
                        <div 
                            className="md:col-span-1 lg:col-span-3 lg:order-last text-black rounded-[32px] p-8 flex flex-col transition-all duration-300 hover:-translate-y-2" 
                            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}
                            style={{ backgroundColor: content.cards[1].backgroundColor || '#F1F3EE' }}
                        >
                            <h3 className="text-[32px] font-medium text-center tracking-tight text-gray-900">
                                {content.cards[1].title}
                            </h3>
                            <p className="text-gray-500 text-[16px] mt-1 text-center mb-3 sm:mb-0">
                                {content.cards[1].description}
                            </p>
                            <div className="mt-auto h-[400px] bg-white rounded-t-2xl shadow-inner relative overflow-hidden">
                                {content.cards[1].image && <Image src={content.cards[1].image} alt="Image" />}
                            </div>
                        </div>
                    )}

                    <div className="md:col-span-2 lg:col-span-6 flex flex-col gap-6">
                        <div className="bg-[#F1F3EE] text-black rounded-[32px] transition-all duration-300 hover:-translate-y-2 p-8 flex justify-between items-center relative overflow-hidden h-[250px] lg:h-[300px] xl:h-[250px]" onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}>
                            <div className="relative z-10">
                               
                                <h3 className="text-[32px] font-medium tracking-tight text-gray-900">
                                    Payment History
                                </h3>
                                <p className="text-gray-500 text-[16px] mt-1">
                                    View your complete payment history, including funds added for sending gifts and withdrawals made from coins received.
                                </p>
                            </div>

                            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
                                <div className="w-full h-full border-l-[20px] border-indigo-500 rotate-12 transform translate-x-10" />
                            </div>
                        </div>

                        <div className="bg-[#F1F3EE] rounded-[32px] overflow-hidden relative h-[365px] lg:h-[450px] xl:h-[365px] group transition-all duration-300 hover:-translate-y-2" onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}>
                            <Image
                                src={Image1}
                                alt="Team working"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                                <div className="relative">
                                    <h1 className="text-white text-9xl md:text-[135px] font-medium tracking-tighter flex items-center">
                                        Reelboost
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

             {/* 4. Bottom Grid (Single col on MD, 3 col on LG) */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    {/* Video Trimming Card */}
    <div className="bg-[#F1F3EE] text-black rounded-[40px] p-6 flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-3 shadow-lg group">
        <div className="w-full mb-2 overflow-hidden rounded-[24px]">
            <Image 
                src={trim} 
                alt="Video Trimming" 
                className="w-full my-8 object-contain" 
            />
        </div>
        <div className="text-center px-2 pb-4">
            <h3 className="text-[32px] font-bold tracking-tight text-gray-900">Video Trimming</h3>
            <p className="text-gray-500 text-[17px] mt-2 leading-relaxed">
                Videos can be trimmed from the beginning or end, with a maximum length limit of 30 seconds.
            </p>
        </div>
    </div>

    {/* Add Music Card */}
    <div className="bg-[#F1F3EE] text-black rounded-[40px] p-6 flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-3 shadow-lg group">
        <div className="w-full mb-2 overflow-hidden rounded-[24px]">
            <Image 
                src={music} 
                alt="Add Music for Reels" 
                className="w-full my-8 object-contain" 
            />
        </div>
        <div className="text-center px-2 pb-4">
            <h3 className="text-[32px] font-bold tracking-tight text-gray-900">Add Music for Reels</h3>
            <p className="text-gray-500 text-[17px] mt-2 leading-relaxed">
                Add Music to Reels allows users to enhance their short videos by selecting background music from an audio library.
            </p>
        </div>
    </div>

    {/* Gift Lists Card */}
    <div className="bg-[#F1F3EE] text-black rounded-[40px] p-6 flex flex-col items-center transition-all duration-500 hover:-translate-y-3 shadow-lg group">
        <div className="w-full mb-2 overflow-hidden rounded-[24px]">
            <Image 
                src={giftlist} 
                alt="Gift Lists" 
                className="w-full my-8 object-contain" 
            />
        </div>
        <div className="text-center px-2 pb-4">
            <h3 className="text-[32px] font-bold tracking-tight text-gray-900">Gift Lists</h3>
            <p className="text-gray-500 text-[17px] mt-2 leading-relaxed">
                The gift list includes multiple categories of gift icons that users can send and receive to earn coins.
            </p>
        </div>
    </div>
    
</div>
            </div>

            <style jsx>{`
    @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(calc(-100% * (${mainFeatures.length} / ${mainFeatures.length * 4}))); }
    }
    .animate-scroll {
        animation: scroll 40s linear infinite;
    }
    @media (min-width: 768px) and (max-width: 1023px) {
        @keyframes scroll-md {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100% * (${mainFeatures.length} / ${mainFeatures.length * 4}))); }
        }
        .animate-scroll {
            animation: scroll-md 50s linear infinite;
        }
    }
    @media (min-width: 1024px) {
        .animate-scroll {
            animation: none;
        }
    }
`}</style>
        </section>
    );
};

export default FourthSection;