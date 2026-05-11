import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Chunk } from '@/lib/types';

const VW = 1000, VH = 680;
const GROUND_Y = VH - 52; // 628

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

function leafColor(retention: number): string {
  if (retention >= 0.75) return '#22c55e';
  if (retention >= 0.60) return '#86efac';
  if (retention >= 0.45) return '#eab308';
  if (retention >= 0.25) return '#f97316';
  if (retention >= 0.10) return '#ef4444';
  return '#7f1d1d';
}

function ambientLeafColor(x: number): string {
  const t = Math.max(0, Math.min(1, (x - 80) / 840));
  if (t < 0.24) return '#22c55e';
  if (t < 0.44) return '#86efac';
  if (t < 0.64) return '#eab308';
  if (t < 0.82) return '#f97316';
  return '#ef4444';
}

const SHADES: Record<string, { hi: string; lo: string; vein: string }> = {
  '#22c55e': { hi: '#86efac', lo: '#14532d', vein: '#4ade80' },
  '#86efac': { hi: '#bbf7d0', lo: '#166534', vein: '#86efac' },
  '#eab308': { hi: '#fef08a', lo: '#713f12', vein: '#fde047' },
  '#f97316': { hi: '#fed7aa', lo: '#7c2d12', vein: '#fb923c' },
  '#ef4444': { hi: '#fca5a5', lo: '#7f1d1d', vein: '#f87171' },
  '#7f1d1d': { hi: '#b91c1c', lo: '#450a0a', vein: '#ef4444' },
};

const LP = (W: number, H: number): string => {
  const w = W * 0.5, h = H * 0.5;
  return (
    `M 0,${h * 0.94} ` +
    `C ${-w * 0.55},${h * 0.72} ${-w * 1.28},${h * 0.18} ${-w * 1.30},${-h * 0.14} ` +
    `C ${-w * 1.28},${-h * 0.46} ${-w * 0.60},${-h * 0.78} ${-w * 0.10},${-h * 0.95} ` +
    `C ${-w * 0.04},${-h * 0.99} 0,${-h * 1.00} 0,${-h * 1.00} ` +
    `C 0,${-h * 1.00} ${w * 0.04},${-h * 0.99} ${w * 0.10},${-h * 0.95} ` +
    `C ${w * 0.60},${-h * 0.78} ${w * 1.28},${-h * 0.46} ${w * 1.30},${-h * 0.14} ` +
    `C ${w * 1.28},${h * 0.18} ${w * 0.55},${h * 0.72} 0,${h * 0.94} Z`
  );
};

// ── Maple canopy clusters ─────────────────────────────────────
// Counts cut ~45 % vs banyan; outer branch-tip groups added for maple shape
const CLUSTERS: [number, number, number, number, number][] = [
  // Crown top
  [402,72,42,32, 6],[500,66,48,38, 7],[598,72,42,32, 6],
  // Row 2
  [328,108,47,37, 5],[412,102,51,40, 6],[500,98,53,42, 7],[588,102,51,40, 6],[672,108,47,37, 5],
  // Row 3
  [258,145,47,37, 4],[340,139,51,40, 5],[422,135,53,42, 6],[500,131,55,44, 7],[578,135,53,42, 6],[660,139,51,40, 5],[742,145,47,37, 4],
  // Row 4
  [188,182,44,35, 4],[270,177,49,39, 5],[354,173,51,40, 5],[436,169,53,42, 6],[518,166,55,44, 6],[600,169,53,42, 6],[682,173,51,40, 5],[764,177,49,39, 5],[834,182,44,35, 3],
  // Row 5
  [210,220,43,34, 3],[296,214,47,37, 4],[380,210,49,39, 4],[462,206,51,40, 5],[544,203,53,42, 6],[626,206,51,40, 5],[708,210,49,39, 4],[788,214,47,37, 4],[832,220,43,34, 3],
  // Row 6
  [242,258,42,33, 3],[326,252,45,36, 4],[408,248,47,37, 4],[490,244,49,39, 5],[572,241,51,40, 5],[654,244,49,39, 4],[736,248,47,37, 4],[816,252,45,36, 3],
  // Row 7 (sparse)
  [284,294,40,32, 3],[368,288,43,34, 3],[452,284,45,36, 4],[534,279,47,37, 4],[618,281,45,36, 3],[704,285,43,34, 3],[786,290,40,32, 3],
  // Row 8 (very sparse)
  [332,328,38,30, 2],[414,322,40,32, 3],[496,318,42,33, 3],[578,320,42,33, 3],[660,323,40,32, 3],[742,329,38,30, 2],
  // Center vertical fills
  [458,118,42,33, 4],[542,120,42,33, 4],[454,155,42,33, 4],[546,158,42,33, 4],[450,196,42,33, 3],[550,199,42,33, 3],
  // Maple branch-tip clusters (left)
  [170,195,32,25, 5],[132,175,26,20, 4],[104,163,20,16, 4],
  [248,230,32,25, 4],[212,218,28,22, 4],
  // Maple branch-tip clusters (right, mirror)
  [830,195,32,25, 5],[868,175,26,20, 4],[896,163,20,16, 4],
  [752,230,32,25, 4],[788,218,28,22, 4],
];

