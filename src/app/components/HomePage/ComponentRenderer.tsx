'use client';

import React from 'react';
import Image from 'next/image';
import { Type, Image as ImageIcon, Video, Square, Minus, MapPin, Star, Sparkles } from 'lucide-react';
import { LayoutComponent } from '@/app/store/layoutSlice';
import { useAppSelector } from '@/app/store/hooks';

interface ComponentRendererProps {
  component: LayoutComponent;
}

// Debug flag
const DEBUG = true;

export default function ComponentRenderer({ component }: ComponentRendererProps) {
  const { type, content, styles } = component;
  const headingEditorState = useAppSelector((state) => state.headingEditor);
  const headingComponent = headingEditorState.components[component.id];

  if (DEBUG && type === 'heading') {
    console.log('ComponentRenderer ID check:', {
      componentId: component.id,
      availableIds: Object.keys(headingEditorState.components),
      matchFound: !!headingComponent
    });
  }

  // Helper function to safely get border value
  const getBorderValue = (border: any) => {
    if (!border || border.type === 'none') return undefined;
    if (border.width === undefined || !border.widthUnit || !border.color) return undefined;
    return `${border.width}${border.widthUnit} ${border.type} ${border.color}`;
  };

  // Helper function to safely get border radius value
  const getBorderRadiusValue = (border: any) => {
    if (!border) return undefined;
    // Use individual radius values if available, otherwise fall back to single radius
    if (border.radiusTop !== undefined) {
      const rt = border.radiusTop || 0;
      const rr = border.radiusRight || 0;
      const rb = border.radiusBottom || 0;
      const rl = border.radiusLeft || 0;
      if (rt === 0 && rr === 0 && rb === 0 && rl === 0) return undefined;
      return `${rt}${border.radiusUnit} ${rr}${border.radiusUnit} ${rb}${border.radiusUnit} ${rl}${border.radiusUnit}`;
    }
    if (border.radius === undefined || !border.radiusUnit) return undefined;
    return `${border.radius}${border.radiusUnit}`;
  };

  switch (type) {
    case 'heading':
      const handleHeadingClick = () => {
        // Check if we're in an iframe (preview mode)
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'HEADING_CLICK',
            componentId: component.id,
            componentType: 'heading'
          }, '*');
        }
      };

      // Get heading styles from editor if available
      const headingStyles = headingComponent?.styles;
      const headingAdvanced = headingComponent?.advanced;

      if (DEBUG) {
        console.log('ComponentRenderer detailed data:', {
          componentId: component.id,
          headingComponentExists: !!headingComponent,
          content: headingComponent?.content,
          styles: headingStyles,
          advanced: headingAdvanced,
          typography: headingStyles?.typography,
          background: headingAdvanced?.background,
          transform: headingAdvanced?.transform,
          border: headingAdvanced?.border,
          margin: headingAdvanced?.margin,
          padding: headingAdvanced?.padding,
        });
      }

      // Build inline styles from heading editor
      const inlineStyles: React.CSSProperties = {
        color: headingStyles?.textColor || styles?.color,
        fontFamily: headingStyles?.typography?.fontFamily ? `var(--font-${headingStyles.typography.fontFamily.toLowerCase()})` : undefined,
        fontSize: headingStyles?.typography?.fontSize ? `${headingStyles.typography.fontSize}${headingStyles.typography.fontSizeUnit}` : styles?.fontSize,
        fontWeight: headingStyles?.typography?.fontWeight,
        textAlign: headingStyles?.alignment || styles?.textAlign as 'left' | 'center' | 'right',
        textTransform: headingStyles?.typography?.textTransform,
        fontStyle: headingStyles?.typography?.fontStyle,
        textDecoration: headingStyles?.typography?.textDecoration,
        lineHeight: headingStyles?.typography?.lineHeightUnit === 'normal' ? 'normal' : `${headingStyles?.typography?.lineHeight}${headingStyles?.typography?.lineHeightUnit}`,
        letterSpacing: headingStyles?.typography?.letterSpacing ? `${headingStyles.typography.letterSpacing}${headingStyles.typography.letterSpacingUnit}` : undefined,
        wordSpacing: headingStyles?.typography?.wordSpacing ? `${headingStyles.typography.wordSpacing}${headingStyles.typography.wordSpacingUnit}` : undefined,
        margin: headingAdvanced?.margin ? `${headingAdvanced.margin.top}${headingAdvanced.margin.unit} ${headingAdvanced.margin.right}${headingAdvanced.margin.unit} ${headingAdvanced.margin.bottom}${headingAdvanced.margin.unit} ${headingAdvanced.margin.left}${headingAdvanced.margin.unit}` : undefined,
        padding: headingAdvanced?.padding ? `${headingAdvanced.padding.top}${headingAdvanced.padding.unit} ${headingAdvanced.padding.right}${headingAdvanced.padding.unit} ${headingAdvanced.padding.bottom}${headingAdvanced.padding.unit} ${headingAdvanced.padding.left}${headingAdvanced.padding.unit}` : undefined,
        mixBlendMode: headingStyles?.blendMode,
        // Text stroke - use proper CSS with webkit prefix
        WebkitTextStroke: headingStyles?.textStroke?.enabled && headingStyles.textStroke.width > 0 
          ? `${headingStyles.textStroke.width}${headingStyles.textStroke.widthUnit} ${headingStyles.textStroke.color}` 
          : undefined,
        // Text shadow
        textShadow: headingStyles?.textShadow?.enabled 
          ? `${headingStyles.textShadow.horizontal}${headingStyles.textShadow.horizontalUnit} ${headingStyles.textShadow.vertical}${headingStyles.textShadow.verticalUnit} ${headingStyles.textShadow.blur}${headingStyles.textShadow.blurUnit} ${headingStyles.textShadow.color}` 
          : undefined,
        // Background (Normal state)
        backgroundColor: headingAdvanced?.background?.normal?.type === 'color' ? headingAdvanced.background.normal.color : undefined,
        backgroundImage: headingAdvanced?.background?.normal?.type === 'image' && headingAdvanced.background.normal.image?.url ? `url(${headingAdvanced.background.normal.image.url})` : undefined,
        // Transform (Normal state) - combine all transform properties
        transform: headingAdvanced?.transform?.normal ? 
          `rotate(${headingAdvanced.transform.normal.rotate}${headingAdvanced.transform.normal.rotateUnit}) ` +
          `scale(${headingAdvanced.transform.normal.scale || 1}) ` +
          `skewX(${headingAdvanced.transform.normal.skewX || 0}${headingAdvanced.transform.normal.skewXUnit}) ` +
          `skewY(${headingAdvanced.transform.normal.skewY || 0}${headingAdvanced.transform.normal.skewYUnit}) ` +
          `translateX(${headingAdvanced.transform.normal.translateX || 0}${headingAdvanced.transform.normal.translateXUnit}) ` +
          `translateY(${headingAdvanced.transform.normal.translateY || 0}${headingAdvanced.transform.normal.translateYUnit})`
          : undefined,
        transformOrigin: headingAdvanced?.transform?.normal?.transformOrigin,
        // Border (Normal state) - only apply if headingAdvanced exists and has border
        border: getBorderValue(headingAdvanced?.border?.normal),
        borderRadius: getBorderRadiusValue(headingAdvanced?.border?.normal),
        // Position
        position: headingAdvanced?.position,
        zIndex: headingAdvanced?.zIndex !== '' ? headingAdvanced?.zIndex : undefined,
      };

      // Responsive classes - use correct Tailwind classes to hide on specific breakpoints
      const responsiveClasses = headingAdvanced?.responsive ? [
        headingAdvanced.responsive.hideOnDesktop ? 'lg:hidden' : '',
        headingAdvanced.responsive.hideOnTabletPortrait ? 'md:hidden' : '',
        headingAdvanced.responsive.hideOnMobilePortrait ? 'sm:hidden' : '',
      ].filter(Boolean).join(' ') : '';

      // Advanced layout styles
      const layoutStyles: React.CSSProperties = {
        width: headingAdvanced?.width === 'custom' && headingAdvanced?.widthValue
          ? `${headingAdvanced.widthValue}${headingAdvanced.widthUnit}`
          : headingAdvanced?.width === 'full'
            ? '100%'
            : headingAdvanced?.width === 'inline'
              ? 'auto'
              : undefined,
        alignSelf: headingAdvanced?.alignSelf !== 'auto' ? headingAdvanced?.alignSelf : undefined,
        order: headingAdvanced?.order !== '' && headingAdvanced?.order !== undefined && !isNaN(Number(headingAdvanced?.order))
          ? Number(headingAdvanced?.order)
          : undefined,
        minWidth: headingAdvanced?.minWidth ? `${headingAdvanced.minWidth}${headingAdvanced.minWidthUnit}` : undefined,
        maxWidth: headingAdvanced?.maxWidth ? `${headingAdvanced.maxWidth}${headingAdvanced.maxWidthUnit}` : undefined,
        minHeight: headingAdvanced?.minHeight ? `${headingAdvanced.minHeight}${headingAdvanced.minHeightUnit}` : undefined,
        maxHeight: headingAdvanced?.maxHeight ? `${headingAdvanced.maxHeight}${headingAdvanced.maxHeightUnit}` : undefined,
      };

      // Merge layout styles with inline styles
      const finalStyles = { ...layoutStyles, ...inlineStyles };

      // Get HTML tag from content (default to h2)
      const htmlTag = headingComponent?.content?.htmlTag || 'h2';

      // Get link URL
      const linkUrl = headingComponent?.content?.link;

      // Get CSS ID and Classes
      const cssId = headingAdvanced?.cssId || component.id;
      const cssClasses = headingAdvanced?.cssClasses || '';

      if (DEBUG) {
        console.log('ComponentRenderer final output:', component.id, {
          htmlTag,
          linkUrl,
          cssId,
          cssClasses,
          layoutStyles,
          finalStyles,
          responsiveClasses,
          text: headingComponent?.content?.title || content?.text || 'Heading Text'
        });
      }

      // Create heading element with dynamic tag
      const headingText = (headingComponent?.content?.title as string) || (content?.text as string) || 'Heading Text';

      const headingElement = React.createElement(
        htmlTag,
        {
          className: `${cssClasses} cursor-pointer hover:ring-2 hover:ring-blue-400 rounded px-2 py-1 transition-all ${responsiveClasses}`,
          onClick: handleHeadingClick,
          style: finalStyles,
          id: cssId,
        },
        headingText
      );

      // Wrap with link if URL is provided
      if (linkUrl) {
        return (
          <a href={linkUrl} style={{ textDecoration: 'none' }}>
            {headingElement}
          </a>
        );
      }

      return headingElement;
    
    case 'text':
      return (
        <p 
          className="text-base text-gray-600 leading-relaxed"
          style={{
            color: styles?.color,
            fontSize: styles?.fontSize,
            textAlign: styles?.textAlign as 'left' | 'center' | 'right',
          }}
        >
          {(content?.text as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
        </p>
      );
    
    case 'image':
      if (content?.src) {
        return (
          <div className="relative w-full aspect-video">
            <Image
              src={content.src as string}
              alt={(content?.alt as string) || 'Image'}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        );
      }
      return (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-400 text-sm">Image Placeholder</span>
          </div>
        </div>
      );
    
    case 'video':
      if (content?.src) {
        return (
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video 
              src={content.src as string} 
              controls 
              className="w-full h-full object-cover"
            />
          </div>
        );
      }
      return (
        <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <span className="text-gray-500 text-sm">Video Placeholder</span>
          </div>
        </div>
      );
    
    case 'button':
      return (
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          style={{
            backgroundColor: styles?.backgroundColor,
            color: styles?.color,
            borderRadius: styles?.borderRadius,
          }}
        >
          {(content?.text as string) || 'Click Me'}
        </button>
      );
    
    case 'divider':
      return <hr className="w-full border-t-2 border-gray-200 my-4" />;
    
    case 'spacer':
      return <div className="h-8" />;
    
    case 'icon':
      return (
        <div className="flex items-center justify-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: styles?.backgroundColor || '#F3F4F6' }}
          >
            {content?.icon && typeof content.icon === 'string' ? (
              <span className="text-3xl">{content.icon}</span>
            ) : (
              <Star className="w-8 h-8 text-gray-400" />
            )}
          </div>
        </div>
      );
    
    case 'google-maps':
      return (
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-500 text-sm">Google Maps</span>
          </div>
        </div>
      );
    
    case 'optinmonster':
      return (
        <div className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">OptinMonster Campaign</p>
          <p className="text-sm opacity-80">Convert visitors into subscribers</p>
        </div>
      );
    
    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500 text-sm">Unknown component: {type}</p>
        </div>
      );
  }
}
