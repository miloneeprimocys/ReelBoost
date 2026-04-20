import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Edit3, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  section?: any;
  onEdit?: (sectionId: string, contentType: string, field?: string) => void;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ section, onEdit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get testimonials content from Redux store
  const { testimonialsContent } = useAppSelector(state => state.testimonials);
  
  // Use section content if available, otherwise fallback to testimonialsContent
  const content = section?.content || testimonialsContent;
  
  const testimonials = content.testimonials || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Calculate visible testimonials based on screen size
  const getVisibleTestimonials = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1536) return 2; // 2XL screens - show 2 cards
      if (window.innerWidth >= 1024) return 3; // LG/XL screens - show 3 cards
      if (window.innerWidth >= 768) return 2; // MD screens - show 2 cards
      return 1; // SM screens - show 1 card
    }
    return 2; // Default to 2 for larger screens
  };

  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleTestimonials());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative bg-white"
      style={{ 
        backgroundColor: content.backgroundColor || '#f9fafb',
        scrollMarginTop: '100px'
      }}
      onClick={() => onEdit && onEdit(section?.id || "testimonials", 'text', 'testimonials-header')}
    >
      {/* Edit Icon - Top Right Corner - Only visible in builder mode */}
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

      <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Dot Text Above Title */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: content.dotTextColor || '#111827' }}
            />
            <span 
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: content.dotTextColor || '#111827' }}
            >
              {content.dotText || 'TESTIMONIALS'}
            </span>
          </div>
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
            style={{ color: content.textColor || '#111827' }}
          >
            {content.title || 'Reviews from real people'}
          </h2>
          
          {/* Trustpilot Rating */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-700 font-medium">4.8</span>
            <span className="text-gray-500">| 2,391 reviews</span>
          </div>

          {/* Quote Icon and Subtitle */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Quote size={32} className="text-blue-600" />
            </div>
            <h3 
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: content.textColor || '#111827' }}
            >
              {content.subtitle || 'What our customers are saying'}
            </h3>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          {testimonials.length > visibleCount && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                aria-label="Previous testimonials"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4  cursor-pointer z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                aria-label="Next testimonials"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Testimonials Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-4 sm:gap-6 lg:gap-8"
              style={{
                transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
                width: `${(testimonials.length * 100) / visibleCount}%`
              }}
            >
              {testimonials.map((testimonial: Testimonial, index: number) => (
                <div
                  key={testimonial.id}
                  className={`shrink-0 w-full ${
                    visibleCount === 3 ? 'lg:w-1/3' : 
                    visibleCount === 2 ? 'md:w-1/2 2xl:w-1/2' : 
                    'w-full'
                  } px-2`}
                >
                  <div
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 relative group cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(section?.id || "testimonials", 'testimonial', index.toString());
                    }}
                  >
                    {/* Edit Indicator */}
                    {onEdit && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Edit3 size={12} className="text-blue-500" />
                      </div>
                    )}

                    {/* Speech Bubble Tail */}
                    <div className="absolute bottom-0 left-8 transform translate-y-full">
                      <div className="w-0 h-0 border-l-20 border-l-transparent border-r-20 border-r-transparent border-t-20 border-t-white"></div>
                    </div>

                    {/* Rating */}
                    <div className="flex mb-4">
                      {renderStars(testimonial.rating || 5)}
                    </div>

                    {/* Content - with text wrapping */}
                    <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed break-all line-clamp-5">
                      {testimonial.content}
                    </p>

                    {/* Author Section */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base mr-3">
                          {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {testimonial.name}
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {Math.floor(Math.random() * 30) + 1} days ago
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {testimonials.length > visibleCount && (
            <div className="flex justify-center mt-6 sm:mt-8 gap-2">
              {Array.from({ length: Math.ceil(testimonials.length / visibleCount) }).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index * visibleCount);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    Math.floor(currentIndex / visibleCount) === index
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
