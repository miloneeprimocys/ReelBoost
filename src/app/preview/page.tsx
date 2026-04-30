'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/app/store'
import { useAppSelector } from '@/app/store/hooks';
import { syncBuilderState } from '@/app/store/builderSlice';
import { syncPagesState } from '@/app/store/pagesSlice';
import { syncBannerState } from '@/app/store/bannerSlice';
import DynamicNavbar from '@/app/sections/Home/DynamicNavbar';
import DynamicFooter from '@/app/sections/Home/DynamicFooter';
import Hero from '@/app/Pages/Home/Hero';
import SecondSection from '@/app/Pages/Home/SecondSection';
import ThirdSection from '@/app/Pages/Home/ThirdSection';
import FourthSection from '@/app/Pages/Home/FourthSection';
import FifthSection from '@/app/Pages/Home/FifthSection';
import SixthSection from '@/app/Pages/Home/SixthSection';
import DynamicBanner from '@/app/sections/Home/DynamicBanner';
import DynamicFeatures from '@/app/sections/Home/DynamicFeatures';
import DynamicBenefits from '@/app/sections/Home/DynamicBenefits';
import DynamicContactHero from '@/app/sections/Home/ContactHero';
import DynamicTestimonials from '@/app/sections/Home/DynamicTestimonials';
import DynamicFaq from '@/app/sections/Home/DynamicFaq';
import DynamicSubscriptionPlan from '@/app/sections/Home/DynamicSubscriptionPlan';
import { Plus } from 'lucide-react';

