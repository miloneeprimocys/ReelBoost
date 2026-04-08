"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
  layout: 'left' | 'right' | 'center';
  titleColor: string;
  subtitleColor: string;
  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  tags: string[];
  activeTag: string;
  appStoreImage: string;
  googlePlayImage: string;
  dotText: string;
}

const DynamicHero: React.FC<{ sectionContent?: HeroContent }> = ({ sectionContent }) => {
  const sections = useAppSelector(state => state.builder.sections);
  
  // Use provided sectionContent or get from Redux state
  const heroContent = sectionContent || sections.find(s => s.type === 'hero')?.content || {
    title: 'Reelboost - Tiktok Clone App',
    subtitle: 'Create, Share, and Discover Amazing Videos',
    description: 'Join the next generation of video sharing platform with advanced features and seamless user experience.',
    primaryButtonText: 'Get Started',
    secondaryButtonText: 'Learn More',
    backgroundImage: '/hero.png',
    layout: 'left' as const,
    titleColor: '#2D3134',
    subtitleColor: '#4A72FF',
    descriptionColor: '#4B5563',
    primaryButtonColor: '#4A72FF',
    secondaryButtonColor: '#6B7280',
    animation: 'fade' as const,
    tags: ["Live Streaming", "PK Battles", "Video Editing", "Social Features"],
    activeTag: "Live Streaming",
    appStoreImage: '/Button1.png',
    googlePlayImage: '/Button2.png',
    dotText: ''
  };
  const isPreviewMode = useAppSelector(state => state.builder.isPreviewMode);
  
  const heroSection = sections.find(s => s.type === 'hero');
  const isVisible = heroSection?.visible ?? true;
  const [isAnimate, setIsAnimate] = useState(false);
  const [activeTag, setActiveTag] = useState(heroContent?.activeTag || "Live Streaming");

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (heroContent?.animation) {
      case 'fade':
        return isAnimate ? 'opacity-100' : 'opacity-0';
      case 'slide':
        return isAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8';
      case 'bounce':
        return isAnimate ? 'opacity-100 animate-bounce' : 'opacity-0 scale-95';
      default:
        return 'opacity-100';
    }
  };

  const getLayoutClasses = () => {
    switch (heroContent?.layout) {
      case 'right':
        return 'lg:flex-row-reverse';
      case 'center':
        return 'flex-col items-center text-center';
      default:
        return 'lg:flex-row';
    }
  };

  if (!heroContent) return null;

  return (
    <section className="relative pt-[80px] lg:pt-[150px] w-full   px-4 md:px-12 lg:px-24 bg-white overflow-hidden pb:15 sm:pb-22">

        <div className={`mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 ${getLayoutClasses()} lg:gap-14 w-full py-4`}>

            {/* --- LEFT CONTENT SECTION --- */}
            <div
                className={`flex-1 order-2 lg:order-none transition-all duration-1000 ease-out text-center lg:text-left z-20 ${isAnimate ? "opacity-100" : "opacity-0"
                    }`}
            >
                <span className="inline-flex items-center gap-2 mb-3 xl:mb-5 text-[14px] font-normal tracking-normal uppercase text-black">
                    <span className="w-2 h-2 rounded-full bg-[#4A6CF7]" />
                    {heroContent.dotText || ''}
                </span>

                <h1 className="text-[32px]  sm:text-5xl md:text-6xl xl:text-[86px] 2xl:text-[92px]  xl:leading-[1.1] font-extrabold text-[#2D3134] tracking-tight break-words">
                    {heroContent.title.split(' - ').map((part: string, index: number) => (
                        <React.Fragment key={index}>
                            {index > 0 && <br className="hidden lg:block" />}
                            <span className="relative inline-block lg:px-2">
                                {index === 0 ? part + ' -' : part}
                            </span>
                            {index === 0 && <br />}
                        </React.Fragment>
                    ))}
                </h1>

                <p className="2xl:mt-6 mt-4 mx-auto lg:mx-0 max-w-xl text-[15px] md:text-[18px] leading-relaxed text-gray-600">
                    {heroContent.description}
                </p>

                <div className="2xl:mt-10 mt-6 flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 ">
                    <button
                        onClick={() => handleTagClick("Short Video")}
                        className={`rounded-lg px-4 py-2 text-[14px] sm:text-[16px] font-medium transition-all cursor-pointer hover:scale-98 ${activeTag === "Short Video" ? "bg-[#FFB800] text-gray-800 shadow-sm" : "bg-[#F3F7FF] text-[#4A72FF]"
                            }`}
                    >
                        Short Video
                    </button>
                    {heroContent.tags?.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`rounded-lg px-4 py-2 text-[14px] sm:text-[16px] font-medium transition-all cursor-pointer hover:scale-98 ${activeTag === tag ? "bg-[#FFB800] text-gray-800 shadow-sm" : "bg-[#F3F7FF] text-[#4A72FF]"
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="2xl:mt-20 mt-10 flex items-center justify-center lg:justify-start gap-5">
                    <button className="transition-transform hover:scale-98 cursor-pointer">
                        <Image
                            src={heroContent.appStoreImage || "/Button1.png"}
                            alt="App Store"
                            className="h-12 md:h-15"
                            width={200}
                            height={60}
                        />
                    </button>
                    <button className="transition-transform hover:scale-98 cursor-pointer">
                        <Image
                            src={heroContent.googlePlayImage || "/Button2.png"}
                            alt="Google Play"
                            className="h-12 md:h-15"
                            width={200}
                            height={60}
                        />
                    </button>
                </div>
            </div>

            {/* --- RIGHT IMAGE SECTION */}

            <div className="relative flex flex-1 order-1 lg:order-none justify-center items-center lg:justify-end w-full pb-8 lg:pb-0 mt-10 lg:mt-0">

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
                            src={heroContent.backgroundImage || "/hero.png"}
                            alt="App Interface"
                            className="w-full h-full object-contain sm:drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                            width={400}
                            height={700}
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
};

export default DynamicHero;
