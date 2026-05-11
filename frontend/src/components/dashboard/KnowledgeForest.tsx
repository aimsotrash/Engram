import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trees } from 'lucide-react';

interface Category { name: string; pct: number; col: string; count: number }
interface Props { categories: Category[] }

const glass = {
  background: 'rgba(10,12,26,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: 18,
};

// ── same RNG as BanyanTree ─────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

// ── exact BanyanTree leaf shape ────────────────────────────────────
function lp(w: number, h: number): string {
  const hw = w * 0.5, hh = h * 0.5;
  return (
    `M 0,${hh * 0.92} ` +
    `C ${-hw * 0.75},${hh * 0.40} ${-hw * 1.10},${-hh * 0.15} 0,${-hh * 0.96} ` +
    `C ${hw * 1.10},${-hh * 0.15} ${hw * 0.75},${hh * 0.40} 0,${hh * 0.92} Z`
  );
}

// ── health-driven leaf color with natural per-leaf variation ───────
function miniLeafColor(pct: number, rv: number): string {
  const decay = (100 - pct) / 100;
  const r = Math.max(0, Math.min(1, decay * 1.2 + (rv - 0.5) * 0.22));
  if (r < 0.24) return '#38d96b';
  if (r < 0.50) return '#8BEA55';
  if (r < 0.68) return '#F4D03F';
  if (r < 0.85) return '#FF9A1F';
  return '#E85D2A';
}

function glowColor(pct: number): string {
  if (pct >= 75) return '#22c55e';
  if (pct >= 55) return '#a3e635';
  if (pct >= 35) return '#f97316';
  return '#ef4444';
}

// per-color shade table (highlight / shadow / vein)
const SH: Record<string, { hi: string; lo: string }> = {
  '#38d96b': { hi: '#90ffbf', lo: '#1a5e30' },
  '#8BEA55': { hi: '#c8ff88', lo: '#3d6e18' },
  '#F4D03F': { hi: '#fff79a', lo: '#7a6010' },
  '#FF9A1F': { hi: '#ffd080', lo: '#7a3e00' },
  '#E85D2A': { hi: '#ffaa80', lo: '#721808' },
};

// ── BanyanTree branch paths (exact copies) ─────────────────────────
const BT_L1: [string, number][] = [
  ['M 394,372 C 334,322 234,258 122,178', 9],
  ['M 396,364 C 368,308 314,224 272,138', 6],
  ['M 398,358 C 398,292 400,218 400,138', 4],
  ['M 402,364 C 432,308 486,224 528,138', 6],
  ['M 406,372 C 466,322 566,258 678,178', 9],
];
const BT_L1M: [string, number][] = [
  ['M 278,286 C 292,260 312,236 328,214', 2.5],
  ['M 278,286 C 264,260 246,234 230,212', 2.5],
  ['M 339,262 C 352,238 368,216 380,196', 2.0],
  ['M 339,262 C 325,238 308,214 294,194', 2.0],
  ['M 399,253 C 386,228 370,204 356,182', 3.0],
  ['M 399,253 C 412,228 428,204 444,182', 3.0],
  ['M 461,262 C 448,238 432,216 420,196', 2.0],
  ['M 461,262 C 475,238 492,214 506,194', 2.0],
  ['M 523,286 C 509,260 489,236 474,214', 2.5],
  ['M 523,286 C 537,260 556,234 570,212', 2.5],
];
const BT_L1S: [string, number][] = [
  ['M 342,332 C 310,337 276,343 244,350', 2.5],
  ['M 342,332 C 315,322 289,313 262,303', 2.5],
  ['M 458,332 C 490,337 524,343 556,350', 2.5],
  ['M 458,332 C 485,322 511,313 538,303', 2.5],
];
const BT_L2: [string, number][] = [
  ['M 122,178 C 98,155 74,132 54,110',    3.6],
  ['M 122,178 C 148,155 170,132 186,110', 3.6],
  ['M 272,138 C 250,115 232,93 224,74',   3.0],
  ['M 272,138 C 294,115 312,93 318,74',   3.0],
  ['M 400,138 C 386,114 376,92 370,74',   2.6],
  ['M 400,138 C 414,114 424,92 430,74',   2.6],
  ['M 528,138 C 506,115 488,93 482,74',   3.0],
  ['M 528,138 C 550,115 568,93 576,74',   3.0],
  ['M 678,178 C 652,155 628,132 614,110', 3.6],
  ['M 678,178 C 704,155 726,132 746,110', 3.6],
];
const BT_L3: [string, number][] = [
  ['M 54,110 C 44,98 36,87 28,76',    2.0], ['M 54,110 C 66,98 76,87 86,76',    2.0],
  ['M 186,110 C 174,98 164,87 154,76', 2.0], ['M 186,110 C 198,98 210,87 220,76', 2.0],
  ['M 224,74 C 214,63 206,53 200,44',  1.8], ['M 224,74 C 234,63 242,53 248,44',  1.8],
  ['M 318,74 C 308,63 300,53 294,44',  1.8], ['M 318,74 C 328,63 336,53 342,44',  1.8],
  ['M 370,74 C 361,63 354,53 348,44',  1.8], ['M 370,74 C 379,63 386,53 392,44',  1.8],
  ['M 430,74 C 421,63 414,53 408,44',  1.8], ['M 430,74 C 439,63 446,53 452,44',  1.8],
  ['M 482,74 C 472,63 464,53 458,44',  1.8], ['M 482,74 C 492,63 500,53 506,44',  1.8],
  ['M 576,74 C 566,63 558,53 552,44',  1.8], ['M 576,74 C 586,63 594,53 600,44',  1.8],
  ['M 614,110 C 602,98 592,87 582,76', 2.0], ['M 614,110 C 626,98 636,87 646,76', 2.0],
  ['M 746,110 C 734,98 724,87 716,76', 2.0], ['M 746,110 C 758,98 768,87 778,76', 2.0],
];

