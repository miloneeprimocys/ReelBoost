"use client";

import React from 'react';
import { Edit3 } from 'lucide-react';

interface ContactHeroProps {
  sectionId: string;
  onEdit?: (sectionId: string, contentType: 'text' | 'style' | 'image' | 'admin' | 'footer' | 'navbar' | 'contact' | null, elementId: string) => void;
}

const ContactHero: React.FC<ContactHeroProps> = ({ sectionId, onEdit }) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-20 px-4">
      {/* Edit button */}
      {onEdit && (
        <button
          onClick={() => onEdit(sectionId, 'text', 'contact-hero-title')}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all z-10 hover:bg-gray-50"
          title="Edit Contact Hero Section"
        >
          <Edit3 size={16} className="text-gray-600" />
        </button>
      )}
      
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Get in Touch
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Contact Us
          </button>
          <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactHero;
