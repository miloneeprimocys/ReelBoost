"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Edit3, ChevronLeft, ChevronRight, Quote, Star, ArrowLeft, ArrowRight } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface DynamicTestimonialsProps {
  section?: any;
  onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'testimonial' | null, elementId?: string) => void;
}

// Get random days ago for demo
const getDaysAgo = (id: string) => {
  const days = [1, 2, 3, 5, 7, 14, 21, 30];
  const index = id.charCodeAt(0) % days.length;
  return days[index];
};

const DynamicTestimonials = ({ section, onEdit }: DynamicTestimonialsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get testimonials content from Redux store
  const { testimonialsContent } = useAppSelector(state => state.testimonials);
  
  // Check if we're in preview mode (builder)
  const isPreviewMode = useAppSelector(state => state.builder.isPreviewMode);
  
  // Use section content if available, otherwise fallback to testimonialsContent
  let content = section?.content || testimonialsContent;
  
  // ABSOLUTE override - force light gray on homepage no matter what
  if (!isPreviewMode) {
    content = {
      ...content,
      backgroundColor: '#f3f4f6',
      textColor: '#111827'
    };
  }

  const testimonials = content.testimonials || [];
  const carouselPosition = content.carouselPosition || 'right';
const baseIndex = testimonials.length;
  // Check screen size
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024); // Stack layout on mobile/tablet (<1024px)
      setIsTablet(width >= 1024 && width < 1536); // LG/XL screens (1024-1536px)
    };
    
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-play carousel - move one card at a time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Calculate average rating and total reviews automatically
  const calculateStats = () => {
    if (testimonials.length === 0) return { avgRating: '0.0', totalReviews: 0 };
    const totalRating = testimonials.reduce((sum: number, t: Testimonial) => sum + (t.rating || 5), 0);
    const avgRating = (totalRating / testimonials.length).toFixed(1);
    return { avgRating, totalReviews: testimonials.length };
  };

  const { avgRating, totalReviews } = calculateStats();

  const renderStars = (rating: number, starColor?: string, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size === 'sm' ? 12 : 16}
        className={`${sizeClass} ${i < rating ? 'fill-current' : 'text-gray-300'}`}
        style={{ color: i < rating ? (starColor || '#10b981') : '#d1d5db' }}
      />
    ));
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Testimonial Item - Card + Profile Info (like screenshot)
  const TestimonialItem = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
    const cardBg = content.cardBackgroundColor || '#ffffff';
    
    return (
      <div className="flex flex-col h-full">
        {/* Card - Only quote, content, stars - Fixed height, bigger for 2XL */}
        <div
          className="rounded-2xl p-5 sm:p-6 2xl:p-8 relative group cursor-pointer flex flex-col"
          style={{ 
            backgroundColor: cardBg,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            minHeight: '200px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(section?.id || "testimonials", 'testimonial', index.toString());
          }}
        >
          {/* Edit Indicator */}
          {onEdit && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Edit3 size={14} className="text-blue-500" />
            </div>
          )}

          {/* Quote Icon - Top Left, bigger for 2XL */}
          <div className="mb-4">
            <Quote 
              size={36}
              className="opacity-20 2xl:w-12 2xl:h-12"
              style={{ color: content.quoteIconColor || '#9ca3af' }}
            />
          </div>

          {/* Content - flex grow to fill space, bigger text for 2XL */}
          <p 
            className="text-sm 2xl:text-base leading-relaxed mb-4 flex-grow"
            style={{ color: content.cardTextColor || '#374151' }}
          >
            {testimonial.content}
          </p>

          {/* Stars - At bottom of card */}
          <div className="flex gap-0.5">
            {renderStars(testimonial.rating || 5, content.starColor, 'sm')}
          </div>

          {/* Speech Bubble Tail - At bottom LEFT corner, beside profile */}
  <div className="absolute -bottom-3.5 left-0">
            <div 
              className="w-0 h-0"
              style={{ 
                borderTop: `35px solid ${cardBg}`, // Height of the arrow
                borderRight: '45px solid transparent', // Width/Angle of the arrow
              }}
            />
          </div>
        </div>

        {/* Profile Info - BESIDE tail at same horizontal level */}
      <div className="flex items-center gap-2 mt-3 ml-3">
          {/* Avatar */}
          {testimonial.avatar ? (
           <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-md bg-white">
              <img 
                src={testimonial.avatar} 
                alt={testimonial.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-white shadow-md bg-white"
              style={{ 
                background: `linear-gradient(to bottom right, ${content.starColor || '#60a5fa'}, ${content.quoteIconColor || '#2563eb'})`,
                color: '#ffffff'
              }}
            >
              {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          
          {/* Name and Date */}
          <div>
            <h4 
              className="font-semibold text-sm"
              style={{ color: content.cardTextColor || '#111827' }}
            >
              {testimonial.name}
            </h4>
            <p className="text-xs" style={{ color: content.cardTextColor ? `${content.cardTextColor}80` : '#6b7280' }}>
              {getDaysAgo(testimonial.id)} days ago
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Left Content Component - Reduced font sizes
  const LeftContent = () => (
    <div className="flex flex-col justify-center lg:pr-4 xl:pr-8">
      {/* Large Quote Icon - Smaller */}
      <div className="mb-4 lg:mb-6">
        <Quote 
          size={60} 
          className="opacity-20 lg:w-16 lg:h-16 w-14 h-14"
          style={{ color: content.quoteIconColor || '#9ca3af' }}
        />
      </div>

      {/* Title - Smaller on all screens with overflow handling */}
      <h3 
        className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-semibold mb-3 lg:mb-4 leading-tight break-words"
        style={{ color: content.textColor || '#111827' }}
      >
        {content.subtitle || 'What our customers are saying'}
      </h3>

      {/* Navigation Arrows - Smaller */}
      <div className="flex items-center gap-3 mt-3 lg:mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className="p-2.5 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          aria-label="Previous testimonial"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="p-2.5 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          aria-label="Next testimonial"
        >
          <ArrowRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Progress Line */}
      <div className="flex items-center gap-2 mt-5">
        <div className="h-0.5 w-6 bg-gray-800 rounded-full" />
        <div className="h-0.5 w-12 bg-gray-300 rounded-full" />
      </div>
    </div>
  );

  // Carousel Component - Infinite loop with seamless scrolling
  const Carousel = () => {
    // PREVIEW MODE (builder): 1 card until 2XL (1536px+)
    // HOMEPAGE: 2 cards on LG+ (1024px+)
    let visibleCount: number;
    
    if (isPreviewMode) {
      visibleCount = isMobile || isTablet ? 1 : 2;
    } else {
      visibleCount = isMobile ? 1 : 2;
    }
    
    // Create infinite loop by duplicating testimonials
    const infiniteTestimonials = [...testimonials, ...testimonials, ...testimonials];
    const offset = testimonials.length;
    
    return (
      <div className="relative w-full">
        {/* Cards Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out gap-4 lg:gap-6 my-4"
       style={{
  transform: `translateX(-${(currentIndex + baseIndex) * (100 / visibleCount)}%)`,
  transition: 'transform 0.8s ease-in-out'
}}
          >
            {infiniteTestimonials.map((testimonial: Testimonial, index: number) => (
              <div
                key={`${testimonial.id}-${index}`}
                className={`shrink-0 px-1 ${
                  visibleCount === 1 
                    ? 'w-full' 
                    : 'w-1/2'
                }`}
              >
                <TestimonialItem testimonial={testimonial} index={index % testimonials.length} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots - show when showing 1 card at a time */}
        {visibleCount === 1 && testimonials.length > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_: Testimonial, index: number) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={`h-2 rounded-full transition-all duration-200 ${
                  currentIndex === index
                    ? 'bg-gray-800 w-5'
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Mobile Layout (<1024px)
  const MobileLayout = () => (
    <div className="flex flex-col max-w-lg mx-auto">
      {/* Top: Title and Quote - Compact */}
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <Quote 
            size={48} 
            className="opacity-20"
            style={{ color: content.quoteIconColor || '#9ca3af' }}
          />
        </div>
        <h3 
          className="text-xl sm:text-2xl font-semibold mb-3 leading-tight"
          style={{ color: content.textColor || '#111827' }}
        >
          {content.subtitle || 'What our customers are saying'}
        </h3>
        
        {/* Navigation - Centered */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="p-2 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="p-2 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <ArrowRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Bottom: Carousel - Full width single card */}
      <div className="w-full">
        <Carousel />
      </div>
    </div>
  );

  // Desktop Layout (>=1024px) - Two column with better proportions
  const DesktopLayout = () => {
    const isCarouselLeft = carouselPosition === 'left';
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Content - takes 3 columns on LG, 4 on XL (smaller) */}
        <div className={`lg:col-span-3 xl:col-span-4 ${isCarouselLeft ? 'order-2 lg:order-2' : 'order-1 lg:order-1'}`}>
          <LeftContent />
        </div>

        {/* Carousel - takes 9 columns on LG, 8 on XL (bigger) */}
        <div className={`lg:col-span-9 xl:col-span-8 ${isCarouselLeft ? 'order-1 lg:order-1' : 'order-2 lg:order-2'}`}>
          <Carousel />
        </div>
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      id={section?.id || "testimonials"}
      className="w-full py-12 lg:py-18 px-4 sm:px-6 lg:px-8 xl:px-12 relative transition-colors duration-300"
      style={{ 
        backgroundColor: !isPreviewMode ? '#f3f4f6' : (content.backgroundColor || '#f9fafb'),
        scrollMarginTop: '100px'
      }}
      onClick={() => onEdit && onEdit(section?.id || "testimonials", 'text', 'testimonials-header')}
    >
      {/* Edit Icon - Top Right Corner */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(section?.id || "testimonials", 'text', 'testimonials-header');
          }}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
          title="Edit testimonials section"
        >
          <Edit3 size={16} />
        </button>
      )}

      <div 
        className={`max-w-7xl mx-auto transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Header - Rating and Title */}
        <div className="text-center mb-10 lg:mb-14">
          <h2 
            className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 break-words px-4"
            style={{ color: content.textColor || '#111827' }}
          >
            {content.title || 'Reviews from real people'}
          </h2>
          
          {/* Rating Badge */}
          <div className="flex items-center justify-center gap-3">
            <span className="font-semibold text-lg" style={{ color: content.textColor || '#111827' }}>
              {avgRating}/5
            </span>
            <div className="flex">
              {renderStars(Math.round(Number(avgRating)), content.starColor)}
            </div>
            
            <span style={{ color: content.textColor ? `${content.textColor}99` : '#6b7280' }}>
              Based on {totalReviews.toLocaleString()} reviews
            </span>
          </div>
        </div>

        {/* Content - Mobile or Desktop Layout */}
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </div>
    </section>
  );
};

export default DynamicTestimonials;
