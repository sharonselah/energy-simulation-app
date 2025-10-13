// Animated number counter component

'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef(value);

  useEffect(() => {
    // Only animate if value actually changed
    if (previousValueRef.current === value) {
      return;
    }

    setIsAnimating(true);
    const startValue = previousValueRef.current;
    const endValue = value;
    const startTime = Date.now();
    const difference = endValue - startValue;

    const updateValue = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + difference * easeOut;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setIsAnimating(false);
        previousValueRef.current = value;
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span 
      className={`${className} ${isAnimating ? 'animate-countUp' : ''}`}
      aria-live="polite"
    >
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

