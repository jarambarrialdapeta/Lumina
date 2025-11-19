import React from 'react';
import { Transaction, TransactionType, Budget } from '../types';
import { TransactionList } from '../components/TransactionList';
import { GlassCard } from '../components/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, budgets, onAddTransaction }) => {
  
  const data = [
    {
      name: 'Ingresos',
      amount: transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, c) => a + c.amount, 0),
      color: '#10b981' // emerald
    },
    {
      name: 'Gastos',
      amount: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, c) => a + c.amount, 0),
      color: '#f43f5e' // rose
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <TransactionList transactions={transactions} budgets={budgets} onAddTransaction={onAddTransaction} />
      </div>
      
      <div className="lg:col-span-4 space-y-6">
        <GlassCard title="Balance Comparativo" icon={<BarChart3 className="text-sky-500"/>} glowColor="cyan" className="h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
               <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
               <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
               <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                 formatter={(value) => `€${value.toLocaleString()}`}
               />
               <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                 {data.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </GlassCard>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-2">Consejo Rápido</h4>
          <p className="text-xs text-slate-600">
            Tus gastos representan un <span className="text-rose-500 font-bold">{((data[1].amount / (data[0].amount || 1)) * 100).toFixed(0)}%</span> de tus ingresos. 
            Intenta mantener este ratio por debajo del 70% para aumentar tu capacidad de ahorro.
          </p>
        </div>
      </div>
    </div>
  );
};