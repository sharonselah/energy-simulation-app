// Scroll to top button component

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="
        fixed bottom-6 right-6 z-50
        bg-cta text-primary
        w-12 h-12 rounded-full
        shadow-xl hover:shadow-2xl
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:-translate-y-1
        focus:outline-none focus-visible:ring-4 focus-visible:ring-cta/50
        animate-fadeInUp
      "
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" aria-hidden="true" />
    </button>
  );
}

