# Phase 7: Quick Reference Guide

## New Components & Utilities

### Loading & Feedback Components

#### LoadingSpinner
```tsx
import LoadingSpinner from '@/components/shared/LoadingSpinner';

<LoadingSpinner size="md" message="Loading data..." />
```
- Sizes: `sm`, `md`, `lg`
- Optional message prop
- Brand-colored (CTA yellow)

#### SkeletonLoader
```tsx
import SkeletonLoader from '@/components/shared/SkeletonLoader';

<SkeletonLoader variant="card" count={3} />
```
- Variants: `card`, `text`, `metric`, `chart`, `button`
- Count prop for multiple items
- Shimmer animation

#### Toast Notifications
```tsx
import Toast from '@/components/shared/Toast';

<Toast 
  type="success" 
  message="Device saved!" 
  onClose={() => {}}
/>
```
- Types: `success`, `error`, `warning`, `info`
- Auto-dismiss after 5 seconds
- Slide-in animation

### Animation Components

#### AnimatedNumber
```tsx
import AnimatedNumber from '@/components/shared/AnimatedNumber';

<AnimatedNumber 
  value={1234.56}
  duration={1000}
  decimals={2}
  prefix="KES "
  suffix="/month"
/>
```
- Smooth counting animation
- Configurable duration
- Prefix/suffix support

#### LazyLoad
```tsx
import LazyLoad from '@/components/shared/LazyLoad';

<LazyLoad>
  <HeavyComponent />
</LazyLoad>
```
- Intersection Observer-based
- Custom skeleton support
- Viewport-based loading

#### ScrollToTop
```tsx
import ScrollToTop from '@/components/shared/ScrollToTop';

<ScrollToTop />
```
- Appears after 300px scroll
- Smooth scroll to top
- Floating action button

---

## Enhanced Components

### Button
```tsx
<Button 
  variant="cta"
  loading={isLoading}
  disabled={false}
  ariaLabel="Submit form"
  fullWidth={false}
>
  Click Me
</Button>
```
- New: `loading` prop with spinner
- New: `ariaLabel` for accessibility
- New: `fullWidth` option
- Improved hover effects
- Better focus states

### Card
```tsx
<Card 
  title="My Card"
  subtitle="Description"
  hoverable={true}
  loading={false}
  ariaLabel="Statistics card"
>
  Content
</Card>
```
- New: `hoverable` with lift effect
- New: `loading` with skeleton
- New: `ariaLabel` for accessibility
- Fade-in animation on mount

### MetricCard
```tsx
<MetricCard
  title="Total Savings"
  value={1234}
  subtitle="per month"
  icon={DollarSign}
  trend="up"
  trendValue="12%"
  animated={true}
  decimals={2}
  prefix="KES "
/>
```
- New: `animated` with number counter
- New: `decimals` for precision
- New: `prefix`/`suffix` support
- Improved trend display

---

## Animation CSS Classes

### Fade Animations
- `animate-fadeIn` - Fade in from bottom
- `animate-fadeInUp` - Slide up while fading
- `animate-fadeInDown` - Slide down while fading
- `animate-slideInRight` - Slide from left

### Scale Animations
- `animate-scaleIn` - Scale up while fading
- `animate-pulse` - Pulse opacity
- `animate-bounce` - Bounce vertically

### Special Animations
- `animate-countUp` - For number transitions
- `animate-spin` - Rotate continuously
- `skeleton` - Shimmer loading effect
- `stagger-item` - For list items with delay

### Hover Effects
- `hover-lift` - Lift on hover
- `card-hover` - Card-specific hover
- `transition-smooth` - Smooth all transitions

### Example Usage
```tsx
<div className="animate-fadeInUp stagger-item" style={{ animationDelay: '0.1s' }}>
  Content
</div>
```

---

## Performance Utilities

### useIntersectionObserver
```tsx
import { useIntersectionObserver } from '@/lib/performance';

const ref = useRef<HTMLDivElement>(null);
const isVisible = useIntersectionObserver(ref, {
  threshold: 0.1,
  rootMargin: '50px',
});
```

### useDebounce
```tsx
import { useDebounce } from '@/lib/performance';

const debouncedValue = useDebounce(searchTerm, 500);
```

### useThrottle
```tsx
import { useThrottle } from '@/lib/performance';

const throttledFn = useThrottle(expensiveFunction, 1000);
```

### PerformanceMonitor
```tsx
import { PerformanceMonitor } from '@/lib/performance';

PerformanceMonitor.start('calculation');
// ... do work ...
PerformanceMonitor.end('calculation'); // Logs duration
```

---

## Lazy Loading with Next.js

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic';
import SkeletonLoader from '@/components/shared/SkeletonLoader';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <SkeletonLoader variant="card" />,
    ssr: false, // Disable SSR if client-only
  }
);
```

### Example in page.tsx
```tsx
const CostComparison = dynamic(
  () => import('@/components/cost-comparison/CostComparison'),
  {
    loading: () => <SkeletonLoader variant="card" className="h-96" />,
    ssr: false,
  }
);
```

---

## Accessibility Best Practices

### ARIA Labels
```tsx
// Button with descriptive label
<button aria-label="Close dialog">
  <X className="w-4 h-4" aria-hidden="true" />
