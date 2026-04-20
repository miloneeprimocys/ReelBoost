"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";
import HeroImage from "../../../../public/second.svg";
import list from "../../../../public/list.svg";
import live from "../../../../public/livestream.svg";

interface BannerFeature {
  title: string;
  description: string;
  icon: string;
}

interface BannerContent {
  dotText?: string;
  dotColor?: string;
  dotTextColor?: string;
  title: string;
  subtitle?: string;
  description: string;
  features: BannerFeature[];
  backgroundImage?: string;
  backgroundColor?: string;
  layout: 'left' | 'right' | 'center';
  animation: 'none' | 'fade' | 'slide' | 'bounce';
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  featureTitleColor?: string;
  featureDescriptionColor?: string;
}

interface SecondSectionProps {
  sectionId?: string;
}

const SecondSection: React.FC<SecondSectionProps> = ({ sectionId }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Specifically target the right content for the intersection observer
    const contentRef = useRef(null);

    // Get this specific section's content from Redux store using the passed sectionId
    const section = useAppSelector(state => 
      state.banner.sections.find(s => s.id === sectionId) || state.builder.sections.find(s => s.id === sectionId)
    );
    
        
    // Use content from Redux or fallback to default content
    const content: BannerContent = section?.content || {
      dotText: 'Live Streaming',
      title: 'Start video, interact with your user.',
      subtitle: '',
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
      titleColor: '#111827',
      subtitleColor: '#4B5563',
      descriptionColor: '#4B5563',
      featureTitleColor: '#111827',
      featureDescriptionColor: '#4B5563'
    };

    console.log('=== SecondSection Content Debug ===');
    console.log('sectionId:', sectionId);
    console.log('section:', section);
    console.log('content.title:', content.title);
    console.log('content.description:', content.description);
    console.log('content.features:', content.features);
    console.log('content.backgroundColor:', content.backgroundColor);
    console.log('content.backgroundImage:', content.backgroundImage);
    console.log('==============================');

    useEffect(() => {
        setIsMounted(true);
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            {
                threshold: 0.2,
                rootMargin: "0px 0px -50px 0px"
            }
        );
        if (contentRef.current) observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, []);

    // Sync component when section content changes in Redux
    useEffect(() => {
        if (section?.content) {
            console.log('SecondSection - Section content updated:', section.content);
            // Force re-render by updating a local state that depends on section content
            setIsVisible(prev => prev);
        }
    }, [section?.content]);

    const getAnimationClass = () => {
        if (!isVisible) return '';
        switch (content.animation) {
            case 'fade': return 'animate-fade-in';
            case 'slide': return 'animate-slide-in';
            case 'bounce': return 'animate-bounce-in';
            default: return '';
        }
    };

    return (
        <section 
            id={sectionId || 'second-1'} 
            className="relative w-full pt-10 lg:pt-20 xl:pt-20 pb-10 mb-20 px-4 md:px-12 lg:px-16 xl:px-16 bg-white overflow-hidden"
            style={{ backgroundColor: content.backgroundColor }}
        >
            <div className="w-full max-w-3xl mx-auto overflow-hidden">
                <div className={`mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 lg:gap-14 
    ${content.layout === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'} 
    w-full py-4`}>
                    {/* Left Image */}
                    <div
                        className={`flex-1   transition-all duration-1000 ease-out z-10 ${getAnimationClass()} w-full max-w-md lg:max-w-lg overflow-hidden`}
                        style={{
                            opacity: isVisible ? 1 : 0
                        }}
                    >
                        {content.backgroundImage ? (
                            <div className="relative w-full h-auto rounded-xl md:rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:rotate-[-12deg] hover:scale-105 cursor-pointer">
                                <img 
                                    src={content.backgroundImage} 
                                    alt={content.title || 'Banner image'} 
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 bg-gray-200 rounded-xl md:rounded-2xl flex items-center justify-center">
                                <span className="text-gray-500 text-sm md:text-base">No image available</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Content */}
                    <div
                        ref={contentRef}
                        className={`flex-1   transition-all duration-1000 ease-out text-center lg:text-left z-20 ${getAnimationClass()} w-full max-w-sm lg:max-w-md overflow-hidden`}
                        style={{
                            opacity: isVisible ? 1 : 0,
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        {/* Dot Text */}
                        {content.dotText && (
                            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs sm:text-sm font-medium break-words max-w-full" style={{ color: content?.dotTextColor || '#2b49c5', backgroundColor: content?.dotColor || '#3b82f6' }}>
                                {content.dotText}
                            </div>
                        )}
                        
                        {/* Title */}
                        {content.title && (
                            <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl leading-tight break-words">
                                {content.title.split(' - ').map((part: string, index: number) => (
                                    <React.Fragment key={index}>
                                        {index > 0 && <br className="hidden lg:block" />}
                                        <span className="relative inline-block lg:px-2">
                                            {index === 0 ? part + ' -' : part}
                                        </span>
                                        {index === 0 && <br />}
                                    </React.Fragment>
                                ))}
                            </h2>
                        )}
                        
                        {/* Subtitle */}
                        {content.subtitle && (
                            <p className="mt-4 mx-auto lg:mx-0 max-w-sm text-sm md:text-base leading-relaxed text-gray-800 break-words">
                                {content.subtitle}
                            </p>
                        )}
                        
                        {/* Description */}
                        <p className="mt-4 mx-auto lg:mx-0 max-w-sm text-sm md:text-base leading-relaxed text-gray-600 break-words">
                            {content.description}
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-3 md:space-y-4 pt-2 md:pt-4">
                            {content.features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="flex items-start gap-3 md:gap-4 w-full overflow-x-hidden"
                                >
                                    <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mt-0.5 md:mt-1">
                                        {feature.icon && feature.icon !== '' ? (
                                            <img 
                                                src={feature.icon} 
                                                alt={feature.title || 'Feature icon'} 
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    // Fallback to static icons if dynamic icon fails
                                                    const target = e.target as HTMLImageElement;
                                                    if (index === 0) target.src = list.src;
                                                    if (index === 1) target.src = live.src;
                                                    if (index === 2) target.src = HeroImage.src;
                                                }}
                                            />
                                        ) : (
                                            <>
                                                {index === 0 && <Image src={list} alt="List icon" width={24} height={24} className="w-full h-full object-contain" />}
                                                {index === 1 && <Image src={live} alt="Live icon" width={24} height={24} className="w-full h-full object-contain" />}
                                                {index === 2 && <Image src={HeroImage} alt="Hero icon" width={24} height={24} className="w-full h-full object-contain" />}
                                                {index > 2 && <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-blue-500"></div>}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-x-hidden">
                                        <h4 
                                            className="font-semibold text-gray-900 leading-tight break-words text-sm sm:text-base"
                                            style={{ 
                                                color: content.featureTitleColor,
                                                wordWrap: 'break-word', 
                                                overflowWrap: 'break-word',
                                                hyphens: 'auto',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {feature.title}
                                        </h4>
                                        <p 
                                            className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words mt-1"
                                            style={{ 
                                                color: content.featureDescriptionColor,
                                                wordWrap: 'break-word', 
                                                overflowWrap: 'break-word',
                                                hyphens: 'auto',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SecondSection;