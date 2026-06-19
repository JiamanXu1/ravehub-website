import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import capability01Events from '../../assets/capabilities/capability-01-events.png';
import capability02Archive from '../../assets/capabilities/capability-02-archive.png';
import capability03Team from '../../assets/capabilities/capability-03-team.png';
import capability04Video from '../../assets/capabilities/capability-04-community.mp4';
import capability05Video from '../../assets/capabilities/capability-05-community-sets.mp4';
import capability06Official from '../../assets/capabilities/capability-06-official.png';

type CapabilityMediaType = 'image' | 'video';

const capabilities = [
  {
    id: '01',
    title: '全球电音活动指南',
    description: '汇集海内外各大电音节、艺人巡演、线下专场全量资讯，清晰呈现演出时间、场地、舞台排期与嘉宾阵容。同时收录各类电音曲风科普，不管是资深玩家还是入门新人，都能轻松找到心仪现场，一站式解锁全球电音现场动态。',
    accent: ['#06b6d4', '#14b8a6', '#10b981'] as [string, string, string],
    glowColor: 'rgba(6,182,212,0.4)',
    appScreen: capability01Events as string | null,
    appScreenType: 'image' as CapabilityMediaType,
  },
  {
    id: '02',
    title: '专属电音成长档案',
    description: '记录每一次奔赴现场的美好瞬间，到场打卡自动留存观演足迹、喜爱 DJ 与参与场次。搭配专属成长体系，把每一场热爱都妥善珍藏，打造独属于你的专属电音履历，让音乐旅途有迹可循。',
    accent: ['#7c3aed', '#a855f7', '#ec4899'] as [string, string, string],
    glowColor: 'rgba(139,92,246,0.45)',
    appScreen: capability02Archive as string | null,
    appScreenType: 'image' as CapabilityMediaType,
  },
  {
    id: '03',
    title: '同好结伴轻松同行',
    description: '搭建趣味小队社群，你可以组队相约出行，也能结识志同道合的玩伴。专为新手玩家匹配靠谱同行伙伴，告别独自奔赴的孤单，大家结伴打卡、互相照应，让每一次线下相聚都更安心、更欢乐。',
    accent: ['#ec4899', '#f43f5e', '#fb7185'] as [string, string, string],
    glowColor: 'rgba(236,72,153,0.4)',
    appScreen: capability03Team as string | null,
    appScreenType: 'image' as CapabilityMediaType,
  },
  {
    id: '04',
    title: '电音兴趣分享社区',
    description: '这里是专属 Raver 的分享天地，随心发布现场实拍、观演心得、演出评价。聊聊喜欢的 DJ、分享出行攻略，和同好交流感受，用动态记录热爱，打造有温度的电音交流圈子。',
    accent: ['#f97316', '#f59e0b', '#facc15'] as [string, string, string],
    glowColor: 'rgba(249,115,22,0.4)',
    appScreen: capability04Video as string | null,
    appScreenType: 'video' as CapabilityMediaType,
  },
  {
    id: '05',
    title: '全民共建资源宝库',
    description: '集结全体玩家力量，一起完善演出歌单、现场时刻表、场地攻略等实用内容。人人都能补充现场一手资料，共享干货、互通信息，慢慢沉淀出丰富又实用的电音资源库。',
    accent: ['#3b82f6', '#6366f1', '#8b5cf6'] as [string, string, string],
    glowColor: 'rgba(99,102,241,0.4)',
    appScreen: capability05Video as string | null,
    appScreenType: 'video' as CapabilityMediaType,
  },
  {
    id: '06',
    title: '直击艺人与主办方动态',
    description: '关注喜爱的 DJ、演出主办方，第一时间接收巡演预告、开票提醒与新鲜动态。近距离了解艺人幕后故事、活动最新消息，不错过每一场期待已久的演出。',
    accent: ['#a855f7', '#7c3aed', '#4f46e5'] as [string, string, string],
    glowColor: 'rgba(168,85,247,0.4)',
    appScreen: capability06Official as string | null,
    appScreenType: 'image' as CapabilityMediaType,
  },
];

