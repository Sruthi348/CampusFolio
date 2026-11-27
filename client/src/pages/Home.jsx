import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F6F9] text-[#0F172A] relative overflow-hidden select-none">
      
      {/* Decorative subtle background accents */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#E9EFF6] to-transparent rounded-full blur-3xl pointer-events-none opacity-70"
        aria-hidden="true"
      />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-[#DCE3EC] bg-[#FFFFFF]/90 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left side of header: Logo, CampusFolio heading, and Institutional Portfolio subtitle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#142B4A] flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-extrabold text-xl sm:text-2xl text-[#0F172A] tracking-tight leading-none">
                CampusFolio
              </h1>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#526175] mt-1 leading-none">
                Institutional Portfolio
              </span>
            </div>
          </div>

          {/* Right side of header: Visitor Sign In and Sign In buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/visitor-login"
              className="inline-flex items-center justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#142B4A] text-[#142B4A] hover:bg-[#E9EFF6] text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer"
            >
              Visitor Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#243F64] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Layout: Prominent, clean, centered presentation */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Prominent Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[#142B4A] flex items-center justify-center text-white shadow-lg mb-8 border border-[#B9C9DD]/30 transition-transform duration-300 hover:scale-105">
            <GraduationCap className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#0F172A] tracking-tight leading-tight">
            Campus<span className="text-[#142B4A]">Folio</span>
          </h2>

          {/* Institutional Portfolio Subtitle directly below it */}
          <p className="text-lg sm:text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#526175] mt-3 sm:mt-5">
            Institutional Portfolio
          </p>

        </div>
      </main>

      {/* Bottom Spacer to balance the layout perfectly */}
      <div className="h-10 sm:h-16" aria-hidden="true" />

    </div>
  );
}
