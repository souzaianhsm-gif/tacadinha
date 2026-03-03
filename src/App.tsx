import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  History, 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Match {
  id: string;
  result: 'win' | 'loss';
  timestamp: number;
  bet: number;
  profit: number;
}

interface DailyHistoryItem {
  id: string;
  date: string;
  totalMatches: number;
  wins: number;
  losses: number;
  profit: number;
  winRate: number;
}

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryItem[]>([]);
  const [initialBankroll, setInitialBankroll] = useState<number>(100);
  const [dailyGoal, setDailyGoal] = useState<number>(100);
  const betAmount = 5;
  const winProfit = 4;

  // Load data from localStorage
  useEffect(() => {
    const savedMatches = localStorage.getItem('sinuca_matches');
    const savedBankroll = localStorage.getItem('sinuca_initial_bankroll');
    const savedHistory = localStorage.getItem('sinuca_daily_history');
    const savedGoal = localStorage.getItem('sinuca_daily_goal');
    
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedBankroll) setInitialBankroll(Number(savedBankroll));
    if (savedHistory) setDailyHistory(JSON.parse(savedHistory));
    if (savedGoal) setDailyGoal(Number(savedGoal));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('sinuca_matches', JSON.stringify(matches));
    localStorage.setItem('sinuca_initial_bankroll', initialBankroll.toString());
    localStorage.setItem('sinuca_daily_history', JSON.stringify(dailyHistory));
    localStorage.setItem('sinuca_daily_goal', dailyGoal.toString());
  }, [matches, initialBankroll, dailyHistory, dailyGoal]);

  const stats = useMemo(() => {
    const total = matches.length;
    const wins = matches.filter(m => m.result === 'win').length;
    const losses = matches.filter(m => m.result === 'loss').length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const totalProfit = matches.reduce((acc, m) => acc + m.profit, 0);
    const currentBankroll = initialBankroll + totalProfit;
    
    return {
      total,
      wins,
      losses,
      winRate,
      totalProfit,
      currentBankroll,
      progress: (total / dailyGoal) * 100
    };
  }, [matches, initialBankroll]);

  const addMatch = (result: 'win' | 'loss') => {
    if (matches.length >= dailyGoal) {
      if (!confirm('Você já atingiu a meta de 100 partidas hoje. Deseja registrar mais uma?')) {
        return;
      }
    }

    const newMatch: Match = {
      id: crypto.randomUUID(),
      result,
      timestamp: Date.now(),
      bet: betAmount,
      profit: result === 'win' ? winProfit : -betAmount
    };

    setMatches([newMatch, ...matches]);
  };

  const resetDay = () => {
    if (matches.length === 0) {
      alert('Nenhuma partida para salvar.');
      return;
    }

    if (confirm('Deseja finalizar o dia e salvar no histórico?')) {
      const newHistoryItem: DailyHistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString('pt-BR'),
        totalMatches: stats.total,
        wins: stats.wins,
        losses: stats.losses,
        profit: stats.totalProfit,
        winRate: stats.winRate
      };

      setDailyHistory([newHistoryItem, ...dailyHistory]);
      setMatches([]);
    }
  };

  const deleteHistoryItem = (id: string) => {
    if (confirm('Excluir este dia do histórico?')) {
      setDailyHistory(dailyHistory.filter(item => item.id !== id));
    }
  };

  const deleteMatch = (id: string) => {
    setMatches(matches.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-zinc-100">Sinuca Pro Manager</h1>
          </div>
          <button 
            onClick={resetDay}
            className="text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar Dia
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400">Banca Atual</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="stat-value text-zinc-100">
                R$ {stats.currentBankroll.toFixed(2)}
              </div>
              <div className={`text-xs font-medium mt-1 ${stats.totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}R$ {stats.totalProfit.toFixed(2)} hoje
              </div>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400">Taxa de Vitória</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="stat-value text-zinc-100">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-xs font-medium text-zinc-400 mt-1">
                {stats.wins} Vitórias / {stats.losses} Derrotas
              </div>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400">Meta Diária</span>
              <Target className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="stat-value text-zinc-100">
                {stats.total} / {dailyGoal}
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                  className="h-full bg-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => addMatch('win')}
            className="btn-win flex items-center justify-center gap-2 h-20 text-lg"
          >
            <CheckCircle2 className="w-6 h-6" />
            GANHEI (+R$ 4)
          </button>
          <button 
            onClick={() => addMatch('loss')}
            className="btn-loss flex items-center justify-center gap-2 h-20 text-lg"
          >
            <XCircle className="w-6 h-6" />
            PERDI (-R$ 5)
          </button>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico Recente
            </h2>
            <div className="text-sm text-zinc-400 font-medium">
              Aposta fixa: R$ {betAmount}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            {matches.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-zinc-400 font-medium">Nenhuma partida registrada hoje.</p>
                <p className="text-xs text-zinc-500">Comece a jogar para ver seu progresso!</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                <AnimatePresence initial={false}>
                  {matches.map((match, index) => (
                    <motion.div 
                      key={match.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          match.result === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {match.result === 'win' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100">
                            Partida #{matches.length - index}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className={`font-mono font-bold ${
                          match.result === 'win' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {match.result === 'win' ? '+' : ''}R$ {match.profit.toFixed(2)}
                        </div>
                        <button 
                          onClick={() => deleteMatch(match.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-rose-500 transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Daily History Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Dias Anteriores
          </h2>
          
          <div className="glass-card overflow-hidden">
            {dailyHistory.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                Nenhum dia finalizado ainda.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {dailyHistory.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group">
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-100">{item.date}</div>
                      <div className="text-xs text-zinc-400">
                        {item.totalMatches} partidas • {item.wins}V / {item.losses}D • {item.winRate.toFixed(1)}% WR
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`font-mono font-bold ${item.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.profit >= 0 ? '+' : ''}R$ {item.profit.toFixed(2)}
                      </div>
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-rose-500 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration / Footer */}
        <div className="glass-card p-6 bg-zinc-900 text-white border-none">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Configurações da Banca</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Banca Inicial (R$)</label>
                <input 
                  type="number" 
                  value={initialBankroll}
                  onChange={(e) => setInitialBankroll(Number(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 w-full font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Meta de Partidas</label>
                <input 
                  type="number" 
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 w-full font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                <div className="text-xs text-zinc-400 mb-1">Aposta</div>
                <div className="font-mono font-bold">R$ {betAmount.toFixed(2)}</div>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                <div className="text-xs text-zinc-400 mb-1">Lucro p/ Vitória</div>
                <div className="font-mono font-bold">R$ {winProfit.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
