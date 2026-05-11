import { useMemo } from 'react';
import { motion } from 'framer-motion';

// ── deterministic RNG ──────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

// ── leaf color by x-position ──────────────────────────────────────
function leafColor(x: number): string {
  if (x < 300) return '#22c55e';
  if (x < 450) return '#84cc16';
  if (x < 550) return '#eab308';
  if (x < 650) return '#f97316';
  return '#ef4444';
}

// ── leaf shape path ───────────────────────────────────────────────
function lp(w: number, h: number): string {
  const hw = w * 0.5, hh = h * 0.5;
  return (
    `M 0,${hh * 0.92} ` +
    `C ${-hw * 0.75},${hh * 0.40} ${-hw * 1.10},${-hh * 0.15} 0,${-hh * 0.96} ` +
    `C ${hw * 1.10},${-hh * 0.15} ${hw * 0.75},${hh * 0.40} 0,${hh * 0.92} Z`
  );
}

// ── leaf clusters [cx, cy, rx, ry, count] ─────────────────────────
// Dense on left (green) → sparse on right (red) — the health gradient
const CLUSTERS: [number, number, number, number, number][] = [
  // ── upper canopy ─────────────────────────────────────────────────
  [122, 152, 78, 60, 50],   // far-left crown
  [192, 138, 65, 50, 42],   // left crown
  [272, 128, 58, 44, 36],   // centre-left
  [338, 144, 52, 40, 26],   // inner-left
  [400, 138, 50, 40, 10],   // centre top
  [462, 144, 52, 40, 20],   // inner-right
  [528, 128, 58, 44, 19],   // right-centre
  [608, 138, 65, 50, 14],   // right
  [678, 152, 78, 60, 11],   // far-right
  // ── L1S top strip ────────────────────────────────────────────────
  [293, 318, 28, 22, 11],  [302, 298, 26, 20,  9],
  [507, 318, 28, 22, 11],  [498, 298, 26, 20,  9],
  // ── L1S bottom strip ─────────────────────────────────────────────
  [293, 362, 28, 22, 11],  [302, 338, 26, 20,  9],
  [507, 362, 28, 22, 11],  [498, 338, 26, 20,  9],
  // ── branch-top fringe L1 lower half ──────────────────────────────
  [330, 295, 40, 60, 32],  [365, 282, 36, 58, 28],  [399, 274, 34, 56, 11],
  [435, 282, 36, 58, 28],  [470, 295, 40, 60, 32],
  // ── branch-top fringe L1 upper half ──────────────────────────────
  [203, 210, 38, 55, 27],  [312, 192, 34, 52, 24],  [399, 188, 32, 50, 10],
  [488, 192, 34, 52, 24],  [597, 210, 38, 55, 27],
  // ── L1M sub-branches ─────────────────────────────────────────────
  [302, 229, 30, 48, 21],  [255, 228, 30, 48, 21],
  [360, 210, 28, 45, 17],  [317, 210, 28, 45, 17],
  [378, 200, 27, 44,  7],  [420, 200, 27, 44,  7],
  [440, 210, 28, 45, 17],  [484, 210, 28, 45, 17],
  [497, 229, 30, 48, 21],  [545, 228, 30, 48, 21],
  // ── mid canopy ───────────────────────────────────────────────────
  [200, 222, 52, 38, 40],   // outer-left
  [278, 198, 50, 36, 36],   // left upper
  [336, 185, 48, 35, 32],   // inner-left
  [399, 180, 50, 36, 12],   // centre
  [462, 185, 48, 35, 30],   // inner-right
  [520, 198, 50, 36, 34],   // right upper
  [598, 222, 52, 38, 37],   // outer-right
  // ── 5cm–7cm, sparse scatter 1.5cm–6cm from centre (x=220–355 left, x=445–580 right) ──
  [288, 410, 68, 30,  6],
  [513, 410, 68, 30,  6],
  // ── 7cm–9cm, sparse scatter 1.5cm–5cm from centre (x=250–355 left, x=445–550 right) ──
  [303, 350, 53, 30,  6],
  [498, 350, 53, 30,  6],
  // ── 8cm–10cm, sparse scatter 5cm–9cm from centre (x=130–250 left, x=550–670 right) ──
  [190, 320, 60, 30,  6],
  [610, 320, 60, 30,  6],
  // ── 8cm–10cm, less dense 5cm–8cm from centre (x=160–250 left, x=550–640 right) ──
  [205, 320, 45, 30, 10],
  [595, 320, 45, 30, 10],
  // ── 9cm–12cm, sparse scatter 5cm–8cm from centre (x=160–250 left, x=550–640 right) ──
  [205, 275, 45, 45,  6],
  [595, 275, 45, 45,  6],
  // ── 16cm–18cm very sparse (no solid horizontal band) ─────────────
  [110,  80, 52, 30,  8],  [230,  80, 48, 30,  7],  [350,  80, 46, 30,  6],
  [470,  80, 46, 30,  6],  [590,  80, 48, 30,  6],  [710,  80, 52, 30,  5],
  // ── 18cm–19cm ────────────────────────────────────────────────────
  [400,  35, 70, 15, 11],
  [355,  35, 15, 15,  8],  [445,  35, 15, 15,  8],
  [280,  35, 15, 15,  8],  [520,  35, 15, 15,  8],
  [ 87,  35, 17, 15,  7],  [714,  35, 17, 15,  7],
  [153,  35, 23, 15,  8],  [648,  35, 23, 15,  8],
  [220,  35, 30, 15,  9],  [580,  35, 30, 15,  9],
  // ── 19.5cm–20cm ──────────────────────────────────────────────────
  [310,  -3, 30,  8,  8],  [490,  -3, 30,  8,  8],
  [235,  -3, 30,  8,  8],  [565,  -3, 30,  8,  8],
  [168,  -3, 38,  8,  9],  [633,  -3, 38,  8,  9],
  // ── sparse overlays 18–20.5cm ────────────────────────────────────
  [400,  35, 330, 15,  4],
  [400,  13, 330, 38,  5],  [395,   8, 325, 38,  4],
  // ── 20cm–21cm ────────────────────────────────────────────────────
  [243, -25, 128, 15, 13],  [557, -25, 128, 15, 13],
  // ── 21cm–22cm ────────────────────────────────────────────────────
  [307, -55, 87, 15, 12],   [493, -55, 87, 15, 12],
  // ── tall centre strip 17–22cm sparse ─────────────────────────────
  [400,   5, 60, 75,  5],  [403,   2, 58, 75,  4],
  // ── 17–22cm outer sparse ─────────────────────────────────────────
  [213,   5, 143, 75,  5],  [588,   5, 143, 75,  5],
  // ── 18cm–19cm half-circle arc ────────────────────────────────────
  [343,  35,  7, 20, 10],  [457,  35,  7, 20, 10],  [400,  21, 52,  7,  6],
];

