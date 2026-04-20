"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Edit3, Check, Star, Sparkles } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  badgeText?: string;
}

interface DynamicSubscriptionPlanProps {
  section?: any;
  onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'plan' | null, elementId?: string) => void;
}

const DynamicSubscriptionPlan = ({ section, onEdit }: DynamicSubscriptionPlanProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get subscription plan content from Redux store
  const { subscriptionPlanContent } = useAppSelector(state => state.subscriptionPlan);
  
  // Check if we're in preview mode (builder)
  const isPreviewMode = useAppSelector(state => state.builder.isPreviewMode);
  
  // Default content with fallback values
  const defaultContent = {
    title: 'Choose Your Plan',
    subtitle: 'Flexible pricing options for every stage of your journey',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    cardBackgroundColor: '#ffffff',
    cardTextColor: '#374151',
    cardBorderColor: '#e5e7eb',
    popularCardBackgroundColor: '#f0f9ff',
    popularCardBorderColor: '#3b82f6',
    buttonBackgroundColor: '#111827',
    buttonTextColor: '#ffffff',
    popularButtonBackgroundColor: '#3b82f6',
    popularButtonTextColor: '#ffffff',
    dotText: 'Pricing',
    dotTextColor: '#111827',
    showDotText: true,
    tickColor: '#10b981',
    plans: []
  };

  // Use section content if available, otherwise fallback to subscriptionPlanContent
  // Merge with defaults to ensure all required fields exist
  let content = {
    ...defaultContent,
    ...subscriptionPlanContent,
    ...section?.content,
    // Ensure nested arrays are properly merged
    plans: section?.content?.plans || subscriptionPlanContent?.plans || defaultContent.plans
  };

  const plans = content.plans || [];

  // Intersection Observer for scroll animation
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

    return () => observer.disconnect();
  }, []);

  const handleEdit = (contentType: 'text' | 'style' | 'plan' | null = null, elementId?: string) => {
    if (onEdit && section) {
      onEdit(section.id, contentType, elementId);
    }
  };

  // Determine grid classes based on number of plans
  const getGridClasses = () => {
    if (plans.length <= 1) {
      return 'grid-cols-1 justify-items-center';
    } else if (plans.length === 2) {
      return 'grid-cols-1 md:grid-cols-2 justify-items-center';
    } else {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center';
    }
  };

  return (
    <section
      ref={sectionRef}
      id={section?.id || 'subscription-plan-1'}
      className="relative w-full py-16 md:py-24 transition-all duration-500 bg-white"
      style={{ 
        backgroundColor: content.backgroundColor,
        '--section-bg': content.backgroundColor
      } as React.CSSProperties}
      onClick={() => handleEdit()}
    >
      {/* Edit Button - Only show in builder mode */}
      {!isPreviewMode && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100"
          style={{ opacity: isPreviewMode ? 0 : undefined }}
        >
          <Edit3 className="w-4 h-4 text-gray-700" />
        </button>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div 
          className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit('text');
          }}
        >
          {content.showDotText && content.dotText && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <div 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: content.dotTextColor || content.textColor }}
              />
              <span 
                className="text-sm font-semibold uppercase tracking-wider break-words"
                style={{ color: content.dotTextColor || content.textColor }}
              >
                {content.dotText}
              </span>
            </div>
          )}
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 break-words w-full"
            style={{ color: content.textColor }}
          >
            {content.title}
          </h2>
          <p 
            className="text-lg md:text-xl max-w-2xl mx-auto break-words -mb-2 w-full"
            style={{ color: content.textColor, opacity: 0.7 }}
          >
            {content.subtitle}
          </p>
        </div>

        {/* Plans Grid */}
        <div className={`grid gap-8 md:gap-12 ${getGridClasses()}`}>
          {plans.map((plan: SubscriptionPlan, index: number) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 md:p-8 transition-all duration-500 hover:shadow-xl w-full max-w-md ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                backgroundColor: plan.isPopular ? content.popularCardBackgroundColor : content.cardBackgroundColor,
                borderColor: plan.isPopular ? content.popularCardBorderColor : content.cardBorderColor,
                borderWidth: '2px',
                transitionDelay: `${index * 100}ms`
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit('plan', plan.id);
              }}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                  style={{ 
                    backgroundColor: content.popularCardBorderColor,
                    color: content.popularButtonTextColor
                  }}
                >
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="break-words">{plan.badgeText || 'Most Popular'}</span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 
                  className="text-xl md:text-2xl font-bold mb-2 break-words w-full"
                  style={{ color: content.cardTextColor }}
                >
                  {plan.name}
                </h3>
                <p 
                  className="text-sm mb-4 break-words w-full"
                  style={{ color: content.cardTextColor, opacity: 0.7 }}
                >
                  {plan.description}
                </p>
                <div className="flex flex-row items-baseline justify-center gap-1 flex-wrap">
                  <span 
                    className="text-4xl md:text-5xl font-bold"
                    style={{ color: content.cardTextColor, overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}
                  >
                    {plan.price}
                  </span>
                  <span 
                    className="text-sm"
                    style={{ color: content.cardTextColor, opacity: 0.7 }}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature: string, featureIndex: number) => (
                  <li 
                    key={featureIndex}
                    className="flex items-start gap-3"
                    style={{ color: content.cardTextColor }}
                  >
                    <Check 
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: content.tickColor || (plan.isPopular ? content.popularCardBorderColor : content.buttonBackgroundColor) }}
                    />
                    <span className="text-sm break-words w-full">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: plan.isPopular ? content.popularButtonBackgroundColor : content.buttonBackgroundColor,
                  color: plan.isPopular ? content.popularButtonTextColor : content.buttonTextColor
                }}
              >
                <span className="break-words w-full">{plan.buttonText || 'Get Started'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DynamicSubscriptionPlan;