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
import Logo from "../../../public/logo.svg"
import Image from "next/image"

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);

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
        <footer ref={footerRef} className="bg-[#050533]  text-white pt-8  sm:pt-16 pb-4 relative overflow-hidden">
            {/* 2. Main Content Section */}
            <div className="max-w-7xl mx-auto px-6">
                {/* lg:justify-items-center ensures the columns are centered in their respective grid areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-8 lg:justify-items-center mb-20">

                    {/* Column 1: Brand & Description */}
                    <div className={`transition-all duration-1000 delay-100 flex flex-col items-start ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <Image src={Logo} alt="ReelBoost Logo" width={40} height={40} />
                        </div>
                        <p className="text-gray-400 text-[16px] leading-relaxed mb-8 max-w-[380px]">
                            Grow your business with an affordable, customizable AppGUE solution that enhances communication effortlessly. Our Software provides businesses with a script that allows for seamless interaction.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                                <div
                                    key={idx}
                                    className="group/icon w-12 h-12 rounded-full bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-blue-700"
                                >
                                    <div className="relative w-6 h-6 overflow-hidden">
                                        <Icon className="w-6 h-6 text-white transition-all duration-300 group-hover/icon:-translate-x-12" />
                                        <Icon className="w-6 h-6 text-white absolute top-0 left-12 transition-all duration-300 group-hover/icon:left-0" />
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
                            <li><button onClick={() => scrollToSection('second-1')} className="inline-block cursor-pointer text-gray-400 hover:text-blue-500 hover:translate-x-2 text-[16px] font-medium transition-all duration-300">Live Streaming</button></li>
                            <li><button onClick={() => scrollToSection('third-1')} className="inline-block cursor-pointer text-gray-400 hover:text-blue-500 hover:translate-x-2 text-[16px] font-medium transition-all duration-300">Pk Battle</button></li>
                            <li><button onClick={() => scrollToSection('features')} className="inline-block cursor-pointer text-gray-400 hover:text-blue-500 hover:translate-x-2 text-[16px] font-medium transition-all duration-300">Features</button></li>
                            <li><button onClick={() => scrollToSection('fifth-1')} className="inline-block cursor-pointer text-gray-400 hover:text-blue-500 hover:translate-x-2 text-[16px] font-medium transition-all duration-300">Admin Panel</button></li>
                            <li><button onClick={() => scrollToSection('benefits')} className="inline-block cursor-pointer text-gray-400 hover:text-blue-500 hover:translate-x-2 text-[16px] font-medium transition-all duration-300">Benefits</button></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className={`transition-all duration-1000 delay-300 flex flex-col items-start ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="border-b border-gray-800 mb-8 pb-4 w-fit pr-8">
                            <h4 className="text-[20px] text-gray-200 font-bold">Contact</h4>
                        </div>
                        <ul className="space-y-6 -mt-2">
                            <li>
                                <button className="flex items-center gap-4 text-gray-400 text-[16px] font-medium transition-all duration-300 hover:text-blue-500 hover:translate-x-2 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-blue-600/20">
                                        <Phone size={20} className="text-blue-500" />
                                    </div>
                                    +91-9033160895
                                </button>
                            </li>
                            <li>
                                <button className="flex items-center gap-4 text-gray-400 text-[16px] font-medium transition-all duration-300 hover:text-blue-500 hover:translate-x-2 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-blue-600/20">
                                        <Mail size={20} className="text-blue-500" />
                                    </div>
                                    info@primocys.com
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Bar Section */}
            <div className="w-full border-t border-white/10 pt-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-[14px] text-gray-400 tracking-wide font-medium text-center md:text-left">
                    <p className="order-2 md:order-1">
                        © Primocys 2024 All Rights Reserved
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 order-1 md:order-2">
                        <a href="#" className="hover:text-blue-500 transition-colors whitespace-nowrap">Security</a>
                        <span className="hidden sm:inline text-white/10">|</span>
                        <a href="#" className="hover:text-blue-500 transition-colors whitespace-nowrap">Privacy & Policy</a>
                        <span className="hidden sm:inline text-white/10">|</span>
                        <a href="#" className="hover:text-blue-500 transition-colors whitespace-nowrap">Terms & Services</a>
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