import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Globe, TrendingUp, TrendingDown, Activity, Loader2, RefreshCw, Search, ArrowLeft, BarChart3, PieChart, DollarSign } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, BarChart, Bar, XAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { fetchGlobalIndices, fetchMarketNews, getDeepStockAnalysis } from '../services/geminiService';
import { DeepStockAnalysis, AnnualMetric } from '../types';

// --- Helper Component for Charts ---
const FundamentalChart: React.FC<{ title: string, data: AnnualMetric[], color: string, type?: 'bar' | 'area', formatter?: (v: number) => string }> = ({ 
  title, data, color, type = 'bar', formatter = (v) => `${v}` 
}) => (
  <div className="h-[250px] w-full flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
    <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">{title}</h4>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b' }}
              formatter={formatter}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={data}>
             <defs>
                <linearGradient id={`grad_${title.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
             </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b' }}
              formatter={formatter}
            />
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad_${title.replace(/\s/g,'')})`} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);

// --- Main Market View ---

export const MarketView: React.FC = () => {
  const [mode, setMode] = useState<'OVERVIEW' | 'ANALYSIS'>('OVERVIEW');
  const [loading, setLoading] = useState(false);
  
  // Overview State
  const [indices, setIndices] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [overviewLoaded, setOverviewLoaded] = useState(false);

  // Analysis State
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData, setStockData] = useState<DeepStockAnalysis | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    const [indicesData, newsData] = await Promise.all([
      fetchGlobalIndices(),
      fetchMarketNews()
    ]);
    if (indicesData) setIndices(indicesData);
    if (newsData && Array.isArray(newsData)) setNews(newsData);
    setOverviewLoaded(true);
    setLoading(false);
  };

  useEffect(() => {
    if (mode === 'OVERVIEW' && !overviewLoaded) {
      loadOverview();
    }
  }, [mode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMode('ANALYSIS');
    setStockData(null);

    const data = await getDeepStockAnalysis(searchQuery);
    setStockData(data);
    setLoading(false);
  };

  // --- Renders ---

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
      {/* Tickers Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "S&P 500", data: indices?.sp500 },
          { name: "NASDAQ", data: indices?.nasdaq },
          { name: "Bitcoin", data: indices?.btc }
        ].map((idx) => (
           <GlassCard key={idx.name} className="h-24 flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-slate-800">{idx.name}</h3>
                   <p className="text-xs text-slate-500">Índice Global</p>
                </div>
                <div className="text-right">
                   <p className="font-mono text-lg font-bold text-slate-800">{idx.data?.price || "---"}</p>
                   <p className={`text-xs font-bold ${(idx.data?.change || 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                     {(idx.data?.change || 0) >= 0 ? '+' : ''}{idx.data?.change || 0}%
                   </p>
                </div>
              </div>
              {/* Simple background chart effect */}
              <div className={`absolute bottom-0 left-0 w-full h-1.5 ${(idx.data?.change || 0) >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
           </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Noticias Globales" icon={<Activity className="text-sky-500"/>}>
          <div className="space-y-4">
            {news.length === 0 && !loading && <p className="text-slate-400">Cargando noticias...</p>}
            {news.map((n, i) => (
              <div key={i} className="pb-3 border-b border-slate-100 last:border-0">
                 <div className="flex justify-between mb-1">
                   <span className="text-[10px] text-sky-700 border border-sky-200 px-1.5 rounded bg-sky-50 font-bold">{n.tag}</span>
                   <span className="text-[10px] text-slate-400">{n.time}</span>
                 </div>
                 <p className="text-sm text-slate-700 hover:text-sky-600 cursor-pointer transition-colors font-medium">{n.title}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        
        <GlassCard title="Tendencia" className="flex items-center justify-center">
           <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-violet-50 mb-4 shadow-sm">
                 <Globe size={48} className="text-violet-400" />
              </div>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                El mercado muestra volatilidad mixta. Usa el buscador superior para analizar acciones individuales en profundidad.
              </p>
           </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderAnalysis = () => {
    if (loading) {
       return (
         <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-sky-500" size={48} />
            <p className="text-slate-500 animate-pulse font-medium">Analizando fundamentales de {searchQuery.toUpperCase()}...</p>
            <p className="text-xs text-slate-400">Recopilando balances, dividendos y ratios de crecimiento.</p>
         </div>
       );
    }

    if (!stockData) {
      return (
        <div className="text-center py-20">
           <p className="text-rose-500 font-medium">No se encontraron datos para "{searchQuery}". Intenta con otro ticker.</p>
           <button onClick={() => setMode('OVERVIEW')} className="mt-4 text-slate-500 hover:text-slate-800 underline">Volver</button>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4">
        {/* Header Data */}
        <GlassCard className="relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                 <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-800">{stockData.symbol}</h2>
                    <span className="px-2 py-1 rounded bg-slate-100 text-xs text-slate-500 border border-slate-200 font-bold">{stockData.currency}</span>
                 </div>
                 <p className="text-lg text-slate-600 font-medium">{stockData.name}</p>
                 <p className="text-xs text-slate-500 max-w-md mt-1">{stockData.description}</p>
              </div>
              <div className="text-right">
                 <div className="text-4xl font-black text-slate-800 tracking-tight">
                    {stockData.currency === 'USD' ? '$' : '€'}{stockData.price}
                 </div>
                 <div className="text-sm text-slate-500 mt-1">Cap. Mercado: <span className="text-sky-600 font-bold">{stockData.metrics.marketCap}</span></div>
              </div>
           </div>
        </GlassCard>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           {[
             { label: "P/E Ratio", value: stockData.metrics.pe, ideal: "< 20", color: "text-violet-600" },
             { label: "FCF Yield", value: `${stockData.metrics.fcfYield}%`, ideal: "> 5%", color: "text-emerald-600" },
             { label: "Div. Yield", value: `${stockData.metrics.dividendYield}%`, ideal: "High", color: "text-sky-600" },
             { label: "Payout Ratio", value: `${stockData.metrics.payoutRatio}%`, ideal: "< 60%", color: "text-rose-500" },
             { label: "Deuda/Eq", value: "N/A", ideal: "Low", color: "text-amber-500" },
           ].map((m, i) => (
             <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] uppercase text-slate-400 mb-1 font-bold">{m.label}</span>
                <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
             </div>
           ))}
        </div>

        {/* Chart Section 1: Growth & Profitability */}
        <h3 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
           <BarChart3 className="text-sky-500" size={20} /> Crecimiento y Rentabilidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <FundamentalChart title="Ingresos (Revenue)" data={stockData.history.revenue} color="#0ea5e9" type="bar" formatter={(v)=>`${(v/1000000000).toFixed(1)}B`} />
           <FundamentalChart title="Beneficio x Acción (EPS)" data={stockData.history.eps} color="#8b5cf6" type="bar" formatter={(v)=>`${v}`} />
           <FundamentalChart title="Flujo Caja Libre (FCF)" data={stockData.history.fcf} color="#10b981" type="bar" formatter={(v)=>`${(v/1000000000).toFixed(1)}B`}/>
        </div>

        {/* Chart Section 2: Dividends & Efficiency */}
        <h3 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
           <PieChart className="text-rose-500" size={20} /> Dividendos y Eficiencia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <FundamentalChart title="Dividendos" data={stockData.history.dividends} color="#ec4899" type="area" formatter={(v)=>`${v}`} />
           <FundamentalChart title="Retorno s/Equity (ROE)" data={stockData.history.roe} color="#f59e0b" type="area" formatter={(v)=>`${(v*100).toFixed(1)}%`} />
           <FundamentalChart title="Deuda Neta" data={stockData.history.debt} color="#f43f5e" type="bar" formatter={(v)=>`${(v/1000000000).toFixed(1)}B`} />
        </div>
      </div>
    );
  };

  return (
    <div className="pb-12">
      {/* Top Search Bar */}
      <div className="flex items-center gap-4 mb-8">
         {mode === 'ANALYSIS' && (
           <button onClick={() => { setMode('OVERVIEW'); setSearchQuery(''); }} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
              <ArrowLeft size={20} />
           </button>
         )}
         <form onSubmit={handleSearch} className="flex-1 relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar Empresa (ej: KO, AAPL, BBVA.MC)..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:shadow-lg focus:shadow-sky-100 transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-sky-500" size={20} />}
         </form>
      </div>

      {mode === 'OVERVIEW' ? renderOverview() : renderAnalysis()}
    </div>
  );
};