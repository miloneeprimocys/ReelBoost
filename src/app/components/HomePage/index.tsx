"use client";

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { useAppSelector } from '../../hooks/reduxHooks';
import Navbar from "../../Common/Navbar";
import WebsiteBuilder from "./WebsiteBuilder";
import Footer from "../../Common/Footer";
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

function HomePageContent() {
  const { sections } = useAppSelector(state => state.builder);
  const { sections: bannerSections } = useAppSelector(state => state.banner);
  
  // Combine all sections from both slices
  const allSections = [...sections, ...bannerSections];
  
  // Sort sections by order
  const sortedSections = allSections.sort((a, b) => a.order - b.order);

  return (
    <main>
      <div className='mb-10'>    
          <Navbar />
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
      <Footer />
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
