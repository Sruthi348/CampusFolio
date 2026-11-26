import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#DCE3EC] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#142B4A] flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-[#0F172A] tracking-tight">
                Campus<span className="text-[#142B4A]">Folio</span>
              </span>
            </div>
            <p className="text-xs text-[#526175] max-w-md leading-relaxed">
              Institutional Centralized Student Portfolio Discovery Platform. Showcasing verified academic credentials, engineering projects, publications, and professional achievements to recruiters and alumni networks worldwide.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#526175] pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#526175]" />
                University Campus
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#526175]" />
                portfolios@college.edu
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#526175]">
              <li>
                <Link to="/search" className="hover:text-[#142B4A] transition">
                  Browse Portfolios
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-[#142B4A] transition">
                  Academic Departments
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#142B4A] transition">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link to="/search?status=ALUMNI" className="hover:text-[#142B4A] transition">
                  Alumni Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Trust & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3">
              Institutional Governance
            </h4>
            <ul className="space-y-2 text-xs text-[#526175]">
              <li>
                <Link to="/privacy" className="hover:text-[#142B4A] transition flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#243F64]" />
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#142B4A] transition">
                  Student & Staff Portal
                </Link>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold badge-approved">
                  Verified Records Only
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#DCE3EC] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526175]">
          <p>© {new Date().getFullYear()} CampusFolio Institutional Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <Link to="/privacy" className="hover:underline hover:text-[#142B4A]">Privacy Policy</Link>
            <span>•</span>
            <span>Institutionally Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
