import { motion } from 'framer-motion';
import { Flame, ChevronRight } from 'lucide-react';

interface FadingItem {
  title: string;
  days: number;
  col: string;
}

interface Props {
  items: FadingItem[];
}

const glass = {
  background: 'rgba(10,12,26,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: 18,
};

export function FadingNowList({ items }: Props) {
  return (
    <motion.div
      style={glass}
      className="p-4"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Flame size={12} style={{ color: '#FF9A1F' }}/>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Fading Now</p>
        </div>
        <span className="text-[10px] text-slate-600 font-medium">{items.length} items</span>
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer group"
            style={{ border: '1px solid transparent' }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            whileHover={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.05)',
            }}>

            {/* urgency dot */}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: item.col, boxShadow: `0 0 6px ${item.col}88` }}
            />

            {/* title + days */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-slate-600">{item.days} days since review</p>
            </div>

            {/* arrow */}
            <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0"/>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
