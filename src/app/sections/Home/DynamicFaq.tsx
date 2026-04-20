"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Edit3, PlusCircle, MinusCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface DynamicFaqProps {
  section?: any;
  onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'faq' | null, elementId?: string) => void;
}

const DynamicFaq = ({ section, onEdit }: DynamicFaqProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { faqContent } = useAppSelector(state => state.faq);

  
  const isPreviewMode = useAppSelector(state => state.builder.isPreviewMode);

  let content = section?.content || faqContent;

  // Ensure backgroundColor is always set to prevent dark background issues
  // If backgroundColor is missing, undefined, or empty, use default white color
  if (!content.backgroundColor || content.backgroundColor === 'undefined' || content.backgroundColor === 'null') {
    content = { ...content, backgroundColor: '#ffffff' };
  }

  const allFaqs = content.faqs || [];
  const categories = content.categories || ['General'];
  const [activeCategory, setActiveCategory] = useState(content.activeCategory || 'General');
  
  // Filter FAQs by active category
  const faqs = activeCategory === 'All' 
    ? allFaqs 
    : allFaqs.filter((faq: FAQItem) => faq.category === activeCategory || !faq.category);

  useEffect(() => {
    setActiveCategory(content.activeCategory || 'General');
  }, [content.activeCategory]);

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

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setOpenIndex(null);
  };
  
  // Get category color styles
  const getCategoryStyle = (cat: string) => {
    const isActive = activeCategory === cat;
    return {
      backgroundColor: isActive ? (content.tabActiveBgColor || '#ffffff') : 'transparent',
      color: isActive ? (content.tabActiveTextColor || content.textColor || '#344054') : (content.tabInactiveTextColor || content.accentColor || '#667085'),
      borderColor: isActive ? (content.tabActiveBorderColor || content.borderColor || '#D0D5DD') : 'transparent',
      borderWidth: '1px',
      borderStyle: 'solid'
    };
  };
  

  return (
    <section
      ref={sectionRef}
      id={section?.id || "faq"}
      className="w-full px-4 py-16 md:py-24 relative transition-colors duration-300 bg-white"
      style={{
        backgroundColor: content.backgroundColor || '#ffffff',
        scrollMarginTop: '100px'
      }}
      onClick={() => onEdit && onEdit(section?.id || "faq", 'text', 'faq-header')}
    >
      {/* Edit Icon - Top Right Corner */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(section?.id || "faq", 'text', 'faq-header');
          }}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
          title="Edit FAQ section"
        >
          <Edit3 size={16} />
        </button>
      )}

      <div
        className={`max-w-[768px] mx-auto transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Dot Text Above Title */}
          {content.showDotText !== false && content.dotText && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: content.dotTextColor || '#101828' }}
              />
              <span
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: content.dotTextColor || '#101828' }}
              >
                {content.dotText}
              </span>
            </div>
          )}

          <h2
            className="text-3xl md:text-[36px] font-semibold tracking-tight mb-4"
            style={{ color: content.textColor || '#101828' }}
          >
            {content.title || 'Frequently asked questions'}
          </h2>
          <p
            className="text-lg md:text-xl -mb-4"
            style={{ color: content.accentColor || '#667085' }}
          >
            {content.subtitle || "Can't find what you're looking for? Chat to our friendly team!"}
          </p>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex justify-center mb-12">
            <div className="relative inline-flex p-1 bg-[#F9FAFB] border border-[#F2F4F7] rounded-full">
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(cat);
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm font-semibold rounded-full transition-all ${
                    activeCategory === cat
                      ? "bg-white text-[#344054] shadow-sm"
                      : "text-[#667085] hover:text-[#344054]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Accordion - Tab Wise */}
        <div
          className="space-y-0 rounded-lg overflow-hidden"
          style={{ 
            borderTop: `1px solid ${content.borderColor || '#EAECF0'}`,
            backgroundColor: content.accordionBgColor || 'transparent'
          }}
        >
          {faqs.length === 0 ? (
            <div className="py-12 text-center">
              <p style={{ color: content.accentColor || '#667085' }}>
                No FAQs available for this category.
              </p>
            </div>
          ) : (
          <>
          {faqs.map((faq: FAQItem, index: number) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="group cursor-pointer transition-colors relative"
                style={{ 
                  borderBottom: `1px solid ${content.borderColor || '#EAECF0'}`,
                  backgroundColor: isOpen ? (content.activeAccordionBgColor || 'transparent') : 'transparent'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(section?.id || "faq", 'faq', faq.id);
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex(isOpen ? null : index);
                  }}
                  className="w-full p-4 flex items-start justify-between text-left transition-all"
                >
                  <span
                    className="text-lg font-medium pr-4 wrap-break-word flex-1"
                    style={{ color: content.textColor || '#101828' }}
                  >
                    {faq.question}
                  </span>
                  <span className="ml-4 shrink-0 mt-1 cursor-pointer">
                    {isOpen ? (
                      <MinusCircle
                        className="w-6 h-6"
                        style={{ color: content.minusIconColor || content.accentColor || '#98A2B3' }}
                        strokeWidth={1.5}
                      />
                    ) : (
                      <PlusCircle
                        className="w-6 h-6"
                        style={{ color: content.plusIconColor || content.accentColor || '#98A2B3' }}
                        strokeWidth={1.5}
                      />
                    )}
                  </span>
                </button>

                {/* Content with Animation Container */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out px-4 ${
                    isOpen ? 'max-h-[500px] pb-6 md:pb-8' : 'max-h-0'
                  }`}
                >
                  <div
                    className="text-base md:text-lg leading-relaxed wrap-break-word overflow-y-auto max-h-96"
                    style={{ color: content.accentColor || '#667085' }}
                  >
                    {faq.answer}
                  </div>
                </div>

                {/* Edit Indicator */}
                {onEdit && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Edit3 size={12} className="text-blue-500" />
                  </div>
                )}
              </div>
            );
          })}
          </>
          )}
        </div>
      </div>
    </section>
  );
};

export default DynamicFaq;
