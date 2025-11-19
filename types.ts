
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category?: string;
}

export interface StockDataPoint {
  name: string;
  value: number;
  invested: number;
}

export interface PortfolioSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  investmentsValue: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Investment {
  id: string;
  ticker: string;
  name: string; // Company name
  shares: number;
  purchasePrice: number; // Price per share in EUR
  originalCurrency: 'EUR' | 'USD'; 
  purchaseDate: string;
  currentPrice: number; // Current price in EUR
  dividendPerShare: number; // Annual dividend per share in EUR
  paymentMonths: number[]; // Array of months (0=Jan, 11=Dec) when it pays
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export type ViewMode = 'DASHBOARD' | 'INVESTMENTS' | 'TRANSACTIONS' | 'MARKET' | 'BUDGET';

// --- New Types for Deep Market Analysis ---

export interface AnnualMetric {
  year: string;
  value: number;
}

export interface DeepStockAnalysis {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  
  // Valuation Metrics
  metrics: {
    pe: number;
    fcfYield: number;
    dividendYield: number;
    marketCap: string;
    payoutRatio: number;
  };

  // Historical Data Arrays (last 4 years)
  history: {
    revenue: AnnualMetric[];
    eps: AnnualMetric[];
    fcf: AnnualMetric[];
    dividends: AnnualMetric[];
    debt: AnnualMetric[];
    roe: AnnualMetric[];
    roic: AnnualMetric[];
  };
}
