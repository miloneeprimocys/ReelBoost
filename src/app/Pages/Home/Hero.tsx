"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";
import HeroImage from "../../../../public/hero.png";
import Button1 from "../../../../public/Button1.png";
import Button2 from "../../../../public/Button2.png";
import { Edit } from "lucide-react";

interface HeroProps {
    sectionId: string;
    onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'image', elementId: string) => void;
}

export default function Hero({ sectionId, onEdit }: HeroProps) {
    const [isAnimate, setIsAnimate] = useState(false);

    // Get static content from homeSlice as base
    const staticHeroContent = useAppSelector(state => state.home.heroContent);
    
    // Get this specific section's content from builder slice using sectionId
    const section = useAppSelector(state => 
        state.builder.sections.find(s => s.id === sectionId)
    );
    
    // Merge content: static base + this specific section's content
    const heroContent = {
        ...staticHeroContent,
        // Override with this specific section's content from Redux
        ...(section?.content || {})
    };
    
    // Debug: Log content updates
    React.useEffect(() => {
        console.log('Hero component - sectionId:', sectionId);
        console.log('Hero component - section:', section);
        console.log('Hero component - heroContent.title:', heroContent.title);
        console.log('Hero component - heroContent.description:', heroContent.description);
    }, [sectionId, section, heroContent.title, heroContent.description]);
    
    const tags = heroContent?.tags || ["Live Streaming", "PK Battle", "Multiple Payment Gateway", "Video Trimming", "Add Music", "Wallet", "Gits", "Earn Coins"];
    const [activeTag, setActiveTag] = useState(heroContent?.activeTag || "Live Streaming");

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section id={sectionId} className="relative w-full pt-12  px-4 md:px-8 bg-white overflow-hidden pb-10 md:pb-12 lg:pb-16 group max-w-full overflow-x-hidden">
            {/* Edit Icon - Top Right Corner - Only visible in builder mode */}
            {onEdit && (
                <button
                    onClick={() => onEdit(sectionId, 'text', 'hero-title')}
                    className="absolute top-10 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:scale-105  transition-all z-10 hover:bg-gray-50"
                    title="Edit Hero Section"
                >
                    <Edit size={16} className="text-gray-600" />
                </button>
            )}

            <div 
                onClick={() => onEdit && onEdit(sectionId, 'text', 'hero-title')}
                className={`mx-auto flex max-w-6xl md:max-w-6xl lg:max-w-6xl xl:max-w-6xl  flex-col lg:px-5 2xl:px-0 items-center justify-center gap-4 md:gap-6 lg:flex-row lg:gap-12 w-full py-6 md:py-8 lg:py-12 ${onEdit ? 'cursor-pointer' : ''} ${heroContent?.layout === 'center' ? 'lg:flex-col' :
                    heroContent?.layout === 'right' ? 'lg:flex-row-reverse' :
                        'lg:flex-row'
                } max-w-full overflow-hidden`}>

                {/* --- LEFT CONTENT SECTION --- */}
                <div
                    className={`max-w-xl lg:max-w-2xl xl:max-w-3xl flex-1 order-2 lg:order-none transition-all duration-1000 ease-out z-20 ${heroContent?.layout === 'center' ? 'text-center' : 'text-center lg:text-left'
                        } ${isAnimate ? "opacity-100" : "opacity-0"}`}
                >

                    {/* Dot text above title - Only renders if dotText exists and isn't empty */}
                    {heroContent?.dotText && heroContent.dotText.trim() !== "" && (
                        <div className="mb-4">
                            <span className="text-sm font-semibold underline underline-offset-8 decoration-2 uppercase tracking-wide" style={{ color: heroContent?.dotTextColor || '#2b49c5' }}>
                                {heroContent.dotText}
                            </span>
                        </div>
                    )}

                    <h1
                        className={`text-[28px] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tighter break-words hyphens-auto overflow-wrap-anywhere ${onEdit ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity max-w-full`}
                        style={{ color: heroContent?.titleColor || '#2D3134', wordWrap: 'break-word', wordBreak: 'break-word' }}
                        onClick={() => onEdit && onEdit(sectionId, 'text', 'hero-title')}
                    >
                        {heroContent?.title || 'Reelboost - Tiktok Clone App'}
                    </h1>

                    <p
                        className={`mt-4 md:mt-6 mx-auto lg:mx-0 max-w-xl lg:max-w-2xl text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] leading-relaxed break-words hyphens-auto overflow-wrap-anywhere ${onEdit ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
                        style={{ color: heroContent?.descriptionColor || '#6B7280', wordWrap: 'break-word', wordBreak: 'break-word' }}
                        onClick={() => onEdit && onEdit(sectionId, 'text', 'hero-description')}
                    >
                        {heroContent?.description || 'ReelBoost is a modern short-video and live-streaming app inspired by TikTok. It lets users create, edit, and share engaging short videos with a smooth discovery feed. Creators can go live, interact with audiences in real time, and build loyal communities. Designed for performance and scale, ReelBoost supports engagement, growth, and monetization.'}
                    </p>

                    <div className={`mt-6 md:mt-8 lg:mt-10 flex flex-wrap gap-2 sm:gap-3 md:gap-4 max-w-full ${heroContent?.layout === 'center' ? 'justify-center' : 'justify-center lg:justify-start'
                        }`}>
                        <button
                            onClick={() => setActiveTag("Short Video")}
                            className={`rounded-lg px-3 py-2 md:px-4 md:py-3 text-[12px] sm:text-[14px] md:text-[16px] font-medium transition-all cursor-pointer hover:scale-98 ${activeTag === "Short Video" ? "bg-[#FFB800] text-gray-800 shadow-sm" : "bg-[#F3F7FF] text-[#4A72FF]"
                                }`}
                        >
                            Short Video
                        </button>
                        {tags.map((tag: string) => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`rounded-lg px-3 py-2 md:px-4 md:py-3 text-[12px] sm:text-[14px] md:text-[16px] font-medium transition-all cursor-pointer hover:scale-98 ${activeTag === tag ? "bg-[#FFB800] text-gray-800 shadow-sm" : "bg-[#F3F7FF] text-[#4A72FF]"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className={`mt-8 md:mt-10 lg:mt-12 flex items-center gap-4 md:gap-5 lg:gap-6 ${heroContent?.layout === 'center' ? 'justify-center' : 'justify-center lg:justify-start'
                        }`}>
                        {heroContent?.appStoreImage && heroContent?.appStoreImage !== '' && (
                            <button
                                onClick={() => onEdit && onEdit(sectionId, 'image', 'hero-buttons')}
                                className={`transition-transform ${onEdit ? 'hover:scale-98 cursor-pointer' : ''}`}
                            >
                                <Image
                                    src={heroContent?.appStoreImage}
                                    alt="App Store"
                                    width={140}
                                    height={56}
                                    className="h-12 md:h-14 lg:h-16 w-auto"
                                />
                            </button>
                        )}
                        {heroContent?.googlePlayImage && heroContent?.googlePlayImage !== '' && (
                            <button 
                                onClick={() => onEdit && onEdit(sectionId, 'image', 'hero-buttons')}
                                className={`transition-transform ${onEdit ? 'hover:scale-98 cursor-pointer' : ''}`}
                            >
                                <Image
                                    src={heroContent?.googlePlayImage}
                                    alt="Google Play"
                                    width={140}
                                    height={56}
                                    className="h-12 md:h-14 lg:h-16 w-auto"
                                />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- RIGHT IMAGE SECTION */}

                <div className={`relative flex flex-1 order-1 lg:order-none justify-center items-center w-full pb-8 lg:pb-0 mt-10 lg:mt-0 ${heroContent?.layout === 'center' ? 'lg:justify-center' :
                        heroContent?.layout === 'right' ? 'lg:justify-start' :
                            'lg:justify-center'
                    }`}>

                    <div className="relative w-[200px] h-[400px] sm:w-[280px] sm:h-[560px] lg:w-[220px] lg:h-[450px] xl:w-[370px] xl:h-[700px]">

                        {/* BLUE ACCENT */}
                        <div
                            className={`absolute -left-5 -top-5 lg:-left-7 lg:-top-7 xl:-left-7 xl:-top-10 h-32 w-32 lg:h-36 lg:w-36 xl:h-56 xl:w-56 rounded-tl-[50px] lg:rounded-tl-[50px] xl:rounded-tl-[85px] border-l-[8px] lg:border-l-[15px] xl:border-l-[20px] border-t-[8px] lg:border-t-[15px] xl:border-t-[20px] transition-all duration-700 ease-out z-0 ${isAnimate ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
                                }`}
                            style={{ 
                                borderColor: heroContent?.topAccentColor || '#2B59FF',
                                transitionDelay: "600ms"
                            }}
                        />
                        {/* MAIN PHONE IMAGE */}
                        <div
                            className={`relative z-10 w-full h-full transition-all duration-1000 ease-out ${isAnimate ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                                }`}
                        >
                            <Image
                                src={heroContent?.backgroundImage || HeroImage}
                                alt="App Interface"
                                width={370}
                                height={700}
                                className="w-full h-full object-contain sm:drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                            />
                        </div>
                        {/* YELLOW ACCENT */}
                        <div
                            className={`absolute -right-5 -bottom-5 lg:-right-7 lg:-bottom-7 xl:-right-7 xl:-bottom-10 h-32 w-32 lg:h-36 lg:w-36 xl:h-56 xl:w-56 rounded-br-[50px] lg:rounded-br-[50px] xl:rounded-br-[85px] border-r-[8px] lg:border-r-[15px] xl:border-r-[20px]  border-b-[8px] lg:border-b-[15px] xl:border-b-[20px] transition-all duration-700 ease-out z-20 ${isAnimate ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
                                }`}
                            style={{ 
                                borderColor: heroContent?.bottomAccentColor || '#FFB800',
                                transitionDelay: "900ms"
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

