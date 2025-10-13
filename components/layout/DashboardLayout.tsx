// Main dashboard layout wrapper

'use client';

import React from 'react';
import Header from './Header';
import ScrollToTop from '@/components/shared/ScrollToTop';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main 
        className="container mx-auto px-4 py-6 md:py-8 flex-1 animate-fadeIn"
        role="main"
      >
        {children}
      </main>
      <footer 
        className="bg-primary text-white py-6 md:py-8 mt-12 border-t-4 border-cta shadow-2xl"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs md:text-sm">
              © {new Date().getFullYear()} Energy Simulation Game
            </p>
            <p className="text-xs md:text-sm text-white/80">
              Empowering Kenyan Energy Consumers
            </p>
          </div>
          <div className="text-xs text-white/60">
            Helping Kenya save energy and reduce carbon emissions
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}

