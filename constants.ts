
import { StockDataPoint, Transaction, TransactionType, Investment, Budget } from "./types";

export const EXCHANGE_RATE_USD_TO_EUR = 0.92; // 1 USD = 0.92 EUR

// Start with a flat line at 0 for the chart
export const MOCK_STOCK_DATA: StockDataPoint[] = [
  { name: 'Inicio', value: 0, invested: 0 },
];

// Empty transactions list
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Empty investments list
export const INITIAL_INVESTMENTS: Investment[] = [];

// Empty budgets list
export const INITIAL_BUDGETS: Budget[] = [];
