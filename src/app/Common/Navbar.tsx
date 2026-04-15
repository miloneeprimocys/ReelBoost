"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Edit3 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { toggleBuilderMode } from "../store/builderSlice";
import { updateNavbarContent } from "../store/navbarSlice";
import Image from "next/image";
import logo from "../../../public/logo.svg";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    
    // Get navbar state from Redux store
    const navbar = useAppSelector(state => state.navbar);
    const { content } = navbar;
    
    
    // Handle scroll for sticky effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Updated redirection logic to match footer
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
            // Close mobile menu after clicking
            setIsOpen(false);
        }
    };

    
    const toggleMobileDropdown = (name: string) => {
        setOpenMobileDropdown(openMobileDropdown === name ? null : name);
    };

    return (
        <>
            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 py-4 ${scrolled ? "bg-white shadow-md" : "bg-white shadow-md"}`} style={{ backgroundColor: content?.backgroundColor }}>
                <div className="max-w-7xl mx-auto px-2 flex items-center justify-between">

                    {/* 1. Logo (Left) */}
                   <Image src={content?.logo || logo} alt="ReelBoost" width={40} height={40} />

                    {/* 2. Desktop Navigation Links (Center) */}
                    <div className="hidden lg:flex items-center gap-8">
                        {content?.links?.filter(link => link.visible).map((link) => (
                            <div key={link.id} className="group relative">
                                <button 
                                    onClick={() => scrollToSection(link.sectionId)}
                                    className="flex cursor-pointer items-center gap-1 text-[16px] font-semibold hover:text-black transition-colors"
                                    style={{ color: content?.textColor }}
                                >
                                    {link.label}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 3. Controls (Right) - Now includes Builder next to Live Demo */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Builder Button - Desktop Only */}
                        <button
                            onClick={() => dispatch(toggleBuilderMode())}
                            className="hidden lg:flex items-center gap-2 bg-blue-600/10 text-blue-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-600/20"
                        >
                            <Edit3 size={16} />
                            Builder
                        </button>

                        {/* Create Account Button / Live Demo */}
                        <button 
                            className="relative group/btn px-3 sm:px-7 py-2 sm:py-3 text-[10px] sm:text-[14px] rounded-lg font-bold transition-all whitespace-nowrap overflow-hidden flex items-center justify-center min-w-[100px] sm:min-w-[160px]"
                            style={{ 
                                backgroundColor: content?.liveDemoButton?.backgroundColor || '#2b49c5',
                                color: content?.liveDemoButton?.textColor || '#ffffff'
                            }}
                        >
                            <span
                                className="absolute inset-x-0 top-0 w-full h-[160%] transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] translate-y-[-101%] group-hover/btn:translate-y-0 z-0 pointer-events-none"
                                style={{ 
                                    clipPath: 'ellipse(100% 40% at 50% 35%)',
                                    backgroundColor: content?.liveDemoButton?.hoverBackgroundColor || '#000000'
                                }}
                            ></span>
                            <span className="relative z-10 transition-colors duration-300 pointer-events-none uppercase">
                                {content?.liveDemoButton?.label || 'live demo'}
                            </span>
                        </button>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="lg:hidden p-1 text-[#2b49c5] bg-blue-50 rounded-[5px] hover:bg-blue-100 transition-colors"
                        >
                            <Menu size={24} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- MOBILE OVERLAY SYSTEM --- */}
            <div
                className={`fixed inset-0 bg-black/50 z-[110] transition-transform duration-500 ease-in-out ${isOpen
                        ? "translate-x-0 delay-0"
                        : "-translate-x-full delay-150"
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* 2. Blue Sidebar Overlay */}
            <div className={`fixed top-0 left-0 h-full w-[85%] max-w-[400px] bg-[#2b49c5] z-[120] p-6 sm:p-8 transition-transform duration-500 ease-in-out ${isOpen
                    ? "translate-x-0 delay-150"
                    : "-translate-x-full delay-0"
                }`}>
                <div className="flex items-center justify-between mb-10 sm:mb-12">
                    <span className="text-2xl sm:text-3xl font-black text-white italic">AppGUE</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 border border-white/30 rounded-[10px] text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[85vh]">
                    {content?.links?.filter(link => link.visible).map((link) => (
                        <div key={link.id} className="py-3">
                            <button
                                onClick={() => scrollToSection(link.sectionId)}
                                className="flex items-center justify-between w-full text-white text-base sm:text-lg font-bold text-left hover:text-yellow-400 transition-colors outline-none focus:outline-none"
                            >
                                {link.label}
                            </button>
                        </div>
                    ))}
                    {/* Builder Option in Mobile */}
                    <div className="py-3 border-t border-white/20 mt-4 pt-4">
                        <button
                            onClick={() => {
                                dispatch(toggleBuilderMode());
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 w-full text-white text-base sm:text-lg font-bold text-left hover:text-yellow-400 transition-colors"
                        >
                            <Edit3 size={20} />
                            Builder
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;