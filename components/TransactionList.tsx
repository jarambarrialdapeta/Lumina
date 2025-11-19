import React, { useState } from 'react';
import { Transaction, TransactionType, Budget } from '../types';
import { GlassCard } from './GlassCard';
import { ArrowUpRight, ArrowDownRight, Briefcase, Plus } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, budgets, onAddTransaction }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTrans, setNewTrans] = useState({
    description: '',
    amount: '',
    type: TransactionType.EXPENSE,
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrans.description || !newTrans.amount) return;

    onAddTransaction({
      description: newTrans.description,
      amount: parseFloat(newTrans.amount),
      type: newTrans.type,
      date: new Date().toISOString().split('T')[0],
      category: newTrans.category || 'General'
    });
    
    setNewTrans({ description: '', amount: '', type: TransactionType.EXPENSE, category: '' });
    setIsAdding(false);
  };

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME: return <ArrowUpRight className="text-emerald-500" size={20} />;
      case TransactionType.EXPENSE: return <ArrowDownRight className="text-rose-500" size={20} />;
      case TransactionType.INVESTMENT: return <Briefcase className="text-violet-500" size={20} />;
    }
  };

  return (
    <GlassCard title="Transacciones Recientes" className="h-[500px] flex flex-col" glowColor="none">
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all text-sky-600"
        >
          <Plus size={18} className={`transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-inner">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" placeholder="Descripción" className="bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none"
              value={newTrans.description} onChange={e => setNewTrans({...newTrans, description: e.target.value})}
            />
            <input 
              type="number" placeholder="Monto (€)" className="bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none"
              value={newTrans.amount} onChange={e => setNewTrans({...newTrans, amount: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select 
              className="bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none"
              value={newTrans.type} onChange={(e) => setNewTrans({...newTrans, type: e.target.value as TransactionType})}
            >
              <option value={TransactionType.EXPENSE}>Gasto</option>
              <option value={TransactionType.INCOME}>Ingreso</option>
              <option value={TransactionType.INVESTMENT}>Inversión</option>
            </select>
            
            <div className="relative">
              <input 
                list="category-options"
                type="text" 
                placeholder="Categoría" 
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none"
                value={newTrans.category} 
                onChange={e => setNewTrans({...newTrans, category: e.target.value})}
              />
              <datalist id="category-options">
                {budgets.map(b => (
                  <option key={b.id} value={b.category} />
                ))}
                <option value="Salario" />
                <option value="Inversión" />
                <option value="Freelance" />
                <option value="General" />
              </datalist>
            </div>
          </div>
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg p-2 text-sm font-bold transition-colors shadow-md shadow-sky-200">
            Añadir Transacción
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-300 transition-all shadow-sm group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-${t.type === 'INCOME' ? 'emerald' : t.type === 'INVESTMENT' ? 'violet' : 'rose'}-200 transition-colors`}>
                {getIcon(t.type)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">{t.description}</p>
                <p className="text-xs text-slate-400">{t.date} • {t.category}</p>
              </div>
            </div>
            <span className={`font-mono font-bold ${
              t.type === TransactionType.INCOME ? 'text-emerald-600' : 
              t.type === TransactionType.INVESTMENT ? 'text-violet-600' : 'text-rose-500'
            }`}>
              {t.type === TransactionType.EXPENSE ? '-' : '+'}€{t.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};