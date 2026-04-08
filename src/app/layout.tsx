import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reelboost",
  description: "Grow your reels faster",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          min-h-screen
          flex
          flex-col
          bg-white
        `}
      >
        {/* Page content */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}

