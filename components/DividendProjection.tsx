import React, { useState } from 'react';
import { Investment } from '../types';
import { GlassCard } from './GlassCard';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DividendProjectionProps {
  currentAnnualDividends: number;
}

export const DividendProjection: React.FC<DividendProjectionProps> = ({ currentAnnualDividends }) => {
  const [years, setYears] = useState(10);
  const growthRate = 0.08; // 8% annual dividend growth mock
  
  // Passive income goal
  const monthlyGoal = 1000; // 1000 EUR/month
  const annualGoal = monthlyGoal * 12;
  const currentProgress = (currentAnnualDividends / annualGoal) * 100;

  const generateProjectionData = () => {
    let data = [];
    let currentAmount = currentAnnualDividends;
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= years; i++) {
      data.push({
        year: currentYear + i,
        amount: Math.round(currentAmount)
      });
      currentAmount = currentAmount * (1 + growthRate);
    }
    return data;
  };

  const data = generateProjectionData();
  const futureValue = data[data.length - 1].amount;

  return (
    <GlassCard 
        title="Proyección Valor Futuro (Dividendos)" 
        icon={<TrendingUp className="text-emerald-500" />} 
        glowColor="emerald"
        className="h-auto min-h-[400px] flex flex-col"
    >
        {/* Goal Progress */}
        <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
               <div>
                 <h4 className="text-sm text-slate-500 font-medium">Meta Ingresos Pasivos</h4>
                 <div className="text-2xl font-bold text-slate-800">€{Math.round(currentAnnualDividends / 12)} <span className="text-sm text-slate-400 font-normal">/ €{monthlyGoal} mes</span></div>
               </div>
               <span className="text-emerald-600 font-bold">{currentProgress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-400 shadow-sm" style={{ width: `${Math.min(currentProgress, 100)}%` }}></div>
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                <span>€{(currentAnnualDividends/365).toFixed(2)} diario</span>
                <span>€{(currentAnnualDividends/8760).toFixed(2)} por hora</span>
            </div>
        </div>

        {/* Chart Controls */}
        <div className="flex justify-center gap-2 mb-4">
           {[10, 25, 40].map(y => (
               <button
                 key={y}
                 onClick={() => setYears(y)}
                 className={`px-3 py-1 rounded-full text-xs border transition-all ${years === y ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' : 'border-transparent hover:bg-slate-100 text-slate-500'}`}
               >
                 {y} Años
               </button>
           ))}
        </div>
        
        {/* Chart */}
        <div className="flex-1 min-h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                   <XAxis dataKey="year" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                   <YAxis stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `€${val}`} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(val) => `€${val}`}
                   />
                   <Area type="monotone" dataKey="amount" stroke="#f59e0b" fill="url(#colorIncome)" strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Valor Futuro Estimado ({new Date().getFullYear() + years})</span>
            <span className="text-xl font-bold text-amber-500">€{futureValue.toLocaleString()}</span>
        </div>
    </GlassCard>
  );
};