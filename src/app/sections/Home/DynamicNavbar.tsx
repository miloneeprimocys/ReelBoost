"use client";

import React from 'react';
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { Link, Edit3 } from 'lucide-react';
import { openEditor, setEditingOverlay } from "../../store/editorSlice";

interface DynamicNavbarProps {
  sectionId?: string;
  onEdit?: () => void;
}

const DynamicNavbar: React.FC<DynamicNavbarProps> = ({ sectionId = 'navbar-1', onEdit }) => {
  // Get navbar state from Redux store
  const navbar = useAppSelector(state => state.navbar);
  const { content } = navbar;
  const dispatch = useAppDispatch();
  
  // Check if navbar editor is open
  const editingOverlay = useAppSelector(state => state.editor.editingOverlay);
  const isNavbarEditorOpen = editingOverlay.isOpen && editingOverlay.sectionType === 'navbar';

  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening editor when clicking nav links
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
      className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 transition-all -mb-8 -translate-y-0.5 ${
        isNavbarEditorOpen ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'
      }`}
      style={{ backgroundColor: content.backgroundColor }}
      onClick={!isNavbarEditorOpen ? handleEditClick : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  ">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={content.logo} 
              alt="ReelBoost Logo" 
              width={40} 
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {content.links.filter(link => link.visible).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={(e) => scrollToSection(link.sectionId, e)}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                    style={{ color: content.textColor }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Demo Button */}
          <div className="flex items-center gap-3">
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

          {/* Edit Button - Top Right Corner */}
          {!isNavbarEditorOpen && (
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
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 6h16M4 6h16M4 6h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DynamicNavbar;
