"use client";

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../../store';
import WebsiteBuilder from '../../components/HomePage/WebsiteBuilder';
import BuilderNavbar from '../../components/HomePage/WebsiteBuilder/BuilderNavbar';
import { toggleBuilderMode } from '../../store/builderSlice';
import { useParams } from 'next/navigation';

function WebsiteBuilderWithMode() {
  const dispatch = useDispatch();
  const params = useParams();
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewZoom, setPreviewZoom] = useState(100);
  
  // Get the page name from URL params
  const pageName = params?.page as string || 'Home';
  
  useEffect(() => {
    // Enable builder mode when this page loads
    dispatch(toggleBuilderMode());
  }, [dispatch]);

  const handlePublish = () => {
    console.log('Publishing website...');
    window.location.href = '/';
  };
  
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <BuilderNavbar 
          currentDevice={currentDevice}
          onDeviceChange={setCurrentDevice}
          onPublish={handlePublish}
        />
      </div>
      <div className="mt-16">
        <WebsiteBuilder 
          currentDevice={currentDevice}
          previewZoom={previewZoom}
          onZoomChange={setPreviewZoom}
        />
      </div>
    </>
  );
}

export default function WebsiteBuilderPage() {
  return (
    <Provider store={store}>
      <WebsiteBuilderWithMode />
    </Provider>
  );
}
