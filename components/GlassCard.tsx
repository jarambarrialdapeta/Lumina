import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'pink' | 'purple' | 'emerald' | 'amber' | 'none';
  title?: string;
  icon?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'none',
  title,
  icon
}) => {
  const glowStyles = {
    cyan: 'shadow-[0_4px_20px_rgba(14,165,233,0.15)] border-sky-200',
    pink: 'shadow-[0_4px_20px_rgba(236,72,153,0.15)] border-pink-200',
    purple: 'shadow-[0_4px_20px_rgba(139,92,246,0.15)] border-violet-200',
    emerald: 'shadow-[0_4px_20px_rgba(16,185,129,0.15)] border-emerald-200',
    amber: 'shadow-[0_4px_20px_rgba(245,158,11,0.15)] border-amber-200',
    none: 'border-slate-200 shadow-sm'
  };

  return (
    <div className={`
      relative backdrop-blur-xl bg-white/70 
      border rounded-2xl p-6 
      transition-all duration-300 hover:bg-white/90 hover:shadow-md
      ${glowStyles[glowColor]}
      ${className}
    `}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
          {icon && <span className="text-slate-600">{icon}</span>}
          {title && <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};