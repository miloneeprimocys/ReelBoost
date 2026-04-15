"use client";

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { Link, Edit3, X, ChevronDown } from 'lucide-react';
import { openEditor, setEditingOverlay } from "../../store/editorSlice";
import { useRouter, usePathname } from 'next/navigation';

interface DynamicNavbarProps {
  sectionId?: string;
  onEdit?: () => void;
  isPreviewMode?: boolean; // Add prop to indicate preview mode
}

const DynamicNavbar: React.FC<DynamicNavbarProps> = ({ sectionId = 'navbar-1', onEdit, isPreviewMode = false }) => {
  // Get navbar state from Redux store
  const navbar = useAppSelector(state => state.navbar);
  const { content } = navbar;
  // Get pages from pagesSlice instead of builderSlice
  const { pages: pagesFromSlice } = useAppSelector(state => state.pages);
  const { currentPage } = useAppSelector(state => state.builder);
  const dispatch = useAppDispatch();

  // Transform pages from pagesSlice format to the format expected by the navbar
  const pages = pagesFromSlice.map(p => ({
    id: p.id,
    name: p.title,
    path: p.slug,
    visible: p.visible,
    sections: p.sections,
    hasDropdown: p.hasDropdown,
    links: p.links,
  }));

  // Use page-specific links for dropdown
  const pageLinks = pagesFromSlice.find(p => p.id === currentPage)?.links || [];
  const router = useRouter();
  const pathname = usePathname();
  
  // Debug logging
  console.log('DynamicNavbar - isPreviewMode:', isPreviewMode);
  console.log('DynamicNavbar - pages:', pages);
  console.log('DynamicNavbar - content.links:', content.links);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  
  // Check if navbar editor is open
  const editingOverlay = useAppSelector(state => state.editor.editingOverlay);
  const isNavbarEditorOpen = editingOverlay.isOpen && editingOverlay.sectionType === 'navbar';

  const handleNavigation = (pageId: string, sectionId?: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent opening editor when clicking nav links
    }
    
    if (isPreviewMode) {
      // In preview mode, ALWAYS scroll to section within preview container
      if (sectionId) {
        const previewContainer = document.getElementById('preview-container');
        const element = document.getElementById(sectionId);
        
        if (previewContainer && element) {
          const containerScrollTop = previewContainer.scrollTop;
          const elementOffsetTop = element.offsetTop;
          const offset = 100; // Adjust for fixed navbar
          const targetScrollTop = elementOffsetTop - offset;
          
          previewContainer.scrollTo({
            top: targetScrollTop,
            behavior: "smooth"
          });
        }
      }
    } else {
      // In live website, use routing
      if (pageId === 'home' && sectionId) {
        // Check if we're already on HomePage
        if (pathname === '/') {
          // If on homepage, just scroll to section
          const element = document.getElementById(sectionId);
          if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        } else {
          // If not on homepage, navigate to homepage with section hash
          // Use window.location for full page reload to ensure scroll works
          if (typeof window !== 'undefined') {
            window.location.href = `/#${sectionId}`;
          }
        }
      } else {
        // Navigate to other pages using Redux page data
        const page = pages.find(p => p.id === pageId);
        if (page) {
          router.push(page.path);
        }
      }
    }
    
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
    setIsHomeDropdownOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      // Open navbar editor
      dispatch(setEditingOverlay({
        isOpen: true,
        sectionId: 'navbar-1',
        sectionType: 'navbar',
        contentType: 'navbar'
      }));
    }
  };

  return (
    <nav 
      className={`bg-white shadow-sm border-b border-gray-200 ${isPreviewMode ? 'sticky top-0' : 'fixed top-0 left-0 right-0'} z-40 transition-all ${
        isNavbarEditorOpen ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'
      }`}
      style={{ backgroundColor: content.backgroundColor }}
      onClick={!isNavbarEditorOpen ? handleEditClick : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickable to navigate to home */}
          <div
            className="flex items-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation('home', undefined, undefined);
            }}
          >
            <img
              src={content.logo}
              alt="ReelBoost Logo"
              width={40}
              height={40}
              className="h-8 w-auto hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {/* Render pages from Redux as main links */}
              {pages.filter(page => page.visible).map((page) => (
                <li key={page.id} className="relative group">
                  {page.hasDropdown && page.sections && page.sections.length > 0 ? (
                    // Page with dropdown for sections
                    <div className="relative group">
                      <button
                        className="hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                        style={{ color: content.textColor }}
                      >
                        {page.name}
                        <ChevronDown size={14} />
                      </button>

                      {/* Page Dropdown with Links */}
                      <div
                        className="absolute top-full left-0 mt-1 w-48 border border-gray-200 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                        style={{ backgroundColor: content.dropdownBackgroundColor || '#ffffff' }}
                      >
                        {page.links?.filter((link: {visible: boolean}) => link.visible).map((link: {id: string; label: string; sectionId: string}) => (
                          <div
                            key={link.id}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                              isPreviewMode
                                ? 'cursor-default'
                                : 'cursor-pointer'
                            }`}
                            style={{
                              color: content.dropdownTextColor || '#374151',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = content.dropdownHoverColor || '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={!isPreviewMode ? (e) => handleNavigation(page.id, link.sectionId, e) : undefined}
                          >
                            {link.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Direct link page (no dropdown)
                    <button
                      onClick={() => handleNavigation(page.id, undefined, undefined)}
                      className="hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                      style={{ color: content.textColor }}
                    >
                      {page.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Live Demo Button */}
          <div className="flex items-center gap-3">
            {/* Builder Button - Always show */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/WebsiteBuilder';
              }}
              className="px-3 sm:px-7 py-2 sm:py-3 text-[10px] sm:text-[14px] rounded-lg font-bold transition-all whitespace-nowrap overflow-hidden flex items-center justify-center min-w-25 sm:min-w-40 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600/20"
            >
              <Edit3 size={16} />
              <span className="ml-2">Builder</span>
            </button>
            
            <button 
              className="relative group/btn px-3 sm:px-7 py-2 sm:py-3 text-[10px] sm:text-[14px] rounded-lg font-bold transition-all whitespace-nowrap overflow-hidden flex items-center justify-center min-w-[100px] sm:min-w-[160px]"
              style={{ 
                backgroundColor: content.liveDemoButton?.backgroundColor || '#2b49c5',
                color: content.liveDemoButton?.textColor || '#ffffff'
              }}
            >
              <span
                className="absolute inset-x-0 top-0 w-full h-[160%] transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] translate-y-[-101%] group-hover/btn:translate-y-0 z-0 pointer-events-none"
                style={{ 
                  clipPath: 'ellipse(100% 40% at 50% 35%)',
                  backgroundColor: content.liveDemoButton?.hoverBackgroundColor || '#000000'
                }}
              ></span>
              <span className="relative z-10 transition-colors duration-300 pointer-events-none uppercase">
                {content.liveDemoButton?.label || 'live demo'}
              </span>
            </button>
          </div>

          {/* Edit Button - Only show in preview mode */}
          {isPreviewMode && !isNavbarEditorOpen && (
            <button
              onClick={handleEditClick}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors opacity-0 hover:opacity-100"
              title="Edit navbar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={24} /> : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Page Links */}
            <div className="space-y-2">
              {/* Render pages from Redux as main links */}
              {pages.filter(page => page.visible).map((page) => (
                <div key={page.id}>
                  {page.hasDropdown && page.sections && page.sections.length > 0 ? (
                    // Page with expandable sections
                    <>
                      <button
                        onClick={() => setIsHomeDropdownOpen(!isHomeDropdownOpen)}
                        className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center justify-between"
                      >
                        {page.name}
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform ${isHomeDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Mobile Page Sub-links */}
                      {isHomeDropdownOpen && (
                        <div
                          className="pl-4 space-y-1 rounded-lg py-2"
                          style={{ backgroundColor: content.dropdownBackgroundColor || '#ffffff' }}
                        >
                          {page.links?.filter((link: {visible: boolean}) => link.visible).map((link: {id: string; label: string; sectionId: string}) => (
                            <div
                              key={link.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                isPreviewMode
                                  ? 'cursor-default'
                                  : 'cursor-pointer'
                              }`}
                              style={{
                                color: content.dropdownTextColor || '#4b5563',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = content.dropdownHoverColor || '#f3f4f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={!isPreviewMode ? (e) => {
                                handleNavigation(page.id, link.sectionId, e);
                                setIsMobileMenuOpen(false);
                                setIsHomeDropdownOpen(false);
                              } : undefined}
                            >
                              {link.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Direct link page (no dropdown)
                    <button
                      onClick={() => {
                        handleNavigation(page.id, undefined, undefined);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    >
                      {page.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DynamicNavbar;
