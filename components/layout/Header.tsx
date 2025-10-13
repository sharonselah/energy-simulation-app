// Header component for the dashboard

import React from 'react';
import { Zap } from 'lucide-react';

export default function Header() {
  return (
    <header 
      className="bg-primary text-white shadow-xl border-b border-primary/20 sticky top-0 z-40 animate-fadeInDown"
      role="banner"
    >
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-cta/20 p-2 rounded-xl shadow-lg transition-transform hover:scale-110">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-cta" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              Energy Simulation Game
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/90 mt-0.5 md:mt-1 truncate">
              Discover savings with smart electricity usage in Kenya
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

