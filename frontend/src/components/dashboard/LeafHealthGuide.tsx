import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const GUIDE = [
  { label: 'Fresh · Strong', range: '90–100%', col: '#38d96b', desc: 'Well-retained, reviewed recently' },
  { label: 'Good',           range: '60–89%',  col: '#8BEA55', desc: 'Solid memory, minimal decay' },
  { label: 'Fading',         range: '30–59%',  col: '#F4D03F', desc: 'Needs review soon' },
  { label: 'Weak',           range: '10–29%',  col: '#FF9A1F', desc: 'Significant forgetting detected' },
  { label: 'Forgotten',      range: '0–9%',    col: '#E85D2A', desc: 'Re-learn from scratch' },
];

const glass = {
  background: 'rgba(10,12,26,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: 18,
};

export function LeafHealthGuide() {
  return (
    <motion.div
      style={glass}
      className="p-5"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>

      <div className="flex items-center gap-1.5 mb-4">
        <BookOpen size={12} className="text-slate-400"/>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Leaf Health Guide</p>
      </div>

      <div className="flex flex-col gap-2">
        {GUIDE.map(({ label, range, col, desc }, i) => (
          <motion.div
            key={label}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.06 }}>

            {/* colored bar + dot */}
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: col, boxShadow: `0 0 6px ${col}80` }}/>
              {i < GUIDE.length - 1 && (
                <div className="w-px flex-1 min-h-[12px]"
                  style={{ background: `linear-gradient(${col}60,transparent)` }}/>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold" style={{ color: col }}>{label}</span>
                <span className="text-[10px] font-mono text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded-md">{range}</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
