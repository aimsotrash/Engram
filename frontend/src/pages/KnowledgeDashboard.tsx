import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trees, Search, Brain, BookOpen, Settings,
  Zap, Clock, Flame, Sparkles, ChevronRight, TrendingUp,
} from 'lucide-react';
import { BanyanTree } from '@/components/tree/BanyanTree';
import { useAuth } from '@/contexts/AuthContext';

// ── palette ───────────────────────────────────────────────────────
const G = {
  green:  '#22c55e',
  lime:   '#84cc16',
  yellow: '#eab308',
  orange: '#f97316',
  red:    '#ef4444',
  purple: '#8b5cf6',
  panel:  '#0F172A',
  border: 'rgba(255,255,255,0.05)',
};

// ── glass card style ──────────────────────────────────────────────
const glass = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: 'rgba(15,23,42,0.80)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${G.border}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: 20,
  ...extra,
});

// ── mock data ─────────────────────────────────────────────────────
const TM_LABELS = ['Now', '+7d', '+30d', '+90d', '+180d', '+365d'];

const FADING = [
  { title: 'OAuth2.0 Implementation',  days: 3,  col: G.green  },
  { title: 'Redis Pub/Sub System',      days: 5,  col: G.lime   },
  { title: 'FastAPI Background Tasks',  days: 7,  col: G.yellow },
  { title: 'Vector DB Best Practices',  days: 9,  col: G.orange },
  { title: 'CLIP Embeddings Guide',     days: 11, col: G.red    },
];

const CATS = [
  { name: 'Development',   pct: 82, col: G.green  },
  { name: 'AI / ML',       pct: 68, col: G.lime   },
  { name: 'System Design', pct: 41, col: G.yellow },
  { name: 'Productivity',  pct: 75, col: G.green  },
  { name: 'Personal',      pct: 45, col: G.orange },
];

const DISCOVERIES = [
  { icon: '🔍', badge: 'I just found something!', body: 'You worked on JWT Auth 2 months ago — worth revisiting.', time: '2h ago', col: '#93c5fd' },
  { icon: '💡', badge: 'This might help!',         body: 'Your WebSockets note connects to the Redis work you\'re doing.', time: '5h ago', col: '#fde047' },
  { icon: '🔔', badge: "Don't forget this!",       body: "Rate Limiting patterns are starting to fade — quick review?",   time: '1d ago', col: '#fca5a5' },
];

const LEAF_GUIDE = [
  { label: 'Fresh · Strong', range: '90–100%', col: G.green  },
  { label: 'Good',           range: '60–89%',  col: G.lime   },
  { label: 'Fading',         range: '30–59%',  col: G.yellow },
  { label: 'Weak',           range: '10–29%',  col: G.orange },
  { label: 'Forgotten',      range: '0–9%',    col: G.red    },
];

// ── nav items ─────────────────────────────────────────────────────
const NAV = [
  { id: '/',          icon: Trees,    label: 'Tree'     },
  { id: '/search',    icon: Search,   label: 'Search'   },
  { id: '/quiz',      icon: Brain,    label: 'Quiz'     },
  { id: '/library',   icon: BookOpen, label: 'Library'  },
  { id: '/settings',  icon: Settings, label: 'Settings' },
];

// ── mini tree SVG for categories ──────────────────────────────────
function MiniTree({ col, pct }: { col: string; pct: number }) {
  const r = 11 + pct * 0.10;
  return (
    <svg viewBox="0 0 56 52" width={48} height={44}>
      <rect x={25} y={36} width={6} height={14} rx={3} fill="#1a0e04"/>
      <ellipse cx={28} cy={24} rx={r + 4} ry={(r + 4) * 0.70} fill={col} opacity={0.12}/>
      <ellipse cx={28} cy={22} rx={r}     ry={r * 0.72}        fill={col} opacity={0.85}/>
      <ellipse cx={24} cy={16} rx={r * 0.55} ry={r * 0.42}    fill={col} opacity={0.65}/>
      <ellipse cx={32} cy={18} rx={r * 0.48} ry={r * 0.38}    fill={col} opacity={0.60}/>
      <ellipse cx={28} cy={12} rx={r * 0.44} ry={r * 0.36}    fill={col} opacity={0.72}/>
    </svg>
  );
}