function PreviewContent() {
  const { sections } = useAppSelector((state) => state.builder);
  const { sections: bannerSections } = useAppSelector((state) => state.banner);
  const { pages } = useAppSelector((state) => state.pages);
  const [isInIframe, setIsInIframe] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // Track current page from parent
  const dispatch = useDispatch();

  // Merge builder sections with banner sections for preview
  const allSections = useMemo(() => {
    console.log('allSections useMemo running, sections:', sections?.length, 'bannerSections:', bannerSections?.length);
    const sectionsMap = new Map();
    
    // Add all builder sections first
    if (sections) {
      sections.forEach((section: any) => {
        sectionsMap.set(section.id, { ...section, source: 'builder' });
      });
    }
    
    // Add banner sections from banner slice (these are the dynamic ones)
    if (bannerSections) {
      bannerSections.forEach((section: any) => {
        if (!sectionsMap.has(section.id)) {
          sectionsMap.set(section.id, { ...section, source: 'banner' });
        }
      });
    }
    
    const result = Array.from(sectionsMap.values());
    console.log('allSections result:', result.map(s => ({ id: s.id, source: s.source, visible: s.visible })));
    return result;
  }, [sections, bannerSections]);

  useEffect(() => {
    // Check if we're inside an iframe
    setIsInIframe(window.self !== window.top);

    // Handle messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SCROLL_TO_SECTION') {
        const { sectionId } = event.data;
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Use CSS class instead of inline styles to avoid hydration mismatch
          element.classList.add('scroll-highlight');
          setTimeout(() => {
            element.classList.remove('scroll-highlight');
          }, 1000);
        }
      } else if (event.data && event.data.type === 'SYNC_STATE') {
        // Receive state from parent window
        console.log('Received SYNC_STATE from parent', event.data);
        const { builderState, pagesState, bannerState, currentPage: pageFromParent } = event.data;
        if (builderState) {
          dispatch(syncBuilderState(builderState));
        }
        if (pagesState) {
          dispatch(syncPagesState(pagesState));
        }
        if (bannerState) {
          dispatch(syncBannerState(bannerState));
        }
        if (pageFromParent) {
          setCurrentPage(pageFromParent);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Request initial state from parent
    if (window.self !== window.top && window.parent) {
      console.log('Requesting initial state from parent');
      window.parent.postMessage({ type: 'REQUEST_STATE' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [dispatch]);

  // Get current page sections from pages (for visibility check)
  const currentPageData = pages.find(p => p.id === currentPage);
  const pageSections = currentPageData?.sections || [];

  // Filter visible sections and sort by builder section order
  // Only show sections that belong to the current page (exist in pageSections)
  const visibleSections = allSections
    .filter(s => {
      const pageSection = pageSections.find(ps => ps.sectionId === s.id);
      // Section must exist in the current page's sections AND be visible
      if (!pageSection) return false; // Not in this page - hide it
      if (pageSection.visible === false) return false; // Page says hide it
      if (s.visible === false) return false; // Section itself is hidden
      return true;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleSectionClick = (sectionId: string, sectionType: string, contentType?: string, elementId?: string) => {
    if (isInIframe && window.parent) {
      window.parent.postMessage({
        type: 'SECTION_CLICK',
        sectionId,
        sectionType,
        contentType,
        elementId
      }, '*');
    }
  };

  const handleAddSection = (type: string, name: string) => {
    if (isInIframe && window.parent) {
      window.parent.postMessage({
        type: 'ADD_SECTION',
        sectionType: type,
        sectionName: name
      }, '*');
    }
  };

  return (
    <div className="min-h-screen  ">
      {/* CSS for scroll highlight effect - avoids hydration mismatch */}
      <style dangerouslySetInnerHTML={{__html: `
        .scroll-highlight {
          background-color: rgba(59, 130, 246, 0.1) !important;
          transition: background-color 0.3s ease;
        }
      `}} />
      {/* Dynamic Navbar */}
      <div id="navbar-1" onClick={() => handleSectionClick('navbar-1', 'navbar', 'navbar')} className="cursor-pointer">
        <DynamicNavbar isPreviewMode={true} />
      </div>

      {/* Render Sections - with ID for scrolling */}
      {visibleSections.map((section) => {
        const wrapperClasses = isInIframe ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset scroll-mt-20" : "scroll-mt-20";
        
        switch (section.type) {
          case 'hero':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'hero')}>
                <Hero sectionId={section.id} />
              </div>
            );
          case 'second':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'second')}>
                <SecondSection sectionId={section.id} />
              </div>
            );
          case 'third':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'third')}>
                <ThirdSection sectionId={section.id} />
              </div>
            );
          case 'fourth':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'features')}>
                <FourthSection sectionId={section.id} />
              </div>
            );
          case 'banner':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'banner')}>
                <DynamicBanner sectionId={section.id} />
              </div>
            );
          case 'features':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'features')}>
                <DynamicFeatures section={section} />
              </div>
            );
          case 'fifth':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'admin')}>
                <FifthSection sectionId={section.id} />
              </div>
            );
          case 'sixth':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'admin')}>
                <SixthSection sectionId={section.id} />
              </div>
            );
          case 'benefits':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'benefits')}>
                <DynamicBenefits sectionId={section.id} />
              </div>
            );
          case 'contact-hero':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'contact')}>
                <DynamicContactHero sectionId={section.id} />
              </div>
            );
          case 'testimonials':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'testimonials')}>
                <DynamicTestimonials section={section} />
              </div>
            );
          case 'faq':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'faq')}>
                <DynamicFaq section={section} />
              </div>
            );
          case 'subscription-plan':
            return (
              <div key={section.id} id={section.id} className={wrapperClasses} onClick={() => handleSectionClick(section.id, 'subscription-plan')}>
                <DynamicSubscriptionPlan section={section} />
              </div>
            );
          default:
            return null;
        }
      })}

      {/* Add New Section - Only show in iframe - ABOVE footer */}
      {isInIframe && (
        <div id="add-new-section" className="border-2 border-dashed border-gray-300 p-8 bg-gray-50 rounded-xl mx-4 mb-8 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Add New Section</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            <button
              onClick={() => handleAddSection('hero', 'Hero Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">Text and Image</div>
              <div className="text-sm text-gray-500">Hero section</div>
            </button>
            
            <button
              onClick={() => handleAddSection('live-streaming', 'Live Streaming Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">Live Streaming</div>
              <div className="text-sm text-gray-500">Video & chat features</div>
            </button>
            
            <button
              onClick={() => handleAddSection('pk-battle', 'PK Battle Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">PK Battle</div>
              <div className="text-sm text-gray-500">Competition & gifting</div>
            </button>
            
            <button
              onClick={() => handleAddSection('features', 'Features Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">Features</div>
              <div className="text-sm text-gray-500">Showcase</div>
            </button>
            
            <button
              onClick={() => handleAddSection('fifth', 'Admin Panel Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">Admin Panel</div>
              <div className="text-sm text-gray-500">Dashboard</div>
            </button>
            
            <button
              onClick={() => handleAddSection('benefits', 'Benefits Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">Benefits</div>
              <div className="text-sm text-gray-500">Highlight advantages</div>
            </button>

            <button
              onClick={() => handleAddSection('testimonials', 'Testimonials Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">Testimonials</div>
              <div className="text-sm text-gray-500">Customer reviews</div>
            </button>

            <button
              onClick={() => handleAddSection('faq', 'FAQ Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">FAQ</div>
              <div className="text-sm text-gray-500">Common questions</div>
            </button>

            <button
              onClick={() => handleAddSection('subscription-plan', 'Subscription Plan Section')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="font-medium text-gray-900">Pricing</div>
              <div className="text-sm text-gray-500">Subscription plans</div>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Footer */}
      <div id="footer-1" onClick={() => handleSectionClick('footer-1', 'footer', 'footer')} className={isInIframe ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset transition-all" : ""}>
        <DynamicFooter sectionId="footer-1" />
      </div>

    </div>
  );
}

export default function PreviewPage() {
  return (
    <Provider store={store}>
      <PreviewContent />
    </Provider>
  );
}
