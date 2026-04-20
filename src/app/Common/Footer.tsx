"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Facebook,
    Twitter,
    Linkedin,
    ArrowUp,
    Instagram,
    Phone,
    Mail
} from "lucide-react";
import Logo from "@/public/logo.svg"
import Image from "next/image"
import { useAppSelector } from "@/app/hooks/reduxHooks";
import { selectFooterContent, FooterContent } from "@/app/store/footerSlice";

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    
    // Get footer content from Redux footer slice, with fallback for when Provider is not available
    let footerContent;
    try {
        footerContent = useAppSelector(selectFooterContent);
    } catch (error) {
        console.log('Redux Provider not available, using fallback content');
        footerContent = null;
    }
    
    // Fallback content when Redux is not available
    const defaultContent: FooterContent = {
        brandDescription: "Grow your business with an affordable, customizable AppGUE solution that enhances communication effortlessly.",
        logoUrl: "/logo.svg",
        socialLinks: [
            { id: 'facebook', name: 'Facebook', url: '#', enabled: true, icon: 'facebook', customIconUrl: undefined },
            { id: 'twitter', name: 'Twitter', url: '#', enabled: true, icon: 'twitter', customIconUrl: undefined },
            { id: 'linkedin', name: 'Linkedin', url: '#', enabled: true, icon: 'linkedin', customIconUrl: undefined },
            { id: 'instagram', name: 'Instagram', url: '#', enabled: true, icon: 'instagram', customIconUrl: undefined }
        ],
        usefulLinks: [
            { id: 'live-streaming', text: 'Live Streaming', sectionId: 'second-1', enabled: true },
            { id: 'pk-battle', text: 'Pk Battle', sectionId: 'third-1', enabled: true },
            { id: 'features', text: 'Features', sectionId: 'fourth-1', enabled: true },
            { id: 'admin-panel', text: 'Admin Panel', sectionId: 'fifth-1', enabled: true },
            { id: 'benefits', text: 'Benefits', sectionId: 'sixth-1', enabled: true }
        ],
        contactInfo: {
            phone: "+91-9033160895",
            email: "info@primocys.com",
            phoneEnabled: true,
            emailEnabled: true,
            phoneIcon: 'phone',
            emailIcon: 'mail',
            phoneCustomIconUrl: undefined,
            emailCustomIconUrl: undefined,
            phoneOrder: 0,
            emailOrder: 1
        },
        copyright: "© Primocys 2024 All Rights Reserved",
        bottomLinks: [
            { id: 'security', text: 'Security', url: '#', enabled: true },
            { id: 'privacy', text: 'Privacy & Policy', url: '#', enabled: true },
            { id: 'terms', text: 'Terms & Services', url: '#', enabled: true }
        ],
        styles: {
            backgroundColor: '#050533',
            brandTextColor: '#ffffff',
            linkTextColor: '#9ca3af',
            linkHoverColor: '#3b82f6',
            socialIconColor: '#ffffff',
            socialIconBackground: '#ffffff20',
            socialIconHoverBackground: '#1d4ed8',
            contactIconColor: '#3b82f6',
            contactIconBackground: '#dbeafe',
            contactIconHoverBackground: '#1e3a8a',
            bottomBarBorderColor: '#ffffff10',
            bottomBarTextColor: '#9ca3af',
            bottomBarLinkHoverColor: '#3b82f6'
        }
    };
    
    const content: FooterContent = footerContent || defaultContent;
    
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

    // Redirection logic to match navbar sections
    const scrollToSection = (sectionId: string) => {
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

    return (
        <footer ref={footerRef} className="text-white pt-8  sm:pt-16 pb-4 relative overflow-hidden bg-[#050533]" style={{ backgroundColor: content?.styles?.backgroundColor || '#050533' }}>
            {/* 2. Main Content Section */}
            <div className="max-w-7xl mx-auto px-6">
                {/* lg:justify-items-center ensures the columns are centered in their respective grid areas */}
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
                                    className="group/icon w-12 h-12 rounded-full bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-blue-700 flex-shrink-0 relative"
                                    onClick={() => window.open(link.url, '_blank')}
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
                                >
                                    {/* Shining effect overlay */}
                                    <div className="absolute inset-0 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-200">
                                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover/icon:translate-x-full transition-transform duration-500 ease-out"></div>
                                    </div>
                                    <div className="relative w-6 h-6 overflow-hidden" style={{ color: content.styles.socialIconColor }}>
                                        {renderSocialIcon(link)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Useful Links */}
                    <div className={`transition-all duration-1000 delay-200 flex flex-col items-start ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="border-b border-gray-800 mb-8 pb-4 w-fit pr-8">
                            <h4 className="text-[20px] text-gray-200 font-bold">Useful Links</h4>
                        </div>
                        <ul className="space-y-4 -mt-2">
                            {content.usefulLinks.filter((link: any) => link.enabled).map((link: any) => (
                                <li key={link.id}>
                                    <button 
                                        onClick={() => scrollToSection(link.sectionId)} 
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
                        <div className="border-b border-gray-800 mb-8 pb-4 w-fit pr-8">
                            <h4 className="text-[20px] text-gray-200 font-bold">Contact</h4>
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
                                        className="flex items-center gap-4 text-gray-400 text-[16px] font-medium transition-all duration-300 hover:text-blue-500 hover:translate-x-2 cursor-pointer group"
                                        onClick={() => item.type === 'phone' 
                                            ? window.location.href = `tel:${item.value}`
                                            : window.location.href = `mailto:${item.value}`
                                        }
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

            {/* 3. Bottom Bar Section */}
            <div className="w-full border-t border-white/10 pt-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-[14px] text-gray-400 tracking-wide font-medium text-center md:text-left">
                    <p className="order-2 md:order-1 break-words max-w-full">
                        {content.copyright}
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 order-1 md:order-2">
                        {content.bottomLinks.filter((link: any) => link.enabled).map((link: any, index: number) => (
                            <React.Fragment key={link.id}>
                                <a 
                                    href={link.url} 
                                    className="hover:text-blue-500 transition-colors whitespace-nowrap break-words max-w-[120px]"
                                    onClick={(e) => {
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

export default Footer;