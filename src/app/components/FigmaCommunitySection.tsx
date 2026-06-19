import React, { useEffect, useRef } from 'react';
import { motion, type MotionValue, useMotionValue, useTransform } from 'motion/react';
import edmPersonality from '../../assets/community/edm-personality.jpg';
import diyTimetable from '../../assets/community/diy-timetable.jpg';
import rollingBanner from '../../assets/community/rolling-banner.jpg';
import keepInTouch from '../../assets/community/keep-in-touch.jpg';
import communityVideo01 from '../../assets/community/community-video-01.mp4';
import communityVideo02 from '../../assets/community/community-video-02.mp4';

type CommunityMedia = {
  src: string;
  type: 'image' | 'video';
  title: string;
  aspectClass: string;
  frameClass: string;
  angle: number;
  radius: string;
};

const communityMedia: CommunityMedia[] = [
  {
    src: edmPersonality,
    type: 'image',
    title: 'EDM personality profile',
    aspectClass: 'aspect-[8/15]',
    frameClass: 'border-[#9b5cff] shadow-[0_0_26px_rgba(155,92,255,0.78),0_0_62px_rgba(155,92,255,0.32)]',
    angle: -84,
    radius: 'clamp(12rem, 24vw, 22rem)',
  },
  {
    src: diyTimetable,
    type: 'image',
    title: 'DIY timetable',
    aspectClass: 'aspect-square',
    frameClass: 'border-[#7cff6b] shadow-[0_0_26px_rgba(124,255,107,0.72),0_0_62px_rgba(124,255,107,0.26)]',
    angle: -18,
    radius: 'clamp(13rem, 27vw, 24rem)',
  },
  {
    src: rollingBanner,
    type: 'image',
    title: 'Rolling banner editor',
    aspectClass: 'aspect-square',
    frameClass: 'border-[#34d6ff] shadow-[0_0_26px_rgba(52,214,255,0.76),0_0_62px_rgba(52,214,255,0.3)]',
    angle: 48,
    radius: 'clamp(12rem, 25vw, 23rem)',
  },
  {
    src: keepInTouch,
    type: 'image',
    title: 'Keep in touch',
    aspectClass: 'aspect-[6/13]',
    frameClass: 'border-[#ff4a2f] shadow-[0_0_28px_rgba(255,74,47,0.78),0_0_66px_rgba(255,74,47,0.28)]',
    angle: 116,
    radius: 'clamp(12rem, 25vw, 23rem)',
  },
  {
    src: communityVideo01,
    type: 'video',
    title: 'Community video one',
    aspectClass: 'aspect-[37/80]',
    frameClass: 'border-[#ff47cc] shadow-[0_0_28px_rgba(255,71,204,0.76),0_0_66px_rgba(255,71,204,0.28)]',
    angle: 184,
    radius: 'clamp(12rem, 24vw, 22rem)',
  },
  {
    src: communityVideo02,
    type: 'video',
    title: 'Community video two',
    aspectClass: 'aspect-[37/80]',
    frameClass: 'border-[#ffd84a] shadow-[0_0_28px_rgba(255,216,74,0.76),0_0_66px_rgba(255,216,74,0.3)]',
    angle: 250,
    radius: 'clamp(12rem, 24vw, 22rem)',
  },
];

