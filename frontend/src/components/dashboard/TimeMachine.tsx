import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export interface TmStop {
  label: string;
  short: string;
  hours: number;
  decay: number;
}

interface Props {
  stops: TmStop[];
  index: number;
  onChange: (i: number) => void;
}

export function TimeMachine({ stops, index, onChange }: Props) {
  const fillPct = (index / (stops.length - 1)) * 100;

  return (
    <div
      className="flex flex-col gap-1.5 p-3 rounded-2xl"
      style={{
        background: 'rgba(10,12,26,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 260,
      }}>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-purple-400"/>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Time Machine</span>
        </div>
        <motion.span
          key={stops[index].short}
          className="text-[11px] font-black"
          style={{ color: '#a78bfa' }}
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          {stops[index].short}
        </motion.span>
      </div>

      {/* track */}
      <div className="relative h-1 rounded-full mx-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          animate={{ width: `${fillPct}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 30 }}
          style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}
        />
      </div>

      {/* dots */}
      <div className="flex justify-between px-0.5">
        {stops.map((t, i) => (
          <button
            key={t.short}
            onClick={() => onChange(i)}
            className="flex flex-col items-center gap-0.5 group"
            title={t.label}>
            <motion.div
              className="w-2 h-2 rounded-full"
              animate={{
                background: i === index ? '#8b5cf6' : 'rgba(255,255,255,0.14)',
                boxShadow: i === index ? '0 0 8px rgba(139,92,246,0.9)' : 'none',
                scale: i === index ? 1.3 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
            <span
              className="text-[8px] font-medium leading-none"
              style={{ color: i === index ? '#a78bfa' : '#2a2a3a' }}>
              {t.short}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
