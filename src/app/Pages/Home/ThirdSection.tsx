"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";
import HeroImage from "../../../../public/third.svg";
import Audience from "../../../../public/audience.svg";
import Gift from "../../../../public/gift.svg";
import Sword from "../../../../public/sword.svg";

interface BannerFeature {
  title: string;
  description: string;
  icon: string;
}

interface BannerContent {
  dotText?: string;
  dotTextColor?: string;
  dotColor?: string;
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

interface ThirdSectionProps {
  sectionId?: string;
}

const ThirdSection: React.FC<ThirdSectionProps> = ({ sectionId }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Specifically target the content for the intersection observer
    const contentRef = useRef(null);

    // Get this specific section's content from Redux store using the passed sectionId
    const section = useAppSelector(state => 
      state.banner.sections.find(s => s.id === sectionId) || state.builder.sections.find(s => s.id === sectionId)
    );
    
    // Use content from Redux or fallback to static content
    const content: BannerContent = section?.content || {
      dotText: 'PK Battle',
      title: 'Live battles to win audience support',
      subtitle: '',
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
      layout: 'right',
      animation: 'fade',
      titleColor: '#111827',
      subtitleColor: '#4B5563',
      descriptionColor: '#4B5563',
      featureTitleColor: '#111827',
      featureDescriptionColor: '#4B5563'
    };

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
            id={sectionId || 'third-1'} 
            className="relative w-full pt-10 xl:pt-20 pb-10 mb-20 px-4 md:px-12 lg:px-24 bg-white overflow-hidden hide-scrollbar"
            style={{ backgroundColor: content.backgroundColor }}
        >
            <div className={`w-full max-w-3xl mx-auto overflow-hidden hide-scrollbar`}>
                <div className={`mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 lg:gap-14 lg:flex-row w-full py-4`}>
                    {/* Left Content */}
                    <div
                        ref={contentRef}
                        className={`flex-1 order-2 transition-all duration-1000 ease-out text-center lg:text-left z-20 ${getAnimationClass()} lg:order-1`}
                        style={{
                            opacity: isVisible ? 1 : 0
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
                        <div className="space-y-4 pt-4">
                        {content.features.map((feature, index) => (
                            <div 
                                key={index}
                                className="flex items-start gap-4"
                                style={{ 
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                                    transition: `all 0.6s ease-out ${index * 0.1}s`
                                }}
                            >
                                <div className="shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    {index === 0 && <Image src={HeroImage} alt="Hero icon" width={24} height={24} className="text-yellow-600" />}
                                    {index === 1 && <Image src={Audience} alt="Audience icon" width={24} height={24} className="text-yellow-600" />}
                                    {index === 2 && <Image src={Gift} alt="Gift icon" width={24} height={24} className="text-yellow-600" />}
                                    {index === 3 && <Image src={Sword} alt="Sword icon" width={24} height={24} className="text-yellow-600" />}
                                    {index > 3 && <div className="w-6 h-6 rounded-full bg-yellow-500"></div>}
                                </div>
                                <div>
                                    <h3 
                                        className="font-semibold text-gray-900 mb-1"
                                        style={{ color: content.featureTitleColor }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Right Image */}
                <div
                    className={`flex-1 order-1 transition-all duration-1000 ease-out z-10 ${getAnimationClass()} lg:order-2`}
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
            </div>
        </div>
        </section>
    );
};

export default ThirdSection;