// ── falling leaf spawn points ─────────────────────────────────────
const FALLING: { xp: number; yp: number; delay: number; dx: number; col: string }[] = [
  { xp: 74, yp: 30, delay: 0.0,  dx: -22, col: '#f97316' },
  { xp: 80, yp: 26, delay: 0.9,  dx:  28, col: '#ef4444' },
  { xp: 85, yp: 34, delay: 1.8,  dx: -16, col: '#eab308' },
  { xp: 77, yp: 40, delay: 2.7,  dx:  32, col: '#f97316' },
  { xp: 88, yp: 28, delay: 3.6,  dx: -28, col: '#ef4444' },
  { xp: 72, yp: 22, delay: 4.5,  dx:  20, col: '#eab308' },
  { xp: 83, yp: 42, delay: 5.4,  dx: -18, col: '#f97316' },
  { xp: 91, yp: 30, delay: 0.45, dx:  14, col: '#ef4444' },
];

// ── primary branches [path, strokeWidth] ─────────────────────────
const L1: [string, number][] = [
  ['M 394,372 C 334,322 234,258 122,178',    9],
  ['M 396,364 C 368,308 314,224 272,138',    6],
  ['M 398,358 C 398,292 400,218 400,138',    4],
  ['M 402,364 C 432,308 486,224 528,138',    6],
  ['M 406,372 C 466,322 566,258 678,178',    9],
];

// ── mid-branch forks — sprout from the middle of each L1 ────────
// Midpoints computed at t=0.5 of each L1 cubic bezier
const L1M: [string, number][] = [
  // L1[0] mid (278,286) — outer-left branch
  ['M 278,286 C 292,260 312,236 328,214',   2.5],
  ['M 278,286 C 264,260 246,234 230,212',   2.5],
  // L1[1] mid (339,262) — inner-left branch
  ['M 339,262 C 352,238 368,216 380,196',   2.0],
  ['M 339,262 C 325,238 308,214 294,194',   2.0],
  // L1[2] mid (399,253) — center branch
  ['M 399,253 C 386,228 370,204 356,182',   3],
  ['M 399,253 C 412,228 428,204 444,182',   3],
  // L1[3] mid (461,262) — inner-right branch
  ['M 461,262 C 448,238 432,216 420,196',   2.0],
  ['M 461,262 C 475,238 492,214 506,194',   2.0],
  // L1[4] mid (523,286) — outer-right branch
  ['M 523,286 C 509,260 489,236 474,214',   2.5],
  ['M 523,286 C 537,260 556,234 570,212',   2.5],
];

