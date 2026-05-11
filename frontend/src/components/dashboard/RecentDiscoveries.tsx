import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

interface Discovery {
  icon: string;
  badge: string;
  body: string;
  time: string;
  col?: string;
}

interface Props {
  discoveries: Discovery[];
}

const glass = {
  background: 'rgba(10,12,26,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: 18,
};

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  '🔍': { bg: 'rgba(59,130,246,0.12)',   text: '#93c5fd' },
  '💡': { bg: 'rgba(234,179,8,0.12)',    text: '#fde047' },
  '🔔': { bg: 'rgba(239,68,68,0.12)',    text: '#fca5a5' },
};

export function RecentDiscoveries({ discoveries }: Props) {
  return (
    <motion.div
      style={glass}
      className="p-5"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>

      <div className="flex items-center gap-1.5 mb-4">
        <Zap size={12} style={{ color: '#fde047' }}/>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Recent Discoveries</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {discoveries.map(({ icon, badge, body, time }, i) => {
          const bc = BADGE_COLORS[icon] ?? { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa' };
          return (
            <motion.div
              key={badge}
              className="p-3 rounded-xl cursor-pointer group"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.08 }}
              whileHover={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.09)',
              }}>

              <div className="flex items-start gap-2.5">
                {/* icon circle */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ background: bc.bg }}>
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-bold truncate" style={{ color: bc.text }}>{badge}</span>
                    <span className="text-[9px] text-slate-700 shrink-0">{time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug transition-colors">{body}</p>
                </div>

                <ChevronRight size={11} className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0 mt-0.5"/>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
