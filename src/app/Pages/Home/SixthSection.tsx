"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { iconMap } from "../../store/benefitsSlice";
import { Phone } from "lucide-react";
import { Benefit } from "../../store/benefitsSlice";

const SixthSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Get benefits content from Redux store
  const { benefitsContent } = useAppSelector(state => state.benefits);
  const { sections } = useAppSelector(state => state.builder);
  const sixthSection = sections.find(s => s.id === 'sixth-1');
  
  // Use sixth section content if available, otherwise use benefits content
  const content = sixthSection?.content || benefitsContent;
  const benefits = content?.benefits || [];

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

  // Calculate row heights after content is visible and benefits change
  useEffect(() => {
    if (isVisible && rowRefs.current.length > 0) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        const heights = rowRefs.current.map(ref => ref?.offsetHeight || 0);
        
        // Calculate cumulative heights for line positions
        const cumulativeHeights: number[] = [];
        let sum = 0;
        for (let i = 0; i < heights.length - 1; i++) {
          sum += heights[i];
          cumulativeHeights.push(sum);
        }
        setRowHeights(cumulativeHeights);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, benefits]);

  const horizontalDashedStyle = {
    backgroundImage: `linear-gradient(to right, ${content?.borderColor || '#d1d5db'} 60%, rgba(255,255,255,0) 0%)`,
    backgroundPosition: 'bottom',
    backgroundSize: '15px 1px',
    backgroundRepeat: 'repeat-x',
    marginLeft: '2rem',
    marginRight: '2rem',
  };

  const verticalDashedStyle = {
    backgroundImage: `linear-gradient(to bottom, ${content?.borderColor || '#d1d5db'} 60%, rgba(255,255,255,0) 0%)`,
    backgroundPosition: 'right',
    backgroundSize: '1px 15px',
    backgroundRepeat: 'repeat-y',
  };

  // Calculate number of rows for desktop (3 columns)
  const totalRows = Math.ceil(benefits.length / 3);
  
  // Get icon component or custom image
  const getIconElement = (benefit: Benefit) => {
    // If custom image is uploaded, show that
    if (benefit.iconImage) {
      return <img src={benefit.iconImage} alt={benefit.title} className="w-full h-full object-contain" />;
    }
    // Otherwise use the icon component
    const IconComponent = iconMap[benefit.iconName] || iconMap['Phone'];
    return <IconComponent />;
  };

  return (
    <section 
      ref={sectionRef} 
      id="sixth-1" 
      className="w-full py-4 md:py-14 px-4 sm:px-6 overflow-x-hidden"
      style={{ backgroundColor: content?.backgroundColor || '#ffffff' }}
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
            <span className="break-words inline-block max-w-full" style={{ color: content?.highlightedTitleColor  || '#111827' }}>
              {content?.highlightedTitle || 'Using Product'}
            </span>
          </h2>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 relative gap-x-0 gap-y-0 w-full">
          
          {/* Dynamic Horizontal Dashed Lines based on actual row heights */}
          {rowHeights.map((height, i) => (
            <div 
              key={`line-${i}`}
              className="hidden md:block absolute left-0 right-0 h-px z-0" 
              style={{ 
                ...horizontalDashedStyle, 
                top: `${height}px`
              }}
            />
          ))}

          {/* Render rows with refs */}
          {Array.from({ length: totalRows }).map((_, rowIndex) => {
            const rowBenefits = benefits.slice(rowIndex * 3, (rowIndex + 1) * 3);
            return (
              <React.Fragment key={`row-${rowIndex}`}>
                {rowBenefits.map((benefit: Benefit, colIndex: number) => {
                  const globalIndex = rowIndex * 3 + colIndex;
                  const isLastInRow = colIndex === 2 || colIndex === rowBenefits.length - 1;
                  const rowDelay = rowIndex * 250; 
                  const isActive = activeCard === parseInt(benefit.id.split('-')[1]);
                  const iconElement = getIconElement(benefit);

                  return (
                    <div 
                      key={benefit.id}
                      ref={colIndex === 0 ? (el) => { rowRefs.current[rowIndex] = el; } : undefined}
                      onClick={() => setActiveCard(parseInt(benefit.id.split('-')[1]))}
                      className={`relative group p-4 pb-7 md:p-6 lg:p-8 transition-all duration-1000 ease-out z-10 w-full overflow-hidden`}
                      style={{ 
                        transitionDelay: isVisible ? `${rowDelay}ms` : "0ms",
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                        gridColumn: colIndex === 0 ? 'auto' : 'auto'
                      }}
                      onMouseEnter={(e) => {
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
                          className="mb-2.5 py-3 transition-colors duration-300 flex-shrink-0"
                          style={{ 
                            color: isActive 
                              ? (content?.benefitIconColor || '#2563EB')
                              : (content?.benefitIconColor || '#2563EB'),
                          }}
                        >
                          {iconElement}
                        </div>
                        
                        <h3 
                          data-title
                          className="text-xl md:text-[22px] lg:text-2xl font-bold mb-3 sm:mb-4 transition-colors duration-300 break-words w-full"
                          style={{ 
                            color: content?.benefitTitleColor || '#111827'
                          }}
                        >
                          {benefit.title}
                        </h3>
                        
                        <p 
                          className="text-[15px] lg:text-[17px] tracking-wide leading-relaxed break-words w-full"
                          style={{ 
                            color: content?.benefitDescriptionColor || '#6B7280'
                          }}
                        >
                          {benefit.description}
                        </p>
                      </div>

                      {/* Mobile-only Divider */}
                      {globalIndex !== benefits.length - 1 && (
                        <div className="block md:hidden absolute bottom-0 left-2 right-2 h-px" style={horizontalDashedStyle} />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SixthSection;