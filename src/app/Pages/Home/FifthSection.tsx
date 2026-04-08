"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useAppSelector } from "../../hooks/reduxHooks";

// --- Types ---
interface AdminTabContent {
    id: string;
    label: string;
    subtitle: string;
    title: string;
    description: string;
    points: string[];
    image: string;
    visible?: boolean;
    order: number;
    // Color properties
    labelColor?: string;
    subtitleColor?: string;
    titleColor?: string;
    descriptionColor?: string;
    pointsColor?: string;
}

interface FifthSectionProps {
    sectionId?: string;
}

const FifthSection = ({ sectionId }: FifthSectionProps) => {
    const { sections: builderSections } = useAppSelector(state => state.builder);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [animate, setAnimate] = useState(false);

    // Get this specific section from builderSections
    const section = builderSections.find(s => s.id === sectionId);

    // Get section-level colors from this specific section
    const getSectionColors = () => {
        return {
            labelColor: section?.content?.labelColor || '#2b49c5',
            subtitleColor: section?.content?.subtitleColor || '#2b49c5',
            titleColor: section?.content?.titleColor || '#111827',
            descriptionColor: section?.content?.descriptionColor || '#6b7280',
            pointsColor: section?.content?.pointsColor || '#374151',
        };
    };

    // Get tabs from this specific section's content
    const getTabs = (): AdminTabContent[] => {
        if (section?.content?.tabs && Array.isArray(section.content.tabs)) {
            return section.content.tabs
                .filter((t: AdminTabContent) => t.visible !== false)
                .sort((a: AdminTabContent, b: AdminTabContent) => (a.order || 0) - (b.order || 0));
        }
        return [];
    };

    const tabs = getTabs();
    const sectionColors = getSectionColors();
    const layout = section?.content?.layout || 'left';
    const [activeTab, setActiveTab] = useState<AdminTabContent>(tabs[0] || {
        id: '',
        label: '',
        subtitle: '',
        title: '',
        description: '',
        points: [],
        image: '/Admin1.svg'
    });

    // Update active tab when tabs change
    useEffect(() => {
        const currentTabs = getTabs();
        console.log('FifthSection useEffect - tabs updated:', currentTabs);
        console.log('FifthSection useEffect - activeTab before update:', activeTab);
        if (currentTabs.length > 0) {
            // Always update activeTab with the latest data from currentTabs
            const updatedTab = currentTabs.find(t => t.id === activeTab.id);
            if (updatedTab) {
                // Only update if the data has actually changed to prevent infinite loops
                if (JSON.stringify(updatedTab) !== JSON.stringify(activeTab)) {
                    console.log('FifthSection - updating activeTab with new data:', updatedTab);
                    setActiveTab(updatedTab);
                }
            } else {
                // If current active tab is not in the new tabs list, switch to first
                console.log('FifthSection - activeTab not found, switching to first tab');
                setActiveTab(currentTabs[0]);
            }
        }
    }, [builderSections]);

    // This ensures the section is linkable from your Navbar
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
        if (tab.id === activeTab.id) return;
        setAnimate(false);
        setTimeout(() => {
            setActiveTab(tab);
            setAnimate(true);
        }, 300);
    };

    if (tabs.length === 0) {
        return null;
    }

    return (
        <section 
            id={sectionId || "admin-panel"} 
            ref={sectionRef} 
            className="w-full bg-white py-12 sm:py-16 md:py-20 overflow-x-hidden scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
                {/* Header Section */}
                <div className="sm:mb-6 md:mb-8 mb-4 text-center lg:text-left">
                    <span 
                        className="text-xs sm:text-sm font-semibold underline underline-offset-4 sm:underline-offset-8 decoration-2 uppercase tracking-wide break-words inline-block max-w-full"
                        style={{ color: section?.content?.headerSubtitleColor || '#2b49c5' }}
                    >
                        {section?.content?.headerSubtitle || 'Admin Panel Features'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-3 sm:mt-4 md:mt-6 leading-tight break-words max-w-full" style={{ color: section?.content?.mainTitleColor || '#111827' }}>
                        {section?.content?.mainTitle || 'Describing'}
                        <span 
                            className="px-1 py-0.5 sm:py-1 ml-1 sm:ml-2 inline-block break-words"
                            style={{ 
                                backgroundColor: section?.content?.highlightedTitleBgColor || '#EEF2FF',
                                color: section?.content?.highlightedTitleColor || '#2b49c5'
                            }}
                        >
                            {section?.content?.highlightedTitle || 'Admin Panel'}
                        </span>
                    </h2>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-t border-gray-200 mb-6 md:mb-10 lg:mb-12 gap-3 sm:gap-4 md:gap-6 lg:gap-10 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab)}
                            className={`pb-3 sm:pb-4 md:pb-5  pt-3 sm:pt-4 md:pt-5 text-[10px] sm:text-[11px] md:text-[12px] lg:text-[14px] font-bold tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.18em] lg:tracking-[0.2em] transition-all duration-300 border-b-2 whitespace-nowrap cursor-pointer uppercase ${
                                activeTab.id === tab.id ? "border-[#2b49c5]" : "border-transparent text-gray-700 hover:text-black"
                            }`}
                            style={{ 
                                color: activeTab.id === tab.id ? sectionColors.labelColor : undefined
                            }}
                        >
                            <span className="break-words max-w-[120px] sm:max-w-[150px] md:max-w-none inline-block">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-14 items-center">
                    {layout === 'left' ? (
                        <>
                            {/* Left Side: Image */}
                            <div className={`relative transition-all duration-700 ease-in-out transform ${animate ? "translate-x-0 opacity-100" : "lg:-translate-x-20 translate-x-20 opacity-0"}`}>
                                <div className="rounded-[15px] overflow-hidden shadow-2xl">
                                    <Image
                                        src={activeTab.image || '/Admin1.svg'}
                                        alt={activeTab.title}
                                        width={800}
                                        height={600}
                                        className="w-full h-[300px] md:h-[380px] lg:h-[450px] xl:h-[550px] object-cover"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Right Side: Content */}
                            <div className={`flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 transition-all duration-700 ease-in-out transform ${animate ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}>
                                <div className="overflow-x-hidden">
                                    <span 
                                        className="font-bold underline underline-offset-4 decoration-2 text-[11px] sm:text-xs md:text-sm uppercase tracking-widest block mb-2 sm:mb-3 md:mb-4 lg:mb-5 break-words max-w-full"
                                        style={{ color: sectionColors.subtitleColor }}
                                    >
                                        {activeTab.subtitle}
                                    </span>
                                    <h3 
                                        className="text-xl sm:text-2xl md:text-3xl lg:text-[42px] font-extrabold leading-tight mt-1 sm:mt-2 break-words max-w-full"
                                        style={{ color: sectionColors.titleColor }}
                                    >
                                        {activeTab.title}
                                    </h3>
                                    <p 
                                        className="font-medium leading-relaxed tracking-wide text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] mt-3 sm:mt-4 md:mt-5 lg:mt-6 break-words max-w-full"
                                        style={{ color: sectionColors.descriptionColor }}
                                    >
                                        {activeTab.description}
                                    </p>
                                </div>

                                {/* Feature Points - Vertically Stacked */}
                                <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-1 sm:py-2 overflow-x-hidden">
                                    {activeTab.points?.map((point, index) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-2.5 md:gap-3 group">
                                            <div className="flex-shrink-0 pt-0.5">
                                                <CheckCircle size={18} className="sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] xl:w-[26px] xl:h-[26px]" style={{ color: sectionColors.subtitleColor }} />
                                            </div>
                                            <span 
                                                className="font-semibold text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] leading-relaxed break-words flex-1"
                                                style={{ color: sectionColors.pointsColor }}
                                            >
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
                            <div className={`relative transition-all duration-700 ease-in-out transform ${animate ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"} lg:order-2`}>
                                <div className="rounded-[15px] overflow-hidden shadow-2xl">
                                    <Image
                                        src={activeTab.image || '/Admin1.svg'}
                                        alt={activeTab.title}
                                        width={800}
                                        height={600}
                                        className="w-full h-[300px] md:h-[380px] lg:h-[450px] xl:h-[550px] object-cover"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Left Side: Content */}
                            <div className={`flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 transition-all duration-700 ease-in-out transform ${animate ? "translate-x-0 opacity-100" : "lg:-translate-x-20 translate-x-20 opacity-0"} lg:order-1`}>
                                <div className="overflow-x-hidden">
                                    <span 
                                        className="font-bold underline underline-offset-4 decoration-2 text-[11px] sm:text-xs md:text-sm uppercase tracking-widest block mb-2 sm:mb-3 md:mb-4 lg:mb-5 break-words max-w-full"
                                        style={{ color: sectionColors.subtitleColor }}
                                    >
                                        {activeTab.subtitle}
                                    </span>
                                    <h3 
                                        className="text-xl sm:text-2xl md:text-3xl lg:text-[42px] font-extrabold leading-tight mt-1 sm:mt-2 break-words max-w-full"
                                        style={{ color: sectionColors.titleColor }}
                                    >
                                        {activeTab.title}
                                    </h3>
                                    <p 
                                        className="font-medium leading-relaxed tracking-wide text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] mt-3 sm:mt-4 md:mt-5 lg:mt-6 break-words max-w-full"
                                        style={{ color: sectionColors.descriptionColor }}
                                    >
                                        {activeTab.description}
                                    </p>
                                </div>

                                {/* Feature Points - Vertically Stacked */}
                                <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-1 sm:py-2 overflow-x-hidden">
                                    {activeTab.points?.map((point, index) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-2.5 md:gap-3 group">
                                            <div className="flex-shrink-0 pt-0.5">
                                                <CheckCircle size={18} className="sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] xl:w-[26px] xl:h-[26px]" style={{ color: sectionColors.subtitleColor }} />
                                            </div>
                                            <span 
                                                className="font-semibold text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] leading-relaxed break-words flex-1"
                                                style={{ color: sectionColors.pointsColor }}
                                            >
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

export default FifthSection;