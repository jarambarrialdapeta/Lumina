import React, { useMemo } from 'react';
import { Investment } from '../types';
import { GlassCard } from '../components/GlassCard';
import { InvestmentPieChart } from '../components/InvestmentPieChart';
import { DividendCalendar } from '../components/DividendCalendar';
import { DividendProjection } from '../components/DividendProjection';
import { Plus, DollarSign } from 'lucide-react';

interface InvestmentsViewProps {
  investments: Investment[];
  onOpenAddModal: () => void;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({ investments, onOpenAddModal }) => {
  
  const performance = useMemo(() => {
    const totalInvested = investments.reduce((acc, curr) => acc + (curr.shares * curr.purchasePrice), 0);
    const currentValue = investments.reduce((acc, curr) => acc + (curr.shares * curr.currentPrice), 0);
    const totalDividends = investments.reduce((acc, curr) => acc + (curr.shares * curr.dividendPerShare), 0);
    const totalPL = currentValue - totalInvested;
    const percentPL = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    return { totalInvested, currentValue, totalPL, percentPL, totalDividends };
  }, [investments]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cartera de Dividendos</h2>
         <button 
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-white font-medium shadow-lg shadow-violet-200 transition-all"
         >
            <Plus size={18} /> Añadir Activo
         </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="flex flex-col items-center justify-center py-4" glowColor="purple">
              <span className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">Valor Cartera</span>
              <span className="text-2xl font-black text-slate-800">
                 €{performance.currentValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </span>
          </GlassCard>

          <GlassCard className="flex flex-col items-center justify-center py-4" glowColor={performance.totalPL >= 0 ? 'none' : 'pink'}>
              <span className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">P/L Total</span>
              <div className={`flex items-center gap-1 text-xl font-black ${performance.totalPL >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {performance.totalPL >= 0 ? '+' : ''}€{performance.totalPL.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  <span className="text-sm opacity-80 ml-1 font-medium">({performance.percentPL.toFixed(1)}%)</span>
              </div>
          </GlassCard>

          <GlassCard className="flex flex-col items-center justify-center py-4" glowColor="cyan">
             <span className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">Dividendos / Año</span>
             <span className="text-2xl font-black text-sky-600">
                €{performance.totalDividends.toLocaleString(undefined, {maximumFractionDigits: 2})}
             </span>
          </GlassCard>

           <GlassCard className="flex flex-col items-center justify-center py-4" glowColor="none">
             <span className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">Yield on Cost Global</span>
             <span className="text-2xl font-black text-emerald-600">
                {performance.totalInvested > 0 ? ((performance.totalDividends / performance.totalInvested) * 100).toFixed(2) : 0}%
             </span>
          </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Distribution */}
          <div className="lg:col-span-1">
             <InvestmentPieChart investments={investments} />
          </div>

          {/* Holdings List */}
          <div className="lg:col-span-2">
              <GlassCard title="Mis Activos & Dividendos" className="h-[400px] flex flex-col bg-white/80">
                  <div className="flex text-xs uppercase tracking-widest text-slate-500 font-bold px-4 pb-2 border-b border-slate-100">
                      <div className="w-1/3">Nombre</div>
                      <div className="w-1/3 text-center hidden md:block">Pagos</div>
                      <div className="w-1/3 text-right">Yield / Dividendos</div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 p-2">
                     {investments.length === 0 && (
                       <div className="flex h-full items-center justify-center text-slate-400">
                         No hay inversiones activas.
                       </div>
                     )}
                     {investments.map(inv => {
                        const dividendTotal = inv.shares * inv.dividendPerShare;
                        const currentYield = inv.currentPrice > 0 ? (inv.dividendPerShare / inv.currentPrice) * 100 : 0;
                        const yieldOnCost = inv.purchasePrice > 0 ? (inv.dividendPerShare / inv.purchasePrice) * 100 : 0;

                        return (
                            <div key={inv.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all group">
                                <div className="flex items-center justify-between">
                                    
                                    {/* Col 1: Identity */}
                                    <div className="w-full md:w-1/3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-[10px] font-bold text-slate-700 relative">
                                            {inv.ticker.substring(0, 4)}
                                            {inv.originalCurrency === 'USD' && (
                                              <div className="absolute -top-1 -right-1 text-sky-500 bg-white rounded-full">
                                                <DollarSign size={12} />
                                              </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{inv.ticker}</h4>
                                            <p className="text-xs text-slate-500 truncate max-w-[120px]">{inv.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{inv.shares.toFixed(2)} shares</p>
                                        </div>
                                    </div>

                                    {/* Col 2: Payment Pills */}
                                    <div className="hidden md:flex w-1/3 justify-center items-center gap-1">
                                       {inv.paymentMonths && inv.paymentMonths.length > 0 ? (
                                          inv.paymentMonths.map(m => (
                                            <div key={m} className="w-6 h-1.5 bg-amber-300 rounded-full" title={`Paga en Mes ${m+1}`}></div>
                                          ))
                                       ) : (
                                          <span className="text-[10px] text-slate-300">?</span>
                                       )}
                                    </div>

                                    {/* Col 3: Metrics */}
                                    <div className="w-full md:w-1/3 text-right flex flex-col gap-1">
                                        <div className="flex justify-end items-baseline gap-4">
                                           <div className="text-right">
                                              <span className="block text-[10px] text-slate-400 uppercase font-bold">Yield</span>
                                              <span className="text-sm font-mono text-emerald-600 font-bold">{currentYield.toFixed(2)}%</span>
                                           </div>
                                           <div className="text-right">
                                              <span className="block text-[10px] text-slate-400 uppercase font-bold">YoC</span>
                                              <span className="text-sm font-mono text-violet-600 font-bold">{yieldOnCost.toFixed(2)}%</span>
                                           </div>
                                        </div>
                                        <div className="mt-1 pt-1 border-t border-slate-100">
                                            <span className="text-xs text-slate-500 font-bold">€{dividendTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                     })}
                  </div>
              </GlassCard>
          </div>
      </div>

      {/* New Section: Dividend Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DividendCalendar investments={investments} />
          <DividendProjection currentAnnualDividends={performance.totalDividends} />
      </div>
    </div>
  );
};