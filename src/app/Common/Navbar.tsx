"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Edit3 } from "lucide-react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { toggleBuilderMode } from "../store/builderSlice";
import Image from "next/image";
import logo from "../../../public/logo.svg";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
    const dispatch = useAppDispatch();

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

    const navLinks = [
        { name: "Live Streaming", id: "second-1", hasDropdown: false, options: [] as string[] },
        { name: "Pk Battle", id: "third-1", hasDropdown: false, options: [] as string[] },
        { name: "Features", id: "fourth-1", hasDropdown: false, options: [] as string[] },
        { name: "Admin Panel", id: "fifth-1", hasDropdown: false, options: [] as string[] },
        { name: "Benefits", id: "sixth-1", hasDropdown: false, options: [] as string[] },
    ];

    const toggleMobileDropdown = (name: string) => {
        setOpenMobileDropdown(openMobileDropdown === name ? null : name);
    };

    return (
        <>
            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 py-4 ${scrolled ? "bg-white shadow-md" : "bg-white shadow-md"}`}>
                <div className="max-w-7xl mx-auto px-2 flex items-center justify-between">

                    {/* 1. Logo (Left) */}
                   <Image src={logo} alt="ReelBoost" width={40} height={40} />

                    {/* 2. Desktop Navigation Links (Center) */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <div key={link.name} className="group relative">
                                <button 
                                    onClick={() => scrollToSection(link.id)}
                                    className="flex cursor-pointer items-center gap-1 text-[16px] font-semibold text-[#2b49c5] hover:text-black transition-colors"
                                >
                                    {link.name}
                                    {link.hasDropdown && <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-300" />}
                                </button>

                                {link.hasDropdown && (
                                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                        <div className="bg-[#2b49c5] shadow-xl rounded-xl py-2 min-w-[200px] border border-blue-400/20">
                                            {link.options?.map((opt: any) => (
                                                <a
                                                    key={opt}
                                                    href="#"
                                                    className="block px-4 py-2 text-[16px] text-white hover:text-yellow-400 cursor-pointer rounded-lg transition-all"
                                                >
                                                    {opt}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                        <button className="relative group/btn bg-[#2b49c5] text-white px-3 sm:px-7 py-2 sm:py-3 text-[10px] sm:text-[14px] rounded-lg font-bold transition-all whitespace-nowrap overflow-hidden flex items-center justify-center min-w-[100px] sm:min-w-[160px]">
                            <span
                                className="absolute inset-x-0 top-0 w-full h-[160%] bg-black transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] translate-y-[-101%] group-hover/btn:translate-y-0 z-0 pointer-events-none"
                                style={{ clipPath: 'ellipse(100% 40% at 50% 35%)' }}
                            ></span>
                            <span className="relative z-10 transition-colors duration-300 pointer-events-none uppercase">
                                live demo
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
                    {navLinks.map((link) => (
                        <div key={link.name} className="py-3">
                            <button
                                onClick={() => link.hasDropdown ? toggleMobileDropdown(link.name) : scrollToSection(link.id)}
                                className="flex items-center justify-between w-full text-white text-base sm:text-lg font-bold text-left hover:text-yellow-400 transition-colors outline-none focus:outline-none"
                            >
                                {link.name}
                                {link.hasDropdown && (
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-transform duration-300 ${openMobileDropdown === link.name ? "rotate-180" : ""}`}>
                                        <ChevronDown size={16} />
                                    </div>
                                )}
                            </button>

                            {link.hasDropdown && (
                                <div
                                    className={`grid transition-all duration-500 ease-in-out ${openMobileDropdown === link.name
                                        ? "grid-rows-[1fr] opacity-100 mt-1"
                                        : "grid-rows-[0fr] opacity-0 mt-0"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="flex flex-col gap-4 ml-2 mt-2">
                                            {link.options?.map((opt) => (
                                                <a
                                                    key={opt}
                                                    href="#"
                                                    className="relative text-white/70 hover:text-yellow-400 pl-6 py-1 text-[16px] transition-colors block cursor-pointer flex items-center 
                                        before:content-[''] before:absolute before:left-0 before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full before:transition-colors hover:before:bg-yellow-400"
                                                >
                                                    {opt}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
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