// ── 手机框（可替换图片）──────────────────────────────────────────────────────
const PhoneMockup = ({ item }: { item: typeof capabilities[0] }) => {
  const [a, b, c] = item.accent;
  return (
    <div className="relative flex-shrink-0" style={{ width: 225, marginTop: -64, marginBottom: -64, zIndex: 20 }}>
      {/* 外层柔光 */}
      <div
        className="absolute -inset-6 rounded-[3rem] blur-3xl opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${a}99, transparent 70%)` }}
      />
      {/* 手机外框 */}
      <div
        className="relative aspect-[9/19] rounded-[2.5rem] shadow-2xl"
        style={{
          padding: '0.6rem',
          background: 'linear-gradient(160deg, #4b5563 0%, #2a2f39 48%, #171a21 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -8px 18px rgba(0,0,0,0.22)',
        }}
      >
        {/* 屏幕 */}
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[42%] h-[18px] bg-black/80 rounded-b-2xl z-20" />
          {/* ── 可替换区域 START ── */}
          {item.appScreen && item.appScreenType === 'video' ? (
            <video
              src={item.appScreen}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-fill"
            />
          ) : item.appScreen ? (
            <img src={item.appScreen} alt={item.title} className="absolute inset-0 w-full h-full object-fill" />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: `linear-gradient(160deg, ${a}, ${b}, ${c})` }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.2),transparent_60%)]" />
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                <div className="w-4 h-4 rounded-sm border-2 border-white/60" />
              </div>
              <span className="relative z-10 text-white/40 text-[0.48rem] font-mono tracking-[0.2em] uppercase">App Screen</span>
            </div>
          )}
          {/* ── 可替换区域 END ── */}
          {/* 屏幕反光 */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.09)_0%,transparent_50%)] pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
};

