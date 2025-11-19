import React, { useState } from 'react';
import { X, Search, Loader2, Check, AlertCircle, DollarSign, Euro } from 'lucide-react';
import { Investment } from '../types';
import { fetchRealTimeStock, StockQuote } from '../services/geminiService';
import { EXCHANGE_RATE_USD_TO_EUR } from '../constants';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (inv: Omit<Investment, 'id'>) => void;
}

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = useState<'SEARCH' | 'DETAILS'>('SEARCH');
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundStock, setFoundStock] = useState<StockQuote | null>(null);
  
  // Details form state
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR'); // Default to EUR
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    
    setLoading(true);
    setError('');

    const data = await fetchRealTimeStock(ticker);
    
    setLoading(false);

    if (data && data.price) {
      setFoundStock(data);
      // Auto-detect currency if possible, otherwise default to EUR
      const detectedCurrency = data.currency === 'USD' ? 'USD' : 'EUR';
      setSelectedCurrency(detectedCurrency);
      setStep('DETAILS');
    } else {
      setError('No pudimos encontrar información actual para este ticker.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundStock || !shares || !purchasePrice) return;

    const qty = parseFloat(shares);
    const priceInput = parseFloat(purchasePrice);
    
    // Normalize everything to EUR
    let priceInEur = priceInput;
    let currentPriceInEur = foundStock.price;
    let dividendInEur = foundStock.annualDividend || 0;

    // Exchange Rate Logic
    const needsConversion = selectedCurrency === 'USD' || (foundStock.currency === 'USD');

    if (selectedCurrency === 'USD') {
        priceInEur = priceInput * EXCHANGE_RATE_USD_TO_EUR;
    }

    if (foundStock.currency === 'USD' || (foundStock.currency !== 'EUR' && selectedCurrency === 'USD')) {
        currentPriceInEur = foundStock.price * EXCHANGE_RATE_USD_TO_EUR;
        dividendInEur = (foundStock.annualDividend || 0) * EXCHANGE_RATE_USD_TO_EUR;
    }

    onAdd({
      ticker: foundStock.symbol,
      name: foundStock.name,
      shares: qty,
      purchasePrice: priceInEur, // Store in EUR
      originalCurrency: selectedCurrency,
      purchaseDate: date,
      currentPrice: currentPriceInEur, // Store in EUR
      dividendPerShare: dividendInEur, // Store in EUR
      paymentMonths: foundStock.paymentMonths || [] // Save months
    });
    
    // Reset
    setTicker('');
    setFoundStock(null);
    setShares('');
    setPurchasePrice('');
    setStep('SEARCH');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-600/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-300/50 p-6 overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Añadir Inversión</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'SEARCH' ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Ticker / Símbolo</label>
              <div className="relative">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Ej: TEF.MC, KO, AAPL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200 transition-all uppercase"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2 text-rose-500 text-xs font-medium">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !ticker}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-violet-200"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Buscar Cotización'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-3 mb-4">
              <div className="bg-violet-100 p-2 rounded-full">
                 <Check size={16} className="text-violet-600" />
              </div>
              <div>
                 <p className="font-bold text-slate-800">{foundStock?.symbol}</p>
                 <p className="text-xs text-slate-500">{foundStock?.name}</p>
                 <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-white px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-medium">
                      {foundStock?.price} {foundStock?.currency}
                    </span>
                    {(foundStock?.annualDividend || 0) > 0 && (
                       <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                         Div: {foundStock?.annualDividend}
                       </span>
                    )}
                 </div>
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('EUR')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedCurrency === 'EUR' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Euro size={16} /> Euros
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('USD')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedCurrency === 'USD' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <DollarSign size={16} /> Dólares
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Precio ({selectedCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition-all"
                  placeholder={foundStock?.price.toString()}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Fecha de Compra</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition-all"
                required
              />
            </div>

            <div className="flex gap-3 mt-6">
               <button
                type="button"
                onClick={() => setStep('SEARCH')}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 font-bold transition-all"
               >
                 Atrás
               </button>
               <button
                type="submit"
                className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 rounded-xl text-white font-bold transition-all shadow-lg shadow-sky-200"
               >
                 Guardar (en €)
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};