// ── circular progress ring ────────────────────────────────────────
function ProgressRing({ pct, col, size = 88 }: { pct: number; col: string; size?: number }) {
  const r = size * 0.44, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={col} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${col}88)`, transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={size * 0.20} fontWeight={800} fontFamily="Inter,sans-serif">{pct}%</text>
      <text x={size/2} y={size/2 + 12} textAnchor="middle"
        fill="rgba(148,163,184,0.45)" fontSize={size * 0.085} fontFamily="Inter,sans-serif" letterSpacing="1">RETENTION</text>
    </svg>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className="w-[96px] shrink-0 flex flex-col justify-between py-5 px-3"
      style={{ background: '#0B0F1A', borderRadius: 28, border: `1px solid ${G.border}` }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <svg viewBox="0 0 40 40" width={24} height={24}>
            <ellipse cx={16} cy={21} rx={11} ry={7.5} fill={G.purple} opacity={0.9}/>
            <polygon points="27,21 36,14 36,28" fill={G.purple} opacity={0.7}/>
            <circle cx={11} cy={19} r={2.2} fill="white" opacity={0.85}/>
          </svg>
        </div>
        <span className="text-[11px] font-semibold text-slate-300 tracking-tight">Dory.md</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-2">
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = location.pathname === id;
          return (
            <motion.button
              key={id}
              onClick={() => navigate(id)}
              className="w-full flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-2xl transition-colors"
              style={active ? {
                background: 'rgba(139,92,246,0.18)',
                border: '1px solid rgba(139,92,246,0.30)',
                boxShadow: '0 0 14px rgba(139,92,246,0.38)',
              } : {
                border: '1px solid transparent',
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}>
              <Icon size={18} style={{ color: active ? G.purple : '#475569' }}/>
              <span className="text-[9px] font-medium leading-none"
                style={{ color: active ? '#c4b5fd' : '#475569' }}>{label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom user chip */}
      <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}` }}>
        <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold"
          style={{ background: 'rgba(139,92,246,0.25)', color: '#c4b5fd' }}>A</div>
        <p className="text-[9px] text-slate-500 leading-tight">Pro plan</p>
      </div>
    </aside>
  );
}