// ── Maple-style branches (arc upward and outward from single trunk) ──
const BRANCHES: [string, number, number][] = [
  ['M489,330 C440,290 366,248 288,218 Q228,196 172,184', 22, 14],
  ['M489,330 C450,305 396,278 338,256 Q284,238 240,228', 17, 11],
  ['M491,330 C460,315 422,298 380,280 Q342,265 308,256', 12,  8],
  ['M493,332 C472,318 450,307 424,297 Q400,288 378,282',  9,  6],
  ['M498,330 C495,303 492,272 490,240 Q488,212 486,184',  9,  6],
  ['M507,332 C528,318 550,307 576,297 Q600,288 622,282',  9,  6],
  ['M509,330 C540,315 578,298 620,280 Q658,265 692,256', 12,  8],
  ['M511,330 C550,305 604,278 662,256 Q716,238 760,228', 17, 11],
  ['M511,330 C560,290 634,248 712,218 Q772,196 828,184', 22, 14],
];

const SECONDARY: [string, number][] = [
  ['M172,184 Q138,170 108,158 Q80,148 56,140',  11],
  ['M240,228 Q210,214 182,202 Q156,192 134,186',  9],
  ['M828,184 Q862,170 892,158 Q920,148 944,140',  11],
  ['M760,228 Q790,214 818,202 Q844,192 866,186',   9],
  ['M486,184 Q482,157 478,128 Q474,102 471,78',    8],
  ['M490,184 Q494,157 498,128 Q502,102 505,78',    8],
];

const FALLEN = [
  { x:188, y:528, rot: 42, col:'#f97316', w:14, h:20 },
  { x:332, y:560, rot:-28, col:'#ef4444', w:12, h:18 },
  { x:678, y:546, rot: 61, col:'#eab308', w:15, h:22 },
  { x:812, y:518, rot:-44, col:'#f97316', w:13, h:19 },
  { x:460, y:578, rot: 18, col:'#86efac', w:11, h:17 },
  { x:730, y:572, rot:-68, col:'#ef4444', w:12, h:18 },
  { x:252, y:590, rot: 82, col:'#eab308', w:10, h:16 },
  { x:144, y:598, rot: 55, col:'#7f1d1d', w: 9, h:14 },
];

function applyDecay(chunks: Chunk[], offsetH: number): Chunk[] {
  if (offsetH <= 0) return chunks;
  const exp = 1 + offsetH / 720;
  return chunks.map(c => ({ ...c, retention: Math.max(0, ((c.retention ?? 0.5) ** exp)) }));
}

interface LeafSlot {
  x: number; y: number; rotation: number;
  lW: number; lH: number; depth: number;
  opacity: number;
  chunk: Chunk | null;
}

interface Props {
  chunks: Chunk[];
  timeOffsetHours?: number;
  onLeafClick: (c: Chunk) => void;
  selectedId?: string;
  className?: string;
}

