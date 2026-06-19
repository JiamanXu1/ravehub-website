import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ScrollVideoProps {
  videoUrl: string;
  totalDuration: number;
  keyframes: number[];
  scrollPoints: number[];
}

export const ScrollVideo: React.FC<ScrollVideoProps> = ({
  videoUrl,
  totalDuration,
  keyframes,
  scrollPoints
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const displayedProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const progressAnimationRef = useRef<number | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoTime, setVideoTime] = useState(0);

  // 只负责加载视频，不混入 ScrollTrigger
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setIsVideoLoaded(true);
      video.pause();
      video.currentTime = 0;
    };

    const handleError = () => {
      setTimeout(() => video.load(), 1000);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, []); // 只在挂载时运行一次

  const syncVideoToProgress = (progress: number) => {
    const video = videoRef.current;
    if (!video) return;

    // 自定义时间映射，在 4 秒处插入「暂停带」(progress 0.22 ~ 0.42)
    let targetTime = 0;
    if (progress <= 0.15) {
      targetTime = (progress / 0.15) * 2;
    } else if (progress <= 0.22) {
      targetTime = 2 + ((progress - 0.15) / 0.07) * 2;
    } else if (progress <= 0.42) {
      targetTime = 4;
    } else if (progress <= 0.62) {
      targetTime = 4 + ((progress - 0.42) / 0.20) * 2;
    } else if (progress <= 0.82) {
      targetTime = 6 + ((progress - 0.62) / 0.20) * 5;
    } else {
      targetTime = 11 + ((progress - 0.82) / 0.18) * (totalDuration - 11);
    }

    targetTime = Math.max(0, Math.min(totalDuration, targetTime));
    try { video.currentTime = targetTime; } catch (_) {}
    setScrollProgress(progress);
    setVideoTime(targetTime);
  };

  const animateProgressTo = (target: number) => {
    targetProgressRef.current = target;

    if (progressAnimationRef.current !== null) {
      return;
    }

    const tick = () => {
      const current = displayedProgressRef.current;
      const next = current + (targetProgressRef.current - current) * 0.28;

      displayedProgressRef.current = next;
      syncVideoToProgress(next);

      if (Math.abs(targetProgressRef.current - next) < 0.002) {
        displayedProgressRef.current = targetProgressRef.current;
        syncVideoToProgress(targetProgressRef.current);
        progressAnimationRef.current = null;
        return;
      }

      progressAnimationRef.current = requestAnimationFrame(tick);
    };

    progressAnimationRef.current = requestAnimationFrame(tick);
  };

  // 由全站分屏控制器派发内部滚动：页面不下移，只推进视频。
  useEffect(() => {
    if (!isVideoLoaded) return;

    const container = containerRef.current;
    if (!container) return;

    const onSectionWheel = (event: Event) => {
      const customEvent = event as CustomEvent<{ deltaY: number; direction: number; sectionId: string }>;
      if (customEvent.detail.sectionId !== 'projects') return;

      const current = progressRef.current;
      const direction = customEvent.detail.direction;
      const isAtStart = current <= 0 && direction < 0;
      const isAtEnd = current >= 1 && direction > 0;

      if (isAtStart || isAtEnd) {
        return;
      }

      customEvent.preventDefault();
      const next = Math.min(1, Math.max(0, current + Math.abs(customEvent.detail.deltaY) * 0.0015 * direction));
      progressRef.current = next;
      animateProgressTo(next);
    };

    syncVideoToProgress(progressRef.current);
    container.addEventListener('ravehub:section-wheel', onSectionWheel as EventListener);
    return () => {
      if (progressAnimationRef.current !== null) {
        cancelAnimationFrame(progressAnimationRef.current);
      }

      container.removeEventListener('ravehub:section-wheel', onSectionWheel as EventListener);
    };
  }, [isVideoLoaded, totalDuration, keyframes, scrollPoints]);

  // Canvas 持续绘制视频帧
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isVideoLoaded) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const drawFrame = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        animationFrameId = requestAnimationFrame(drawFrame);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const videoAspect = 16 / 9;
      const canvasAspect = canvasWidth / canvasHeight;
      let mainWidth, mainHeight, mainX, mainY;

      if (canvasAspect > videoAspect) {
        mainHeight = canvasHeight;
        mainWidth = mainHeight * videoAspect;
        mainX = (canvasWidth - mainWidth) / 2;
        mainY = 0;
      } else {
        mainWidth = canvasWidth;
        mainHeight = mainWidth / videoAspect;
        mainX = 0;
        mainY = (canvasHeight - mainHeight) / 2;
      }

      ctx.drawImage(video, mainX, mainY, mainWidth, mainHeight);

      // 鱼眼遮罩：用径向渐变直接画在 canvas 上，黑色边缘融入背景
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      const rx = canvasWidth * 0.62;
      const ry = canvasHeight * 0.55;

      // 外圈黑色渐变遮罩（覆盖画面边缘）
      const vignette = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.38, cx, cy, Math.max(rx, ry));
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.55, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.75, 'rgba(0,0,0,0.45)');
      vignette.addColorStop(0.88, 'rgba(0,0,0,0.82)');
      vignette.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 顶部霓虹紫光晕
      const topGlow = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.28);
      topGlow.addColorStop(0, 'rgba(139,92,246,0.18)');
      topGlow.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.28);

      // 底部黑色渐隐 — 从画面 55% 处开始压黑（缩小遮挡区域）
      const bottomFade = ctx.createLinearGradient(0, canvasHeight * 0.55, 0, canvasHeight);
      bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
      bottomFade.addColorStop(0.45, 'rgba(0,0,0,0.55)');
      bottomFade.addColorStop(0.78, 'rgba(0,0,0,0.9)');
      bottomFade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = bottomFade;
      ctx.fillRect(0, canvasHeight * 0.55, canvasWidth, canvasHeight * 0.45);

      // 底部霓虹青光晕（叠在黑色渐隐上）
      const bottomGlow = ctx.createLinearGradient(0, canvasHeight, 0, canvasHeight * 0.72);
      bottomGlow.addColorStop(0, 'rgba(34,211,238,0.10)');
      bottomGlow.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, canvasHeight * 0.72, canvasWidth, canvasHeight * 0.28);

      // 左侧粉光晕
      const leftGlow = ctx.createLinearGradient(0, 0, canvasWidth * 0.2, 0);
      leftGlow.addColorStop(0, 'rgba(236,72,153,0.12)');
      leftGlow.addColorStop(1, 'rgba(236,72,153,0)');
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, canvasWidth * 0.2, canvasHeight);

      // 右侧紫光晕
      const rightGlow = ctx.createLinearGradient(canvasWidth, 0, canvasWidth * 0.8, 0);
      rightGlow.addColorStop(0, 'rgba(139,92,246,0.12)');
      rightGlow.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(canvasWidth * 0.8, 0, canvasWidth * 0.2, canvasHeight);

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isVideoLoaded]);

  return (
    <div
      ref={containerRef}
      id="projects"
      className="h-screen bg-black"
      style={{ position: 'relative' }}
    >
      {/* 隐藏的视频源 */}
      <video
        ref={videoRef}
        preload="auto"
        playsInline
        muted
        className="hidden"
        disablePictureInPicture
        controlsList="nodownload"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* 固定的视频容器 */}
      <div
        ref={stickyRef}
        className="w-full h-screen overflow-hidden bg-black"
        style={{ position: 'relative' }}
      >
        {/* 顶部渐变过渡 */}
        <div className="absolute top-0 left-0 right-0 h-64 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-transparent" />
        </div>

        {/* 底部渐变过渡 — 收窄高度，让文字区域完整显示 */}
        <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ height: '22%' }}>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.95) 80%, #000 100%)'
          }} />
        </div>

        {/* 动态背景效果层 */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4], x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-purple-500/25 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1.3, 1, 1.3], opacity: [0.5, 0.8, 0.5], x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-20%] right-[-15%] w-[55%] h-[55%] bg-cyan-500/25 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, 180, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[25%] right-[15%] w-[45%] h-[45%] bg-pink-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-[30%] left-[20%] w-[40%] h-[40%] bg-violet-500/20 rounded-full blur-[130px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff02_1px,transparent_1px),linear-gradient(-45deg,#ffffff02_1px,transparent_1px)] bg-[size:6rem_6rem]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-white/8 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] border border-white/6 rounded-full border-dashed"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-purple-400/10 rounded-full border-dotted"
          />
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] border-2 border-cyan-400/20 rounded-full"
          />
        </div>

        {/* Canvas 视频层 */}
        <div className="relative z-10 w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent" />
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-pink-500/10 via-transparent to-transparent" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-violet-500/10 via-transparent to-transparent" />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 left-8 w-2 h-2 bg-purple-400 rounded-full blur-sm"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-8 right-8 w-2 h-2 bg-cyan-400 rounded-full blur-sm"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-8 left-8 w-2 h-2 bg-pink-400 rounded-full blur-sm"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-8 right-8 w-2 h-2 bg-violet-400 rounded-full blur-sm"
            />
          </div>
        </div>

        {/* 文字内容层：视频 2s 淡入，4s 停留，4s 后淡出 */}
        {(() => {
          // 基于视频时间控制透明度：2s→3s 淡入，3s→4s 全显，4s→4.5s 淡出
          let opacity = 0;
          if (videoTime >= 2 && videoTime < 3) {
            opacity = (videoTime - 2) / 1;
          } else if (videoTime >= 3 && videoTime <= 4) {
            opacity = 1;
          } else if (videoTime > 4 && videoTime < 4.6) {
            opacity = 1 - (videoTime - 4) / 0.6;
          }
          return (
            <div
              className="absolute bottom-[16%] left-[6%] z-30 pointer-events-none"
              style={{ opacity, transition: 'opacity 0.25s ease', maxWidth: '32%' }}
            >
              <div className="w-10 h-px bg-gradient-to-r from-purple-400 to-cyan-400 mb-4" />
              <h2
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 'clamp(1.4rem, 2.2vw, 2rem)',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.96)',
                  marginBottom: '0.75em',
                  textShadow: '0 0 28px rgba(139,92,246,0.7)',
                  lineHeight: 1.3,
                }}
              >
                二相乐园
              </h2>
              <p
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 'clamp(0.82rem, 1.15vw, 1.05rem)',
                  fontWeight: 300,
                  color: 'rgba(205,205,225,0.85)',
                  lineHeight: 2,
                  textAlign: 'justify',
                  textJustify: 'inter-character' as any,
                  letterSpacing: '0.06em',
                  textShadow: '0 0 14px rgba(0,0,0,0.9)',
                }}
              >
                人间的派对终会散场，如同转瞬寂灭的音律。黑胶以纹路封存声音，我们以虚拟封存热爱，让用户单次的现实人生，拥有无限次重映的电音狂欢。
              </p>
            </div>
          );
        })()}

        {/* 第二段文字：视频 5s–7s，右上角 */}
        {(() => {
          let opacity = 0;
          if (videoTime >= 5 && videoTime < 5.8) {
            opacity = (videoTime - 5) / 0.8;
          } else if (videoTime >= 5.8 && videoTime <= 6.5) {
            opacity = 1;
          } else if (videoTime > 6.5 && videoTime < 7) {
            opacity = 1 - (videoTime - 6.5) / 0.5;
          }
          return (
            <div
              className="absolute top-[14%] right-[5%] z-30 pointer-events-none"
              style={{ opacity, transition: 'opacity 0.25s ease', maxWidth: '30%' }}
            >
              {/* 装饰线靠右对齐 */}
              <div className="flex justify-end mb-4">
                <div className="w-10 h-px bg-gradient-to-l from-cyan-400 to-purple-400" />
              </div>
              <h2
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 'clamp(1.4rem, 2.2vw, 2rem)',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.96)',
                  marginBottom: '0.75em',
                  textShadow: '0 0 28px rgba(34,211,238,0.65)',
                  lineHeight: 1.3,
                  textAlign: 'right',
                }}
              >
                虚实对局
              </h2>
              <p
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 'clamp(0.82rem, 1.15vw, 1.05rem)',
                  fontWeight: 300,
                  color: 'rgba(205,205,225,0.85)',
                  lineHeight: 2,
                  textAlign: 'justify',
                  textJustify: 'inter-character' as any,
                  letterSpacing: '0.06em',
                  textShadow: '0 0 14px rgba(0,0,0,0.9)',
                }}
              >
                搭建全新交互体系，让社群成为一座无限续篇的模拟乐园。以游戏化体验升级社交形态，让短暂的相逢，变成一场永不落幕的结伴漫游。
              </p>
            </div>
          );
        })()}

        {/* 第三段文字：视频 9s–11s，左上角 */}
        {(() => {
          let opacity = 0;
          if (videoTime >= 9 && videoTime < 9.8) {
            opacity = (videoTime - 9) / 0.8;
          } else if (videoTime >= 9.8 && videoTime <= 10.5) {
            opacity = 1;
          } else if (videoTime > 10.5 && videoTime < 11) {
            opacity = 1 - (videoTime - 10.5) / 0.5;
          }
          return (
            <div
              className="absolute top-[12%] left-[38%] z-30 pointer-events-none"
              style={{ opacity, transition: 'opacity 0.25s ease', maxWidth: '31%' }}
            >
              <div className="w-10 h-px bg-gradient-to-r from-pink-400 to-violet-400 mb-4" />
              <h2
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 'clamp(1.4rem, 2.2vw, 2rem)',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.96)',
                  marginBottom: '0.75em',
                  textShadow: '0 0 28px rgba(236,72,153,0.65)',
                  lineHeight: 1.3,
                }}
              >
                音台藏序
              </h2>
              <p
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 'clamp(0.82rem, 1.15vw, 1.05rem)',
                  fontWeight: 300,
                  color: 'rgba(205,205,225,0.85)',
                  lineHeight: 2,
                  textAlign: 'justify',
                  textJustify: 'inter-character' as any,
                  letterSpacing: '0.06em',
                  textShadow: '0 0 14px rgba(0,0,0,0.9)',
                }}
              >
                让小众私藏的独家 SET 走出孤岛，让每一份纯粹的电音热爱，拥有被看见、被传颂、被延续的终身浪漫。
              </p>
            </div>
          );
        })()}

        {/* 加载提示 */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
            <div className="text-white text-xl font-mono">Loading video...</div>
          </div>
        )}
      </div>
    </div>
  );
};
