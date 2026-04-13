"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useAppSelector } from "../../hooks/reduxHooks";

interface AdminTabContent {
  id: string;
  label: string;
  subtitle: string;
  title: string;
  description: string;
  points: string[];
  image: string;
  order: number;
  visible: boolean;
}

const DynamicAdmin = () => {
  const { sections: adminSections, activeSection: adminActiveSection } = useAppSelector(state => state.admin);
  const { sections: builderSections } = useAppSelector(state => state.builder);
  const [activeTab, setActiveTab] = useState<AdminTabContent | null>(null);
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get tabs from ALL fifth sections in builderSlice
  const getAllTabs = (): AdminTabContent[] => {
    const tabs: AdminTabContent[] = [];
    
    // Get tabs from ALL fifth sections in builderSlice (not just the first one)
    const fifthSections = builderSections.filter(s => s.type === 'fifth' || s.id.startsWith('fifth-'));
    console.log('DynamicAdmin - fifthSections found:', fifthSections.length);
    
    fifthSections.forEach(fifthSection => {
      console.log('DynamicAdmin - fifthSection:', fifthSection.id, 'tabs:', fifthSection.content?.tabs);
      if (fifthSection?.content?.tabs && Array.isArray(fifthSection.content.tabs)) {
        // Only include visible tabs from this section
        const visibleTabs = fifthSection.content.tabs.filter((t: AdminTabContent) => t.visible !== false);
        console.log('DynamicAdmin - visibleTabs:', visibleTabs.map((t: AdminTabContent) => ({ id: t.id, label: t.label, points: t.points })));
        tabs.push(...visibleTabs);
      }
    });
    
    console.log('DynamicAdmin - total tabs:', tabs.length);
    // If no tabs found, return empty array
    return tabs;
  };

  const visibleSections = getAllTabs();
  
  // Get layout from first fifth section
  const getLayout = () => {
    const firstFifthSection = builderSections.find(s => s.type === 'fifth' || s.id.startsWith('fifth-'));
    return firstFifthSection?.content?.layout || 'left';
  };
  
  const layout = getLayout();

  // Helper function to get first fifth section for header content
  const getFirstFifthSection = () => {
    return builderSections.find(s => s.type === 'fifth' || s.id.startsWith('fifth-'));
  };

  useEffect(() => {
    // Set initial active tab
    if (visibleSections.length > 0 && !activeTab) {
      setActiveTab(visibleSections[0])
    }
  }, [visibleSections, activeTab]);

  useEffect(() => {
    // Update active tab when adminActiveSection changes from builder
    if (adminActiveSection) {
      const section = visibleSections.find((s: AdminTabContent) => s.id === adminActiveSection);
      if (section) {
        setActiveTab(section);
      }
    }
  }, [adminActiveSection, visibleSections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = (tab: AdminTabContent) => {
    if (tab.id === activeTab?.id) return;
    setAnimate(false);
    setTimeout(() => {
      setActiveTab(tab);
      setAnimate(true);
    }, 300);
  };

  if (!activeTab) {
    return (
      <section 
        id="admin-panel" 
        ref={sectionRef} 
        className="w-full bg-white py-20 overflow-hidden scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center overflow-x-hidden">
          <p className="text-gray-500 break-words">No admin sections available. Please add admin sections in the builder.</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="admin-panel" 
      ref={sectionRef} 
      className="w-full bg-white py-12 sm:py-16 md:py-20 overflow-x-hidden scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Header Section */}
        <div className="sm:mb-6 md:mb-8 mb-4 text-center lg:text-left">
          <span 
            className="text-xs sm:text-sm font-semibold underline underline-offset-4 sm:underline-offset-8 decoration-2 uppercase tracking-wide break-words inline-block max-w-full"
            style={{ color: getFirstFifthSection()?.content?.headerSubtitleColor || '#2b49c5' }}
          >
            {getFirstFifthSection()?.content?.headerSubtitle || 'Admin Panel Features'}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-3 sm:mt-4 md:mt-6 leading-tight break-words hyphens-auto" style={{ color: getFirstFifthSection()?.content?.mainTitleColor || '#111827' }}>
            {getFirstFifthSection()?.content?.mainTitle || 'Describing'}
            <span 
              className="px-1 py-0.5 sm:py-1 ml-1 sm:ml-2 inline-block wrap-break-word hyphens-auto max-w-full"
              style={{ 
                backgroundColor: getFirstFifthSection()?.content?.highlightedTitleBgColor || '#EEF2FF',
                color: getFirstFifthSection()?.content?.highlightedTitleColor || '#2b49c5'
              }}
            >
              {getFirstFifthSection()?.content?.highlightedTitle || 'Admin Panel'}
            </span>
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-t border-gray-200 mb-6 md:mb-10 lg:mb-16 gap-2 sm:gap-3 md:gap-4 lg:gap-6 overflow-x-auto no-scrollbar">
          {visibleSections.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={`pb-3 sm:pb-4 md:pb-5 lg:pb-6 pt-3 sm:pt-4 md:pt-5 lg:pt-6 text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] font-bold tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.18em] transition-all duration-300 border-b-2 whitespace-nowrap cursor-pointer uppercase flex-shrink-0 min-w-0 ${
                activeTab?.id === tab.id 
                  ? "border-[#2b49c5] text-[#2b49c5]" 
                  : "border-transparent text-gray-700 hover:text-black"
              }`}
            >
              <span className="break-words max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px] truncate inline-block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 xl:gap-14 items-center">
          {layout === 'left' ? (
            <>
              {/* Left Side: Image */}
              <div className={`relative transition-all duration-700 ease-in-out transform ${
                animate ? "translate-x-0 opacity-100" : "lg:-translate-x-20 translate-x-20 opacity-0"
              }`}>
                <div className="rounded-[15px] overflow-hidden shadow-2xl">
                  <Image
                    src={activeTab.image}
                    alt={activeTab.title}
                    width={800}
                    height={600}
                    className="w-full h-[300px] md:h-[380px] lg:h-[450px] 2xl:h-[550px] object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Right Side: Content */}
              <div className={`flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 transition-all duration-700 ease-in-out transform ${
                animate ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
              }`}>
                <div className="overflow-x-hidden">
                  <span className="text-[#2b49c5] font-bold underline underline-offset-4 decoration-2 text-[11px] sm:text-xs md:text-sm uppercase tracking-widest block mb-2 sm:mb-3 md:mb-4 lg:mb-5 break-words max-w-full">
                    {activeTab.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-[42px] font-extrabold text-[#111827] leading-tight mt-1 sm:mt-2 break-words max-w-full">
                    {activeTab.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed tracking-wide text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] mt-3 sm:mt-4 md:mt-5 lg:mt-6 break-words max-w-full">
                    {activeTab.description}
                  </p>
                </div>

                {/* Feature Points - Vertically Stacked */}
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-1 sm:py-2 overflow-x-hidden">
                  {activeTab.points?.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-2.5 md:gap-3 group">
                      <div className="flex-shrink-0 pt-0.5">
                        <CheckCircle size={18} className="text-[#2b49c5] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] xl:w-[26px] xl:h-[26px]" />
                      </div>
                      <span className="text-[#374151] font-semibold text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] leading-relaxed break-words flex-1">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Right Side: Image */}
              <div className={`relative transition-all duration-700 ease-in-out transform ${
                animate ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
              } lg:order-2`}>
                <div className="rounded-[15px] overflow-hidden shadow-2xl">
                  <Image
                    src={activeTab.image}
                    alt={activeTab.title}
                    width={800}
                    height={600}
                    className="w-full h-[300px] md:h-[380px] lg:h-[450px] 2xl:h-[550px] object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Left Side: Content */}
              <div className={`flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 transition-all duration-700 ease-in-out transform ${
                animate ? "translate-x-0 opacity-100" : "lg:-translate-x-20 translate-x-20 opacity-0"
              } lg:order-1`}>
                <div className="overflow-x-hidden">
                  <span className="text-[#2b49c5] font-bold underline underline-offset-4 decoration-2 text-[11px] sm:text-xs md:text-sm uppercase tracking-widest block mb-2 sm:mb-3 md:mb-4 lg:mb-5 break-words max-w-full">
                    {activeTab.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-[42px] font-extrabold text-[#111827] leading-tight mt-1 sm:mt-2 break-words max-w-full">
                    {activeTab.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed tracking-wide text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] mt-3 sm:mt-4 md:mt-5 lg:mt-6 break-words max-w-full">
                    {activeTab.description}
                  </p>
                </div>

                {/* Feature Points - Vertically Stacked */}
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-1 sm:py-2 overflow-x-hidden">
                  {activeTab.points?.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-2.5 md:gap-3 group">
                      <div className="flex-shrink-0 pt-0.5">
                        <CheckCircle size={18} className="text-[#2b49c5] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] xl:w-[26px] xl:h-[26px]" />
                      </div>
                      <span className="text-[#374151] font-semibold text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] leading-relaxed break-words flex-1">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default DynamicAdmin;