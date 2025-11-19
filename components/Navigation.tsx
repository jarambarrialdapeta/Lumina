import React from 'react';
import { LayoutDashboard, PieChart, Wallet, Globe, PiggyBank } from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'DASHBOARD', label: 'Resumen', icon: <LayoutDashboard size={16} />, color: 'sky' },
    { id: 'INVESTMENTS', label: 'Inversiones', icon: <PieChart size={16} />, color: 'violet' },
    { id: 'TRANSACTIONS', label: 'Movimientos', icon: <Wallet size={16} />, color: 'emerald' },
    { id: 'BUDGET', label: 'Presupuesto', icon: <PiggyBank size={16} />, color: 'amber' },
    { id: 'MARKET', label: 'Bolsa', icon: <Globe size={16} />, color: 'rose' },
  ] as const;

  // Helper to map color name to Tailwind classes dynamically isn't ideal with JIT, 
  // so we use explicit conditional logic or safe-listed classes.
  // Here we use a simpler approach for the active state.

  const getActiveClasses = (color: string) => {
    switch(color) {
        case 'sky': return 'bg-sky-100 text-sky-700 border-sky-200 shadow-sm';
        case 'violet': return 'bg-violet-100 text-violet-700 border-violet-200 shadow-sm';
        case 'emerald': return 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm';
        case 'amber': return 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm';
        case 'rose': return 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm';
        default: return 'bg-slate-100 text-slate-900';
    }
  }

  return (
    <div className="flex justify-center mb-6 overflow-x-auto pb-2 md:pb-0">
      <div className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-full p-1.5 flex space-x-1 shadow-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewMode)}
            className={`
              flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap border
              ${currentView === item.id 
                ? getActiveClasses(item.color)
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'}
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};