import React from 'react';
import { StockChart } from '../components/StockChart';
import { AIAdvisor } from '../components/AIAdvisor';
import { GlassCard } from '../components/GlassCard';
import { PortfolioSummary, StockDataPoint } from '../types';
import { ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  summary: PortfolioSummary;
  stockData: StockDataPoint[];
  financialContext: string;
  onNavigate: (view: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  summary, 
  stockData, 
  financialContext,
  onNavigate 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Charts & Quick Links */}
      <div className="lg:col-span-8 space-y-6">
        <StockChart data={stockData} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => onNavigate('INVESTMENTS')} className="group text-left">
            <GlassCard className="h-full hover:bg-violet-50 transition-colors" glowColor="purple">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-800">Mis Inversiones</h3>
                <ArrowRight className="text-violet-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-slate-500">Gestiona tu cartera, añade acciones y ve tu distribución.</p>
              <div className="mt-4 text-2xl font-bold text-violet-600">€{summary.investmentsValue.toLocaleString()}</div>
            </GlassCard>
          </button>

          <button onClick={() => onNavigate('TRANSACTIONS')} className="group text-left">
            <GlassCard className="h-full hover:bg-sky-50 transition-colors" glowColor="cyan">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-800">Movimientos</h3>
                <ArrowRight className="text-sky-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-slate-500">Controla tus gastos e ingresos mensuales.</p>
              <div className="mt-4 text-2xl font-bold text-slate-800">€{summary.totalBalance.toLocaleString()}</div>
            </GlassCard>
          </button>
        </div>
      </div>

      {/* Right Column: AI Advisor */}
      <div className="lg:col-span-4 space-y-6">
        <AIAdvisor contextSummary={financialContext} />
        
        <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm bg-slate-50">
          <p>Estado del Sistema: <span className="text-emerald-600 font-bold">En línea</span></p>
          <p className="mt-1 text-xs text-slate-400">Última sincronización: Hace un momento</p>
        </div>
      </div>
    </div>
  );
};