import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, useLocation } from './router';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { ScrollVideo } from './components/ScrollVideo';
import { Services } from './components/Services';
import { FigmaCommunitySection } from './components/FigmaCommunitySection';
import { Download } from './components/Download';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Work } from './components/Work';
import { ProjectDetail } from './components/ProjectDetail';
import { ScrollIndicator } from './components/ScrollIndicator';

const pageSectionIds = ['hero', 'about', 'projects', 'services', 'community', 'download', 'contact'];

const FullPageScrollController = () => {
  const [pathname] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    let isJumping = false;
    let lastJumpAt = 0;
    let gestureLocked = false;
    let gestureUnlockTimer: ReturnType<typeof window.setTimeout> | undefined;
    let touchStartY: number | null = null;
    let touchLastY: number | null = null;

    const scheduleGestureUnlock = () => {
      if (gestureUnlockTimer) {
        window.clearTimeout(gestureUnlockTimer);
      }

      gestureUnlockTimer = window.setTimeout(() => {
        gestureLocked = false;
      }, 320);
    };

    const lockCurrentGesture = () => {
      gestureLocked = true;
      scheduleGestureUnlock();
    };

    const getCurrentSectionIndex = () => {
      const viewportCenter = window.scrollY + window.innerHeight / 2;

      return pageSectionIds.reduce((activeIndex, id, index) => {
        const section = document.getElementById(id);

        if (!section) {
          return activeIndex;
        }

        return section.offsetTop <= viewportCenter ? index : activeIndex;
      }, 0);
    };

    const jumpToSection = (index: number) => {
      const nextIndex = Math.max(0, Math.min(pageSectionIds.length - 1, index));
      const section = document.getElementById(pageSectionIds[nextIndex]);

      if (!section) {
        return;
      }

      if (Math.abs(window.scrollY - section.offsetTop) < 2) {
        return;
      }

      isJumping = true;
      lockCurrentGesture();
      setIsTransitioning(true);

      window.setTimeout(() => {
        section.scrollIntoView({ behavior: 'auto', block: 'start' });

        window.setTimeout(() => {
          setIsTransitioning(false);

          window.setTimeout(() => {
            isJumping = false;
          }, 260);
        }, 170);
      }, 220);
    };

    const processVerticalIntent = (deltaY: number) => {
      if (gestureLocked) {
        scheduleGestureUnlock();
        return;
      }

      if (isJumping) {
        return;
      }

      const currentIndex = getCurrentSectionIndex();
      const currentSection = document.getElementById(pageSectionIds[currentIndex]);
      const direction = deltaY > 0 ? 1 : -1;

      const internalEvent = new CustomEvent('ravehub:section-wheel', {
        bubbles: true,
        cancelable: true,
        detail: {
          deltaY,
          direction,
          sectionId: pageSectionIds[currentIndex],
        },
      });

      currentSection?.dispatchEvent(internalEvent);

      if (internalEvent.defaultPrevented) {
        return;
      }

      const now = Date.now();
      if (now - lastJumpAt < 360) {
        return;
      }
      lastJumpAt = now;

      jumpToSection(currentIndex + direction);
    };

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest('[data-native-scroll="true"], input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      event.preventDefault();

      processVerticalIntent(event.deltaY);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'PageDown', ' ', 'ArrowUp', 'PageUp'].includes(event.key)) {
        return;
      }

      if (event.repeat || gestureLocked) {
        event.preventDefault();
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-native-scroll="true"], input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      const direction = event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 1;
      event.preventDefault();

      processVerticalIntent(direction * 120);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-native-scroll="true"], input, textarea, select, [contenteditable="true"]')) {
        touchStartY = null;
        touchLastY = null;
        return;
      }

      const y = event.touches[0]?.clientY ?? null;
      touchStartY = y;
      touchLastY = y;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-native-scroll="true"], input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      if (touchLastY === null) {
        touchLastY = event.touches[0]?.clientY ?? null;
        return;
      }

      const currentY = event.touches[0]?.clientY ?? touchLastY;
      const deltaY = touchLastY - currentY;

      if (Math.abs(deltaY) < 2) {
        return;
      }

      event.preventDefault();
      processVerticalIntent(deltaY * 2.8);
      touchLastY = currentY;
    };

    const handleTouchEnd = () => {
      touchStartY = null;
      touchLastY = null;
      scheduleGestureUnlock();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (gestureUnlockTimer) {
        window.clearTimeout(gestureUnlockTimer);
      }

      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeInOut' }}
          className="fixed inset-0 z-[90] pointer-events-none bg-black"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 0.42, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,255,85,0.18),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(155,92,255,0.16),transparent_34%)] blur-2xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Preloader Component
const Preloader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    className="fixed inset-0 z-[999] bg-white flex items-center justify-center text-black"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-4"
    >
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
        Ravehub
      </h1>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
        className="h-px bg-black/20 w-32"
      />
    </motion.div>
  </motion.div>
);

// Enhanced ScrollToTop to handle both routes and hash anchors
const ScrollToTop = () => {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const HomePage = () => (
  <>
    <Hero />
    <About />
    <ScrollVideo
      videoUrl="https://video-jasonlee.oss-cn-shanghai.aliyuncs.com/%E6%BB%9A%E5%8A%A8%E7%89%B9%E6%95%88.mp4"
      totalDuration={16}
      keyframes={[3, 6, 11]}
      scrollPoints={[0.3, 0.6, 0.82]}
    />
    <Services />
    <FigmaCommunitySection />
    <Download />
    <Footer />
  </>
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intro animation duration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>

      {!loading && (
        <div className="bg-neutral-950 min-h-screen text-white selection:bg-white/20">
          <FullPageScrollController />
          <Navbar />
          <Switch>
            <Route path="/work/:slug" component={ProjectDetail} />
            <Route path="/work" component={Work} />
            <Route path="/" component={HomePage} />
          </Switch>
          <ScrollIndicator />
        </div>
      )}
    </Router>
  );
}

export default App;
