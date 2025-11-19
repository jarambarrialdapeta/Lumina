import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getFinancialAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIAdvisorProps {
  contextSummary: string;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ contextSummary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: 'Hola, soy Lumina AI. Analizo tus finanzas y la bolsa en tiempo real. ¿En qué puedo ayudarte hoy?', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await getFinancialAdvice(input, contextSummary);
    
    const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <GlassCard 
      title="Lumina Oracle AI" 
      icon={<Bot className="text-sky-500" />} 
      glowColor="cyan"
      className="h-[500px] flex flex-col"
    >
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-sky-100 text-sky-900 rounded-tr-none' 
                : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
              }
            `}>
              {msg.role === 'model' && <Sparkles size={14} className="inline mr-2 text-sky-500" />}
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">{line}</p>
              ))}
              <p className="text-[10px] opacity-50 text-right mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              <Loader2 className="animate-spin text-sky-500" size={16} />
              <span className="text-xs text-slate-500">Analizando mercado...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Pregunta sobre acciones, tendencias..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-200 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-sky-100 hover:bg-sky-200 text-sky-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </GlassCard>
  );
};