// ── leaf cluster positions mirroring BanyanTree key zones ──────────
// counts are ~40% of BanyanTree originals; density scales further with pct
const MINI_CLUSTERS: [number, number, number, number, number][] = [
  // upper canopy
  [122, 152, 78, 60, 20], [192, 138, 65, 50, 17], [272, 128, 58, 44, 14],
  [338, 144, 52, 40, 10], [400, 138, 50, 40,  4], [462, 144, 52, 40,  8],
  [528, 128, 58, 44,  8], [608, 138, 65, 50,  6], [678, 152, 78, 60,  4],
  // branch-top fringe — L1 lower half
  [330, 295, 40, 60, 13], [365, 282, 36, 58, 11], [399, 274, 34, 56,  4],
  [435, 282, 36, 58, 11], [470, 295, 40, 60, 13],
  // branch-top fringe — L1 upper half
  [203, 210, 38, 55, 11], [312, 192, 34, 52, 10], [399, 188, 32, 50,  4],
  [488, 192, 34, 52, 10], [597, 210, 38, 55, 11],
  // L1M sub-branch clusters
  [302, 229, 30, 48,  8], [255, 228, 30, 48,  8],
  [360, 210, 28, 45,  7], [317, 210, 28, 45,  7],
  [378, 200, 27, 44,  3], [420, 200, 27, 44,  3],
  [440, 210, 28, 45,  7], [484, 210, 28, 45,  7],
  [497, 229, 30, 48,  8], [545, 228, 30, 48,  8],
  // mid canopy
  [200, 222, 52, 38, 16], [278, 198, 50, 36, 14], [336, 185, 48, 35, 13],
  [399, 180, 50, 36,  5], [462, 185, 48, 35, 12], [520, 198, 50, 36, 14],
  [598, 222, 52, 38, 15],
];

const BT_ROOTS: [string, number][] = [
  ['M 396,582 C 326,580 210,576 82,582',  4.5],
  ['M 397,580 C 342,578 265,575 172,580', 3.5],
  ['M 398,578 C 365,577 322,575 268,578', 3.0],
  ['M 399,577 C 376,577 352,576 322,578', 2.5],
  ['M 401,577 C 424,577 448,576 478,578', 2.5],
  ['M 402,578 C 436,577 480,575 532,578', 3.0],
  ['M 403,580 C 458,578 540,575 626,580', 3.5],
  ['M 404,582 C 470,580 582,576 718,582', 4.5],
];

