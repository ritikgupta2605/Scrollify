import React, { useCallback, useEffect, useRef, useState } from 'react';

const FEATURES = [
  { id: 1, title: 'Feature 1 : Lorem ipsum dolor', heading: 'TEXT HEADING DISPLAY', bullets: [
      'Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod.',
      'Ut enim minim: veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.',
      'Sed ut perspiciatis: unde omnis iste natus error sit voluptatem accusantium.',
      'Excepteur sint occaecat: cupidatat non proident sunt in culpa qui officia deserunt.',
    ], image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop' },
  { id: 2, title: 'Feature 2 : Lorem ipsum dolor', heading: 'POWERFUL PERFORMANCE', bullets: [
      'Faster loads with on-device caching and smart prefetching.',
      'Battery-friendly rendering pipeline and haptics.',
      'Accessible by default with semantic interactions.',
      'Enterprise-grade security baked in.',
    ], image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop' },
  { id: 3, title: 'Feature 3 : Lorem ipsum dolor', heading: 'BEAUTIFUL INTERACTIONS', bullets: [
      'Fluid transitions tuned for 60fps.',
      'Delightful micro-animations with reduced motion support.',
      'Context-aware UI with instant feedback.',
      'Customizable theming.',
    ], image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop' },
  { id: 4, title: 'Feature 4 : Lorem ipsum dolor', heading: 'REAL-TIME SYNC', bullets: [
      'Live collaboration across devices.',
      'Conflict-free offline editing.',
      'Background refresh with minimal data usage.',
      'Granular permissions.',
    ], image: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop' },
  { id: 5, title: 'Feature 5 : Lorem ipsum dolor', heading: 'ANALYTICS INSIGHTS', bullets: [
      'Understand behavior with privacy-first metrics.',
      'Automatic anomaly detection.',
      'Exportable dashboards.',
      'Shareable reports.',
    ], image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?q=80&w=800&auto=format&fit=crop' },
];

export default function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection observer for sticky behavior
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting);
        setIsSticky(entry.isIntersecting);
      }, 
      { 
        threshold: [0, 0.1, 0.9, 1],
        rootMargin: '0px 0px -50% 0px'
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const lastWheelRef = useRef(0);
  const lastScrollRef = useRef(0);
  const scrollAccumulator = useRef(0);
  const isScrolling = useRef(false);

  const go = useCallback((delta) => {
    setActiveIndex((i) => Math.min(FEATURES.length - 1, Math.max(0, i + delta)));
  }, []);

  // Desktop wheel handling
  useEffect(() => {
    if (isMobile) return;

    function onWheel(e) {
      if (!inView) return;
      const atStart = activeIndex === 0;
      const atEnd = activeIndex === FEATURES.length - 1;
      const now = Date.now();
      const throttleOk = now - lastWheelRef.current > 250;
      if (!throttleOk) { e.preventDefault(); return; }
      if (e.deltaY > 0 && !atEnd) {
        e.preventDefault();
        lastWheelRef.current = now;
        go(1);
      } else if (e.deltaY < 0 && !atStart) {
        e.preventDefault();
        lastWheelRef.current = now;
        go(-1);
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [inView, activeIndex, go, isMobile]);

  // Mobile scroll handling
  useEffect(() => {
    if (!isMobile) return;

    let scrollTimeout;
    let lastScrollY = window.scrollY;
    let scrollDirection = 0;
    let scrollVelocity = 0;

    const handleScroll = () => {
      if (!inView || !isSticky) return;
      
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Accumulate scroll delta
      scrollAccumulator.current += deltaY;
      scrollVelocity = Math.abs(deltaY);
      
      // Determine scroll direction
      if (Math.abs(deltaY) > 5) {
        scrollDirection = deltaY > 0 ? 1 : -1;
      }

      // Set a timeout to handle the scroll after it settles
      scrollTimeout = setTimeout(() => {
        const atStart = activeIndex === 0;
        const atEnd = activeIndex === FEATURES.length - 1;
        
        // Check if we have enough scroll to trigger feature change
        const scrollThreshold = 50; // Minimum scroll distance
        const velocityThreshold = 10; // Minimum scroll velocity
        
        if (Math.abs(scrollAccumulator.current) > scrollThreshold || 
            (Math.abs(scrollAccumulator.current) > 20 && scrollVelocity > velocityThreshold)) {
          
          const now = Date.now();
          const throttleOk = now - lastScrollRef.current > 400;
          
          if (throttleOk) {
            lastScrollRef.current = now;
            
            if (scrollDirection > 0 && !atStart) {
              // Scrolling down - previous feature
              go(-1);
            } else if (scrollDirection < 0 && !atEnd) {
              // Scrolling up - next feature
              go(1);
            }
          }
        }
        
        // Reset accumulator
        scrollAccumulator.current = 0;
        scrollVelocity = 0;
      }, 100);
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [inView, isSticky, activeIndex, go, isMobile]);

  // Mobile touch handling for swipe gestures
  useEffect(() => {
    if (!isMobile) return;

    const node = stickyRef.current;
    if (!node) return;

    let startY = 0;
    let startTime = 0;
    let isSwiping = false;

    const onTouchStart = (e) => {
      if (!inView || !isSticky) return;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isSwiping = false;
    };

    const onTouchMove = (e) => {
      if (!inView || !isSticky) return;
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaY > 10) {
        isSwiping = true;
      }
    };

    const onTouchEnd = (e) => {
      if (!inView || !isSticky || !isSwiping) return;
      
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;
      
      // Only trigger if it's a significant swipe
      const isSignificantSwipe = Math.abs(deltaY) > 60;
      const isFastSwipe = Math.abs(deltaY) > 30 && deltaTime < 300;
      
      if (isSignificantSwipe || isFastSwipe) {
        const now = Date.now();
        const throttleOk = now - lastScrollRef.current > 300;
        
        if (throttleOk) {
          lastScrollRef.current = now;
          const atStart = activeIndex === 0;
          const atEnd = activeIndex === FEATURES.length - 1;
          
          if (deltaY < 0 && !atEnd) {
            // Swipe up - next feature
            go(1);
          } else if (deltaY > 0 && !atStart) {
            // Swipe down - previous feature
            go(-1);
          }
        }
      }
    };

    node.addEventListener('touchstart', onTouchStart, { passive: true });
    node.addEventListener('touchmove', onTouchMove, { passive: true });
    node.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
    };
  }, [inView, isSticky, activeIndex, go, isMobile]);

  const active = FEATURES[activeIndex];

  return (
    <div className="page">
      <div className="container">
        <div className="hero-spacer"></div>
        <section className="feature-section" ref={sectionRef}>
          <div className={`feature-sticky ${isSticky ? 'sticky-active' : ''}`} ref={stickyRef}>
            <div className="grid">
              <div className="left">
                <div className="eyebrow">Feature No.{active.id} -</div>
                <div className="heading">{active.heading}</div>
                <ul className="bullets">
                  {active.bullets.map((b, i) => (<li key={i}>{b}</li>))}
                </ul>
                <div className="arrows" aria-label="Slide navigation">
                  <button className="arrow-btn" aria-label="Previous" onClick={() => go(-1)} disabled={activeIndex===0}>←</button>
                  <span className="divider"></span>
                  <button className="arrow-btn" aria-label="Next" onClick={() => go(1)} disabled={activeIndex===FEATURES.length-1}>→</button>
                </div>
              </div>

              <div className="phone-wrap" aria-hidden>
                <div className="phone real">
                  <img src={active.image} alt="iPhone feature" />
                </div>
              </div>

              <div className="right">
                <h3>Feature Showcase</h3>
                {FEATURES.map((f, i) => (
                  <div key={f.id} className="feature-item" aria-current={i===activeIndex} role="button" tabIndex={0}
                       onClick={() => go(i-activeIndex)} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') go(i-activeIndex); }}>
                    <span className="feature-indicator" />
                    <span className="feature-title">{f.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div style={{ height: '60vh' }} />
      </div>
    </div>
  );
}