// ── 主组件 ────────────────────────────────────────────────────────────────────
export const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const currentRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = capabilities.length;
  const item = capabilities[current];
  const [a, b] = item.accent;
  const swipeThreshold = 70;

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => {
      const next = Math.max(0, Math.min(total - 1, prev + dir));
      currentRef.current = next;
      return next;
    });
  };

  const jumpTo = (index: number) => {
    setDirection(index > currentRef.current ? 1 : -1);
    currentRef.current = index;
    setCurrent(index);
  };

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const handleSwipeEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipePower = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.35;

    if (info.offset.x < -swipeThreshold || (info.velocity.x < -320 && swipePower > swipeThreshold)) {
      go(1);
      return;
    }

    if (info.offset.x > swipeThreshold || (info.velocity.x > 320 && swipePower > swipeThreshold)) {
      go(-1);
    }
  };

  // 提高响应速度，缩短切换耗时，同时保留一次轻微回弹
  const springTransition = { type: 'spring' as const, stiffness: 430, damping: 28, mass: 0.72 };

  const cardVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 140 : -140, opacity: 0, scale: 0.86, rotateY: dir > 0 ? 10 : -10 }),
    center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0, scale: 0.9, rotateY: dir > 0 ? -6 : 6 }),
  };

  return (
    <section ref={sectionRef} id="services" className="relative flex h-screen items-center overflow-hidden bg-neutral-950 px-6 py-10">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] border border-white/[0.04] rounded-full" style={{ borderStyle: 'dashed' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[5%] -left-[8%] w-[500px] h-[500px] border border-white/[0.03] rounded-full" />
        {/* accent 大光晕随卡片变化 */}
        <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[130px]"
          style={{ background: `radial-gradient(ellipse, ${item.glowColor}, transparent 70%)` }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* ── 标题：核心 / 功能 错排 ── */}
        <div className="mb-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-serif italic text-lg text-white">03</span>
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400">/ Capabilities</span>
              </div>
              <div className="h-px w-32 bg-gradient-to-r from-white/30 to-transparent" />
            </div>
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div
                className="text-5xl md:text-7xl font-medium tracking-tighter leading-none text-white select-none"
                style={{ marginLeft: '0.28em' }}
              >
                核心
              </div>
              <div className="text-5xl md:text-7xl font-medium tracking-tighter leading-none select-none"
                style={{
                  marginLeft: '1.72em',
                  fontStyle: 'italic',
                  fontFamily: 'serif',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.45), rgba(255,255,255,0.15))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                功能
              </div>
            </motion.div>
          </div>
          <motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }}
            className="text-base text-neutral-400 font-light leading-relaxed md:border-l md:border-white/10 md:pl-10"
            style={{ fontFamily: '"Noto Serif SC", serif' }}>
            六大核心能力，覆盖电音爱好者从发现、记录到社交的完整旅途。
          </motion.p>
        </div>

        {/* ── 轮播区域：箭头在卡片两侧 ── */}
        <div className="relative mx-auto w-full max-w-[1200px]" style={{ perspective: 1400 }}>
          {/* 卡片容器 */}
          <div className="relative overflow-visible px-0 sm:px-[76px]" style={{ minHeight: 348 }}>
            {/* 左箭头 */}
            <motion.button
              whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.10)' }}
              whileTap={{ scale: 0.92 }}
              onClick={() => current > 0 && go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 hidden sm:flex w-12 h-12 lg:w-14 lg:h-14 rounded-full items-center justify-center"
              style={{
                background: 'rgba(30,30,30,0.78)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* 右箭头 */}
            <motion.button
              whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.10)' }}
              whileTap={{ scale: 0.92 }}
              onClick={() => current < total - 1 && go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 hidden sm:flex w-12 h-12 lg:w-14 lg:h-14 rounded-full items-center justify-center"
              style={{
                background: 'rgba(30,30,30,0.78)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springTransition}
                className="absolute inset-0 cursor-grab active:cursor-grabbing select-none touch-pan-y"
                style={{ transformStyle: 'preserve-3d' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                dragSnapToOrigin
                whileDrag={{ scale: 0.985, cursor: 'grabbing' }}
                onDragEnd={handleSwipeEnd}
              >
                {/* 果冻卡片 */}
                <div
                  className="relative mx-auto flex items-center rounded-3xl h-full overflow-visible"
                  style={{
                    width: 'min(100%, 1040px)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.022) 100%)',
                    backdropFilter: 'blur(36px)',
                    WebkitBackdropFilter: 'blur(36px)',
                    border: '1px solid rgba(255,255,255,0.11)',
                    boxShadow: `0 0 90px ${item.glowColor}, 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.12)`,
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px rounded-full pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent 0%, ${a}cc 30%, ${b}cc 70%, transparent 100%)` }} />
                  <div className="absolute inset-x-0 bottom-0 h-px rounded-full pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent 0%, ${b}55 50%, transparent 100%)` }} />
                  <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[70px] opacity-25 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${a}, transparent)` }} />

                  <div className="flex-1 min-w-0 py-10 pl-10 pr-8 relative z-10">
                    <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-mono tracking-widest"
                      style={{ background: `linear-gradient(90deg, ${a}25, ${b}10)`, border: `1px solid ${a}50`, color: a }}>
                      {item.id} / CAPABILITY
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-5 leading-tight"
                      style={{ fontFamily: '"Noto Serif SC", serif' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light"
                      style={{ fontFamily: '"Noto Serif SC", serif' }}>
                      {item.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 pr-8 relative z-20">
                    <PhoneMockup item={item} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── 圆点：卡片正下方居中 ── */}
          <div className="mt-10 flex items-center justify-center gap-2.5">
            {capabilities.map((cap, i) => (
              <button key={i} onClick={() => jumpTo(i)}>
                <motion.div
                  animate={{
                    width: i === current ? 22 : 7,
                    background: i === current ? cap.accent[0] : 'rgba(255,255,255,0.18)',
                    boxShadow: i === current ? `0 0 8px ${cap.accent[0]}99` : 'none',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="h-[7px] rounded-full"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