export function KnowledgeTree({ chunks, timeOffsetHours = 0, onLeafClick, selectedId, className }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const adj = useMemo(() => applyDecay(chunks, timeOffsetHours), [chunks, timeOffsetHours]);

  const slots = useMemo<LeafSlot[]>(() => {
    const rng = seededRng(42);
    const raw = CLUSTERS.flatMap(([cx, cy, rx, ry, count]) =>
      Array.from({ length: count }, () => {
        const angle = rng() * Math.PI * 2;
        const d     = Math.sqrt(rng());
        const scF   = 0.70 + rng() * 0.68;
        const lW    = (15 + rng() * 13) * scF;
        const lH    = (22 + rng() * 16) * scF;
        const dr    = rng();
        const depth = dr < 0.18 ? 3 : dr < 0.40 ? 2 : dr < 0.65 ? 1 : 0;
        rng();
        const x = cx + Math.cos(angle) * rx * d;
        const y = cy + Math.sin(angle) * ry * d;
        const rot = rng() * 360;
        const opa = 0.68 + rng() * 0.32;
        rng(); rng();
        return { x, y, rotation: rot, lW, lH, depth, opacity: opa };
      })
    );

    const byX    = [...raw].sort((a, b) => a.x - b.x);
    const ranked = [...adj].sort((a, b) => (b.retention ?? 0) - (a.retention ?? 0));
    const n      = ranked.length;
    const total  = byX.length;

    const assigned = new Map<number, Chunk>();
    ranked.forEach((c, ci) => {
      const idx = n <= 1 ? 0 : Math.round(ci * (total - 1) / (n - 1));
      assigned.set(idx, c);
    });

    return byX.map((s, i) => ({ ...s, chunk: assigned.get(i) ?? null }));
  }, [adj]);

  const sorted = useMemo(() => [...slots].sort((a, b) => b.depth - a.depth), [slots]);

  // maple trunk bezier points
  const trunkPath =
    'M 484,628 C 483,576 481,514 480,460 ' +
    'C 479,416 479,372 480,340 ' +
    'C 481,326 484,316 490,310 ' +
    'C 494,306 498,304 500,303 ' +
    'C 502,304 506,306 510,310 ' +
    'C 516,316 519,326 520,340 ' +
    'C 521,372 521,416 520,460 ' +
    'C 519,514 517,576 516,628 Z';

  // highlight strip (cylindrical lit zone ~25 % from left)
  const trunkHiPath =
    'M 486,628 C 485,576 483,514 482,460 ' +
    'C 481,416 481,372 482,342 ' +
    'C 483,330 485,320 488,313 ' +
    'L 493,308 C 492,310 490,316 489,330 ' +
    'C 488,372 488,416 489,460 ' +
    'C 490,514 491,576 492,628 Z';

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className={`select-none ${className ?? 'w-full h-full'}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="ktBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#020608"/>
          <stop offset="55%"  stopColor="#030f08"/>
          <stop offset="100%" stopColor="#061a0a"/>
        </linearGradient>
        <radialGradient id="ktLG" cx="22%" cy="98%" r="58%">
          <stop offset="0%"  stopColor="#2d8b3a" stopOpacity=".42"/>
          <stop offset="100%" stopColor="#2d8b3a" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="ktRO" cx="78%" cy="96%" r="54%">
          <stop offset="0%"  stopColor="#c85a18" stopOpacity=".32"/>
          <stop offset="100%" stopColor="#c85a18" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="ktCS" cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#010304" stopOpacity=".55"/>
          <stop offset="60%"  stopColor="#010304" stopOpacity=".14"/>
          <stop offset="100%" stopColor="#010304" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="ktBark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#060100"/>
          <stop offset="10%"  stopColor="#1e0c04"/>
          <stop offset="26%"  stopColor="#6b3215"/>
          <stop offset="44%"  stopColor="#3e1a08"/>
          <stop offset="66%"  stopColor="#1c0a04"/>
          <stop offset="86%"  stopColor="#0a0200"/>
          <stop offset="100%" stopColor="#040100"/>
        </linearGradient>
        <filter id="ktFog"  x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
        <filter id="ktShadow"><feDropShadow dx="1.5" dy="2.5" stdDeviation="2.4" floodColor="#000" floodOpacity="0.65"/></filter>
        <filter id="ktDB"><feGaussianBlur stdDeviation="2.0"/></filter>
        <filter id="ktMB"><feGaussianBlur stdDeviation="0.9"/></filter>
        <filter id="ktGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
        <filter id="ktSelGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feFlood floodColor="white" floodOpacity="0.6" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Leaf sway keyframes (CSS compositor-threaded) ── */}
      <style>{`
        @keyframes ktSway1 { from { transform: rotate(-2.2deg); } to { transform: rotate(2.2deg); } }
        @keyframes ktSway2 { from { transform: rotate(-1.6deg); } to { transform: rotate(1.6deg); } }
        @keyframes ktSway3 { from { transform: rotate( 1.9deg); } to { transform: rotate(-1.9deg); } }
        @keyframes ktSway4 { from { transform: rotate(-2.6deg); } to { transform: rotate(2.6deg); } }
      `}</style>

      {/* Background */}
      <rect width={VW} height={VH} fill="url(#ktBg)"/>
      <rect width={VW} height={VH} fill="url(#ktLG)"/>
      <rect width={VW} height={VH} fill="url(#ktRO)"/>

      {/* Ground fog */}
      <ellipse cx={VW/2} cy={VH} rx={490} ry={36} fill="#0e2208" opacity=".72" filter="url(#ktFog)"/>
      <ellipse cx={280}  cy={VH-4} rx={260} ry={22} fill="#38d96b" opacity=".13" filter="url(#ktFog)"/>
      <ellipse cx={720}  cy={VH-5} rx={240} ry={20} fill="#e86820" opacity=".10" filter="url(#ktFog)"/>
      <ellipse cx={VW/2} cy={GROUND_Y+22} rx={490} ry={34} fill="#020100" opacity=".82"/>

      {/* Ground disc */}
      <ellipse cx={VW/2} cy={GROUND_Y+4} rx={440} ry={24} fill="#030100" opacity=".85"/>

      {/* ── Maple surface root flares (subtle, natural) ──────────── */}
      {/* left main flare */}
      <path d="M484,625 C470,618 452,614 432,615 C412,616 392,619 370,622 Q346,626 320,628"
        stroke="#080100" strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M484,625 C470,618 452,614 432,615 C412,616 392,619 370,622 Q346,626 320,628"
        stroke="#2e1508" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M484,623 C470,617 452,613 432,614 C412,615 392,618 370,621"
        stroke="#4a2210" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".45"/>
      {/* left minor flare */}
      <path d="M487,628 C476,622 464,618 450,619 Q436,620 420,624"
        stroke="#080100" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M487,628 C476,622 464,618 450,619 Q436,620 420,624"
        stroke="#2e1508" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* right main flare (mirror) */}
      <path d="M516,625 C530,618 548,614 568,615 C588,616 608,619 630,622 Q654,626 680,628"
        stroke="#080100" strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M516,625 C530,618 548,614 568,615 C588,616 608,619 630,622 Q654,626 680,628"
        stroke="#2e1508" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M516,623 C530,617 548,613 568,614 C588,615 608,618 630,621"
        stroke="#4a2210" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".45"/>
      {/* right minor flare */}
      <path d="M513,628 C524,622 536,618 550,619 Q564,620 580,624"
        stroke="#080100" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M513,628 C524,622 536,618 550,619 Q564,620 580,624"
        stroke="#2e1508" strokeWidth="4" fill="none" strokeLinecap="round"/>

      {/* ── Maple single trunk ───────────────────────────────────── */}
      {/* cast shadow (shift right) */}
      <path d={trunkPath} fill="#030100" transform="translate(5,3)" opacity=".52"/>
      {/* main bark body */}
      <path d={trunkPath} fill="url(#ktBark)"/>
      {/* warm cylindrical highlight */}
      <path d={trunkHiPath} fill="#aa5828" opacity=".38"/>
      {/* rim light */}
      <path
        d="M 486,628 C 485,576 483,514 482,460 C 481,416 481,374 483,344 C 484,330 487,319 491,313 L 488,315 C 485,322 484,333 483,348 C 482,380 482,424 483,468 C 484,522 485,578 486,628 Z"
        fill="#e07838" opacity=".15"/>
      {/* bark groove lines */}
      <path d="M 500,628 C 499,545 498,460 498,382 C 497,354 496,340 495,328"
        stroke="#060100" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".42"/>
      <path d="M 504,628 C 503,545 503,462 503,384 C 502,356 501,342 500,330"
        stroke="#060100" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".32"/>
      <path d="M 495,628 C 494,545 493,462 493,384 C 492,356 491,342 490,330"
        stroke="#060100" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity=".28"/>

      {/* ── Trunk fork sub-branches ──────────────────────────────── */}
      <path d="M 490,322 C 482,305 472,285 462,264"
        stroke="#040100" strokeWidth="22" fill="none" strokeLinecap="round"/>
      <path d="M 490,322 C 482,305 472,285 462,264"
        stroke="url(#ktBark)" strokeWidth="18" fill="none" strokeLinecap="round"/>
      <path d="M 510,322 C 518,305 528,285 538,264"
        stroke="#040100" strokeWidth="22" fill="none" strokeLinecap="round"/>
      <path d="M 510,322 C 518,305 528,285 538,264"
        stroke="url(#ktBark)" strokeWidth="18" fill="none" strokeLinecap="round"/>

      {/* ── Primary branches ─────────────────────────────────────── */}
      {BRANCHES.map(([d, s1, s2], i) => (
        <g key={`br${i}`}>
          <path d={d} stroke="#040100" strokeWidth={s1+4} fill="none" strokeLinecap="round"/>
          <path d={d} stroke="url(#ktBark)" strokeWidth={s1} fill="none" strokeLinecap="round"/>
          <path d={d} stroke="#2d1509" strokeWidth={s2} fill="none" strokeLinecap="round"/>
        </g>
      ))}

      {/* ── Secondary branches ───────────────────────────────────── */}
      {SECONDARY.map(([d, sw], i) => (
        <g key={`sbr${i}`}>
          <path d={d} stroke="#060100" strokeWidth={sw+3} fill="none" strokeLinecap="round"/>
          <path d={d} stroke="#2d1509" strokeWidth={sw}   fill="none" strokeLinecap="round"/>
          <path d={d} stroke="#3d1f0d" strokeWidth={sw*0.55} fill="none" strokeLinecap="round" opacity=".52"/>
        </g>
      ))}

      {/* ── Leaves depth 3 — back, blurred ───────────────────────── */}
      {sorted.filter(lf => lf.depth === 3).map((lf, i) => {
        const col   = lf.chunk ? leafColor(lf.chunk.retention ?? 0.5) : ambientLeafColor(lf.x);
        const shade = SHADES[col] ?? SHADES['#22c55e'];
        return (
          <g key={`d3_${i}`}
            transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.rotation.toFixed(1)})`}
            opacity={lf.opacity * 0.42} filter="url(#ktDB)">
            <path d={LP(lf.lW * 0.70, lf.lH * 0.70)} fill={shade.lo}/>
          </g>
        );
      })}

      {/* Depth 2 — back-mid */}
      {sorted.filter(lf => lf.depth === 2).map((lf, i) => {
        const col   = lf.chunk ? leafColor(lf.chunk.retention ?? 0.5) : ambientLeafColor(lf.x);
        const shade = SHADES[col] ?? SHADES['#22c55e'];
        const lW = lf.lW * 0.85, lH = lf.lH * 0.85;
        return (
          <g key={`d2_${i}`}
            transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.rotation.toFixed(1)})`}
            opacity={lf.opacity * 0.60} filter="url(#ktMB)">
            <path d={LP(lW, lH)} fill={shade.lo}/>
            <path d={LP(lW, lH)} fill={col} opacity=".65"/>
          </g>
        );
      })}

      {/* Depth 1 — mid-front, animated + interactive */}
      {sorted.filter(lf => lf.depth === 1).map((lf, i) => {
        const col   = lf.chunk ? leafColor(lf.chunk.retention ?? 0.5) : ambientLeafColor(lf.x);
        const shade = SHADES[col] ?? SHADES['#22c55e'];
        const isSel = lf.chunk?.id === selectedId;
        const hasChunk = !!lf.chunk;
        return (
          <g key={`d1_${i}`}
            transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.rotation.toFixed(1)})`}
            opacity={lf.opacity * 0.84}>
            {/* sway layer — CSS animation so it's compositor-threaded */}
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: '50% 90%',
              animation: `ktSway${(i % 4) + 1} ${2.2 + (i % 5) * 0.26}s ${(i % 9) * 0.24}s ease-in-out infinite alternate`,
            }}>
              <motion.g
                style={{ cursor: hasChunk ? 'pointer' : 'default' }}
                animate={{ scale: isSel ? 1.35 : 1 }}
                whileHover={hasChunk ? { scale: isSel ? 1.35 : 1.22 } : {}}
                whileTap={hasChunk ? { scale: 0.88 } : {}}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                onClick={() => hasChunk && onLeafClick(lf.chunk!)}
                onHoverStart={() => hasChunk && setHoverId(lf.chunk!.id)}
                onHoverEnd={() => setHoverId(null)}>
                <path d={LP(lf.lW, lf.lH)} fill={shade.lo} transform="translate(0.6,1.2)" opacity=".50"/>
                <path d={LP(lf.lW, lf.lH)} fill={col}
                  stroke={isSel ? 'rgba(255,255,255,0.55)' : 'none'}
                  strokeWidth={isSel ? 0.7 : 0}/>
                <ellipse cx={-lf.lW*.06} cy={-lf.lH*.12} rx={lf.lW*.42} ry={lf.lH*.32} fill={shade.hi} opacity=".26"/>
                <path d={`M 0,${lf.lH*.84} C ${lf.lW*.02},${lf.lH*.18} 0,${-lf.lH*.26} 0,${-lf.lH*.88}`}
                  stroke={shade.vein} strokeWidth=".60" fill="none" opacity=".38"/>
              </motion.g>
            </g>
          </g>
        );
      })}

      {/* Depth 0 — front, full detail, fully animated + interactive */}
      {sorted.filter(lf => lf.depth === 0).map((lf, i) => {
        const col   = lf.chunk ? leafColor(lf.chunk.retention ?? 0.5) : ambientLeafColor(lf.x);
        const shade = SHADES[col] ?? SHADES['#22c55e'];
        const r     = lf.chunk?.retention ?? 0.6;
        const isSel = lf.chunk?.id === selectedId;
        const isHov = lf.chunk?.id === hoverId;
        const hasChunk = !!lf.chunk;
        return (
          <g key={`d0_${i}`}
            transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.rotation.toFixed(1)})`}
            opacity={lf.opacity}>
            {/* sway wrapper */}
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: '50% 90%',
              animation: `ktSway${(i % 4) + 1} ${2.0 + (i % 5) * 0.30}s ${(i % 11) * 0.20}s ease-in-out infinite alternate`,
            }}>
              <motion.g
                style={{ cursor: hasChunk ? 'pointer' : 'default' }}
                animate={{ scale: isSel ? 1.5 : 1 }}
                whileHover={hasChunk ? { scale: isSel ? 1.52 : 1.32 } : {}}
                whileTap={hasChunk ? { scale: 0.84 } : {}}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
                onClick={() => hasChunk && onLeafClick(lf.chunk!)}
                onHoverStart={() => hasChunk && setHoverId(lf.chunk!.id)}
                onHoverEnd={() => setHoverId(null)}>

                {/* drop shadow path */}
                <path d={LP(lf.lW, lf.lH)} fill={shade.lo} transform="translate(1,1.8)" opacity=".58"/>

                {/* leaf body */}
                <path d={LP(lf.lW, lf.lH)} fill={col}
                  stroke={isSel ? 'white' : isHov ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)'}
                  strokeWidth={isSel ? 1.0 : isHov ? 0.7 : 0.4}
                  filter={isSel ? 'url(#ktSelGlow)' : r > 0.58 ? 'url(#ktGlow)' : undefined}/>

                {/* highlight sheen */}
                <ellipse cx={-lf.lW*.05} cy={-lf.lH*.10} rx={lf.lW*.42} ry={lf.lH*.32} fill={shade.hi} opacity=".36"/>

                {/* midrib vein */}
                <path d={`M 0,${lf.lH*.88} C ${lf.lW*.03},${lf.lH*.22} ${lf.lW*.01},${-lf.lH*.28} 0,${-lf.lH*.94}`}
                  stroke={shade.vein} strokeWidth=".82" fill="none" opacity=".52"/>

                {/* lateral veins */}
                <path d={`M ${lf.lW*.02},${-lf.lH*.52} C ${-lf.lW*.18},${-lf.lH*.58} ${-lf.lW*.50},${-lf.lH*.52} ${-lf.lW*.68},${-lf.lH*.40}`}
                  stroke={shade.vein} strokeWidth=".44" fill="none" opacity=".30"/>
                <path d={`M ${-lf.lW*.02},${-lf.lH*.52} C ${lf.lW*.18},${-lf.lH*.58} ${lf.lW*.50},${-lf.lH*.52} ${lf.lW*.68},${-lf.lH*.40}`}
                  stroke={shade.vein} strokeWidth=".44" fill="none" opacity=".30"/>
                <path d={`M ${lf.lW*.02},${-lf.lH*.16} C ${-lf.lW*.18},${-lf.lH*.24} ${-lf.lW*.60},${-lf.lH*.18} ${-lf.lW*.84},${-lf.lH*.06}`}
                  stroke={shade.vein} strokeWidth=".38" fill="none" opacity=".26"/>
                <path d={`M ${-lf.lW*.02},${-lf.lH*.16} C ${lf.lW*.18},${-lf.lH*.24} ${lf.lW*.60},${-lf.lH*.18} ${lf.lW*.84},${-lf.lH*.06}`}
                  stroke={shade.vein} strokeWidth=".38" fill="none" opacity=".26"/>

                {/* petiole (stem) */}
                <line x1="0" y1={lf.lH*.90} x2="0" y2={lf.lH*1.18}
                  stroke="#2d1509" strokeWidth="1.2" strokeLinecap="round" opacity=".56"/>

                {/* selected glow ring */}
                {isSel && (
                  <motion.circle
                    cx={0} cy={-lf.lH*.10} r={lf.lW * 0.88}
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth={1.4}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [1, 1.08, 1], opacity: [0.9, 0.5, 0.9] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                {/* hover ripple hint for chunk leaves */}
                {isHov && !isSel && hasChunk && (
                  <motion.circle
                    cx={0} cy={-lf.lH*.10} r={lf.lW * 0.75}
                    fill="none"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth={0.8}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                )}
              </motion.g>
            </g>
          </g>
        );
      })}

      {/* ── Fallen leaves (atmosphere) ───────────────────────────── */}
      {FALLEN.map(({ x, y, rot, col, w, h }, i) => {
        const shade = SHADES[col] ?? SHADES['#22c55e'];
        return (
          <g key={`fall${i}`} transform={`translate(${x},${y}) rotate(${rot})`} opacity="0.58">
            <path d={LP(w, h)} fill={shade.lo} transform="translate(0.5,1)" opacity=".55"/>
            <path d={LP(w, h)} fill={col}/>
            <path d={`M 0,${h*.88} C ${w*.03},${h*.22} 0,${-h*.28} 0,${-h*.94}`}
              stroke={shade.vein} strokeWidth=".6" fill="none" opacity=".42"/>
          </g>
        );
      })}

      {/* Canopy inner shadow — 3D depth */}
      <ellipse cx="500" cy="240" rx="400" ry="258" fill="url(#ktCS)"/>

      <text x={VW/2} y={VH-6} textAnchor="middle"
        fill="rgba(148,163,184,0.15)" fontSize="11"
        fontFamily="JetBrains Mono, monospace" fontWeight="500" letterSpacing="1">
        {slots.filter(s => s.chunk).length} leaves · click to inspect
      </text>
    </svg>
  );
}
