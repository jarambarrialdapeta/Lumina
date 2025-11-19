import React from 'react';
import { Investment } from '../types';
import { GlassCard } from './GlassCard';
import { CalendarDays } from 'lucide-react';

interface DividendCalendarProps {
  investments: Investment[];
}

export const DividendCalendar: React.FC<DividendCalendarProps> = ({ investments }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate monthly dividends
  const monthlyTotals = months.map((_, index) => {
    let total = 0;
    investments.forEach(inv => {
      if (inv.paymentMonths && inv.paymentMonths.includes(index)) {
        // Assume annual dividend is split equally among payment months
        const numPayments = inv.paymentMonths.length || 1;
        const paymentAmount = (inv.shares * inv.dividendPerShare) / numPayments;
        total += paymentAmount;
      }
    });
    return total;
  });

  const maxTotal = Math.max(...monthlyTotals, 1); // Avoid division by zero

  return (
    <GlassCard 
      title="Calendario de Pagos" 
      icon={<CalendarDays className="text-amber-500" />} 
      glowColor="none"
      className="h-[400px] flex flex-col"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
         {months.map((month, index) => {
           const amount = monthlyTotals[index];
           const percentage = (amount / maxTotal) * 100;
           
           return (
             <div key={month} className="flex items-center gap-4 group">
               <div className="w-8 text-xs font-bold text-slate-400 uppercase">{month}</div>
               <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ease-out relative ${amount > 0 ? 'bg-amber-400 shadow-sm' : 'bg-transparent'}`}
                   style={{ width: `${Math.max(percentage, 0)}%` }}
                 />
               </div>
               <div className={`w-16 text-right font-mono text-sm font-bold ${amount > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                 €{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
               </div>
             </div>
           );
         })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        Estimación basada en fechas de pago habituales.
      </div>
    </GlassCard>
  );
};