// ── 1cm-level sub-branches on outermost L1 branches ─────────────
// 2 forks each from t≈0.25 on L1[0] (342,332) and L1[4] (458,332)
const L1S: [string, number][] = [
  // L1[0] (far-left) — reflex droops down-left, second goes 70° up-left
  ['M 342,332 C 310,337 276,343 244,350',  2.5],  // reflex — sweeps left-downward
  ['M 342,332 C 315,322 289,313 262,303',  2.5],  // 70° — diagonal-left upward
  // L1[4] (far-right) — reflex droops down-right, second goes 70° up-right
  ['M 458,332 C 490,337 524,343 556,350',  2.5],  // reflex — sweeps right-downward
  ['M 458,332 C 485,322 511,313 538,303',  2.5],  // 70° — diagonal-right upward
];

// ── secondary branches [path, strokeWidth] ───────────────────────
const L2: [string, number][] = [
  ['M 122,178 C 98,155 74,132 54,110',       3.6],
  ['M 122,178 C 148,155 170,132 186,110',    3.6],
  ['M 272,138 C 250,115 232,93 224,74',      3.0],
  ['M 272,138 C 294,115 312,93 318,74',      3.0],
  ['M 400,138 C 386,114 376,92 370,74',      2.6],
  ['M 400,138 C 414,114 424,92 430,74',      2.6],
  ['M 528,138 C 506,115 488,93 482,74',      3.0],
  ['M 528,138 C 550,115 568,93 576,74',      3.0],
  ['M 678,178 C 652,155 628,132 614,110',    3.6],
  ['M 678,178 C 704,155 726,132 746,110',    3.6],
];

// ── tertiary twigs — 2 per L2 tip ────────────────────────────────
const L3: [string, number][] = [
  // from (54,110)
  ['M 54,110 C 44,98 36,87 28,76',          2.0],
  ['M 54,110 C 66,98 76,87 86,76',          2.0],
  // from (186,110)
  ['M 186,110 C 174,98 164,87 154,76',      2.0],
  ['M 186,110 C 198,98 210,87 220,76',      2.0],
  // from (224,74)
  ['M 224,74 C 214,63 206,53 200,44',       1.8],
  ['M 224,74 C 234,63 242,53 248,44',       1.8],
  // from (318,74)
  ['M 318,74 C 308,63 300,53 294,44',       1.8],
  ['M 318,74 C 328,63 336,53 342,44',       1.8],
  // from (370,74)
  ['M 370,74 C 361,63 354,53 348,44',       1.8],
  ['M 370,74 C 379,63 386,53 392,44',       1.8],
  // from (430,74)
  ['M 430,74 C 421,63 414,53 408,44',       1.8],
  ['M 430,74 C 439,63 446,53 452,44',       1.8],
  // from (482,74)
  ['M 482,74 C 472,63 464,53 458,44',       1.8],
  ['M 482,74 C 492,63 500,53 506,44',       1.8],
  // from (576,74)
  ['M 576,74 C 566,63 558,53 552,44',       1.8],
  ['M 576,74 C 586,63 594,53 600,44',       1.8],
  // from (614,110)
  ['M 614,110 C 602,98 592,87 582,76',      2.0],
  ['M 614,110 C 626,98 636,87 646,76',      2.0],
  // from (746,110)
  ['M 746,110 C 734,98 724,87 716,76',      2.0],
  ['M 746,110 C 758,98 768,87 778,76',      2.0],
];

interface Leaf { x: number; y: number; w: number; h: number; rot: number; opa: number; col: string }