</button>

// Interactive element with state
<button aria-pressed={isSelected}>
  Toggle
</button>

// Live region for dynamic content
<div role="status" aria-live="polite">
  {count} items selected
</div>
```

### Keyboard Navigation
```tsx
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};

<button onKeyDown={handleKeyDown}>
  Click or press Enter/Space
</button>
```

### Focus Management
```tsx
// Custom focus styles (already in animations.css)
<button className="focus:outline-none focus-visible:ring-4 focus-visible:ring-cta/50">
  Accessible Button
</button>
```

---

## Responsive Design Patterns

### Breakpoint Classes
```tsx
// Mobile-first approach
<div className="
  text-sm          // Base (mobile)
  md:text-base     // Tablet
  lg:text-lg       // Desktop
">
  Responsive text
</div>

// Grid layout
<div className="
  grid
  grid-cols-1      // Mobile: 1 column
  sm:grid-cols-2   // Small: 2 columns
  md:grid-cols-3   // Medium: 3 columns
  lg:grid-cols-4   // Large: 4 columns
  gap-4
">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Responsive Spacing
```tsx
<div className="
  px-4 py-4        // Mobile padding
  md:px-6 md:py-6  // Tablet padding
  lg:px-8 lg:py-8  // Desktop padding
">
  Content
</div>
```

---

## Performance Optimization Tips

### 1. Use Dynamic Imports for Heavy Components
```tsx
// ✅ Good - Lazy loaded
const ChartComponent = dynamic(() => import('./ChartComponent'));

// ❌ Bad - Always loaded
import ChartComponent from './ChartComponent';
```

### 2. Memoize Expensive Calculations
```tsx
import { useMemo } from 'react';

const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

### 3. Debounce User Input
```tsx
import { useDebounce } from '@/lib/performance';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // Only runs after user stops typing for 300ms
  performSearch(debouncedSearch);
}, [debouncedSearch]);
```

### 4. Use Intersection Observer for Lazy Loading
```tsx
<LazyLoad>
  <ExpensiveChart data={chartData} />
</LazyLoad>
```

---

## Common Patterns

### Loading State Pattern
```tsx
const [isLoading, setIsLoading] = useState(false);

return (
  <>
    {isLoading ? (
      <SkeletonLoader variant="card" count={3} />
    ) : (
      <div className="space-y-4">
        {data.map(item => <Card key={item.id} {...item} />)}
      </div>
    )}
  </>
);
```

### Animated List Pattern
```tsx
<div className="space-y-4">
  {items.map((item, index) => (
    <div 
      key={item.id}
      className="stagger-item"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Card>{item.content}</Card>
    </div>
  ))}
</div>
```

### Toast Notification Pattern
```tsx
const [toasts, setToasts] = useState<ToastMessage[]>([]);

const addToast = (message: string, type: ToastType) => {
  const id = Date.now().toString();
  setToasts(prev => [...prev, { id, message, type }]);
};

const removeToast = (id: string) => {
  setToasts(prev => prev.filter(t => t.id !== id));
};

// Usage
addToast('Settings saved!', 'success');
```

### Responsive Container Pattern
```tsx
<div className="
  container mx-auto
  px-4 sm:px-6 lg:px-8
  py-6 md:py-8 lg:py-12
">
  {children}
</div>
```

---

## Testing Checklist

### Visual Testing
- [ ] All animations play smoothly
- [ ] Loading states appear correctly
- [ ] Hover effects work on all interactive elements
- [ ] Responsive design works on all breakpoints
- [ ] Colors match brand guidelines

### Accessibility Testing
- [ ] Tab through entire page with keyboard
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Check color contrast ratios
- [ ] Verify ARIA labels are descriptive
- [ ] Test with reduced motion preference

### Performance Testing
- [ ] Check Lighthouse score (target: 90+)
- [ ] Verify lazy loading works
- [ ] Monitor bundle size
- [ ] Check Time to Interactive (target: < 2s)
- [ ] Test on slow 3G network

---

## Troubleshooting

### Animation Not Playing
```tsx
// Make sure parent has correct class
<div className="animate-fadeIn">
  Content
</div>

// For stagger animations, ensure delay is set
<div className="stagger-item" style={{ animationDelay: '0.1s' }}>
  Content
</div>
```

### Lazy Loading Not Working
```tsx
// Check Intersection Observer support
if ('IntersectionObserver' in window) {
  // Use lazy loading
} else {
  // Fallback: load immediately
}
```

### Focus Styles Not Showing
```tsx
// Use focus-visible instead of focus
<button className="focus-visible:ring-4 focus-visible:ring-cta/50">
  Button
</button>
```

### Loading Spinner Not Centered
```tsx
// Use flex container
<div className="flex items-center justify-center min-h-screen">
  <LoadingSpinner size="lg" />
</div>
```

---

## Resources

### Documentation
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [React Hooks](https://react.dev/reference/react)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

## Support

For questions or issues related to Phase 7 enhancements:
1. Check this quick reference
2. Review PHASE7_COMPLETE.md for detailed documentation
3. Check component source code for implementation details
4. Test in isolation using Storybook (if available)

---

**Last Updated**: October 9, 2025
**Phase**: 7 (User Experience Enhancements)
**Status**: Complete

