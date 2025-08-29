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

// No timer-based auto-advance; we drive feature changes from scroll wheel gestures while sticky

export default function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const phoneRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: Use scroll event listener instead of Intersection Observer
      function checkVisibility() {
        const rect = el.getBoundingClientRect();
        // Check if the entire phone image is visible in the viewport
        const isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        setInView(isFullyVisible);
      }
      
      // Check immediately and on scroll
      checkVisibility();
      window.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('resize', checkVisibility);
      window.addEventListener('orientationchange', checkVisibility);
      
      // Also check on touch events for better mobile responsiveness
      let touchStartY = 0;
      const handleTouchStart = (e) => {
        touchStartY = e.touches[0].clientY;
      };
      
      const handleTouchMove = (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;
        
        // If significant vertical movement, check visibility
        if (Math.abs(deltaY) > 10) {
          checkVisibility();
        }
      };
      
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', checkVisibility);
        window.removeEventListener('resize', checkVisibility);
        window.removeEventListener('orientationchange', checkVisibility);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
      };
    } else {
      // Desktop: Use Intersection Observer
      const observer = new IntersectionObserver((entries) => setInView(entries[0].isIntersecting), { 
        threshold: 1.0,
        rootMargin: '0px 0px 0px 0px'
      });
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  const lastWheelRef = useRef(0);

  const go = useCallback((delta) => {
    setActiveIndex((i) => Math.min(FEATURES.length - 1, Math.max(0, i + delta)));
  }, []);



  useEffect(() => {
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
      // When atEnd/start, do not prevent so page scroll continues
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [inView, activeIndex, go]);

  useEffect(() => {
    let startX = 0; 
    let startY = 0;
    let active = false; 
    const node = stickyRef.current; 
    if (!node) return;
    
    const onStart = (e) => { 
      active = true; 
      startX = e.touches[0].clientX; 
      startY = e.touches[0].clientY;
    };
    
    const onEnd = (e) => { 
      if (!active) return; 
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      
      // Only trigger if horizontal swipe is more than vertical (to avoid interfering with scroll)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        go(dx < 0 ? 1 : -1);
      }
      active = false; 
    };
    
    node.addEventListener('touchstart', onStart, { passive: true }); 
    node.addEventListener('touchend', onEnd, { passive: true });
    
    return () => { 
      node.removeEventListener('touchstart', onStart); 
      node.removeEventListener('touchend', onEnd); 
    };
  }, [go]);

  const active = FEATURES[activeIndex];

  return (
    <div className="page">
      <div className="container">
        <div className="hero-spacer"></div>
        <section className="feature-section" ref={sectionRef}>
          <div className="feature-sticky" ref={stickyRef}>
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
                 <div className="phone real" ref={phoneRef}>
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