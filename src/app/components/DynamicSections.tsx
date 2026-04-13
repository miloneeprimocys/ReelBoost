"use client";

import React from 'react';
import { useAppSelector } from '../hooks/reduxHooks';
import DynamicHero from '../sections/Home/DynamicHero';
import SecondSection from '../Pages/Home/SecondSection';
import ThirdSection from '../Pages/Home/ThirdSection';
import FourthSection from '../Pages/Home/FourthSection';
import FifthSection from '../Pages/Home/FifthSection';
import SixthSection from '../Pages/Home/SixthSection';
import DynamicBenefits from '../sections/Home/DynamicBenefits';

const DynamicSections: React.FC = () => {
  const { sections } = useAppSelector(state => state.builder);
  const { activeSection: activeBannerSection } = useAppSelector(state => state.banner);

  const renderSection = (section: any) => {
    if (!section.visible) return null;

    switch (section.type) {
      case 'hero':
        // Hero sections are now handled in HomePage, return null here
        return null;
      case 'second':
        // Only render SecondSection if it's the currently active banner section
        return activeBannerSection === section.id ? <SecondSection key={section.id} /> : null;
      case 'third':
        // Only render ThirdSection if it's the currently active banner section
        return activeBannerSection === section.id ? <ThirdSection key={section.id} /> : null;
      case 'fourth':
        return <FourthSection key={section.id} />;
      case 'fifth':
        return <FifthSection key={section.id} />;
      case 'sixth':
      case 'benefits':
        return <DynamicBenefits key={section.id} sectionId={section.id} />;
      default:
        return (
          <div key={section.id} className="py-16 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.name}</h2>
              <p className="text-gray-600">Section content not implemented yet</p>
            </div>
          </div>
        );
    }
  };

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <main>
      {sortedSections.map(renderSection)}
    </main>
  );
};

export default DynamicSections;
