"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Facebook,
    Twitter,
    Linkedin,
    ArrowUp,
    Instagram,
    Phone,
    Mail,
    Edit3
} from "lucide-react";
import Logo from "../../../public/logo.svg"
import Image from "next/image"
import { useAppSelector } from "../../hooks/reduxHooks";
import { selectFooterContent } from "../../store/footerSlice";

interface DynamicFooterProps {
  sectionId?: string;
  onEdit?: (sectionId: string, contentType: string, elementId?: string) => void;
}

const DynamicFooter: React.FC<DynamicFooterProps> = ({ sectionId, onEdit }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const [showEditIcon, setShowEditIcon] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);

    // Get footer content from Redux footer slice
    const footerContent = useAppSelector(selectFooterContent);

    // The footer content comes directly from the footer slice with defaults already set
    const content = footerContent;

    // Social media icon rendering - use custom icon URL if available, otherwise fallback to default
    const renderSocialIcon = (link: any) => {
      if (link.customIconUrl) {
        return <img src={link.customIconUrl} alt={link.name} className="w-6 h-6" />;
      }
      
      const iconMap: { [key: string]: any } = {
        facebook: Facebook,
        twitter: Twitter,
        linkedin: Linkedin,
        instagram: Instagram
      };
      const Icon = iconMap[link.icon || link.id.toLowerCase()] || Facebook;
      return <Icon />;
    };

    // Contact icon rendering - use custom icon URL if available, otherwise fallback to default
    const renderContactIcon = (type: 'phone' | 'email', customIconUrl?: string, iconName?: string) => {
      if (customIconUrl) {
        return <img src={customIconUrl} alt={`${type} icon`} className="w-5 h-5" />;
      }
      
      const iconMap: { [key: string]: any } = {
        phone: Phone,
        mail: Mail
      };
      const Icon = iconMap[iconName || type] || Phone;
      return <Icon size={20} />;
    };

    // Enhanced redirection logic that works in both preview and home page contexts
    const scrollToSection = (sectionId: string) => {
        console.log('DynamicFooter scrollToSection called with:', sectionId);
        
        // First try to find the preview container (for builder mode)
        const previewContainer = document.getElementById('preview-container');
        
        if (previewContainer) {
            // We're in preview mode - scroll within the preview container
            console.log('Found preview container, scrolling within preview');
            const element = document.getElementById(sectionId);
            
            if (element) {
                console.log('Found element in preview:', element);
                const elementOffsetTop = element.offsetTop;
                const offset = 100; // Header offset
                const targetScrollTop = elementOffsetTop - offset;
                
                previewContainer.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
                
                // Add visual feedback
                element.style.transition = 'background-color 0.3s ease';
                element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 1000);
                return;
            }
        }
        
        // Fallback to regular page scroll (for home page)
        console.log('No preview container found, using regular page scroll');
        const element = document.getElementById(sectionId);
        if (element) {
            console.log('Found element on page:', element);
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            
            // Add visual feedback
            element.style.transition = 'background-color 0.3s ease';
            element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 1000);
        } else {
            console.warn('Element not found:', sectionId);
            // List all available elements for debugging
            const allElements = document.querySelectorAll('[id]');
            const sectionElements = Array.from(allElements).filter(el => 
                el.id.includes('hero') || 
                el.id.includes('second') || 
                el.id.includes('third') || 
                el.id.includes('fourth') || 
                el.id.includes('fifth') || 
                el.id.includes('sixth') ||
                el.id.includes('banner')
            );
            console.log('Available section elements:', sectionElements.map(el => el.id));
        }
    };

    useEffect(() => {
        const currentRef = footerRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowScroll(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleEdit = (contentType: string) => {
        if (onEdit && sectionId) {
            onEdit(sectionId, contentType);
        }
    };

    return (
        <footer 
            ref={footerRef} 
            id={sectionId}
            className="text-white pt-8 sm:pt-16 pb-4 relative overflow-hidden cursor-pointer bg-[#050533]"
            style={{ backgroundColor: content?.styles?.backgroundColor || '#050533' }}
            onMouseEnter={() => setShowEditIcon(true)}
            onMouseLeave={() => setShowEditIcon(false)}
            onClick={() => handleEdit('footer')}
        >
            {/* Edit Icon */}
            {onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEdit('footer');
                    }}
                    className={`absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-lg transition-all duration-300 ${
                        showEditIcon ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                    } hover:bg-white/20`}
                >
                    <Edit3 size={16} className="text-white" />
                </button>
            )}

            {/* Main Content Section */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-8 lg:justify-items-center mb-20">

                    {/* Column 1: Brand & Description */}
                    <div className={`transition-all duration-1000 delay-100 flex flex-col items-start ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <Image src={content.logoUrl} alt="ReelBoost Logo" width={40} height={40} />
                        </div>
                        <p className="text-[16px] leading-relaxed mb-8 max-w-[380px] break-words" 
                           style={{ color: content.styles.brandTextColor }}>
                            {content.brandDescription}
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            {content.socialLinks.filter((link: any) => link.enabled).map((link: any) => (
                                <div
                                    key={link.id}
                                    className="group/icon w-12 h-12 rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-colors flex-shrink-0"
                                    style={{ 
                                        backgroundColor: content.styles.socialIconBackground,
                                        color: content.styles.socialIconColor 
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = content.styles.socialIconHoverBackground;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = content.styles.socialIconBackground;
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="relative w-6 h-6 overflow-hidden" style={{ color: content.styles.socialIconColor }}>
                                        {renderSocialIcon(link)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Useful Links */}
                    <div className={`transition-all duration-1000 delay-200 flex flex-col items-start ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="border-b mb-8 pb-4 w-fit pr-8"
                             style={{ borderColor: content.styles.brandTextColor + '20' }}>
                            <h4 className="text-[20px] font-bold" 
                                style={{ color: content.styles.brandTextColor }}>Useful Links</h4>
                        </div>
                        <ul className="space-y-4 -mt-2">
                            {content.usefulLinks.filter((link: any) => link.enabled).map((link: any) => (
                                <li key={link.id}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            scrollToSection(link.sectionId);
                                        }} 
                                        className="inline-block cursor-pointer hover:translate-x-2 text-[16px] font-medium transition-all duration-300 break-words max-w-full"
                                        style={{ color: content.styles.linkTextColor }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = content.styles.linkHoverColor;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = content.styles.linkTextColor;
                                        }}
                                    >
                                        {link.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className={`transition-all duration-1000 delay-300 flex flex-col items-start ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="border-b mb-8 pb-4 w-fit pr-8"
                             style={{ borderColor: content.styles.brandTextColor + '20' }}>
                            <h4 className="text-[20px] font-bold" 
                                style={{ color: content.styles.brandTextColor }}>Contact</h4>
                        </div>
                        <ul className="space-y-6 -mt-2">
                            {(() => {
                            // Create array of contact items with their order
                            const contactItems = [];
                            if (content.contactInfo.phoneEnabled) {
                                contactItems.push({
                                    type: 'phone',
                                    value: content.contactInfo.phone,
                                    icon: content.contactInfo.phoneIcon,
                                    customIconUrl: content.contactInfo.phoneCustomIconUrl,
                                    order: content.contactInfo.phoneOrder
                                });
                            }
                            if (content.contactInfo.emailEnabled) {
                                contactItems.push({
                                    type: 'email',
                                    value: content.contactInfo.email,
                                    icon: content.contactInfo.emailIcon,
                                    customIconUrl: content.contactInfo.emailCustomIconUrl,
                                    order: content.contactInfo.emailOrder
                                });
                            }
                            
                            // Sort by order and render
                            return contactItems.sort((a, b) => a.order - b.order).map((item) => (
                                <li key={item.type}>
                                    <button 
                                        className="flex items-center gap-4 text-[16px] font-medium transition-all duration-300 hover:translate-x-2 cursor-pointer group"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors group-hover:opacity-80"
                                            style={{ backgroundColor: content.styles.contactIconBackground }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = content.styles.contactIconHoverBackground;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = content.styles.contactIconBackground;
                                            }}
                                        >
                                            <div style={{ color: content.styles.contactIconColor }}>
                                                {renderContactIcon(item.type as 'phone' | 'email', item.customIconUrl, item.icon)}
                                            </div>
                                        </div>
                                        <span className="break-words max-w-[200px]">{item.value}</span>
                                    </button>
                                </li>
                            ));
                        })()}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar Section */}
            <div className="w-full border-t pt-10"
                 style={{ borderColor: content.styles.bottomBarBorderColor }}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-[14px] tracking-wide font-medium text-center md:text-left">
                    <p className="order-2 md:order-1 break-words max-w-full"
                       style={{ color: content.styles.bottomBarTextColor }}>
                        {content.copyright}
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 order-1 md:order-2">
                        {content.bottomLinks.filter((link: any) => link.enabled).map((link: any, index: number) => (
                            <React.Fragment key={link.id}>
                                <a 
                                    href={link.url} 
                                    className="transition-colors whitespace-nowrap break-words max-w-[120px]"
                                    style={{ color: content.styles.bottomBarTextColor }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = content.styles.bottomBarLinkHoverColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = content.styles.bottomBarTextColor;
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (link.url.startsWith('#')) {
                                            e.preventDefault();
                                            scrollToSection(link.url.substring(1));
                                        }
                                    }}
                                >
                                    {link.text}
                                </a>
                                {index < content.bottomLinks.filter((l: any) => l.enabled).length - 1 && (
                                    <span className="hidden sm:inline text-white/10">|</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Scroll Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 z-50 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 
                    ${showScroll ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
                    left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 hover:bg-blue-700 active:scale-95`}
            >
                <ArrowUp size={24} />
            </button>
        </footer>
    );
};

export default DynamicFooter;
