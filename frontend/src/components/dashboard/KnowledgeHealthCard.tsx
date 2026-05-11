import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface Props {
  overallPct: number;
  strong: number;
  fading: number;
  weak: number;
  forgotten: number;
}

function ProgressRing({ pct, col }: { pct: number; col: string }) {
  const r = 40, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
      <circle cx={50} cy={50} r={r} fill="none"
        stroke={col} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${col})`, transition: 'stroke-dasharray 1.2s ease' }}
      />
      <text x={50} y={46} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={18} fontWeight={800} fontFamily="Inter,sans-serif">{pct}%</text>
      <text x={50} y={62} textAnchor="middle"
        fill="rgba(148,163,184,0.45)" fontSize={6} fontFamily="Inter,sans-serif" letterSpacing="1.1">OVERALL</text>
    </svg>
  );
}

const glass = {
  background: 'rgba(10,12,26,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: 18,
};

export function KnowledgeHealthCard({ overallPct, strong, fading, weak, forgotten }: Props) {
  const gaugeCol = overallPct >= 70 ? '#38d96b' : overallPct >= 45 ? '#F4D03F' : '#E85D2A';
  const total = strong + fading + weak + forgotten;

  const stats = [
    { label: 'Strong',    val: strong,    col: '#38d96b' },
    { label: 'Fading',    val: fading,    col: '#F4D03F' },
    { label: 'Weak',      val: weak,      col: '#FF9A1F' },
    { label: 'Forgotten', val: forgotten, col: '#E85D2A' },
  ];

  return (
    <motion.div
      style={glass}
      className="p-4"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

      <div className="flex items-center gap-1.5 mb-3">
        <Leaf size={12} className="text-green-400"/>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Knowledge Health</p>
      </div>

      <div className="flex items-center gap-3">
        <ProgressRing pct={overallPct} col={gaugeCol}/>
        <div className="flex flex-col gap-1.5">
          {stats.map(({ label, val, col }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0"
                style={{ background: col, boxShadow: `0 0 5px ${col}66` }}/>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: col }}>{val}</span>
              <span className="text-[11px] text-slate-600">{label}</span>
            </div>
          ))}
          <div className="pt-1.5 mt-0.5 border-t border-white/5">
            <span className="text-[11px] text-slate-500">
              <span className="font-black text-white text-[13px]">{total}</span> Total Leaves
            </span>
          </div>
        </div>
      </div>

      {/* Mini bar breakdown */}
      <div className="mt-3 h-1.5 rounded-full overflow-hidden flex gap-0.5">
        {stats.map(({ col, val }) => (
          <div key={col} className="h-full rounded-full transition-all duration-1000"
            style={{ flex: val, background: col, opacity: 0.85 }}/>
        ))}
      </div>
    </motion.div>
  );
}
