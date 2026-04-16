"use client";

import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import Navbar from "../../Common/Navbar";
import WebsiteBuilder from "./WebsiteBuilder";
import BuilderNavbar from "./WebsiteBuilder/BuilderNavbar";
import DynamicFooter from "../../sections/Home/DynamicFooter";
import Hero from "../../Pages/Home/Hero";
import DynamicHero from "../../sections/Home/DynamicHero";
import DynamicBanner from "../../sections/Home/DynamicBanner";
import DynamicFeatures from "../../sections/Home/DynamicFeatures";
import DynamicAdmin from "../../sections/Home/DynamicAdmin";
import SecondSection from "../../Pages/Home/SecondSection";
import ThirdSection from "../../Pages/Home/ThirdSection";
import FourthSection from "../../Pages/Home/FourthSection";
import FifthSection from "../../Pages/Home/FifthSection";
import SixthSection from "../../Pages/Home/SixthSection";
import DynamicBenefits from "../../sections/Home/DynamicBenefits";
import DynamicTestimonials from "../../sections/Home/DynamicTestimonials";

function HomePageContent() {
  const { sections, isBuilderMode } = useAppSelector(state => state.builder);
  const { sections: bannerSections } = useAppSelector(state => state.banner);
  const { content: navbarContent } = useAppSelector(state => state.navbar);
  const { content: footerContent } = useAppSelector(state => state.footer);
  const dispatch = useAppDispatch();
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
    
  // Combine all sections from both slices
  const allSections = [...sections, ...bannerSections];
  
  // Sort sections by order
  const sortedSections = allSections.sort((a, b) => a.order - b.order);

  const handlePublish = () => {
    // Save all changes and redirect to home
    console.log('Publishing website...');
    // This would save all the current state
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <main>
      {isBuilderMode && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <BuilderNavbar 
            currentDevice={currentDevice}
            onDeviceChange={setCurrentDevice}
            onPublish={handlePublish}
          />
        </div>
      )}
      <div className={isBuilderMode ? 'mt-16 mb-10' : 'mb-10'}>    
          {!isBuilderMode && <Navbar />}
      </div>

      {/* Render all sections in correct order */}
      {sortedSections.map((section) => {
        if (!section.visible) return null;
        
        switch (section.type) {
          case 'hero':
            return <Hero key={section.id} sectionId={section.id} />;
          case 'banner':
          case 'live-streaming':
          case 'pk-battle':
            return <DynamicBanner key={section.id} sectionId={section.id} />;
          case 'second':
            return <SecondSection key={section.id} sectionId={section.id} />;
          case 'third':
            return <ThirdSection key={section.id} sectionId={section.id} />;
          case 'fourth':
          case 'features':
            return <DynamicFeatures key={section.id} section={section} />;
          case 'admin-panel':
            return <DynamicAdmin key={section.id} />;
          case 'fifth':
            return <FifthSection key={section.id} sectionId={section.id} />;
          case 'sixth':
            return <SixthSection key={section.id} />;
          case 'benefits':
            return <DynamicBenefits key={section.id} sectionId={section.id} />;
          case 'testimonials':
            return <DynamicTestimonials key={section.id} section={section} />;
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
      })}
      
      <WebsiteBuilder />
      <DynamicFooter />
    </main>
  );
}

function HomePage() {
  return (
    <Provider store={store}>
      <HomePageContent />
    </Provider>
  );
}

export default HomePage;
