"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useAppSelector } from "../../hooks/reduxHooks";
import { shallowEqual } from "react-redux";
import { Video, MessageCircle, Star, Zap, Shield, Globe, Edit } from "lucide-react";
import HeroImage from "../../../../public/sword.svg";
import Audience from "../../../../public/audience.svg";
import Gift from "../../../../public/gift.svg";
import Sword from "../../../../public/sword.svg";
import list from "../../../../public/list.svg";
import live from "../../../../public/livestream.svg";
import second from "../../../../public/second.svg";

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
  description: string;
  features: BannerFeature[];
  backgroundImage?: string;
  backgroundColor?: string;
  layout?: 'left' | 'right' | 'center';
  animation?: string;
  titleColor?: string;
  descriptionColor?: string;
  featureTitleColor?: string;
  featureDescriptionColor?: string;
}

interface DynamicBannerProps {
  sectionId: string;
  sectionContent?: BannerContent;
  onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'image', elementId: string) => void;
}

const DynamicBanner: React.FC<DynamicBannerProps> = ({ sectionId, sectionContent, onEdit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const contentRef = useRef(null);

  // Get section content directly from builderSlice (consistent with other sections)
  const builderSectionContent = useAppSelector(state => {
    const section = state.builder.sections.find(s => s.id === sectionId);
    return section?.content;
  });
  
  // Get section type for layout determination
  const builderSection = useAppSelector(state => 
    state.builder.sections.find(s => s.id === sectionId)
  );
  
  console.log('DynamicBanner - Looking for section:', sectionId);
  console.log('DynamicBanner - Builder section:', builderSection);
  
  // Helper function to render correct icon - MOVED INSIDE COMPONENT
  const renderIcon = (iconName: string, className: string, sectionType?: string, featureIndex?: number) => {
    const iconProps = { className };
    
    console.log('renderIcon - sectionId:', sectionId, 'sectionType:', sectionType, 'featureIndex:', featureIndex, 'iconName:', iconName);
    
    // If iconName is a data URL or starts with '/', use it as an image
    if (iconName && (iconName.startsWith('data:') || iconName.startsWith('/'))) {
      console.log('renderIcon - Using dynamic icon:', iconName);
      return <img src={iconName} alt="Feature icon" className={className} onError={(e) => {
        // Fallback to static icons if dynamic icon fails
        const target = e.target as HTMLImageElement;
        const isSecondSection = sectionType === 'second' || sectionType === 'live-streaming' || (sectionId && (sectionId.includes('second') || sectionId.includes('live-streaming')));
        const isThirdSection = sectionType === 'third' || sectionType === 'pk-battle' || (sectionId && (sectionId.includes('third') || sectionId.includes('pk-battle')));
        
        if (isSecondSection) {
          if (featureIndex === 0) target.src = list.src;
          if (featureIndex === 1) target.src = live.src;
        } else if (isThirdSection) {
          if (featureIndex === 0) target.src = HeroImage.src;
          if (featureIndex === 1) target.src = Gift.src;
          if (featureIndex === 2) target.src = Audience.src;
          if (featureIndex === 3) target.src = Sword.src;
        }
      }} />;
    }
    
    // Check if this is a second or third section based on sectionId or sectionType
    const isSecondSection = sectionType === 'second' || sectionType === 'live-streaming' || (sectionId && (sectionId.includes('second') || sectionId.includes('live-streaming')));
    const isThirdSection = sectionType === 'third' || sectionType === 'pk-battle' || (sectionId && (sectionId.includes('third') || sectionId.includes('pk-battle')));
    
    console.log('isSecondSection:', isSecondSection, 'isThirdSection:', isThirdSection);
    
    // Use SVG icons for second and third sections as fallback
    if (isSecondSection) {
      console.log('renderIcon - Using second section icons fallback');
      if (featureIndex === 0) return <Image src={list} alt="List icon" className={className} />;
      if (featureIndex === 1) return <Image src={live} alt="Live icon" className={className} />;
      // Fallback
      return <Image src={list} alt="List icon" className={className} />;
    }
    
    if (isThirdSection) {
      console.log('renderIcon - Using third section icons fallback');
      if (featureIndex === 0) return <Image src={HeroImage} alt="Hero icon" className={className} />;
      if (featureIndex === 1) return <Image src={Gift} alt="Audience icon" className={className} />;
      if (featureIndex === 2) return <Image src={Audience} alt="Gift icon" className={className} />;
      if (featureIndex === 3) return <Image src={Sword} alt="Sword icon" className={className} />;
      // Fallback
      return <Image src={HeroImage} alt="Hero icon" className={className} />;
    }
    
    // Use Lucide icons for other sections
    console.log('renderIcon - Using Lucide icons fallback for:', iconName);
    switch (iconName) {
      case 'Video':
        return <Video {...iconProps} />;
      case 'MessageCircle':
        return <MessageCircle {...iconProps} />;
      case 'Star':
        return <Star {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'Shield':
        return <Shield {...iconProps} />;
      case 'Globe':
        return <Globe {...iconProps} />;
      default:
        return <Video {...iconProps} />;
    }
  };
  
  // Debug: Log section detection
  console.log('DynamicBanner - sectionId:', sectionId);
  console.log('DynamicBanner - builderSection:', builderSection);
  console.log('DynamicBanner - builderSection.type:', builderSection?.type);
  console.log('DynamicBanner - builderSection.content?.title:', builderSection?.content?.title);
  console.log('DynamicBanner - builderSection.content?.dotText:', builderSection?.content?.dotText);
  
  // Helper function to determine default layout based on section type
 const getDefaultLayout = () => {
  const type = builderSection?.type || "";
  const id = sectionId || "";

  // All banner sections use consistent layout based on name/content
  // Live Streaming → LEFT
  if (
    id.includes("live-streaming") ||
    (type === "banner" && builderSection?.name?.toLowerCase().includes("live streaming"))
  ) {
    return "left";
  }

  // PK Battle → RIGHT
  if (
    id.includes("pk-battle") ||
    (type === "banner" && builderSection?.name?.toLowerCase().includes("pk battle"))
  ) {
    return "right";
  }

  return "left"; // default fallback
};

  // Merge content: use builder section content with fallback
  const baseContent = builderSectionContent || {
    dotText: 'Demo Live Streaming',
    title: 'Demo Title',
  
    description: 'Demo Description: This is a demonstration banner section with sample content that showcases the layout and styling capabilities of the banner editor.',
    features: [
      {
        title: 'Demo Feature One',
        description: 'Demo description for the first feature that demonstrates the feature layout and styling.',
        icon: 'Video'
      },
      {
        title: 'Demo Feature Two',
        description: 'Demo description for the second feature showing how multiple features are displayed.',
        icon: 'MessageCircle'
      }
    ],
    backgroundImage: '/second.svg',
    backgroundColor: '#ffffff',
    animation: 'fade',
    titleColor: '#111827',
    descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };

  console.log('=== DynamicBanner Content Debug ===');
  console.log('sectionId:', sectionId);
  console.log('builderSectionContent:', builderSectionContent);
  console.log('baseContent.title:', baseContent.title);
  console.log('baseContent.description:', baseContent.description);
  console.log('baseContent.features:', baseContent.features);
  console.log('baseContent.backgroundColor:', baseContent.backgroundColor);
  console.log('============================');

  // Apply default layout if not set
const bannerContent = {
  ...baseContent,
  layout: baseContent.layout || getDefaultLayout()
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
    switch (bannerContent.animation) {
      case 'fade':
        return 'transition-opacity duration-700';
      case 'slide':
        return 'transition-transform duration-700';
      case 'bounce':
        return 'transition-all duration-700';
      default:
        return 'transition-all duration-700';
    }
  };

  const getVisibilityClass = () => {
    if (!isVisible) return 'opacity-0 translate-y-8';
    switch (bannerContent.animation) {
      case 'fade':
        return 'opacity-100';
      case 'slide':
        return 'opacity-100 translate-y-0';
      case 'bounce':
        return 'opacity-100 translate-y-0 scale-100';
      default:
        return 'opacity-100 translate-y-0';
    }
  };

  const renderContent = () => {
    const layout = bannerContent.layout;
    const isLeftLayout = layout === 'left';
    const isRightLayout = layout === 'right';
    const isCenterLayout = layout === 'center';

    return (
      <div className={`w-full max-w-6xl mx-auto grid grid-cols-1 ${
        isCenterLayout ? 'lg:grid-cols-1' : 
        isRightLayout ? 'lg:grid-cols-2' : 
        'lg:grid-cols-2'
      } items-center gap-8 lg:gap-12`}>
        
        {/* Image Section */}
        {isCenterLayout ? (
          <div className="flex justify-center order-1">
            {renderImageSection()}
          </div>
        ) : isRightLayout ? (
          <div className="order-1 lg:order-1">
            {renderImageSection()}
          </div>
        ) : (
          <div className="order-1 lg:order-2">
            {renderImageSection()}
          </div>
        )}

        {/* Content Section */}
        <div
          ref={contentRef}
          className={`flex flex-col space-y-4 xl:space-y-6 w-full overflow-x-hidden ${
            isRightLayout ? 'order-2 lg:order-2 lg:pl-4' :
            isCenterLayout ? 'text-center items-center order-2' :
            'order-2 lg:order-1 lg:pr-4'
          }`}
        >
          <div className={`transition-opacity duration-500 w-full ${isCenterLayout ? 'flex flex-col items-center' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {bannerContent.dotText && (
              <span className="inline-flex items-center gap-2 mb-3 xl:mb-5 text-[14px] font-normal tracking-normal uppercase break-words" 
                    style={{ color: bannerContent.dotTextColor || bannerContent.descriptionColor }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: bannerContent.dotColor || '#4A6CF7' }} />
                <span className="break-words">{bannerContent.dotText}</span>
              </span>
            )}
            
            <h2 
              className={`text-3xl md:text-5xl xl:text-6xl tracking-tight font-medium leading-[1.1] xl:leading-[1] break-words w-full ${onEdit ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
              style={{ color: bannerContent.titleColor }}
              onClick={() => onEdit && onEdit(sectionId, 'text', 'banner-title')}
            >
              {bannerContent.title}
            </h2>
            
            
            <p 
              className={`mt-4 xl:mt-6 text-[15px] xl:text-[17px] leading-relaxed break-words w-full ${onEdit ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
              style={{ color: bannerContent.descriptionColor }}
              onClick={() => onEdit && onEdit(sectionId, 'text', 'banner-description')}
            >
              {bannerContent.description}
            </p>
          </div>

          <div className={`space-y-2 xl:space-y-4 w-full ${isCenterLayout ? 'flex flex-col items-center' : ''}`}>
            {(bannerContent.features || []).map((feature: any, index: number) => (
              <div
                key={index}
                className={`group flex items-start gap-4 py-3 xl:py-4 px-1.5 rounded-2xl cursor-pointer transition-all duration-500 ${isCenterLayout ? 'max-w-2xl mx-auto' : 'w-full'}`}
                style={{ 
                  opacity: isVisible ? 1 : 0.5,
                  transform: isVisible ? 'translateY(0)' : 'translateY(4px)'
                }}
                onClick={() => onEdit && onEdit(sectionId, 'text', `banner-feature-${index}`)}
              >
                {isCenterLayout ? (
                  <div className="flex flex-col items-center text-center w-full">
                    {/* ICON + TITLE */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative h-6 w-6 xl:h-8 xl:w-8 flex items-center justify-center transition-all duration-300 group-hover:rotate-6 group-hover:scale-105">
                        {feature.icon && renderIcon(feature.icon, "w-6 h-6 xl:w-8 xl:h-8 text-blue-600", builderSection?.type, index)}
                      </div>

                      <h4 
                        className="text-[18px] xl:text-[20px] font-semibold transition-colors duration-300 group-hover:text-blue-600 whitespace-normal break-words"
                        style={{ color: bannerContent.featureTitleColor }}
                      >
                        {feature.title}
                      </h4>
                    </div>

                    {/* DESCRIPTION */}
                    <p 
                      className="mt-2 xl:mt-3 text-[15px] xl:text-[16px] leading-relaxed max-w-2xl whitespace-normal break-words"
                      style={{ color: bannerContent.featureDescriptionColor }}
                    >
                      {feature.description}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* DEFAULT (LEFT / RIGHT) - unchanged */}
                    <div className="flex-shrink-0">
                      <div className="relative h-6 w-6 xl:h-8 xl:w-8 flex items-center justify-center transition-all duration-300 group-hover:rotate-6 group-hover:scale-105">
                        {feature.icon && renderIcon(feature.icon, "w-6 h-6 xl:w-8 xl:h-8 text-blue-600", builderSection?.type, index)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 
                        className="text-[18px] xl:text-[20px] font-semibold transition-colors duration-300 group-hover:text-blue-600 whitespace-normal break-words"
                        style={{ color: bannerContent.featureTitleColor }}
                      >
                        {feature.title}
                      </h4>
                      <p 
                        className="mt-1 xl:mt-2 text-[15px] xl:text-[16px] leading-relaxed whitespace-normal break-words"
                        style={{ color: bannerContent.featureDescriptionColor }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

const renderImageSection = () => {
  const isRightLayout = bannerContent.layout === 'right';
  const isLeftLayout = bannerContent.layout === 'left';
    
  const getMainRotation = () => {
    if (isLeftLayout) {
      // Image on LEFT → tilt RIGHT (+)
      return isMounted && isClicked ? '2deg' : '12deg';
    }
    if (isRightLayout) {
      // Image on RIGHT → tilt LEFT (-)
      return isMounted && isClicked ? '-2deg' : '-12deg';
    }
    return '0deg';
  };

  const getSecondaryRotation = () => {
    if (isLeftLayout) {
      // Image on LEFT → secondary tilts LEFT (-)
      return isMounted && isClicked ? '-2deg' : '-12deg';
    }
    if (isRightLayout) {
      // Image on RIGHT → secondary tilts RIGHT (+)
      return isMounted && isClicked ? '2deg' : '12deg';
    }
    return '0deg';
  };
    
  return (
    <div className="relative flex justify-center mt-10">
      {/* Background Decorative Box */}
      <div
        onClick={() => {
          setIsClicked(false);
          onEdit && onEdit(sectionId, 'image', 'banner-background');
        }}
        className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[450px] md:h-[450px] lg:w-[400px] lg:h-[400px] xl:w-[550px] xl:h-[550px] rounded-[20px] hide-scrollbar overflow-hidden cursor-pointer"
        style={{
          backgroundColor: bannerContent.backgroundColor || '#4A72FF',
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)",
          backgroundSize: "38px 38px",
          backgroundPosition: "center center"
        }}
      />

    {/* Image Container */}
<div
  onClick={(e) => { e.stopPropagation(); setIsClicked(!isClicked); }}
  className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[260px] sm:w-[240px] md:w-[300px] lg:w-[280px] xl:w-[350px] group cursor-pointer lg:left-auto lg:right-auto lg:translate-x-0 ${
      isRightLayout 
      ? 'lg:left-[15%] xl:left-10 2xl:left-24 lg:left-15 lg:-translate-x-1/2' 
      : 'lg:left-[55%] xl:left-10 2xl:left-32 lg:left-15 lg:-translate-x-1/2'
  }`}
>
  {/* Secondary Image - tilts opposite direction */}
  <div 
    className="absolute inset-0 transition-transform duration-500 ease-out"
    style={{ 
      transform: `rotate(${getSecondaryRotation()})`
    }}
  >
    {bannerContent.backgroundImage && (
      <Image
        src={bannerContent.backgroundImage}
        alt="Secondary View"
        width={850}
        height={710}
        className="rounded-[2rem] sm:rounded-[3rem] w-[220px] h-[320px] sm:w-[220px] sm:h-[320px] md:w-[400px] md:h-[420px] lg:w-[480px] lg:h-[450px] 2xl:w-[780px] 2xl:h-[650px] xl:w-[680px] xl:h-[620px]"
      />
    )}
  </div>

  {/* Main Image */}
  <div
    className={`relative transform transition-transform duration-500 ease-out ${
      isRightLayout
        ? (isMounted && isClicked
            ? 'rotate-[2deg]'
            : 'rotate-[12deg] group-hover:rotate-[-2deg]')
        : (isMounted && isClicked
            ? 'rotate-[-2deg]'
            : 'rotate-[-12deg] group-hover:rotate-[2deg]')
    }`}
  >
    {bannerContent.backgroundImage && (
      <Image
        src={bannerContent.backgroundImage}
        alt="Main View"
        width={850}
        height={710}
        priority
        className="rounded-[2rem] sm:rounded-[3rem] w-[220px] h-[320px] sm:w-[220px] sm:h-[320px] md:w-[400px] md:h-[420px] lg:w-[480px] lg:h-[450px] 2xl:w-[780px] 2xl:h-[650px] xl:w-[680px] xl:h-[620px]"
      />
    )}
  </div>
</div>
    </div>
  );
};
  return (
    <section 
      id={sectionId} 
      className="relative w-full py-10 xl:py-20 px-4 md:px-8 bg-white overflow-x-hidden"
    >
      {/* Edit Icon - Top Right Corner - Only visible in builder mode */}
      {onEdit && (
        <button
          onClick={() => onEdit(sectionId, 'text', 'banner-title')}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all z-10 hover:bg-gray-50"
          title="Edit Banner Section"
        >
          <Edit size={16} className="text-gray-600" />
        </button>
      )}
      
      {renderContent()}
    </section>
  );
};

export default DynamicBanner;