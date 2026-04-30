"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { closeImageModal } from "../../../store/modalSlice";

const ImageModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector(state => state.modal);
  const { isOpen, imageSrc, alt } = modal;

  // Disable scrolling on website builder panel when modal is open
  useEffect(() => {
    const builderPanel = document.querySelector('.hide-scrollbar');
    if (isOpen && builderPanel) {
      builderPanel.classList.add('overflow-hidden');
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    return () => {
      if (builderPanel) {
        builderPanel.classList.remove('overflow-hidden');
      }
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
  // Cover entire editing overlay including Cancel/Save buttons
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={() => dispatch(closeImageModal())}
    >
      {/* Modal content */}
      <div 
        className="relative rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - positioned relative to the white modal div */}
        <button
          onClick={() => dispatch(closeImageModal())}
          className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:scale-105  duration-200 cursor-pointer rounded-full shadow-lg transition-colors"
          aria-label="Close modal"
        >
          <X size={16} className="text-black" />
        </button>

        {/* Image container */}
        <div className="flex items-center justify-center p-8 bg-white/70">
          <img 
            src={imageSrc} 
            alt={alt}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;