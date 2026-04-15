"use client";

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import Navbar from '../Common/Navbar';
import DynamicNavbar from '../sections/Home/DynamicNavbar';
import Footer from '../Common/Footer';
import ContactHero from '../components/Pages/ContactUs/ContactHero';

function ContactUsContent() {
  const { isBuilderMode } = useAppSelector(state => state.builder);
  const dispatch = useAppDispatch();

  const handleEdit = (sectionId: string, contentType: string, elementId: string) => {
    console.log('ContactUs section clicked:', { sectionId, contentType, elementId });
    dispatch({
      type: 'editor/setEditingOverlay',
      payload: {
        isOpen: true,
        sectionId,
        sectionType: 'contact',
        contentType
      }
    });
  };

  // Handle scroll target after navigation
  useEffect(() => {
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    if (scrollTarget) {
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollTarget);
        if (element) {
          const offset = 100; // Navbar height
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
          sessionStorage.removeItem('scrollTarget');
        }
      }, 100); // Small delay to ensure DOM is ready
      return () => clearTimeout(timer);
    }
  }, []);

  if (isBuilderMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ContactHero sectionId="contact-hero-1" onEdit={handleEdit} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DynamicNavbar isPreviewMode={false} />
      <ContactHero sectionId="contact-hero-1" />
      <Footer />
    </div>
  );
}

export default function ContactUsPage() {
  return (
    <Provider store={store}>
      <ContactUsContent />
    </Provider>
  );
}