export function BanyanTree() {
  const leaves = useMemo<Leaf[]>(() => {
    const rng = seededRng(42);
    return CLUSTERS.flatMap(([cx, cy, rx, ry, count]) =>
      Array.from({ length: count }, () => {
        const angle = rng() * Math.PI * 2;
        const d = Math.sqrt(rng());
        const x   = cx + Math.cos(angle) * rx * d;
        const y   = cy + Math.sin(angle) * ry * d;
        const w   = 10 + rng() * 11;
        const h   = 14 + rng() * 13;
        const rot = rng() * 360;
        const opa = 0.60 + rng() * 0.38;
        return { x, y, w, h, rot, opa, col: leafColor(x) };
      })
    );
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* ── sway wrapper ─────────────────────────────── */}
      <motion.div
        className="w-full h-full"
        animate={{ rotate: [-0.4, 0.4, -0.4], scale: [1, 1.008, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50% 95%' }}
      >
        <svg
          viewBox="-260 -120 1120 840"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="btTrunk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#2A1A12"/>
              <stop offset="25%"  stopColor="#6B4535"/>
              <stop offset="55%"  stopColor="#8B5E42"/>
              <stop offset="78%"  stopColor="#5A3A28"/>
              <stop offset="100%" stopColor="#2A1A12"/>
            </linearGradient>
            <linearGradient id="btBranch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#7B5540"/>
              <stop offset="100%" stopColor="#3B2820"/>
            </linearGradient>
            <radialGradient id="btAmbient" cx="38%" cy="42%" r="65%">
              <stop offset="0%"   stopColor="rgba(34,197,94,0.09)"/>
              <stop offset="55%"  stopColor="rgba(132,204,22,0.04)"/>
              <stop offset="100%" stopColor="transparent"/>
            </radialGradient>
            <radialGradient id="btAmbientR" cx="75%" cy="40%" r="50%">
              <stop offset="0%"   stopColor="rgba(249,115,22,0.07)"/>
              <stop offset="100%" stopColor="transparent"/>
            </radialGradient>
            <filter id="btLeafGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.8" result="b"/>
              <feComposite in="SourceGraphic" in2="b" operator="over"/>
            </filter>
            <filter id="btShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.45"/>
            </filter>
            <filter id="btDepthBlur">
              <feGaussianBlur stdDeviation="1.2"/>
            </filter>
          </defs>

          {/* ── background glow ───────────────────── */}
          <rect x="-160" y="-120" width="1120" height="840" fill="url(#btAmbient)"/>
          <rect x="-160" y="-120" width="1120" height="840" fill="url(#btAmbientR)"/>

          {/* ── ground shadow ─────────────────────── */}
          <ellipse cx="400" cy="592" rx="320" ry="14" fill="#020408" opacity="0.75"/>

          {/* ── roots ─────────────────────────────── */}
          <g opacity="0.85">
            {[
              ['M 396,582 C 326,580 210,576 82,582',   4.5],
              ['M 397,580 C 342,578 265,575 172,580',  3.5],
              ['M 398,578 C 365,577 322,575 268,578',  3],
              ['M 399,577 C 376,577 352,576 322,578',  2.5],
              ['M 401,577 C 424,577 448,576 478,578',  2.5],
              ['M 402,578 C 436,577 480,575 532,578',  3],
              ['M 403,580 C 458,578 540,575 626,580',  3.5],
              ['M 404,582 C 470,580 582,576 718,582',  4.5],
            ].map(([d, w], i) => (
              <path key={i} d={d as string} stroke="#1E293B" strokeWidth={w as number}
                fill="none" strokeLinecap="round"/>
            ))}
          </g>

          {/* ── trunk ─────────────────────────────── */}
          {/* shadow */}
          <path
            d="M 403,590 C 406,548 408,512 406,478 C 404,444 400,414 398,384 C 396,354 393,328 391,306 C 390,295 392,285 404,277"
            stroke="#0D0D18" strokeWidth="42" fill="none" strokeLinecap="round"/>
          {/* bark body */}
          <path
            d="M 400,590 C 402,548 403,512 402,478 C 401,444 397,414 395,384 C 393,354 390,328 388,306 C 387,295 389,284 400,276"
            stroke="url(#btTrunk)" strokeWidth="38" fill="none" strokeLinecap="round"/>
          {/* highlight strip — cylindrical 3D */}
          <path
            d="M 396,590 C 397,548 398,512 397,478 C 396,444 393,418 392,390 C 391,362 390,338 390,316"
            stroke="#C08858" strokeWidth="11" fill="none" strokeLinecap="round" opacity="0.32"/>
          {/* bark texture grooves */}
          {[
            'M 402,590 C 401,520 400,455 399,385 C 398,350 396,320 394,300',
            'M 405,590 C 404,522 404,458 403,388 C 402,352 400,322 398,302',
          ].map((d, i) => (
            <path key={i} d={d} stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.38"/>
          ))}

          {/* ── primary branches ─────────────────── */}
          {L1.map(([d, w], i) => (
            <g key={i}>
              <path d={d} stroke="#0D0D18" strokeWidth={w + 4} fill="none" strokeLinecap="round"/>
              <path d={d} stroke="url(#btBranch)" strokeWidth={w}  fill="none" strokeLinecap="round"/>
              <path d={d} stroke="#9B7858" strokeWidth={w * 0.28} fill="none" strokeLinecap="round" opacity="0.3"/>
            </g>
          ))}

          {/* ── mid-branch forks ─────────────────── */}
          {L1M.map(([d, w], i) => (
            <g key={i}>
              <path d={d} stroke="#0D0D18" strokeWidth={w + 2} fill="none" strokeLinecap="round"/>
              <path d={d} stroke="url(#btBranch)" strokeWidth={w}  fill="none" strokeLinecap="round"/>
            </g>
          ))}

          {/* ── 1cm-level outer sub-branches ────────── */}
          {L1S.map(([d, w], i) => (
            <g key={i}>
              <path d={d} stroke="#0D0D18" strokeWidth={w + 1.5} fill="none" strokeLinecap="round"/>
              <path d={d} stroke="url(#btBranch)" strokeWidth={w}  fill="none" strokeLinecap="round"/>
            </g>
          ))}

          {/* ── secondary branches ───────────────── */}
          {L2.map(([d, w], i) => (
            <g key={i}>
              <path d={d} stroke="#0D0D18" strokeWidth={w + 2} fill="none" strokeLinecap="round"/>
              <path d={d} stroke="#5A3C28" strokeWidth={w}    fill="none" strokeLinecap="round"/>
            </g>
          ))}

          {/* ── tertiary twigs ───────────────────── */}
          {L3.map(([d, w], i) => (
            <path key={i} d={d} stroke="#3E2A18" strokeWidth={w} fill="none" strokeLinecap="round" opacity="0.80"/>
          ))}

          {/* ── back-layer leaves (blurred, depth) ─ */}
          {leaves.filter((_, i) => i % 3 === 0).map((lf, i) => (
            <g key={`b${i}`}
              transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.rot.toFixed(1)})`}
              opacity={lf.opa * 0.45} filter="url(#btDepthBlur)">
              <path d={lp(lf.w * 0.75, lf.h * 0.75)} fill={lf.col}/>
            </g>
          ))}

          {/* ── mid-layer leaves ─────────────────── */}
          {leaves.filter((_, i) => i % 3 === 1).map((lf, i) => (
            <g key={`m${i}`}
              transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.rot.toFixed(1)})`}
              opacity={lf.opa * 0.72}>
              <path d={lp(lf.w * 0.9, lf.h * 0.9)} fill={lf.col} opacity="0.7"/>
              <path d={lp(lf.w * 0.9, lf.h * 0.9)} fill="rgba(255,255,255,0.08)"
                transform={`translate(${-lf.w * 0.08},${-lf.h * 0.06})`}/>
            </g>
          ))}

          {/* ── front leaves (full detail) ────────── */}
          {leaves.filter((_, i) => i % 3 === 2).map((lf, i) => (
            <g key={`f${i}`}
              transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.rot.toFixed(1)})`}
              opacity={lf.opa} filter="url(#btShadow)">
              {/* shadow cast */}
              <path d={lp(lf.w, lf.h)} fill="rgba(0,0,0,0.28)" transform="translate(1.5,2.5)"/>
              {/* leaf body */}
              <path d={lp(lf.w, lf.h)} fill={lf.col} filter="url(#btLeafGlow)"/>
              {/* specular highlight */}
              <path d={lp(lf.w * 0.50, lf.h * 0.45)}
                fill="rgba(255,255,255,0.14)"
                transform={`translate(${-lf.w * 0.12},${-lf.h * 0.09})`}/>
              {/* midrib */}
              <line x1="0" y1={lf.h * 0.44} x2="0" y2={-lf.h * 0.44}
                stroke="rgba(0,0,0,0.22)" strokeWidth="0.65" opacity="0.7"/>
              {/* petiole */}
              <line x1="0" y1={lf.h * 0.44} x2="0" y2={lf.h * 0.68}
                stroke="#2A1A0E" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
            </g>
          ))}
        </svg>
      </motion.div>

      {/* ── falling leaves (right side decay) ─── */}
      {FALLING.map((fl, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: `${fl.xp}%`, top: `${fl.yp}%` }}
          initial={{ y: 0, x: 0, opacity: 0.9, rotate: 0, scale: 1 }}
          animate={{ y: 210, x: fl.dx, opacity: 0, rotate: 360, scale: 0.7 }}
          transition={{ duration: 6 + i * 0.2, repeat: Infinity, delay: fl.delay, ease: 'easeIn' }}
        >
          <svg width="14" height="20" viewBox="-7 -10 14 20">
            <path d={lp(6, 9)} fill={fl.col} opacity="0.85"/>
            <line x1="0" y1="4" x2="0" y2="-4" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
