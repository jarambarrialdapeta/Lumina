
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to parse JSON from text that might contain markdown
const cleanAndParseJSON = (text: string) => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON from AI:", text);
    return null;
  }
};

export const getFinancialAdvice = async (
  question: string, 
  contextData: string
): Promise<string> => {
  if (!apiKey) return "Error: API Key no configurada.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Contexto financiero del usuario (Valores en EUR): ${contextData}
        Pregunta: ${question}
        
        Responde como NeonOracle (asesor financiero futurista). Sé breve y usa Markdown.
      `,
      config: {
        systemInstruction: "Eres un experto financiero. Usa datos reales si es necesario.",
      }
    });
    return response.text || "Sin respuesta.";
  } catch (error) {
    console.error(error);
    return "Error de conexión.";
  }
};

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY';
  changePercent: number;
  annualDividend: number; 
  paymentMonths: number[]; // 0-11
}

export const fetchRealTimeStock = async (ticker: string): Promise<StockQuote | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Find the current real-time stock price, annual dividend per share, AND typical dividend payment months for ticker symbol "${ticker}".
      
      Return ONLY a JSON object with these fields:
      - symbol (string, uppercase)
      - name (string, company name)
      - price (number, current price)
      - currency (string, e.g. "USD", "EUR")
      - changePercent (number, today's percentage change)
      - annualDividend (number, total annual dividend per share. If none, 0)
      - paymentMonths (array of integers 0-11 representing months, e.g., [0,3,6,9] for Jan/Apr/Jul/Oct. If unknown, guess based on sector or return empty)
      
      Do not add any explanation, just the JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error("Stock fetch error:", error);
    return null;
  }
};

export const fetchMarketNews = async () => {
  if (!apiKey) return [];

  try {
    const prompt = `
      Find 4 distinct, latest financial news headlines from today (Global or Europe).
      Return ONLY a JSON array of objects with:
      - title (string)
      - tag (string, short category like "Tech", "Crypto", "Macro")
      - time (string, e.g., "2h ago")
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return cleanAndParseJSON(response.text) || [];
  } catch (error) {
    console.error("News fetch error:", error);
    return [];
  }
};

export const fetchGlobalIndices = async () => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Find current values for: S&P 500, NASDAQ, and IBEX 35.
      Return ONLY a JSON object with keys "sp500", "nasdaq", "ibex".
      Each value should be an object with:
      - price (string formatted with currency)
      - change (number, percent change)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Indices fetch error:", error);
    return null;
  }
};

export const getDeepStockAnalysis = async (ticker: string) => {
  if (!apiKey) return null;

  try {
    // This prompt asks for specific historical arrays to populate charts
    const prompt = `
      Perform a fundamental analysis search for ticker: "${ticker}".
      Gather financial data for the last 4 years (2021-2024/TTM).

      Return strictly a JSON object with this structure (use 0 if data not found):
      {
        "symbol": "string",
        "name": "string",
        "price": number,
        "currency": "string",
        "description": "Short 1 sentence company description",
        "metrics": {
           "pe": number (P/E Ratio),
           "fcfYield": number (Free Cash Flow Yield %),
           "dividendYield": number (Dividend Yield %),
           "marketCap": "string (e.g. 2.30 B)",
           "payoutRatio": number (Payout Ratio %)
        },
        "history": {
           "revenue": [{ "year": "2021", "value": number }, ...],
           "eps": [{ "year": "2021", "value": number }, ...],
           "fcf": [{ "year": "2021", "value": number }, ...],
           "dividends": [{ "year": "2021", "value": number }, ...],
           "debt": [{ "year": "2021", "value": number }, ...],
           "roe": [{ "year": "2021", "value": number }, ...],
           "roic": [{ "year": "2021", "value": number }, ...]
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Deep analysis error:", error);
    return null;
  }
};
