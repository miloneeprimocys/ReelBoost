import React, { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: "What is ReelBoost and how does it work?",
    answer: "ReelBoost is a comprehensive live streaming and short video platform that empowers creators to broadcast content, engage with audiences in real-time, and monetize through gifts and subscriptions. Simply sign up, set up your profile, and start streaming or uploading short videos instantly.",
    category: "General"
  },
  {
    id: '2',
    question: "How many viewers can join my live stream?",
    answer: "ReelBoost supports unlimited viewers for your live streams. Our infrastructure scales automatically to handle thousands of concurrent viewers with HD quality streaming and minimal latency.",
    category: "Live Streaming"
  },
  {
    id: '3',
    question: "How do I earn money through the platform?",
    answer: "You can earn through multiple channels: receiving virtual gifts from viewers during live streams, subscription-based fan clubs, brand partnerships, and our creator fund program. Earnings are deposited directly to your connected wallet.",
    category: "Monetization"
  },
  {
    id: '4',
    question: "Can I go live with multiple people at once?",
    answer: "Yes! ReelBoost supports multi-guest live streaming with up to 4 participants in a single stream. You can invite guests, manage their audio/video, and even host PK battles for interactive competitions.",
    category: "Live Streaming"
  },
  {
    id: '5',
    question: "How do I withdraw my earnings?",
    answer: "Withdrawals are simple and secure. Go to your wallet section, link your bank account or payment method, and request a withdrawal. Funds are typically processed within 1-3 business days with a minimum withdrawal amount of $10.",
    category: "Monetization"
  }
];

const categories = ["General", "Live Streaming", "Monetization", "Account"];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("General");

  // Filter FAQs by active category
  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <section className="w-full px-4 py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Dot Text Above Title */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#101828]" />
            <span className="text-sm font-semibold uppercase tracking-wider text-[#101828]">
              FAQ
            </span>
          </div>
          
          <h2 className="text-3xl md:text-[36px] font-semibold text-[#101828] tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg md:text-xl text-[#667085]">
            Everything you need to know about ReelBoost. Can't find what you're looking for? <a href="#" className="underline decoration-[#667085]/30 underline-offset-4 hover:text-[#101828] transition-colors">Contact our support team!</a>
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex p-1 bg-[#F9FAFB] border border-[#F2F4F7] rounded-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-semibold cursor-pointer rounded-full transition-all ${
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

        {/* FAQ Accordion - Tab Wise */}
        <div className="space-y-0 border-t border-[#EAECF0]">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#667085]">No FAQs available for this category.</p>
            </div>
          ) : (
          <>
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-[#EAECF0]">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-6 md:py-8 flex items-start justify-between text-left group transition-all"
                >
                  <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-[#101828]' : 'text-[#101828]'}`}>
                    {faq.question}
                  </span>
                  <span className="ml-4 flex-shrink-0 mt-1 cursor-pointer ">
                    {isOpen ? (
                      <MinusCircle className="w-6 h-6 text-[#98A2B3]" strokeWidth={1.5} />
                    ) : (
                      <PlusCircle className="w-6 h-6 text-[#98A2B3]" strokeWidth={1.5} />
                    )}
                  </span>
                </button>
                
                {/* Content with Animation Container */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] pb-6 md:pb-8' : 'max-h-0'
                  }`}
                >
                  <div className="text-base md:text-lg text-[#667085]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
          </>
          )}
        </div>
      </div>
    </section>
  );
}