// ── MiniKnowledgeTree ─────────────────────────────────────────────
function MiniKnowledgeTree({ pct, treeIdx }: { pct: number; col: string; treeIdx: number }) {
  const uid  = `bt${treeIdx}`;
  const glow = glowColor(pct);

  const leaves = useMemo(() => {
    const rng     = seededRng(treeIdx * 13 + 42);
    const density = 0.45 + (pct / 100) * 0.55;
    return MINI_CLUSTERS.flatMap(([cx, cy, rx, ry, count]) => {
      const n = Math.max(1, Math.round(count * density));
      return Array.from({ length: n }, () => {
        const angle = rng() * Math.PI * 2;
        const d     = Math.sqrt(rng());
        const w     = 12 + rng() * 11;
        const h     = 17 + rng() * 12;
        const rot   = rng() * 360;
        const opa   = 0.60 + rng() * 0.38;
        const layer = rng();          // 0→back 1→mid 2→front
        const col   = miniLeafColor(pct, rng());
        return {
          x: cx + Math.cos(angle) * rx * d,
          y: cy + Math.sin(angle) * ry * d,
          w, h, rot, opa, col,
          depth: layer < 0.33 ? 0 : layer < 0.66 ? 1 : 2,
        };
      });
    });
  }, [pct, treeIdx]);

  // viewBox crops BanyanTree canvas to just the tree; ratio ≈ 1.5:1 → 72×48
  const vb = '-200 -100 1050 700';

  return (
    <motion.div
      style={{ width: 72, height: 48, flexShrink: 0, transformOrigin: '50% 95%' }}
      animate={{ rotate: [-0.3, 0.3, -0.3], scale: [1, 1.012, 1] }}
      transition={{ duration: 8 + treeIdx * 0.9, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox={vb} width={72} height={48}
        style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          {/* BanyanTree trunk gradient (unique per instance) */}
          <linearGradient id={`tr${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#2A1A12"/>
            <stop offset="25%"  stopColor="#6B4535"/>
            <stop offset="55%"  stopColor="#8B5E42"/>
            <stop offset="78%"  stopColor="#5A3A28"/>
            <stop offset="100%" stopColor="#2A1A12"/>
          </linearGradient>
          <linearGradient id={`br${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7B5540"/>
            <stop offset="100%" stopColor="#3B2820"/>
          </linearGradient>
          {/* glow / fog filter */}
          <filter id={`fg${uid}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="28"/>
          </filter>
          {/* leaf depth filters */}
          <filter id={`db${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.0"/>
          </filter>
          <filter id={`mb${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8"/>
          </filter>
          <filter id={`ls${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2"
              floodColor="#000" floodOpacity="0.42"/>
          </filter>
          <filter id={`lg${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="b"/>
            <feComposite in="SourceGraphic" in2="b" operator="over"/>
          </filter>
        </defs>

        {/* ── canopy ambient glow ───────────────────── */}
        <ellipse cx="400" cy="190" rx="380" ry="260"
          fill={glow} opacity="0.18" filter={`url(#fg${uid})`}/>

        {/* ── ground shadow + glow ─────────────────── */}
        <ellipse cx="400" cy="592" rx="310" ry="13"
          fill="#020408" opacity="0.75"/>
        <ellipse cx="400" cy="592" rx="220" ry="9"
          fill={glow} opacity="0.20" filter={`url(#fg${uid})`}/>

        {/* ── roots ────────────────────────────────── */}
        <g opacity="0.85">
          {BT_ROOTS.map(([d, w], i) => (
            <path key={i} d={d} stroke="#1E293B" strokeWidth={w}
              fill="none" strokeLinecap="round"/>
          ))}
        </g>

        {/* ── trunk shadow ─────────────────────────── */}
        <path
          d="M 403,590 C 406,548 408,512 406,478 C 404,444 400,414 398,384 C 396,354 393,328 391,306 C 390,295 392,285 404,277"
          stroke="#0D0D18" strokeWidth="46" fill="none" strokeLinecap="round"/>
        {/* bark */}
        <path
          d="M 400,590 C 402,548 403,512 402,478 C 401,444 397,414 395,384 C 393,354 390,328 388,306 C 387,295 389,284 400,276"
          stroke={`url(#tr${uid})`} strokeWidth="38" fill="none" strokeLinecap="round"/>
        {/* highlight */}
        <path
          d="M 396,590 C 397,548 398,512 397,478 C 396,444 393,418 392,390 C 391,362 390,338 390,316"
          stroke="#C08858" strokeWidth="11" fill="none" strokeLinecap="round" opacity="0.30"/>

        {/* ── L1 primary (shadow + bark + sheen) ────── */}
        {BT_L1.map(([d, w], i) => (
          <g key={i}>
            <path d={d} stroke="#0D0D18"        strokeWidth={w + 4} fill="none" strokeLinecap="round"/>
            <path d={d} stroke={`url(#br${uid})`} strokeWidth={w}   fill="none" strokeLinecap="round"/>
            <path d={d} stroke="#9B7858" strokeWidth={w * 0.28}
              fill="none" strokeLinecap="round" opacity="0.30"/>
          </g>
        ))}

        {/* ── L1M mid forks ────────────────────────── */}
        {BT_L1M.map(([d, w], i) => (
          <g key={i}>
            <path d={d} stroke="#0D0D18"          strokeWidth={w + 2} fill="none" strokeLinecap="round"/>
            <path d={d} stroke={`url(#br${uid})`} strokeWidth={w}     fill="none" strokeLinecap="round"/>
          </g>
        ))}

        {/* ── L1S outer sub-branches ───────────────── */}
        {BT_L1S.map(([d, w], i) => (
          <g key={i}>
            <path d={d} stroke="#0D0D18"          strokeWidth={w + 1.5} fill="none" strokeLinecap="round"/>
            <path d={d} stroke={`url(#br${uid})`} strokeWidth={w}       fill="none" strokeLinecap="round"/>
          </g>
        ))}

        {/* ── L2 secondary ─────────────────────────── */}
        {BT_L2.map(([d, w], i) => (
          <g key={i}>
            <path d={d} stroke="#0D0D18" strokeWidth={w + 2} fill="none" strokeLinecap="round"/>
            <path d={d} stroke="#5A3C28" strokeWidth={w}     fill="none" strokeLinecap="round"/>
          </g>
        ))}

        {/* ── L3 tertiary twigs ────────────────────── */}
        {BT_L3.map(([d, w], i) => (
          <path key={i} d={d} stroke="#3E2A18" strokeWidth={w}
            fill="none" strokeLinecap="round" opacity="0.80"/>
        ))}

        {/* ── back leaves (blurred depth) ──────────── */}
        {leaves.filter(l => l.depth === 0).map((l, i) => (
          <g key={`b${i}`}
            transform={`translate(${l.x.toFixed(1)},${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)})`}
            opacity={l.opa * 0.45} filter={`url(#db${uid})`}>
            <path d={lp(l.w * 0.75, l.h * 0.75)} fill={l.col}/>
          </g>
        ))}

        {/* ── mid leaves ───────────────────────────── */}
        {leaves.filter(l => l.depth === 1).map((l, i) => (
          <g key={`m${i}`}
            transform={`translate(${l.x.toFixed(1)},${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)})`}
            opacity={l.opa * 0.72} filter={`url(#mb${uid})`}>
            <path d={lp(l.w * 0.9, l.h * 0.9)} fill={l.col} opacity="0.7"/>
            <path d={lp(l.w * 0.9, l.h * 0.9)} fill="rgba(255,255,255,0.08)"
              transform={`translate(${-l.w * 0.08},${-l.h * 0.06})`}/>
          </g>
        ))}

        {/* ── front leaves — full BanyanTree detail ── */}
        {leaves.filter(l => l.depth === 2).map((l, i) => {
          const sh = SH[l.col] ?? SH['#38d96b'];
          return (
            <g key={`f${i}`}
              transform={`translate(${l.x.toFixed(1)},${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)})`}
              opacity={l.opa} filter={`url(#ls${uid})`}>
              {/* shadow cast */}
              <path d={lp(l.w, l.h)} fill="rgba(0,0,0,0.28)"
                transform="translate(1.5,2.5)"/>
              {/* leaf body + glow */}
              <path d={lp(l.w, l.h)} fill={l.col} filter={`url(#lg${uid})`}/>
              {/* specular highlight */}
              <path d={lp(l.w * 0.50, l.h * 0.45)}
                fill={sh.hi} opacity="0.14"
                transform={`translate(${-l.w * 0.12},${-l.h * 0.09})`}/>
              {/* midrib */}
              <line x1="0" y1={l.h * 0.44} x2="0" y2={-l.h * 0.44}
                stroke="rgba(0,0,0,0.22)" strokeWidth="0.65" opacity="0.7"/>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}

// ── KnowledgeForest (layout unchanged) ───────────────────────────
export function KnowledgeForest({ categories }: Props) {
  return (
    <motion.div style={glass} className="p-5"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>

      <div className="flex items-center gap-1.5 mb-4">
        <Trees size={12} className="text-emerald-400"/>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Knowledge Forest</p>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map(({ name, pct, col, count }, i) => (
          <motion.div key={name}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.07 }}>

            <div className="flex items-center gap-2.5 mb-1.5">
              <MiniKnowledgeTree pct={pct} col={col} treeIdx={i}/>
              <span className="flex-1 text-[12px] font-medium text-slate-300">{name}</span>
              <span className="text-[11px] text-slate-600 tabular-nums">{count} leaves</span>
              <span className="text-[12px] font-bold tabular-nums"
                style={{ color: col, minWidth: 34, textAlign: 'right' }}>{pct}%</span>
            </div>

            <div className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg,${col}cc,${col})` }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ delay: 0.65 + i * 0.07, duration: 0.8, ease: 'easeOut' }}/>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
