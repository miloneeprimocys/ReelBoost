"use client";

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Globe, Edit3, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { updateFooterContent } from '../../../store/footerSlice';
import { loadPublishedData as loadNavbarData } from '../../../store/navbarSlice';
import { loadPublishedData as loadFooterData } from '../../../store/footerSlice';
import { setSections } from '../../../store/builderSlice';
import { setAllBannerSections } from '../../../store/bannerSlice';
import { store } from '../../../store';

interface BuilderNavbarProps {
  currentDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPublish: () => void;
}

const BuilderNavbar: React.FC<BuilderNavbarProps> = ({
  currentDevice,
  onDeviceChange,
  onPublish
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Save ALL current changes to localStorage for persistence
      // This ensures all changes from all sections are available on home page
      
      // Get current state from Redux
      const state = store.getState();
      
      // Save all relevant data to localStorage
      localStorage.setItem('publishedNavbar', JSON.stringify(state.navbar.content));
      localStorage.setItem('publishedFooter', JSON.stringify(state.footer.content));
      localStorage.setItem('publishedSections', JSON.stringify(state.builder.sections));
      localStorage.setItem('publishedBannerSections', JSON.stringify(state.banner.sections));
      localStorage.setItem('publishedAdminSections', JSON.stringify(state.admin.sections));
      
      // Save individual section states for detailed tracking
      localStorage.setItem('publishedHeroSections', JSON.stringify(state.builder.sections.filter(s => s.type === 'hero')));
      localStorage.setItem('publishedFeaturesSections', JSON.stringify(state.builder.sections.filter(s => s.type === 'features')));
      localStorage.setItem('publishedBenefitsSections', JSON.stringify(state.builder.sections.filter(s => s.type === 'benefits')));
      localStorage.setItem('publishedAdminPanelSections', JSON.stringify(state.builder.sections.filter(s => s.type === 'admin-panel')));
      
      // Save all banner sections (they all have type 'banner')
      localStorage.setItem('publishedBannerSections', JSON.stringify(state.banner.sections));
      
      // Mark as published with full timestamp
      localStorage.setItem('isPublished', 'true');
      localStorage.setItem('publishedAt', new Date().toISOString());
      localStorage.setItem('publishedVersion', new Date().getTime().toString());
      
      console.log('All changes published successfully!', {
        navbar: state.navbar.content,
        footer: state.footer.content,
        sections: state.builder.sections.length,
        bannerSections: state.banner.sections.length,
        adminSections: state.admin.sections.length
      });
      
      // Show success message (no redirect - stay on page to see results)
      console.log('Publish completed! Changes are now visible.');
      
      // Immediately load the published data to show changes without refresh
      setTimeout(() => {
        console.log('Loading published data to show changes...');
        
        // Load navbar
        const publishedNavbar = localStorage.getItem('publishedNavbar');
        if (publishedNavbar) {
          try {
            const navbarData = JSON.parse(publishedNavbar);
            dispatch(loadNavbarData(navbarData));
          } catch (error) {
            console.error('Error loading published navbar:', error);
          }
        }
        
        // Load footer
        const publishedFooter = localStorage.getItem('publishedFooter');
        if (publishedFooter) {
          try {
            const footerData = JSON.parse(publishedFooter);
            dispatch(loadFooterData(footerData));
          } catch (error) {
            console.error('Error loading published footer:', error);
          }
        }
        
        // Load sections
        const publishedSections = localStorage.getItem('publishedSections');
        if (publishedSections) {
          try {
            const sectionsData = JSON.parse(publishedSections);
            dispatch(setSections(sectionsData));
          } catch (error) {
            console.error('Error loading published sections:', error);
          }
        }
        
        // Load banner sections
        const publishedBannerSections = localStorage.getItem('publishedBannerSections');
        if (publishedBannerSections) {
          try {
            const bannerSectionsData = JSON.parse(publishedBannerSections);
            dispatch(setAllBannerSections(bannerSectionsData));
          } catch (error) {
            console.error('Error loading published banner sections:', error);
          }
        }
        
        console.log('Published data loaded - changes should now be visible!');
        
        // Reset publishing state
        setIsPublishing(false);
        
        console.log('Publish completed! Changes saved to localStorage.');
      }, 500);
    } catch (error) {
      console.error('Error publishing:', error);
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-10">
      {/* Left side - WebsiteBuilder text */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900">WebsiteBuilder</h1>
      </div>

      {/* Middle - Device options with responsive visibility */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        {/* Desktop - visible from lg screens and above (1024px+) */}
        <button
          onClick={() => onDeviceChange('desktop')}
          className={`hidden lg:flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors ${
            currentDevice === 'desktop'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Desktop view"
        >
          <Monitor className="w-4 h-4" />
          <span className="text-sm font-medium">Desktop</span>
        </button>
        
        {/* Tablet - visible from md screens and above (768px+) */}
        <button
          onClick={() => onDeviceChange('tablet')}
          className={`hidden md:flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors ${
            currentDevice === 'tablet'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Tablet view"
        >
          <Tablet className="w-4 h-4" />
          <span className="text-sm font-medium">Tablet</span>
        </button>
        
        {/* Mobile - always visible on all screen sizes */}
        <button
          onClick={() => onDeviceChange('mobile')}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors ${
            currentDevice === 'mobile'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Mobile view"
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-sm font-medium">Mobile</span>
        </button>
      </div>

      {/* Right side - Publish button */}
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">
          {isPublishing ? 'Publishing...' : 'Publish'}
        </span>
      </button>
    </div>
  );
};

export default BuilderNavbar;