"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";
import { Edit } from "lucide-react";

interface DynamicFeaturesProps {
  section?: any;
  onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'image' | 'admin' | null, elementId?: string) => void;
}

const DynamicFeatures = ({ section, onEdit }: DynamicFeaturesProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ users: 0, progress: 0 });
  const sectionRef = useRef(null);
  const userCounterRef = useRef(null);
  const [userVisible, setUserVisible] = useState(false);
  const progressRef = useRef(null);
  const [progressVisible, setProgressVisible] = useState(false);

  // Get features content from Redux store
  const { featuresContent } = useAppSelector(state => state.features);
  
  // Use section content only
  const content = section?.content;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProgressVisible(true);
          observer.disconnect();
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
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
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

  return (
    <section
      id={section?.id || 'features'}
      ref={sectionRef}
      className="text-white py-16 md:py-24 px-4 md:px-4 2xl:px-24 overflow-x-hidden relative cursor-pointer"
      style={{ backgroundColor: content.backgroundColor || '#000000' }}
      onClick={() => onEdit && onEdit(section?.id || 'features', 'admin')}
    >
      {/* Edit Icon - Top Right Corner - Only visible in builder mode */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(section?.id || 'features', 'admin');
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all z-10 hover:bg-gray-50"
          title="Edit Features Section"
        >
          <Edit size={16} className="text-gray-600" />
        </button>
      )}
      <div className="max-w-7xl mx-auto overflow-x-hidden px-4 sm:px-6 lg:px-8">
        {/* 1. Header Section */}
        <div
          className={`text-center mb-10 sm:mb-16 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          {content.dotText && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[14px] font-medium tracking-widest uppercase mb-2" style={{ color: content?.dotTextColor || '#FFFFFF' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: content?.dotColor || '#a8aff5' }} />
              <span className="break-words max-w-full">{content.dotText}</span>
            </div>
          )}
          <h2 
            className="text-[28px] md:text-5xl lg:text-5xl font-semibold tracking-normal leading-[1.1] break-words max-w-full px-4"
            style={{ color: content.titleColor || '#ffffff' }}
          >
            {content.title}
          </h2>
        </div>

        {/* 2. Secondary Features (Carousel for all screens, no grid on desktop) */}
        <div
          className={`mb-20 transition-all duration-1000 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          {/* Outer Container: Hidden overflow for smooth animation */}
          <div className="w-full overflow-hidden">
            {/* Outer Wrapper - Handles centering */}
            <div className="flex lg:justify-center">
              
              {/* Inner Track - Animated carousel for all screens */}
              <div 
                className="flex flex-row animate-scroll gap-3 md:gap-3"
                style={{ 
                  animationDuration: '40s', 
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear',
                  minWidth: 'fit-content'
                }}
              >
                {content.features.map((item: any, idx: number) => {

                  return (
                    <div
                      key={idx}
                      className={`shrink-0 w-40 md:w-44 lg:w-48 flex flex-col items-center group`}
                    >
                      <div className="w-full aspect-square bg-[#ad8fe5] rounded-[24px] flex items-center justify-center mb-4 relative overflow-hidden">
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
                        style={{ color: content.textColor || '#ffffff' }}
                      >
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Top Bento Grid - Responsive for all screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 xl:grid-cols-12 gap-6 mb-6">
          {/* Card 1 - Wallet */}
          <div 
            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')} 
            className="transition-all duration-300 hover:-translate-y-2 md:col-span-1 lg:col-span-3 xl:col-span-3 text-black rounded-[32px] p-8 flex flex-col justify-between min-h-[580px] md:min-h-[400px] overflow-hidden"
            style={{ backgroundColor: content.cards[0]?.backgroundColor || '#F1F3EE' }}
          >
         <div className="mt-auto h-[300px] md:h-[350px] 2xl:h-[400px] rounded-t-2xl shadow-inner relative overflow-hidden">
                 {content.cards[0]?.image && (
                <Image 
                  src={content.cards[0].image} 
                  alt="Image" 
                  width={400} 
                  height={350}
                  className="object-cover w-full" 
                />
              )}
            </div>
            <div className="text-center mb-8 mt-6">
              <h3 
                className="text-[32px] font-medium tracking-tight break-words max-w-full"
                style={{ color: content.cardTitleColor || '#111827' }}
              >
                {content.cards[0]?.title || 'Wallet'}
              </h3>
              <p 
                className="text-[16px] mt-1 break-words max-w-full px-2"
                style={{ color: content.cardDescriptionColor || '#4B5563' }}
              >
                {content.cards[0]?.description || 'The wallet allows users to securely manage their balance.'}
              </p>
            </div>
          </div>

          {/* Card 2 - Live Streaming */}
          <div 
            className="md:col-span-1 lg:col-span-3 xl:col-span-3 lg:order-last text-black rounded-[32px] p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 overflow-hidden" 
            onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}
            style={{ backgroundColor: content.cards[1]?.backgroundColor || '#F1F3EE' }}
          >
            <h3 
              className="text-[32px] font-medium text-center tracking-tight break-words max-w-full"
              style={{ color: content.cardTitleColor || '#111827' }}
            >
              {content.cards[1]?.title || 'Live Streaming'}
            </h3>
            <p 
              className="text-[16px] mt-1 text-center mb-3 sm:mb-0 break-words max-w-full px-2"
              style={{ color: content.cardDescriptionColor || '#4B5563' }}
            >
              {content.cards[1]?.description || 'Live streaming supports up to four participants.'}
            </p>
            <div className="mt-auto h-[300px] md:h-[350px] 2xl:h-[400px]  rounded-t-2xl shadow-inner relative overflow-hidden">
              {content.cards[1]?.image && (
                <Image src={content.cards[1].image} alt="Image" width={400} height={400} className="w-full h-auto object-contain" />
              )}
            </div>
          </div>

          {/* Cards 3 & 4 - Payment History & Reelboost */}
          <div className="md:col-span-2 lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
            {/* Payment History */}
            <div 
              className="text-black rounded-[32px] transition-all duration-300 hover:-translate-y-2 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden min-h-[200px] md:h-[250px] lg:h-[280px] xl:h-[300px]" 
              onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}
              style={{ backgroundColor: content.cards[2]?.backgroundColor || '#F1F3EE' }}
            >
              <div className="relative z-10 max-w-full md:max-w-[70%]">
                <h3 
                  className="text-[22px] md:text-[28px] lg:text-[32px] mb-3 font-medium tracking-tight break-words max-w-full"
                  style={{ color: content.cardTitleColor || '#111827' }}
                >
                  {content.cards[2]?.title || 'Payment History'}
                </h3>
                <p 
                  className="text-[13px] md:text-[14px] lg:text-[16px] mt-1 break-words max-w-full"
                  style={{ color: content.cardDescriptionColor || '#4B5563' }}
                >
                  {content.cards[2]?.description || 'View your complete payment history.'}
                </p>
              </div>
              {/* Payment Card Image - Right Side */}
              {content.cards[2]?.image && (
                <div className="w-20 h-20 md:w-24 md:h-24 xl:w-56 xl:h-56 flex-shrink-0 -mr-4">
                  <Image 
                    src={content.cards[2].image} 
                    alt="Payment History" 
                    width={160} 
                    height={160} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Reelboost - Full Image */}
            <div 
              className="rounded-[32px] overflow-hidden relative min-h-[250px] md:h-[365px] lg:h-[400px] xl:h-[365px] group transition-all duration-300 hover:-translate-y-2" 
              onClick={(e) => e.currentTarget.classList.toggle('-translate-y-2')}
              style={{ backgroundColor: content.cards[3]?.backgroundColor || '#F1F3EE' }}
            >
              {content.cards[3]?.image && (
                <Image
                  src={content.cards[3].image}
                  alt="Team working"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                <div className="relative px-4">
                  <h1 className="text-white text-4xl md:text-6xl lg:text-7xl xl:text-[115px] font-medium tracking-tighter flex items-center break-words text-center max-w-full">
                    {content.cards[3]?.title || 'Reelboost'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Grid - Cards 5, 6, 7 - Responsive grid for all screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 5 - Video Trimming */}
          <div 
            className="text-black rounded-[40px] p-6 flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-3 shadow-lg group overflow-hidden"
            style={{ backgroundColor: content.cards[4]?.backgroundColor || '#F1F3EE' }}
          >
            <div className="w-full mb-2 overflow-hidden rounded-[24px]">
              {content.cards[4]?.image && (
                <Image 
                  src={content.cards[4].image} 
                  alt="Video Trimming" 
                  width={300}
                  height={200}
                  className="w-full my-8 object-contain" 
                />
              )}
            </div>
            <div className="text-center px-2 pb-4 w-full">
              <h3 
                className="text-[28px] md:text-[32px] font-medium tracking-tight break-words max-w-full"
                style={{ color: content.cardTitleColor || '#111827' }}
              >
                {content.cards[4]?.title || 'Video Trimming'}
              </h3>
              <p 
                className="text-[15px] md:text-[17px] mt-2 leading-relaxed break-words max-w-full"
                style={{ color: content.cardDescriptionColor || '#4B5563' }}
              >
                {content.cards[4]?.description || 'Videos can be trimmed from beginning or end.'}
              </p>
            </div>
          </div>

          {/* Card 6 - Add Music */}
          <div 
            className="text-black rounded-[40px] p-6 flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-3 shadow-lg group overflow-hidden"
            style={{ backgroundColor: content.cards[5]?.backgroundColor || '#F1F3EE' }}
          >
            <div className="w-full mb-2 overflow-hidden rounded-[24px]">
              {content.cards[5]?.image && (
                <Image 
                  src={content.cards[5].image} 
                  alt="Add Music for Reels" 
                  width={300}
                  height={200}
                  className="w-full my-8 object-contain" 
                />
              )}
            </div>
            <div className="text-center px-2 pb-4 w-full">
              <h3 
                className="text-[28px] md:text-[32px] font-medium tracking-tight break-words max-w-full"
                style={{ color: content.cardTitleColor || '#111827' }}
              >
                {content.cards[5]?.title || 'Add Music for Reels'}
              </h3>
              <p 
                className="text-[15px] md:text-[17px] mt-2 leading-relaxed break-words max-w-full"
                style={{ color: content.cardDescriptionColor || '#4B5563' }}
              >
                {content.cards[5]?.description || 'Add Music to Reels allows users to enhance their short videos.'}
              </p>
            </div>
          </div>

          {/* Card 7 - Gift Lists */}
          <div 
            className="text-black rounded-[40px] p-6 flex flex-col items-center transition-all duration-500 hover:-translate-y-3 shadow-lg group overflow-hidden"
            style={{ backgroundColor: content.cards[6]?.backgroundColor || '#F1F3EE' }}
          >
            <div className="w-full mb-2 overflow-hidden rounded-[24px]">
              {content.cards[6]?.image && (
                <Image 
                  src={content.cards[6].image} 
                  alt="Gift Lists" 
                  width={300}
                  height={200}
                  className="w-full my-8 object-contain" 
                />
              )}
            </div>
            <div className="text-center px-2 pb-4 w-full">
              <h3 
                className="text-[28px] md:text-[32px] font-medium tracking-tight break-words max-w-full"
                style={{ color: content.cardTitleColor || '#111827' }}
              >
                {content.cards[6]?.title || 'Gift Lists'}
              </h3>
              <p 
                className="text-[15px] md:text-[17px] mt-2 leading-relaxed break-words max-w-full"
                style={{ color: content.cardDescriptionColor || '#4B5563' }}
              >
                {content.cards[6]?.description || 'The gift list includes multiple categories of gift icons.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-25%)); }
  }
  .animate-scroll {
    animation: scroll 40s linear infinite;
  }
  .animate-scroll:hover {
    animation-play-state: paused;
  }
  
  /* Stop animation on 2xl screens and above (min-width: 1536px) */
  @media (min-width: 1536px) {
    .animate-scroll {
      animation: none;
    }
    
    /* Make features display as grid on 2xl screens */
    .features-track {
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
    }
    @media (max-width: 1023px) {
        gap: 0.75rem;
    }
    @media (min-width: 1280px) {
        gap: 0.5rem;
    }
  }
`}</style>
    </section>
  );
};

export default DynamicFeatures;