import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { PortfolioSummary } from '../types';

interface SummaryPanelProps {
  summary: PortfolioSummary;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary }) => {
  return (
    <div className="sticky top-4 z-50 mx-4 lg:mx-8 mb-8">
      <div className="backdrop-blur-2xl bg-white/80 border border-white/40 rounded-2xl shadow-xl shadow-slate-200/50 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Balance */}
        <div className="flex flex-col items-center justify-center p-2 border-r border-slate-200/60 last:border-r-0">
          <div className="flex items-center gap-2 text-sky-600 mb-1">
            <Wallet size={18} />
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Balance Total</span>
          </div>
          <span className="text-2xl font-black text-slate-800">
            €{summary.totalBalance.toLocaleString()}
          </span>
        </div>

        {/* Income */}
        <div className="flex flex-col items-center justify-center p-2 border-r border-slate-200/60 last:border-r-0">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <TrendingUp size={18} />
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Ingresos</span>
          </div>
          <span className="text-xl font-bold text-emerald-600">
            +€{summary.totalIncome.toLocaleString()}
          </span>
        </div>

        {/* Expenses */}
        <div className="flex flex-col items-center justify-center p-2 border-r border-slate-200/60 last:border-r-0">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <TrendingDown size={18} />
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Gastos</span>
          </div>
          <span className="text-xl font-bold text-rose-600">
            -€{summary.totalExpenses.toLocaleString()}
          </span>
        </div>

        {/* Investments */}
        <div className="flex flex-col items-center justify-center p-2">
          <div className="flex items-center gap-2 text-violet-500 mb-1">
            <Activity size={18} />
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Inversiones</span>
          </div>
          <span className="text-xl font-bold text-violet-600">
            €{summary.investmentsValue.toLocaleString()}
          </span>
        </div>

      </div>
    </div>
  );
};