import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, RotateCcw, Clock, Tag, TrendingUp } from 'lucide-react';
import type { Chunk } from '@/lib/types';

interface Props {
  leaf: Chunk | null;
  onClose: () => void;
}

function retentionLabel(r: number) {
  if (r >= 0.90) return { label: 'Fresh · Strong', col: '#38d96b' };
  if (r >= 0.60) return { label: 'Good', col: '#8BEA55' };
  if (r >= 0.30) return { label: 'Fading', col: '#F4D03F' };
  if (r >= 0.10) return { label: 'Weak', col: '#FF9A1F' };
  return { label: 'Forgotten', col: '#E85D2A' };
}

function daysSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  return `${d} days ago`;
}

export function LeafDetailPanel({ leaf, onClose }: Props) {
  return (
    <AnimatePresence>
      {leaf && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.38)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
            style={{
              width: 360,
              background: 'rgba(10,12,24,0.97)',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between p-5 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex-1 pr-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
                  {leaf.folder ?? leaf.category}
                </p>
                <h2 className="text-[15px] font-bold text-white leading-snug">
                  {leaf.source_name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <X size={13} color="#888" />
              </button>
            </div>

            {/* Retention badge */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {(() => {
                const r = leaf.retention ?? 0.5;
                const { label, col } = retentionLabel(r);
                const pct = Math.round(r * 100);
                const circ = 2 * Math.PI * 28;
                const dash = (pct / 100) * circ;
                return (
                  <div className="flex items-center gap-4">
                    <svg width={72} height={72} viewBox="0 0 72 72">
                      <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
                      <circle cx={36} cy={36} r={28} fill="none"
                        stroke={col} strokeWidth={6}
                        strokeDasharray={`${dash} ${circ}`}
                        strokeDashoffset={circ * 0.25}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${col})` }}
                      />
                      <text x={36} y={33} textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize={14} fontWeight={800} fontFamily="Inter,sans-serif">{pct}%</text>
                      <text x={36} y={47} textAnchor="middle"
                        fill="rgba(148,163,184,0.5)" fontSize={6} fontFamily="Inter,sans-serif" letterSpacing="0.8">RETENTION</text>
                    </svg>
                    <div>
                      <p className="text-sm font-bold" style={{ color: col }}>{label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Memory strength</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Clock size={10} className="text-slate-600" />
                        <span className="text-[11px] text-slate-500">{daysSince(leaf.last_accessed)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Stats row */}
            <div
              className="px-5 py-3 grid grid-cols-3 gap-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              {[
                { icon: <TrendingUp size={11}/>, label: 'Reviews', val: leaf.access_count },
                { icon: <Tag size={11}/>, label: 'Stability', val: `${Math.round((leaf.stability_S ?? 0) * 100)}%` },
                { icon: <BookOpen size={11}/>, label: 'Complexity', val: `${Math.round((leaf.complexity_k ?? 0.2) * 100)}%` },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex flex-col gap-1 p-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-1 text-slate-500">{icon}<span className="text-[9px] uppercase tracking-wider">{label}</span></div>
                  <span className="text-[13px] font-bold text-white">{val}</span>
                </div>
              ))}
            </div>

            {/* Notes / content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">Notes</p>
              <p className="text-[13px] text-slate-300 leading-relaxed">{leaf.content}</p>

              {leaf.tags && leaf.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {leaf.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-5 pt-3 flex flex-col gap-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.button
                className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                  color: '#fff',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={13} />
                Review Now
              </motion.button>
              <motion.button
                className="w-full py-2 rounded-xl text-[12px] font-semibold text-slate-400"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
              >
                Close
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
