"use client";

import React from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import ContactHero from '../../components/Pages/ContactUs/ContactHero';

interface DynamicContactHeroProps {
  sectionId: string;
  onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'image' | 'admin' | 'footer' | 'navbar' | 'contact' | null, elementId: string) => void;
}

const DynamicContactHero: React.FC<DynamicContactHeroProps> = ({ sectionId, onEdit }) => {
  // Get contact section data from Redux store
  const { sections } = useAppSelector(state => state.builder);
  const section = sections.find(s => s.id === sectionId);
  
  console.log('DynamicContactHero - Looking for section:', sectionId);
  console.log('DynamicContactHero - Contact section:', section);
  console.log('DynamicContactHero - sectionId:', sectionId);
  console.log('DynamicContactHero - section:', section);
  console.log('DynamicContactHero - section.type:', section?.type);

  return (
    <ContactHero 
      sectionId={sectionId} 
      onEdit={onEdit}
    />
  );
};

export default DynamicContactHero;
