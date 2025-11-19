import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Investment } from '../types';
import { GlassCard } from './GlassCard';
import { PieChart as PieIcon } from 'lucide-react';

interface InvestmentPieChartProps {
  investments: Investment[];
}

export const InvestmentPieChart: React.FC<InvestmentPieChartProps> = ({ investments }) => {
  // Aggregate data by Ticker
  const dataMap = investments.reduce((acc, curr) => {
    const value = curr.shares * curr.currentPrice;
    if (acc[curr.ticker]) {
      acc[curr.ticker].value += value;
    } else {
      acc[curr.ticker] = { name: curr.ticker, value };
    }
    return acc;
  }, {} as Record<string, { name: string, value: number }>);

  const data = Object.values(dataMap);
  const COLORS = ['#8b5cf6', '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#f43f5e'];

  return (
    <GlassCard 
        title="Distribución de Activos" 
        icon={<PieIcon className="text-violet-500"/>}
        glowColor="purple"
        className="h-[400px] flex flex-col"
    >
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value: number) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
               contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#1e293b' }}
            />
            <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                formatter={(value) => <span className="text-slate-600 text-xs font-medium ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};