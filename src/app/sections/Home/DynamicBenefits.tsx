"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { iconMap, Benefit } from "../../store/benefitsSlice";

interface DynamicBenefitsProps {
  sectionId?: string;
}

const DynamicBenefits: React.FC<DynamicBenefitsProps> = ({ sectionId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get this specific section from builderSections
  const { sections: builderSections } = useAppSelector(state => state.builder);
  const section = builderSections.find(s => s.id === sectionId);

  // Get benefits content from benefits slice as fallback
  const { benefitsContent } = useAppSelector(state => state.benefits);

  // Use section content if available, otherwise use benefits content
  const content = section?.content || benefitsContent;

  // Get benefits from content
  const benefits: Benefit[] = content?.benefits || benefitsContent.benefits;

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
    backgroundImage: `linear-gradient(to right, ${content?.borderColor || '#d1d5db'} 60%, rgba(255,255,255,0) 0%)`,
    backgroundPosition: 'bottom',
    backgroundSize: '15px 1px',
    backgroundRepeat: 'repeat-x',
    marginLeft: '3rem',
    marginRight: '3rem',
  };

  const verticalDashedStyle = {
    backgroundImage: `linear-gradient(to bottom, ${content?.borderColor || '#d1d5db'} 60%, rgba(255,255,255,0) 0%)`,
    backgroundPosition: 'right',
    backgroundSize: '1px 15px',
    backgroundRepeat: 'repeat-y',
  };

  // Calculate number of rows for desktop (3 columns)
  const totalRows = Math.ceil(benefits.length / 3);

  // Get Icon component or custom image
  const getIconElement = (benefit: Benefit) => {
    // If custom image is uploaded, show that
    if (benefit.iconImage) {
      return <img src={benefit.iconImage} alt={benefit.title} className="w-full h-full object-contain" />;
    }
    // Otherwise use the icon component
    const IconComponent = iconMap[benefit.iconName] || iconMap['Star'];
    return <IconComponent />;
  };

  return (
    <section 
      ref={sectionRef} 
      id={sectionId || "benefits"} 
      className="w-full py-4 md:py-14 px-4 sm:px-6 overflow-x-hidden scroll-mt-20"
      style={{ backgroundColor: content?.backgroundColor || '#FFFFFF' }}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className={`text-center mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 text-[14px] font-medium tracking-widest uppercase mb-2 sm:mb-4"
            style={{ color: content?.dotTextColor || '#000000' }}
          >
            <span 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: content?.dotColor || '#4A6CF7' }}
            />
            <span className="truncate">{content?.dotText || 'Main Benefits'}</span>
          </div>
          <h2 
            className="text-[28px] md:text-5xl lg:text-5xl font-semibold tracking-normal leading-[1.2] mb-4 sm:mb-6 break-words"
            style={{ color: content?.titleColor || '#111827' }}
          >
            {content?.title || 'Many Benefits You Get'} <br className="hidden md:block" />
            <span
              className="px-1 py-0.5 sm:py-1 ml-1 sm:ml-2 inline-block break-words max-w-full"
              style={{ 
                backgroundColor: content?.highlightedTitleBgColor || 'transparent',
                color: content?.highlightedTitleColor || '#111827'
              }}
            >
              {content?.highlightedTitle || 'Using Product'}
            </span>
          </h2>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 relative gap-x-0 gap-y-0 w-full">
          
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
            const iconElement = getIconElement(benefit);

            return (
              <div 
                key={benefit.id} 
                onClick={() => setActiveCard(benefit.id)}
                className={`relative group p-4 pb-7 md:p-6 lg:p-8 transition-all duration-1000 ease-out z-10 w-full overflow-hidden`}
                style={{ 
                    transitionDelay: isVisible ? `${rowDelay}ms` : "0ms",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(50px)'
                }}
                onMouseEnter={(e) => {
                  // On group hover, exchange colors
                  const iconElement = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                  const titleElement = e.currentTarget.querySelector('[data-title]') as HTMLElement;
                  if (iconElement) {
                    iconElement.style.color = content?.benefitTitleColor || '#111827';
                  }
                  if (titleElement) {
                    titleElement.style.color = content?.benefitIconColor || '#2563EB';
                  }
                }}
                onMouseLeave={(e) => {
                  // Restore original colors
                  const iconElement = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                  const titleElement = e.currentTarget.querySelector('[data-title]') as HTMLElement;
                  if (iconElement) {
                    iconElement.style.color = content?.benefitIconColor || '#2563EB';
                  }
                  if (titleElement) {
                    titleElement.style.color = content?.benefitTitleColor || '#111827';
                  }
                }}
              >
                {/* Vertical Dashed Divider */}
                {!isLastInRow && (
                  <div className="hidden md:block absolute right-0 top-12 bottom-12 w-px" style={verticalDashedStyle} />
                )}

                {/* Content */}
                <div className="flex flex-col items-start w-full min-w-0">
                  <div 
                    data-icon
                    className={`mb-2.5 py-3 transition-colors duration-300 flex-shrink-0 ${
                      isActive ? "text-black" : ""
                    }`}
                    style={{ color: isActive ? '#000000' : (content?.benefitIconColor || '#2563EB') }}
                  >
                    {iconElement}
                  </div>
                  
                  <h3 
                    data-title
                    className="text-xl md:text-[22px] lg:text-2xl font-bold mb-3 sm:mb-4 break-words w-full transition-colors duration-300"
                    style={{ color: content?.benefitTitleColor || '#111827' }}
                  >
                    {benefit.title}
                  </h3>
                  
                  <p 
                    className="text-[15px] lg:text-[17px] tracking-wide leading-relaxed break-words w-full"
                    style={{ color: content?.benefitDescriptionColor || '#6B7280' }}
                  >
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

export default DynamicBenefits;