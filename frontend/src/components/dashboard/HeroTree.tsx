import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  decayLevel: number;
  growthLevel: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
function fade(g: number, from: number, to: number) {
  return Math.max(0, Math.min(1, (g - from) / (to - from)));
}
function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

export function leafColor(xRatio: number, decay: number): string {
  const r = Math.min(1, xRatio + decay * 0.62);
  if (r < 0.24) return '#38d96b';
  if (r < 0.50) return '#8BEA55';
  if (r < 0.68) return '#F4D03F';
  if (r < 0.85) return '#FF9A1F';
  return '#E85D2A';
}

const SHADES: Record<string, { hi: string; lo: string; vein: string }> = {
  '#38d96b': { hi: '#90ffbf', lo: '#1a5e30', vein: '#a8ffc8' },
  '#8BEA55': { hi: '#c8ff88', lo: '#3d6e18', vein: '#d4ffaa' },
  '#F4D03F': { hi: '#fff79a', lo: '#7a6010', vein: '#ffe858' },
  '#FF9A1F': { hi: '#ffd080', lo: '#7a3e00', vein: '#ffbe60' },
  '#E85D2A': { hi: '#ffaa80', lo: '#721808', vein: '#ff9060' },
};

/* Broadleaf with distinct pointed tip */
const LP = (W: number, H: number) => {
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

const MIN_X = 82, MAX_X = 918;

/* Dense canopy — 9 rows, ~480 total leaves */
const CLUSTERS: [number,number,number,number,number][] = [
  // Row 1 – crown top y≈72
  [402,72,44,34,8],[500,66,50,39,9],[598,72,44,34,8],
  // Row 2 – y≈105
  [320,108,49,39,8],[410,102,53,42,8],[500,98,55,44,9],[590,102,53,42,8],[680,108,49,39,8],
  // Row 3 – y≈142
  [232,145,49,39,7],[322,139,53,42,8],[412,135,55,44,8],[500,131,57,46,9],[588,135,55,44,8],[678,139,53,42,8],[768,145,49,39,7],
  // Row 4 – y≈180 (widest band)
  [148,182,46,37,7],[238,177,51,41,7],[328,173,53,42,8],[418,169,55,44,8],[508,166,57,46,8],[596,169,55,44,8],[686,173,53,42,8],[776,177,51,41,7],[862,182,46,37,6],
  // Row 5 – y≈217
  [136,219,45,36,6],[226,214,49,39,7],[316,210,51,41,7],[406,206,53,42,7],[496,203,55,44,8],[584,206,53,42,7],[674,210,51,41,7],[764,214,49,39,6],[852,219,45,36,6],
  // Row 6 – y≈254
  [148,256,44,35,6],[238,251,47,38,6],[328,247,49,39,7],[418,243,51,41,7],[508,241,53,43,7],[596,243,51,41,7],[686,247,49,39,7],[776,251,47,38,6],[862,256,44,35,5],
  // Row 7 – y≈290
  [172,292,42,34,5],[262,287,45,36,6],[352,283,47,38,6],[442,279,49,39,7],[532,277,49,39,7],[620,279,47,38,6],[710,283,45,36,6],[798,287,42,34,5],[878,292,40,32,4],
  // Row 8 – y≈326
  [202,328,40,32,5],[290,323,43,34,5],[378,319,45,36,6],[466,315,47,38,6],[556,313,47,38,6],[643,315,45,36,6],[732,319,43,34,5],[818,323,40,32,5],
  // Row 9 – y≈360 (base of canopy)
  [252,362,38,30,4],[338,357,40,32,5],[424,353,42,34,5],[512,351,44,35,6],[598,353,42,34,5],[684,357,40,32,5],[768,362,38,30,4],
  // Inner filler – extra density at center
  [460,118,44,35,6],[540,120,44,35,6],
  [456,153,44,35,6],[544,156,44,35,6],
  [452,192,44,35,5],[548,195,44,35,5],
];

/* Primary canopy branches */
const BRANCHES: [string,number,number][] = [
  ["M488,335 Q415,302 348,278 Q278,252 212,232 Q168,218 138,210", 22,14],
  ["M488,335 Q438,310 382,290 Q318,268 258,252 Q210,240 168,230", 17,11],
  ["M490,335 Q450,318 408,302 Q360,283 308,270 Q264,258 222,248", 13, 8],
  ["M492,335 Q463,322 434,312 Q398,298 360,288 Q324,279 290,272", 10, 6],
  ["M496,335 Q491,308 487,278 Q483,248 480,218 Q477,192 475,165",  9, 6],
  ["M508,335 Q537,322 566,312 Q602,298 640,288 Q676,279 710,272", 10, 6],
  ["M510,335 Q550,318 592,302 Q640,283 692,270 Q736,258 778,248", 13, 8],
  ["M512,335 Q562,310 618,290 Q682,268 742,252 Q790,240 832,230", 17,11],
  ["M512,335 Q585,302 652,278 Q722,252 788,232 Q832,218 862,210", 22,14],
];

const SECONDARY: [string,number][] = [
  ["M138,210 Q110,198 84,185 Q62,173 42,162", 11],
  ["M168,230 Q140,218 114,204 Q90,190 68,176",  9],
  ["M862,210 Q890,198 916,185 Q938,173 958,162", 11],
  ["M832,230 Q860,218 886,204 Q910,190 932,176",  9],
  ["M475,165 Q471,140 467,113 Q463,88 459,64",    8],
  ["M480,165 Q484,138 488,112 Q492,87 496,62",    8],
];

const FALLING = [
  {x:688,y:205,drift:38,dur:4.5,delay:0.0},
  {x:762,y:182,drift:-42,dur:5.2,delay:1.3},
  {x:832,y:218,drift:28,dur:4.0,delay:2.6},
  {x:620,y:228,drift:-32,dur:4.8,delay:0.8},
  {x:892,y:242,drift:22,dur:5.5,delay:2.0},
  {x:552,y:255,drift:-25,dur:4.2,delay:3.5},
  {x:948,y:268,drift:18,dur:4.8,delay:1.8},
  {x:432,y:260,drift:-35,dur:4.6,delay:3.0},
];

/* Sprout leaves for seedling stage */
const SPROUT = [
  {dx:0,  dy:-5,  rot:0,   s:1.00,thresh:0.01},
  {dx:13, dy:4,   rot:28,  s:0.85,thresh:0.04},
  {dx:-13,dy:4,   rot:-28, s:0.85,thresh:0.04},
  {dx:17, dy:18,  rot:44,  s:0.72,thresh:0.08},
  {dx:-17,dy:18,  rot:-44, s:0.72,thresh:0.08},
  {dx:20, dy:34,  rot:58,  s:0.60,thresh:0.13},
  {dx:-20,dy:34,  rot:-58, s:0.60,thresh:0.13},
];

export function HeroTree({ decayLevel, growthLevel }: Props) {
  const g = Math.max(0, Math.min(1, growthLevel));

  const seedlingOp = Math.max(0, 1 - g / 0.38);
  const fullTreeOp = fade(g, 0.18, 0.50);
  const treeScale  = lerp(0.10, 1.0, fade(g, 0.16, 1.0));
  const stemH      = lerp(28, 175, fade(g, 0, 0.38));
  const stemW      = lerp(2.5, 8, fade(g, 0, 0.38));
  const stemTopY   = 630 - stemH;
  const stemGrOp   = Math.max(0, 1 - g / 0.25);
  const stemBrOp   = fade(g, 0.12, 0.30);
  const bOp        = (t: number) => fade(g, t, t + 0.14);
  const rootOp     = fade(g, 0.38, 0.60);
  const fallOp     = fade(g, 0.55, 0.80);

  const leaves = useMemo(() => {
    const rng = seededRng(42);
    return CLUSTERS.flatMap(([cx, cy, rx, ry, count], ci) =>
      Array.from({ length: count }, () => {
        const angle = rng() * Math.PI * 2;
        const d     = Math.sqrt(rng());
        const scF   = 0.70 + rng() * 0.68;
        const W     = (15 + rng() * 13) * scF;
        const H     = (22 + rng() * 16) * scF;
        const dr    = rng();
        const depth = dr < 0.18 ? 3 : dr < 0.40 ? 2 : dr < 0.65 ? 1 : 0;
        const leafThresh = Math.min(0.92, lerp(0.18, 0.88, ci / Math.max(1, CLUSTERS.length - 1)) + (rng() - 0.5) * 0.07);
        return {
          x: cx + Math.cos(angle) * rx * d,
          y: cy + Math.sin(angle) * ry * d,
          rotation: rng() * 360,
          W, H,
          xRatio: (cx - MIN_X) / (MAX_X - MIN_X),
          depth,
          opacity: 0.68 + rng() * 0.32,
          sDur: 2.2 + rng() * 2.4,
          sDel: rng() * 4.2,
          leafThresh,
        };
      })
    );
  }, []);

  const sorted = useMemo(() => [...leaves].sort((a, b) => b.depth - a.depth), [leaves]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[inherit]">
      <style>{`
        @keyframes leafShimmer{0%,100%{opacity:.78}50%{opacity:1}}
        @keyframes treeSway{0%,100%{transform:rotate(0deg)}25%{transform:rotate(.30deg)}75%{transform:rotate(-.30deg)}}
        .tree-sway{animation:treeSway 10s ease-in-out infinite;transform-origin:500px 628px;transform-box:view-box}
        @keyframes sproutSway{0%,100%{transform:rotate(0deg)}40%{transform:rotate(1.8deg)}70%{transform:rotate(-1.4deg)}}
        .sprout-sway{animation:sproutSway 4s ease-in-out infinite;transform-origin:500px 628px;transform-box:view-box}
      `}</style>

      <svg viewBox="0 0 1000 640" className="w-full h-full"
           preserveAspectRatio="xMidYMid meet" style={{display:'block'}}>
        <defs>
          <linearGradient id="tBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#020608"/>
            <stop offset="55%"  stopColor="#030f08"/>
            <stop offset="100%" stopColor="#061a0a"/>
          </linearGradient>
          {/* Dramatic left (green) and right (orange) ground auras */}
          <radialGradient id="lgAura" cx="22%" cy="98%" r="58%">
            <stop offset="0%" stopColor="#2d8b3a" stopOpacity=".50"/>
            <stop offset="100%" stopColor="#2d8b3a" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="roAura" cx="78%" cy="96%" r="54%">
            <stop offset="0%" stopColor="#c85a18" stopOpacity=".40"/>
            <stop offset="100%" stopColor="#c85a18" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="topGlow" cx="50%" cy="18%" r="52%">
            <stop offset="0%" stopColor="#1e4d10" stopOpacity=".35"/>
            <stop offset="100%" stopColor="#1e4d10" stopOpacity="0"/>
          </radialGradient>
          {/* Canopy inner shadow (back-of-canopy darkness) */}
          <radialGradient id="canopyShadow" cx="50%" cy="45%" r="55%">
            <stop offset="0%"   stopColor="#010304" stopOpacity=".62"/>
            <stop offset="60%"  stopColor="#010304" stopOpacity=".20"/>
            <stop offset="100%" stopColor="#010304" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#060100"/>
            <stop offset="10%"  stopColor="#1e0c04"/>
            <stop offset="26%"  stopColor="#6b3215"/>
            <stop offset="44%"  stopColor="#3e1a08"/>
            <stop offset="66%"  stopColor="#1c0a04"/>
            <stop offset="86%"  stopColor="#0a0200"/>
            <stop offset="100%" stopColor="#040100"/>
          </linearGradient>
          <linearGradient id="stemG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#1a5218"/>
            <stop offset="50%"  stopColor="#4aa030"/>
            <stop offset="100%" stopColor="#1a5218"/>
          </linearGradient>
          <filter id="fog" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="24"/>
          </filter>
          <filter id="lshadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.4" floodColor="#000" floodOpacity="0.65"/>
          </filter>
          <filter id="deepBlur">
            <feGaussianBlur stdDeviation="2.0"/>
          </filter>
          <filter id="midBlur">
            <feGaussianBlur stdDeviation="0.9"/>
          </filter>
        </defs>

        {/* ── Atmospheric backgrounds ───────────────────────────── */}
        <rect width="1000" height="640" fill="url(#tBg)"/>
        <rect width="1000" height="640" fill="url(#lgAura)"/>
        <rect width="1000" height="640" fill="url(#roAura)"/>
        <rect width="1000" height="640" fill="url(#topGlow)"/>

        {/* Ground fog rings */}
        <ellipse cx="500" cy="636" rx="490" ry="32" fill="#0e2208" opacity=".80" filter="url(#fog)"/>
        <ellipse cx="280" cy="631" rx="258" ry="20" fill="#38d96b" opacity=".18" filter="url(#fog)"/>
        <ellipse cx="720" cy="630" rx="238" ry="18" fill="#e86820" opacity=".15" filter="url(#fog)"/>

        {/* ════ SEEDLING STAGE ════════════════════════════════════ */}
        <g opacity={seedlingOp} className="sprout-sway">
          <ellipse cx="500" cy="630"
            rx={lerp(18,42,fade(g,0,0.38))} ry={lerp(6,12,fade(g,0,0.38))}
            fill="#1a0900" opacity=".75"/>
          <line x1="500" y1="630" x2="500" y2={stemTopY}
            stroke="url(#stemG)" strokeWidth={stemW} strokeLinecap="round" opacity={stemGrOp}/>
          <line x1="500" y1="630" x2="500" y2={stemTopY}
            stroke="url(#bark)" strokeWidth={stemW} strokeLinecap="round" opacity={stemBrOp}/>
          {SPROUT.map((sp, i) => {
            const leafOp = Math.max(0, Math.min(1, (g - sp.thresh) / 0.05)) * seedlingOp;
            if (leafOp <= 0) return null;
            const lW = lerp(10, 20, fade(g, sp.thresh, sp.thresh + 0.18)) * sp.s;
            const lH = lerp(14, 30, fade(g, sp.thresh, sp.thresh + 0.18)) * sp.s;
            const color = g < 0.18 ? '#38d96b' : leafColor(0.1 + i * 0.04, decayLevel);
            const shade = SHADES[color] ?? SHADES['#38d96b'];
            return (
              <g key={i}
                transform={`translate(${500+sp.dx},${stemTopY+sp.dy}) rotate(${sp.rot})`}
                opacity={leafOp}>
                <path d={LP(lW,lH)} fill={shade.lo} transform="translate(0.5,1)" opacity=".5"/>
                <path d={LP(lW,lH)} fill={color} style={{transition:'fill 0.85s ease'}}/>
                <ellipse cx={-lW*.05} cy={-lH*.15} rx={lW*.40} ry={lH*.30} fill={shade.hi} opacity=".30"/>
                <line x1="0" y1={lH*.82} x2="0" y2={-lH*.88} stroke={shade.vein} strokeWidth=".68" opacity=".40"/>
                <line x1="0" y1={lH*.9} x2="0" y2={lH*1.1} stroke="#2d1509" strokeWidth="1" strokeLinecap="round" opacity=".50"/>
              </g>
            );
          })}
        </g>

        {/* ════ FULL TREE (scale grows from tiny to mature) ═══════ */}
        <g transform={`translate(500,630) scale(${treeScale}) translate(-500,-630)`}
           opacity={fullTreeOp}>
          <g className={g > 0.35 ? 'tree-sway' : ''}>

            {/* Ground disc */}
            <ellipse cx="500" cy="634" rx="490" ry="30" fill="#030100" opacity=".88"/>

            {/* ── Natural surface roots ─────────────────────────── */}
            <g opacity={rootOp}>
              {/* Far-left — arching main root, rises above ground then dips */}
              <path d="M473,622 C452,612 428,606 405,609 C382,612 360,619 338,618 C316,617 292,622 264,626 C238,630 208,632 172,635"
                stroke="#070100" strokeWidth="15" fill="none" strokeLinecap="round"/>
              <path d="M473,622 C452,612 428,606 405,609 C382,612 360,619 338,618 C316,617 292,622 264,626 C238,630 208,632 172,635"
                stroke="#2e1508" strokeWidth="9" fill="none" strokeLinecap="round"/>
              <path d="M473,620 C452,610 428,604 405,607 C382,610 360,617 338,616 C316,615 292,620 264,624"
                stroke="#4a2210" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity=".50"/>

              {/* Mid-left — gentle S-curve along ground */}
              <path d="M478,627 C456,624 432,621 408,620 C384,619 360,621 334,625 C308,629 280,634 246,638"
                stroke="#070100" strokeWidth="11" fill="none" strokeLinecap="round"/>
              <path d="M478,627 C456,624 432,621 408,620 C384,619 360,621 334,625 C308,629 280,634 246,638"
                stroke="#2e1508" strokeWidth="6.5" fill="none" strokeLinecap="round"/>
              <path d="M478,626 C456,623 432,620 408,619 C384,618 360,620 334,624"
                stroke="#4a2210" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".46"/>

              {/* Near-left — forward root hugging ground surface */}
              <path d="M484,631 C466,634 448,636 428,637 C408,638 388,639 366,640 Q342,641 316,642"
                stroke="#060100" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d="M484,631 C466,634 448,636 428,637 C408,638 388,639 366,640 Q342,641 316,642"
                stroke="#2e1508" strokeWidth="5" fill="none" strokeLinecap="round"/>

              {/* Far-right — arching mirror */}
              <path d="M527,622 C548,612 572,606 595,609 C618,612 640,619 662,618 C684,617 708,622 736,626 C762,630 792,632 828,635"
                stroke="#070100" strokeWidth="15" fill="none" strokeLinecap="round"/>
              <path d="M527,622 C548,612 572,606 595,609 C618,612 640,619 662,618 C684,617 708,622 736,626 C762,630 792,632 828,635"
                stroke="#2e1508" strokeWidth="9" fill="none" strokeLinecap="round"/>
              <path d="M527,620 C548,610 572,604 595,607 C618,610 640,617 662,616 C684,615 708,620 736,624"
                stroke="#4a2210" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity=".50"/>

              {/* Mid-right — gentle S-curve */}
              <path d="M522,627 C544,624 568,621 592,620 C616,619 640,621 666,625 C692,629 720,634 754,638"
                stroke="#070100" strokeWidth="11" fill="none" strokeLinecap="round"/>
              <path d="M522,627 C544,624 568,621 592,620 C616,619 640,621 666,625 C692,629 720,634 754,638"
                stroke="#2e1508" strokeWidth="6.5" fill="none" strokeLinecap="round"/>
              <path d="M522,626 C544,623 568,620 592,619 C616,618 640,620 666,624"
                stroke="#4a2210" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".46"/>

              {/* Near-right — forward root */}
              <path d="M516,631 C534,634 552,636 572,637 C592,638 612,639 634,640 Q658,641 684,642"
                stroke="#060100" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d="M516,631 C534,634 552,636 572,637 C592,638 612,639 634,640 Q658,641 684,642"
                stroke="#2e1508" strokeWidth="5" fill="none" strokeLinecap="round"/>

              {/* Offshoots — thin branching tendrils */}
              <path d="M380,617 C366,613 350,612 332,614 Q314,617 298,621"
                stroke="#1c0b04" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M620,617 C634,613 650,612 668,614 Q686,617 702,621"
                stroke="#1c0b04" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M336,625 C322,629 308,633 292,637 Q276,641 258,644"
                stroke="#160904" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M664,625 C678,629 694,633 710,637 Q726,641 742,644"
                stroke="#160904" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </g>

            {/* ── Single trunk ─────────────────────────────────── */}
            <g opacity={bOp(0.20)}>
              {/* Cast shadow — offset right */}
              <path
                d="M472,628 C471,610 476,555 479,490 C481,435 481,385 482,352 C483,340 487,330 488,330 L512,330 C513,330 517,340 518,352 C519,385 519,435 521,490 C524,555 529,610 528,628 Z"
                fill="#020100" transform="translate(5,2)" opacity=".55"/>
              {/* Main bark body — gradient left→right for 3D cylinder */}
              <path
                d="M472,628 C471,610 476,555 479,490 C481,435 481,385 482,352 C483,340 487,330 488,330 L512,330 C513,330 517,340 518,352 C519,385 519,435 521,490 C524,555 529,610 528,628 Z"
                fill="url(#bark)"/>
              {/* Diffuse warm highlight — cylindrical lit zone ~25% from left */}
              <path
                d="M479,628 C478,610 480,555 481,490 C482,435 482,385 483,352 C483,341 486,332 487,330 L491,330 C492,332 494,342 495,357 C496,392 496,442 495,500 C494,560 492,610 490,628 Z"
                fill="#aa5828" opacity=".38"/>
              {/* Specular rim light — thin strip at far left edge */}
              <path
                d="M472,628 C471,610 474,555 477,490 C478,435 479,385 480,352 C480,342 484,332 486,330 L489,330 C488,332 485,343 484,360 C483,395 482,445 482,504 C481,562 480,610 479,628 Z"
                fill="#e07838" opacity=".18"/>
              {/* Bark groove lines — vertical crevices */}
              <path d="M500,628 C499,540 498,455 498,375 C497,350 496,338 495,330"
                stroke="#060100" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".44"/>
              <path d="M505,628 C504,540 503,458 503,378 C502,353 501,340 500,332"
                stroke="#060100" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".34"/>
              <path d="M494,628 C493,540 492,458 492,378 C491,353 490,340 490,332"
                stroke="#060100" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".30"/>
            </g>

            {/* ── Primary branches ─────────────────────────────── */}
            {BRANCHES.map(([d, s1, s2], i) => (
              <g key={`br${i}`} opacity={bOp(0.30)}>
                <path d={d} stroke="#040100" strokeWidth={s1+4} fill="none" strokeLinecap="round"/>
                <path d={d} stroke="url(#bark)" strokeWidth={s1} fill="none" strokeLinecap="round"/>
                <path d={d} stroke="#2d1509" strokeWidth={s2} fill="none" strokeLinecap="round"/>
              </g>
            ))}

            {/* ── Secondary branches ───────────────────────────── */}
            {SECONDARY.map(([d, sw], i) => (
              <g key={`sbr${i}`} opacity={bOp(0.46)}>
                <path d={d} stroke="#060100" strokeWidth={sw+3} fill="none" strokeLinecap="round"/>
                <path d={d} stroke="#2d1509" strokeWidth={sw} fill="none" strokeLinecap="round"/>
                <path d={d} stroke="#3d1f0d" strokeWidth={sw*0.55} fill="none" strokeLinecap="round" opacity=".55"/>
              </g>
            ))}

            {/* ═══ LEAVES — 4 depth layers ══════════════════════ */}

            {/* Depth 3 — furthest back, very dark + blurred */}
            {sorted.filter(lf => lf.depth === 3).map((lf, i) => {
              const vis = fade(g, lf.leafThresh, lf.leafThresh + 0.07);
              if (vis === 0) return null;
              const color = leafColor(lf.xRatio, decayLevel);
              const shade = SHADES[color] ?? SHADES['#38d96b'];
              return (
                <g key={`d3${i}`}
                  transform={`translate(${lf.x},${lf.y}) rotate(${lf.rotation})`}
                  opacity={lf.opacity * 0.42 * vis} filter="url(#deepBlur)"
                  style={{animation:`leafShimmer ${lf.sDur}s ease-in-out ${lf.sDel}s infinite`}}>
                  <path d={LP(lf.W*.70, lf.H*.70)} fill={shade.lo}
                    style={{transition:'fill 0.85s ease'}}/>
                </g>
              );
            })}

            {/* Depth 2 — back-mid, dim + light blur */}
            {sorted.filter(lf => lf.depth === 2).map((lf, i) => {
              const vis = fade(g, lf.leafThresh, lf.leafThresh + 0.07);
              if (vis === 0) return null;
              const color = leafColor(lf.xRatio, decayLevel);
              const shade = SHADES[color] ?? SHADES['#38d96b'];
              const W = lf.W * .85, H = lf.H * .85;
              return (
                <g key={`d2${i}`}
                  transform={`translate(${lf.x},${lf.y}) rotate(${lf.rotation})`}
                  opacity={lf.opacity * 0.60 * vis} filter="url(#midBlur)"
                  style={{animation:`leafShimmer ${lf.sDur}s ease-in-out ${lf.sDel}s infinite`}}>
                  <path d={LP(W,H)} fill={shade.lo} style={{transition:'fill 0.85s ease'}}/>
                  <path d={LP(W,H)} fill={color} style={{transition:'fill 0.85s ease'}} opacity=".65"/>
                  <path d={`M 0,${H*.80} C ${W*.02},${H*.15} 0,${-H*.22} 0,${-H*.84}`}
                    stroke={shade.vein} strokeWidth=".58" fill="none" opacity=".28"/>
                  <path d={`M ${W*.02},${-H*.42} C ${-W*.14},${-H*.48} ${-W*.44},${-H*.42} ${-W*.58},${-H*.32}`}
                    stroke={shade.vein} strokeWidth=".32" fill="none" opacity=".18"/>
                  <path d={`M ${-W*.02},${-H*.42} C ${W*.14},${-H*.48} ${W*.44},${-H*.42} ${W*.58},${-H*.32}`}
                    stroke={shade.vein} strokeWidth=".32" fill="none" opacity=".18"/>
                </g>
              );
            })}

            {/* Depth 1 — front-mid */}
            {sorted.filter(lf => lf.depth === 1).map((lf, i) => {
              const vis = fade(g, lf.leafThresh, lf.leafThresh + 0.07);
              if (vis === 0) return null;
              const color = leafColor(lf.xRatio, decayLevel);
              const shade = SHADES[color] ?? SHADES['#38d96b'];
              const W = lf.W, H = lf.H;
              return (
                <g key={`d1${i}`}
                  transform={`translate(${lf.x},${lf.y}) rotate(${lf.rotation})`}
                  opacity={lf.opacity * 0.84 * vis}
                  style={{animation:`leafShimmer ${lf.sDur}s ease-in-out ${lf.sDel}s infinite`}}>
                  <path d={LP(W,H)} fill={shade.lo} transform="translate(0.6,1.2)" opacity=".48"/>
                  <path d={LP(W,H)} fill={color} style={{transition:'fill 0.85s ease'}}/>
                  <ellipse cx={-W*.06} cy={-H*.12} rx={W*.42} ry={H*.32} fill={shade.hi} opacity=".26"/>
                  <path d={`M 0,${H*.84} C ${W*.02},${H*.18} ${W*.01},${-H*.26} 0,${-H*.88}`}
                    stroke={shade.vein} strokeWidth=".66" fill="none" opacity=".42"/>
                  <path d={`M ${W*.02},${-H*.46} C ${-W*.16},${-H*.52} ${-W*.48},${-H*.46} ${-W*.64},${-H*.36}`}
                    stroke={shade.vein} strokeWidth=".38" fill="none" opacity=".26"/>
                  <path d={`M ${-W*.02},${-H*.46} C ${W*.16},${-H*.52} ${W*.48},${-H*.46} ${W*.64},${-H*.36}`}
                    stroke={shade.vein} strokeWidth=".38" fill="none" opacity=".26"/>
                  <path d={`M ${W*.02},${-H*.12} C ${-W*.16},${-H*.20} ${-W*.56},${-H*.14} ${-W*.78},${-H*.03}`}
                    stroke={shade.vein} strokeWidth=".32" fill="none" opacity=".22"/>
                  <path d={`M ${-W*.02},${-H*.12} C ${W*.16},${-H*.20} ${W*.56},${-H*.14} ${W*.78},${-H*.03}`}
                    stroke={shade.vein} strokeWidth=".32" fill="none" opacity=".22"/>
                  <line x1="0" y1={H*.90} x2="0" y2={H*1.12} stroke="#2d1509" strokeWidth="1.0" strokeLinecap="round" opacity=".48"/>
                </g>
              );
            })}

            {/* Depth 0 — front, full 3-D rendering */}
            {sorted.filter(lf => lf.depth === 0).map((lf, i) => {
              const vis = fade(g, lf.leafThresh, lf.leafThresh + 0.07);
              if (vis === 0) return null;
              const color = leafColor(lf.xRatio, decayLevel);
              const shade = SHADES[color] ?? SHADES['#38d96b'];
              const W = lf.W, H = lf.H;
              return (
                <g key={`d0${i}`}
                  transform={`translate(${lf.x},${lf.y}) rotate(${lf.rotation})`}
                  opacity={lf.opacity * vis} filter="url(#lshadow)"
                  style={{animation:`leafShimmer ${lf.sDur}s ease-in-out ${lf.sDel}s infinite`}}>
                  <path d={LP(W,H)} fill={shade.lo} transform="translate(1,1.8)" opacity=".58"/>
                  <path d={LP(W,H)} fill={color} style={{transition:'fill 0.85s ease'}}/>
                  {/* subsurface glow — upper-left lit zone */}
                  <ellipse cx={-W*.05} cy={-H*.10} rx={W*.42} ry={H*.32} fill={shade.hi} opacity=".36"/>
                  {/* rim highlight — bright left-top edge */}
                  <path d={`M ${-W*.08},${-H*.92} C ${-W*.52},${-H*.76} ${-W*.84},${-H*.44} ${-W*.86},${-H*.12}`}
                    stroke={shade.hi} strokeWidth="1.0" fill="none" opacity=".42"/>
                  {/* midrib — curved central vein */}
                  <path d={`M 0,${H*.88} C ${W*.03},${H*.22} ${W*.01},${-H*.28} 0,${-H*.94}`}
                    stroke={shade.vein} strokeWidth=".82" fill="none" opacity=".55"/>
                  {/* lateral pair 1 — upper */}
                  <path d={`M ${W*.02},${-H*.52} C ${-W*.18},${-H*.58} ${-W*.50},${-H*.52} ${-W*.68},${-H*.40}`}
                    stroke={shade.vein} strokeWidth=".44" fill="none" opacity=".32"/>
                  <path d={`M ${-W*.02},${-H*.52} C ${W*.18},${-H*.58} ${W*.50},${-H*.52} ${W*.68},${-H*.40}`}
                    stroke={shade.vein} strokeWidth=".44" fill="none" opacity=".32"/>
                  {/* lateral pair 2 — middle */}
                  <path d={`M ${W*.02},${-H*.16} C ${-W*.18},${-H*.24} ${-W*.60},${-H*.18} ${-W*.84},${-H*.06}`}
                    stroke={shade.vein} strokeWidth=".38" fill="none" opacity=".28"/>
                  <path d={`M ${-W*.02},${-H*.16} C ${W*.18},${-H*.24} ${W*.60},${-H*.18} ${W*.84},${-H*.06}`}
                    stroke={shade.vein} strokeWidth=".38" fill="none" opacity=".28"/>
                  {/* lateral pair 3 — lower */}
                  <path d={`M ${W*.02},${H*.20} C ${-W*.16},${H*.14} ${-W*.55},${H*.18} ${-W*.76},${H*.28}`}
                    stroke={shade.vein} strokeWidth=".32" fill="none" opacity=".24"/>
                  <path d={`M ${-W*.02},${H*.20} C ${W*.16},${H*.14} ${W*.55},${H*.18} ${W*.76},${H*.28}`}
                    stroke={shade.vein} strokeWidth=".32" fill="none" opacity=".24"/>
                  {/* petiole */}
                  <line x1="0" y1={H*.90} x2="0" y2={H*1.18} stroke="#2d1509" strokeWidth="1.2" strokeLinecap="round" opacity=".58"/>
                </g>
              );
            })}

            {/* Canopy inner-shadow — creates depth/3D ball effect */}
            <ellipse cx="500" cy="248" rx="410" ry="270" fill="url(#canopyShadow)"/>

          </g>
        </g>

        {/* ── Falling leaves (outside scale/sway) ──────────────── */}
        {FALLING.map((fl, i) => {
          const color = leafColor(0.48 + i * 0.07, decayLevel);
          const shade = SHADES[color] ?? SHADES['#F4D03F'];
          return (
            <motion.g key={`fl${i}`}
              animate={{ y:[0,295], x:[0,fl.drift], rotate:[0,460], opacity:[0.88*fallOp,0] }}
              transition={{ duration:fl.dur, repeat:Infinity, delay:fl.delay, ease:'easeIn', repeatDelay:0.6 }}>
              <g transform={`translate(${fl.x},${fl.y})`}>
                <path d={LP(12,18)} fill={color} style={{transition:'fill 0.85s ease'}}/>
                <ellipse cx="-.5" cy="-2.8" rx="3.2" ry="2.8" fill={shade.hi} opacity=".38"/>
                <line x1="0" y1="8" x2="0" y2="-8.5" stroke={shade.vein} strokeWidth=".68" opacity=".42"/>
              </g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
