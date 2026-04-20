"use client";

import React from 'react';
import { Check, Plus, ArrowRight } from 'lucide-react';

interface PlanProps {
  name: string;
  price: string;
  description?: string;
  features: string[];
  buttonText: string;
  isRecommended?: boolean;
  badgeText?: string;
}

const PlanCard = ({ name, price, description, features, buttonText, isRecommended, badgeText }: PlanProps) => {
  return (
    <div className={`relative flex flex-col rounded-[24px] p-6 md:p-8 transition-all duration-300 w-full max-w-md ${
      isRecommended 
        ? 'bg-[#1e2230] text-white scale-105 z-10 shadow-2xl' 
        : 'bg-white text-gray-900 border border-gray-100 shadow-xl'
    }`}>
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
          {badgeText || 'Recommended'}
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 w-full break-words">{name}</h3>
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-sm font-medium opacity-80">{price.includes('MYR') ? 'MYR' : ''}</span>
          <span className="text-3xl font-bold" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>{price.replace('MYR', '')}</span>
          {price !== 'Custom Plan' && <span className="text-lg opacity-60">/m</span>}
        </div>
      </div>

      <div className="h-px w-full bg-gray-200 mb-8 opacity-20" />

      <ul className="flex-grow space-y-4 mb-10">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Plus className={`w-4 h-4 mt-1 shrink-0 ${isRecommended ? 'text-[#a3e635]' : 'text-[#a3e635]'}`} />
            <span className={`text-sm ${isRecommended ? 'text-gray-300' : 'text-gray-600'} break-words w-full`}>
              {feature}
            </span>
          </li>
        ))}
        {description && (
          <p className="text-center text-sm text-gray-500 leading-relaxed px-4 break-words w-full">
            {description}
          </p>
        )}
      </ul>

      <button className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
        isRecommended 
          ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb]' 
          : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
      }`}>
        <span className="break-words">{buttonText}</span>
        <ArrowRight className="w-4 h-4 shrink-0" />
      </button>
    </div>
  );
};

const SubscriptionPlan = () => {
  const plans = [
    {
      name: "Standard",
      price: "MYR 1,099",
      description: "Perfect for individuals getting started",
      features: [
        "One request at a time",
        "Up to 2 brands",
        "3x revisions per design",
        "Average 2-3 days delivery"
      ],
      buttonText: "Get Started",
      isRecommended: false
    },
    {
      name: "Premium",
      price: "MYR 2,399",
      description: "Best for growing businesses",
      features: [
        "One request at a time",
        "Unlimited brands",
        "Unlimited revisions",
        "Priority support"
      ],
      buttonText: "Get Started",
      isRecommended: true,
      badgeText: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "MYR 5,999",
      description: "For large scale operations",
      features: [
        "One request at a time",
        "Up to 3 brands",
        "Unlimited revisions",
        "Average 48 hrs delivery",
        "Chat support 24/7"
      ],
      buttonText: "Book a Call",
      isRecommended: false
    }
  ];

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
    <section className="bg-white py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1e2230] mb-6 break-words w-full overflow-hidden">
            Subscription Plans
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed break-words w-full overflow-hidden">
            Choose the subscription plan that suits you and your business best.
          </p>
        </div>

        <div className={`grid gap-8 md:gap-12 ${getGridClasses()}`}>
          {plans.map((plan, index) => (
            <PlanCard key={index} name={plan.name} price={plan.price} description={plan.description} features={plan.features} buttonText={plan.buttonText} isRecommended={plan.isRecommended} badgeText={plan.badgeText} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlan;