'use client';

import { useState, useEffect } from 'react';
import { fetchChatScenarios, ChatScenario } from '@/lib/api';

interface ChatScenarioSelectProps {
  onSelect: (scenarioId: string) => void;
}

const SCENARIO_ICONS: Record<string, string> = {
  airport: '✈️',
  market: '🛒',
  restaurant: '🍽️',
  hotel: '🏨',
  free: '💬',
};

export default function ChatScenarioSelect({ onSelect }: ChatScenarioSelectProps) {
  const [scenarios, setScenarios] = useState<ChatScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchChatScenarios();
        setScenarios(data.scenarios);
      } catch (e) {
        console.error(e);
        setError('シナリオの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-red-200">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-700 font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <span className="text-5xl">🇮🇩</span>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
            AI会話練習
          </h1>
          <p className="mt-2 text-gray-500">場面を選んでインドネシア語で会話しましょう</p>
        </div>

        {/* シナリオカード */}
        <div className="grid gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:border-red-300 hover:shadow-lg hover:-translate-y-1 transition-all text-left"
            >
              <span className="text-4xl">
                {SCENARIO_ICONS[scenario.id] ?? '💬'}
              </span>
              <div>
                <p className="text-lg font-bold text-slate-900">{scenario.name}</p>
                <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
              </div>
              <span className="ml-auto text-gray-300 text-2xl">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
