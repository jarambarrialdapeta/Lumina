import React, { useMemo } from 'react';
import { Budget, Transaction, TransactionType } from '../types';
import { BudgetList } from '../components/BudgetList';
import { GlassCard } from '../components/GlassCard';
import { PiggyBank, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BudgetViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (b: Omit<Budget, 'id'>) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ budgets, transactions, onAddBudget }) => {
  
  // Calculate spending per category based on Expenses
  const spendingByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
        if (t.type === TransactionType.EXPENSE && t.category) {
            map[t.category] = (map[t.category] || 0) + t.amount;
        }
    });
    return map;
  }, [transactions]);

  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpentBudgeted = budgets.reduce((acc, b) => acc + (spendingByCategory[b.category] || 0), 0);
  
  // Data for Pie Chart
  const remaining = Math.max(totalBudget - totalSpentBudgeted, 0);
  const overspent = Math.max(totalSpentBudgeted - totalBudget, 0);

  const chartData = [
      { name: 'Gastado', value: Math.min(totalSpentBudgeted, totalBudget), color: '#10b981' }, // Emerald
      { name: 'Restante', value: remaining, color: '#e2e8f0' }, // Slate 200
  ];
  
  if (overspent > 0) {
      chartData.push({ name: 'Excedido', value: overspent, color: '#f43f5e' }); // Rose
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Budget List */}
      <div className="lg:col-span-7">
         <BudgetList 
            budgets={budgets} 
            spendingByCategory={spendingByCategory} 
            onAddBudget={onAddBudget} 
         />
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-5 space-y-6">
         <GlassCard title="Resumen Global" icon={<PiggyBank className="text-amber-500"/>} glowColor="amber" className="h-[350px]">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-xs uppercase text-slate-400 font-bold">Límite Total Mensual</p>
                        <p className="text-2xl font-black text-slate-800">€{totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase text-slate-400 font-bold">Gastado</p>
                        <p className={`text-2xl font-black ${overspent > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                            €{totalSpentBudgeted.toLocaleString()}
                        </p>
                    </div>
                </div>
                
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                               formatter={(value: number) => `€${value.toLocaleString()}`}
                               contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b' }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                formatter={(value) => <span className="text-slate-600 text-xs font-bold ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
         </GlassCard>

         <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 shadow-sm">
            <div className="bg-rose-100 p-3 rounded-lg h-fit text-rose-500">
                <TrendingDown size={20} />
            </div>
            <div>
                <h4 className="font-bold text-slate-800 text-sm">Alerta de Gasto</h4>
                <p className="text-xs text-slate-500 mt-1">
                   {overspent > 0 
                     ? "¡Cuidado! Has excedido tu presupuesto global. Revisa las categorías en rojo." 
                     : "Vas por buen camino. Mantienes un margen de ahorro saludable este mes."}
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};