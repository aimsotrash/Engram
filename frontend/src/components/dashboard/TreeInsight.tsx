import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  topFading: string[];
  weakCount: number;
}

const glass = {
  background: 'rgba(10,12,26,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: 18,
};

export function TreeInsight({ topFading, weakCount }: Props) {
  return (
    <motion.div
      style={glass}
      className="p-4"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>

      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={12} style={{ color: '#a78bfa' }}/>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Tree Insight</p>
      </div>

      {/* Primary suggestion */}
      <div className="p-3 rounded-xl mb-2.5"
        style={{ background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.18)' }}>
        <p className="text-[11px] font-semibold text-purple-300 mb-1">Recommended to revisit</p>
        <p className="text-[12px] text-slate-300 leading-relaxed">
          Your <span className="text-white font-semibold">System Design</span> leaves are fading fast.
          Schedule a 20-min review session to restore {weakCount} weak leaves.
        </p>
      </div>

      {/* Fading topics */}
      {topFading.length > 0 && (
        <div className="flex flex-col gap-1">
          {topFading.slice(0, 3).map((t, i) => (
            <motion.div
              key={t}
              className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer group"
              style={{ border: '1px solid transparent' }}
              whileHover={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.08 }}>
              <span className="text-[10px] font-bold text-slate-700 tabular-nums w-3">{i+1}</span>
              <span className="flex-1 text-[11px] text-slate-400 group-hover:text-slate-300 truncate transition-colors">{t}</span>
              <ArrowRight size={10} className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0"/>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
