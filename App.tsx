import React, { useState, useMemo, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { SummaryPanel } from './components/SummaryPanel';
import { AddInvestmentModal } from './components/AddInvestmentModal';
import { INITIAL_TRANSACTIONS, MOCK_STOCK_DATA, INITIAL_INVESTMENTS, EXCHANGE_RATE_USD_TO_EUR, INITIAL_BUDGETS } from './constants';
import { Transaction, PortfolioSummary, TransactionType, Investment, ViewMode, Budget } from './types';
import { fetchRealTimeStock } from './services/geminiService';
import { Loader2, RefreshCw } from 'lucide-react';

// Views
import { DashboardView } from './views/DashboardView';
import { InvestmentsView } from './views/InvestmentsView';
import { TransactionsView } from './views/TransactionsView';
import { MarketView } from './views/MarketView';
import { BudgetView } from './views/BudgetView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('DASHBOARD');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false);
  const [refreshingPrices, setRefreshingPrices] = useState(false);

  // --- Shared Logic & Calculations ---

  const summary: PortfolioSummary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const investmentsCashOut = transactions
      .filter(t => t.type === TransactionType.INVESTMENT)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate current value of ALL investments (prices are already in EUR)
    const currentInvestmentsValue = investments.reduce((acc, curr) => acc + (curr.shares * curr.currentPrice), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      investmentsValue: currentInvestmentsValue, 
      // Balance logic: (Income - Expenses - Money sent to brokerage) + Current Asset Value
      totalBalance: (income - expenses - investmentsCashOut) + currentInvestmentsValue
    };
  }, [transactions, investments]);

  const handleAddTransaction = (newTrans: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTrans,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleAddInvestment = (newInv: Omit<Investment, 'id'>) => {
    const investment: Investment = {
      ...newInv,
      id: crypto.randomUUID()
    };
    setInvestments(prev => [...prev, investment]);
    
    handleAddTransaction({
       description: `Compra ${newInv.ticker}`,
       amount: newInv.shares * newInv.purchasePrice, // Already in EUR from the modal
       type: TransactionType.INVESTMENT,
       date: newInv.purchaseDate,
       category: 'Inversión'
    });
  };

  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const budget: Budget = {
      ...newBudget,
      id: crypto.randomUUID()
    };
    setBudgets(prev => [...prev, budget]);
  };

  const refreshPortfolio = async () => {
    if (refreshingPrices || investments.length === 0) return;
    setRefreshingPrices(true);

    const updatedInvestments = await Promise.all(investments.map(async (inv) => {
      // Fetch real price
      const realData = await fetchRealTimeStock(inv.ticker);
      if (realData && realData.price) {
        let newPriceEur = realData.price;
        let newDivEur = realData.annualDividend || 0;

        // Logic to convert Real Time price to EUR based on returned currency or original tracking
        const isUsd = realData.currency === 'USD' || (inv.originalCurrency === 'USD' && realData.currency !== 'EUR');

        if (isUsd) {
           newPriceEur = realData.price * EXCHANGE_RATE_USD_TO_EUR;
           newDivEur = (realData.annualDividend || 0) * EXCHANGE_RATE_USD_TO_EUR;
        }

        return { 
          ...inv, 
          currentPrice: newPriceEur,
          dividendPerShare: newDivEur !== 0 ? newDivEur : inv.dividendPerShare // Keep old div if 0 returned
        };
      }
      return inv;
    }));

    setInvestments(updatedInvestments);
    setRefreshingPrices(false);
  };

  // Context for AI
  const financialContext = `
    Resumen Financiero Actual (Valores en EUROS €):
    - Balance Total: €${summary.totalBalance}
    - Ingresos Totales: €${summary.totalIncome}
    - Gastos Totales: €${summary.totalExpenses}
    - Valor Cartera Inversiones: €${summary.investmentsValue}
    
    Detalle Inversiones:
    ${investments.map(i => `- ${i.shares} de ${i.ticker}. Comprado en ${i.originalCurrency}. Valor actual: €${i.currentPrice}`).join('\n')}
  `;

  // --- Render ---

  return (
    <div className="min-h-screen pb-12 relative overflow-x-hidden text-slate-800">
      {/* Background decorative elements - Light Theme Pastels */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px]"></div>
         <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <header className="pt-8 px-4 lg:px-8 pb-2 flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-violet-600 to-fuchsia-600 drop-shadow-sm">
              LUMINA<span className="font-light text-slate-500">FINANCE</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Dashboard Financiero (Base: EUR €)</p>
          </div>
          
          <div className="flex flex-col items-center">
            <Navigation currentView={view} onViewChange={setView} />
            {view === 'INVESTMENTS' && (
               <button 
                onClick={refreshPortfolio} 
                disabled={refreshingPrices}
                className="text-xs text-sky-600 flex items-center gap-2 hover:text-sky-700 transition-colors mt-2 font-bold"
               >
                 <RefreshCw size={12} className={refreshingPrices ? 'animate-spin' : ''} />
                 {refreshingPrices ? 'Actualizando precios y divisas...' : 'Actualizar valores de cartera'}
               </button>
            )}
          </div>
        </header>

        {/* Sticky Summary Panel */}
        <SummaryPanel summary={summary} />

        <main className="px-4 lg:px-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {view === 'DASHBOARD' && (
            <DashboardView 
              summary={summary} 
              stockData={MOCK_STOCK_DATA} 
              financialContext={financialContext}
              onNavigate={setView}
            />
          )}

          {view === 'INVESTMENTS' && (
            <InvestmentsView 
              investments={investments} 
              onOpenAddModal={() => setIsAddInvestmentOpen(true)} 
            />
          )}

          {view === 'TRANSACTIONS' && (
             <TransactionsView 
                transactions={transactions} 
                budgets={budgets}
                onAddTransaction={handleAddTransaction} 
             />
          )}
          
          {view === 'BUDGET' && (
             <BudgetView 
                budgets={budgets} 
                transactions={transactions} 
                onAddBudget={handleAddBudget} 
             />
          )}

          {view === 'MARKET' && (
            <MarketView />
          )}
        </main>

        {/* Modals */}
        <AddInvestmentModal 
          isOpen={isAddInvestmentOpen} 
          onClose={() => setIsAddInvestmentOpen(false)}
          onAdd={handleAddInvestment}
        />
      </div>
    </div>
  );
};

export default App;