export const FigmaCommunitySection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const rotationProgressRef = useRef(0);
  const displayedRotationProgressRef = useRef(0);
  const targetRotationProgressRef = useRef(0);
  const rotationAnimationRef = useRef<number | null>(null);
  const rotationProgress = useMotionValue(0);

  const rotate = useTransform(rotationProgress, [0, 1], [-34, 326]);
  const headlineY = useTransform(rotationProgress, [0, 0.18, 0.78, 1], [34, 0, 0, -18]);
  const headlineOpacity = useTransform(rotationProgress, [0, 0.12, 0.86, 1], [0.82, 1, 1, 0.78]);

  const updateRotation = (delta: number) => {
    const current = rotationProgressRef.current;
    const next = Math.min(1, Math.max(0, current + delta));

    rotationProgressRef.current = next;
    targetRotationProgressRef.current = next;

    if (rotationAnimationRef.current === null) {
      const tick = () => {
        const displayed = displayedRotationProgressRef.current;
        const eased = displayed + (targetRotationProgressRef.current - displayed) * 0.26;

        displayedRotationProgressRef.current = eased;
        rotationProgress.set(eased);

        if (Math.abs(targetRotationProgressRef.current - eased) < 0.002) {
          displayedRotationProgressRef.current = targetRotationProgressRef.current;
          rotationProgress.set(targetRotationProgressRef.current);
          rotationAnimationRef.current = null;
          return;
        }

        rotationAnimationRef.current = requestAnimationFrame(tick);
      };

      rotationAnimationRef.current = requestAnimationFrame(tick);
    }

    return next;
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onSectionWheel = (event: Event) => {
      const customEvent = event as CustomEvent<{ deltaY: number; direction: number; sectionId: string }>;
      if (customEvent.detail.sectionId !== 'community') return;

      const current = rotationProgressRef.current;
      const direction = customEvent.detail.direction;
      const isAtStart = current <= 0 && direction < 0;
      const isAtEnd = current >= 1 && direction > 0;

      if (isAtStart || isAtEnd) {
        return;
      }

      customEvent.preventDefault();
      updateRotation(Math.abs(customEvent.detail.deltaY) * 0.0027 * direction);
    };

    section.addEventListener('ravehub:section-wheel', onSectionWheel as EventListener);
    return () => {
      if (rotationAnimationRef.current !== null) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }

      section.removeEventListener('ravehub:section-wheel', onSectionWheel as EventListener);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="community"
      className="relative h-screen min-h-screen overflow-hidden bg-black"
      aria-label="Community interactive media carousel"
      tabIndex={0}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(80,255,95,0.13),transparent_36%),radial-gradient(circle_at_18%_22%,rgba(155,92,255,0.18),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(255,74,47,0.12),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-35 [mask-image:radial-gradient(circle_at_center,#000_48%,transparent_82%)]" />

      <div className="relative flex h-screen items-center justify-center overflow-hidden px-5">
        <motion.div
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ y: headlineY, opacity: headlineOpacity }}
        >
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-lime-200/55">Scroll to rotate</p>
          <h2 className="text-4xl font-semibold tracking-[0.16em] text-white md:text-6xl">
            了解，热爱，参与
          </h2>
          <p
            className="mt-3 text-5xl text-[#76ff55] drop-shadow-[0_0_22px_rgba(118,255,85,0.75)] md:text-7xl"
            style={{ fontFamily: '"Irish Grover", "Noto Serif SC", serif' }}
          >
            Laputa
          </p>
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute h-[min(74vw,46rem)] w-[min(74vw,46rem)] rounded-full border border-lime-300/10 shadow-[0_0_140px_rgba(80,255,95,0.08)]"
          style={{ rotate }}
        />

        <motion.div
          className="relative h-[min(78vw,48rem)] w-[min(78vw,48rem)]"
          style={{ rotate }}
        >
          {communityMedia.map((item, index) => (
            <MediaCard key={item.title} item={item} index={index} rotate={rotate} />
          ))}
        </motion.div>

        <div className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center text-[0.68rem] uppercase tracking-[0.28em] text-white/38">
          <div className="mx-auto mb-2 h-6 w-px animate-pulse bg-white/35" />
          Scroll to rotate
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-neutral-950 via-black/82 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-neutral-950 via-black/84 to-transparent" />
    </section>
  );
};

const MediaCard = ({
  item,
  index,
  rotate,
}: {
  item: CommunityMedia;
  index: number;
  rotate: MotionValue<number>;
}) => {
  const counterRotate = useTransform(rotate, (value) => -value);
  const zIndex = index % 2 === 0 ? 12 : 8;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        rotate: item.angle,
        x: '-50%',
        y: '-50%',
        zIndex,
      }}
    >
      <div style={{ transform: `translateX(${item.radius})` }}>
        <motion.figure
          className={`relative w-[clamp(8.5rem,15vw,13.5rem)] overflow-hidden rounded-[1.65rem] border-2 bg-black/72 p-1.5 backdrop-blur-md ${item.aspectClass} ${item.frameClass}`}
          style={{ rotate: counterRotate }}
          initial={{ opacity: 0, scale: 0.78 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-[-35%] opacity-20 blur-3xl" style={{ background: 'currentColor' }} />
          <div className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-black">
            {item.type === 'video' ? (
              <video
                className="h-full w-full object-contain"
                src={item.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img className="h-full w-full object-contain" src={item.src} alt={item.title} loading="lazy" />
            )}
          </div>
        </motion.figure>
      </div>
    </motion.div>
  );
};
