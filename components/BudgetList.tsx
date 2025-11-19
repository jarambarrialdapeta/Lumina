import React, { useState } from 'react';
import { Budget } from '../types';
import { GlassCard } from './GlassCard';
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetListProps {
  budgets: Budget[];
  spendingByCategory: Record<string, number>;
  onAddBudget: (b: Omit<Budget, 'id'>) => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({ budgets, spendingByCategory, onAddBudget }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit) return;

    onAddBudget({
      category: newBudget.category,
      limit: parseFloat(newBudget.limit)
    });
    
    setNewBudget({ category: '', limit: '' });
    setIsAdding(false);
  };

  const getStatusColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { text: 'text-rose-600', bg: 'bg-rose-500', glow: 'shadow-rose-200' };
    if (percentage >= 75) return { text: 'text-amber-500', bg: 'bg-amber-500', glow: 'shadow-amber-200' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-500', glow: 'shadow-emerald-200' };
  };

  return (
    <GlassCard title="Control de Presupuestos" className="h-full flex flex-col" glowColor="none">
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all text-amber-500"
        >
          <Plus size={18} className={`transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4 mb-3">
             <input 
               type="text" placeholder="Categoría (ej: Ocio)" className="bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800"
               value={newBudget.category} onChange={e => setNewBudget({...newBudget, category: e.target.value})}
             />
             <input 
               type="number" placeholder="Límite (€)" className="bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800"
               value={newBudget.limit} onChange={e => setNewBudget({...newBudget, limit: e.target.value})}
             />
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-amber-200">
             Crear Presupuesto
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {budgets.map(b => {
            const spent = spendingByCategory[b.category] || 0;
            const percentage = Math.min((spent / b.limit) * 100, 100);
            const styles = getStatusColor(spent, b.limit);
            const isOver = spent > b.limit;

            return (
                <div key={b.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h4 className="font-bold text-slate-800">{b.category}</h4>
                            <p className="text-xs text-slate-500">
                                Gastado: <span className="text-slate-800 font-mono">€{spent.toLocaleString()}</span> / €{b.limit.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={`text-lg font-bold font-mono ${styles.text}`}>
                                {percentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                        {/* Solid Bar */}
                        <div 
                            className={`h-full ${styles.bg} relative transition-all duration-500 ease-out shadow-sm`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    
                    {isOver && (
                        <div className="mt-2 flex items-center gap-2 text-rose-500 text-xs font-medium">
                            <AlertTriangle size={12} />
                            <span>Has excedido el límite en €{(spent - b.limit).toLocaleString()}</span>
                        </div>
                    )}
                    {!isOver && percentage < 80 && (
                         <div className="mt-2 flex items-center gap-2 text-emerald-600/70 text-xs font-medium">
                            <CheckCircle2 size={12} />
                            <span>Presupuesto bajo control</span>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </GlassCard>
  );
};