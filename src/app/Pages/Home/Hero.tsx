"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";
import HeroImage from "../../../../public/hero.png";
import Button1 from "../../../../public/Button1.png";
import Button2 from "../../../../public/Button2.png";

interface HeroProps {
    sectionId: string;
}

export default function Hero({ sectionId }: HeroProps) {
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

    const tags = heroContent?.tags || ["Live Streaming", "PK Battle", "Multiple Payment Gateway", "Video Trimming", "Add Music", "Wallet", "Gits", "Earn Coins"];
    const [activeTag, setActiveTag] = useState(heroContent?.activeTag || "Live Streaming");

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section id={sectionId} className="relative pt-[50px] w-full   px-4 md:px-12 lg:px-24 bg-white overflow-hidden pb-10">

            <div className={`mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row lg:gap-8 w-full py-4 ${heroContent?.layout === 'center' ? 'lg:flex-col' :
                    heroContent?.layout === 'right' ? 'lg:flex-row-reverse' :
                        'lg:flex-row'
                }`}>

                {/* --- LEFT CONTENT SECTION --- */}
                <div
                    className={`max-w-xl lg:max-w-2xl xl:max-w-3xl flex-1 order-2 lg:order-none transition-all duration-1000 ease-out z-20 ${heroContent?.layout === 'center' ? 'text-center' : 'text-center lg:text-left'
                        } ${isAnimate ? "opacity-100" : "opacity-0"}`}
                >

                    {/* Dot text above title - Only renders if dotText exists and isn't empty */}
                    {heroContent?.dotText && heroContent.dotText.trim() !== "" && (
                        <div className="mb-4">
                            <span className="text-[#2b49c5] text-sm font-semibold underline underline-offset-8 decoration-2 uppercase tracking-wide">
                                {heroContent.dotText}
                            </span>
                        </div>
                    )}

                    <h1
                        className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold leading-tighter break-words hyphens-auto"
                        style={{ color: heroContent?.titleColor || '#2D3134' }}
                    >
                        {heroContent?.title || 'Reelboost - Tiktok Clone App'}

                        {/* Subtitle Logic: Only renders the break and the span if subtitle exists */}
                        {heroContent?.subtitle && heroContent.subtitle.trim() !== "" && (
                            <>
                                <br className="hidden lg:block" />
                                <span
                                    className="relative inline-block max-w-full text-lg md:text-xl lg:text-2xl break-words hyphens-auto"
                                    style={{ color: heroContent?.subtitleColor || '#2D3134' }}
                                >
                                    {heroContent.subtitle}
                                </span>
                            </>
                        )}
                    </h1>

                    <p
                        className="2xl:mt-6 mt-4 mx-auto lg:mx-0 max-w-xl text-[15px] md:text-[18px] leading-relaxed"
                        style={{ color: heroContent?.descriptionColor || '#6B7280' }}
                    >
                        {heroContent?.description || 'ReelBoost is a modern short-video and live-streaming app inspired by TikTok. It lets users create, edit, and share engaging short videos with a smooth discovery feed. Creators can go live, interact with audiences in real time, and build loyal communities. Designed for performance and scale, ReelBoost supports engagement, growth, and monetization.'}
                    </p>

                    <div className={`2xl:mt-10 mt-6 flex flex-wrap gap-2 sm:gap-3 max-w-full ${heroContent?.layout === 'center' ? 'justify-center' : 'justify-center lg:justify-start'
                        }`}>
                        <button
                            onClick={() => setActiveTag("Short Video")}
                            className={`rounded-lg px-4 py-2 text-[14px] sm:text-[16px] font-medium transition-all cursor-pointer hover:scale-98 ${activeTag === "Short Video" ? "bg-[#FFB800] text-gray-800 shadow-sm" : "bg-[#F3F7FF] text-[#4A72FF]"
                                }`}
                        >
                            Short Video
                        </button>
                        {tags.map((tag: string) => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`rounded-lg px-4 py-2 text-[14px] sm:text-[16px] font-medium transition-all cursor-pointer hover:scale-98 ${activeTag === tag ? "bg-[#FFB800] text-gray-800 shadow-sm" : "bg-[#F3F7FF] text-[#4A72FF]"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className={`2xl:mt-20 mt-10 flex items-center gap-5 ${heroContent?.layout === 'center' ? 'justify-center' : 'justify-center lg:justify-start'
                        }`}>
                        <button className="transition-transform hover:scale-98 cursor-pointer">
                            <Image
                                src={heroContent?.appStoreImage || Button1}
                                alt="App Store"
                                width={120}
                                height={48}
                                className="h-12 md:h-15 w-auto"
                            />
                        </button>
                        <button className="transition-transform hover:scale-98 cursor-pointer">
                            <Image
                                src={heroContent?.googlePlayImage || Button2}
                                alt="Google Play"
                                width={120}
                                height={48}
                                className="h-12 md:h-15 w-auto"
                            />
                        </button>
                    </div>
                </div>

                {/* --- RIGHT IMAGE SECTION */}

                <div className={`relative flex flex-1 order-1 lg:order-none justify-center items-center w-full pb-8 lg:pb-0 mt-10 lg:mt-0 ${heroContent?.layout === 'center' ? 'lg:justify-center' :
                        heroContent?.layout === 'right' ? 'lg:justify-start' :
                            'lg:justify-end'
                    }`}>

                    <div className="relative w-[200px] h-[400px] sm:w-[280px] sm:h-[560px] lg:w-[220px] lg:h-[450px] xl:w-[370px] xl:h-[700px]">

                        {/* BLUE ACCENT */}
                        <div
                            className={`absolute -left-5 -top-5 lg:-left-7 lg:-top-7 xl:-left-7 xl:-top-10 h-32 w-32 lg:h-36 lg:w-36 xl:h-56 xl:w-56 rounded-tl-[50px] lg:rounded-tl-[50px] xl:rounded-tl-[85px] border-l-[8px] lg:border-l-[15px] xl:border-l-[20px] border-t-[8px] lg:border-t-[15px] xl:border-t-[20px] border-[#2B59FF] transition-all duration-700 ease-out z-0 ${isAnimate ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
                                }`}
                            style={{ transitionDelay: "600ms" }}
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
                            className={`absolute -right-5 -bottom-5 lg:-right-7 lg:-bottom-7 xl:-right-7 xl:-bottom-10 h-32 w-32 lg:h-36 lg:w-36 xl:h-56 xl:w-56 rounded-br-[50px] lg:rounded-br-[50px] xl:rounded-br-[85px] border-r-[8px] lg:border-r-[15px] xl:border-r-[20px] border-b-[8px] lg:border-b-[15px] xl:border-b-[20px] border-[#FFB800] transition-all duration-700 ease-out z-0 ${isAnimate ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
                                }`}
                            style={{ transitionDelay: "900ms" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