// ── KNOWLEDGE HEALTH STATS (floating overlay) ─────────────────────
function HealthOverlay() {
  const gaugeCol = G.green;
  const stats = [
    { label: 'Strong',    val: 128, col: G.green  },
    { label: 'Fading',    val: 67,  col: G.yellow },
    { label: 'Weak',      val: 31,  col: G.orange },
    { label: 'Forgotten', val: 12,  col: G.red    },
  ];

  return (
    <motion.div
      className="absolute top-8 left-8 p-5"
      style={{ ...glass(), width: 248, zIndex: 10 }}
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>

      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4">Knowledge Health</p>

      <div className="flex items-center gap-3">
        <ProgressRing pct={72} col={gaugeCol} size={88}/>
        <div className="flex flex-col gap-1.5">
          {stats.map(({ label, val, col }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0"
                style={{ background: col, boxShadow: `0 0 5px ${col}80` }}/>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: col }}>{val}</span>
              <span className="text-[11px] text-slate-600">{label}</span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-white/5 text-[11px] text-slate-600">
            <span className="font-black text-[13px] text-white">238</span> Total Leaves
          </div>
        </div>
      </div>

      {/* segmented bar */}
      <div className="mt-4 h-1.5 rounded-full overflow-hidden flex gap-px">
        {stats.map(({ col, val }) => (
          <div key={col} className="h-full rounded-full" style={{ flex: val, background: col, opacity: 0.85 }}/>
        ))}
      </div>
    </motion.div>
  );
}

// ── TIME MACHINE CARD ─────────────────────────────────────────────
function TimeMachineCard({ idx, setIdx }: { idx: number; setIdx: (i: number) => void }) {
  return (
    <div className="p-5" style={{ ...glass(), height: 160 }}>
      <div className="flex items-center gap-2 mb-1">
        <Clock size={13} style={{ color: G.purple }}/>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Time Machine</span>
        <motion.span key={idx} className="ml-auto text-[11px] font-black" style={{ color: '#c4b5fd' }}
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          {TM_LABELS[idx]}
        </motion.span>
      </div>
      <p className="text-[10px] text-slate-700 mb-3">Project memory decay into the future</p>

      {/* track */}
      <div className="relative mb-2">
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: `${(idx / 5) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}/>
        </div>
        <input
          type="range" min={0} max={5} step={1} value={idx}
          onChange={e => setIdx(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>

      {/* labels */}
      <div className="flex justify-between">
        {TM_LABELS.map((l, i) => (
          <button key={l} onClick={() => setIdx(i)} className="flex flex-col items-center gap-1">
            <motion.div className="w-2 h-2 rounded-full"
              animate={{
                background: i === idx ? G.purple : 'rgba(255,255,255,0.14)',
                boxShadow: i === idx ? `0 0 8px ${G.purple}cc` : 'none',
                scale: i === idx ? 1.3 : 1,
              }}
              transition={{ duration: 0.2 }}/>
            <span className="text-[8px]" style={{ color: i === idx ? '#c4b5fd' : '#2a2a3a' }}>{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── FADING NOW CARD ───────────────────────────────────────────────
function FadingNowCard() {
  return (
    <div className="p-5" style={glass()}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Flame size={13} style={{ color: G.orange }}/>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fading Now</span>
        </div>
        <span className="text-[10px] text-slate-600">{FADING.length} items</span>
      </div>
      <div className="flex flex-col gap-1">
        {FADING.map((item, i) => (
          <motion.div
            key={item.title}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer group"
            style={{ border: '1px solid transparent' }}
            whileHover={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
            <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background: item.col, boxShadow: `0 0 5px ${item.col}99` }}/>
            <span className="flex-1 text-[12px] text-slate-300 truncate group-hover:text-white transition-colors">
              {item.title}
            </span>
            <span className="text-[10px] text-slate-600 shrink-0">{item.days}d</span>
            <ChevronRight size={11} className="text-slate-700 group-hover:text-slate-500 shrink-0 transition-colors"/>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── TREE INSIGHT CARD ─────────────────────────────────────────────
function TreeInsightCard() {
  return (
    <div className="p-5" style={glass()}>
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={13} style={{ color: '#c4b5fd' }}/>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tree Insight</span>
      </div>
      <div className="p-3 rounded-xl mb-3"
        style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.18)' }}>
        <p className="text-[11px] font-semibold text-purple-300 mb-1">Recommended</p>
        <p className="text-[12px] text-slate-300 leading-relaxed">
          Your <span className="text-white font-semibold">System Design</span> leaves are fading fastest.
          A 20-min review session could restore 31 weak leaves.
        </p>
      </div>
      <motion.button
        className="w-full py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-1.5"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 18px rgba(124,58,237,0.38)' }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
        <TrendingUp size={12}/> Start Review Session
      </motion.button>
    </div>
  );
}

// ── LEAF HEALTH GUIDE ─────────────────────────────────────────────
function LeafGuide() {
  return (
    <div className="p-5 h-full" style={glass()}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Leaf Health Guide</p>
      <div className="flex flex-col gap-2.5">
        {LEAF_GUIDE.map(({ label, range, col }, i) => (
          <motion.div key={label} className="flex items-center gap-3"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}>
            <div className="w-3 h-3 rounded-full shrink-0"
              style={{ background: col, boxShadow: `0 0 7px ${col}80` }}/>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold" style={{ color: col }}>{label}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded-md shrink-0">{range}</span>
          </motion.div>
        ))}
      </div>

      {/* gradient bar */}
      <div className="mt-5 h-2 rounded-full overflow-hidden"
        style={{ background: `linear-gradient(90deg,${G.green},${G.lime},${G.yellow},${G.orange},${G.red})` }}/>
      <div className="flex justify-between text-[9px] text-slate-700 mt-1">
        <span>Strong</span><span>Forgotten</span>
      </div>
    </div>
  );
}

// ── CATEGORY TREES ────────────────────────────────────────────────
function CategoryTrees() {
  return (
    <div className="p-5 h-full" style={glass()}>
      <div className="flex items-center gap-1.5 mb-4">
        <Trees size={13} className="text-emerald-400"/>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Knowledge Forest</p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {CATS.map(({ name, pct, col }, i) => (
          <motion.div
            key={name}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}>
            <MiniTree col={col} pct={pct}/>
            <p className="text-[9px] text-slate-400 text-center leading-tight">{name}</p>
            <p className="text-[11px] font-bold tabular-nums" style={{ color: col }}>{pct}%</p>

            {/* mini bar */}
            <div className="w-full h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: col }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: 'easeOut' }}/>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── RECENT DISCOVERIES ────────────────────────────────────────────
function Discoveries() {
  return (
    <div className="p-5 h-full" style={glass()}>
      <div className="flex items-center gap-1.5 mb-4">
        <Zap size={13} style={{ color: '#fde047' }}/>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recent Discoveries</p>
      </div>
      <div className="flex flex-col gap-2">
        {DISCOVERIES.map(({ icon, badge, body, time, col }, i) => (
          <motion.div
            key={badge}
            className="p-3 rounded-xl cursor-pointer group"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * i }}
            whileHover={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }}>
            <div className="flex items-start gap-2.5">
              <div className="text-base shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[10px] font-bold truncate" style={{ color: col }}>{badge}</span>
                  <span className="text-[9px] text-slate-700 shrink-0">{time}</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug transition-colors">{body}</p>
              </div>
              <ChevronRight size={11} className="text-slate-700 group-hover:text-slate-500 shrink-0 mt-0.5 transition-colors"/>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────
export function KnowledgeDashboard() {
  const { user } = useAuth();
  const [tmIdx, setTmIdx] = useState(0);

  const firstName = user?.name?.split(' ')[0] ?? 'Arjun';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Welcome back' : 'Good evening';

  return (
    <div
      className="flex h-screen w-full gap-6 p-6 overflow-hidden"
      style={{ background: '#050816' }}
    >
      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── CENTER ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-y-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <h1 style={{ fontSize: 42, fontWeight: 600, color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {greeting}, {firstName}! <span style={{ fontSize: 38 }}>👋</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your knowledge tree has <span className="text-white font-semibold">238 leaves</span>.
            {' '}128 are thriving, 12 forgotten.
          </p>
        </motion.div>

        {/* ── HERO TREE CARD ─────────────────────────────────────── */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            height: 620,
            borderRadius: 28,
            background: 'rgba(12,16,28,0.70)',
            border: `1px solid ${G.border}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 80px rgba(0,0,0,0.55)',
            flexShrink: 0,
          }}
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55 }}
          whileHover={{ boxShadow: '0 24px 100px rgba(0,0,0,0.65)', transition: { duration: 0.3 } }}>

          {/* The tree fills the card */}
          <BanyanTree />

          {/* Floating health overlay */}
          <HealthOverlay />

          {/* Time label badge */}
          <AnimatePresence>
            {tmIdx > 0 && (
              <motion.div
                className="absolute top-6 right-6 px-3 py-1.5 rounded-xl text-[11px] font-bold text-purple-300"
                style={{ background: 'rgba(124,58,237,0.22)', border: '1px solid rgba(124,58,237,0.28)' }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                ⏳ {TM_LABELS[tmIdx]} memory projection
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] text-slate-600"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.05)' }}>
            Hover any leaf to inspect · colors show memory health
          </div>
        </motion.div>

        {/* ── BOTTOM GRID ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-5" style={{ flexShrink: 0 }}>
          <LeafGuide />
          <CategoryTrees />
          <Discoveries />
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 overflow-y-auto" style={{ width: 320, flexShrink: 0 }}>
        <TimeMachineCard idx={tmIdx} setIdx={setTmIdx} />
        <FadingNowCard />
        <TreeInsightCard />
      </div>
    </div>
  );
}
