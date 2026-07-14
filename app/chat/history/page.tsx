'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchChatHistory, ChatHistoryItem } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

const SCENARIO_ICONS: Record<string, string> = {
  airport: '✈️',
  market: '🛒',
  restaurant: '🍽️',
  hotel: '🏨',
  free: '💬',
};

function ScoreLabel({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400">未採点</span>;
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-600' : 'text-red-600';
  return <span className={`text-sm font-bold ${color}`}>{score}点</span>;
}

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('ログインが必要です');
      setLoading(false);
      return;
    }

    fetchChatHistory()
      .then((data) => setSessions(data.sessions))
      .catch((e) => {
        console.error(e);
        setError('履歴の取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-bold">{error}</p>
          <Link href="/chat" className="mt-4 inline-block text-blue-600 underline">会話練習に戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">会話履歴</h1>
          <Link
            href="/chat"
            className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700"
          >
            新しい会話
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-gray-500">まだ会話履歴がありません</p>
            <Link href="/chat" className="mt-4 inline-block text-red-600 font-bold">
              会話を始める →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link
                key={session.sessionId}
                href={`/chat/history/detail?id=${session.sessionId}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="text-2xl">
                  {SCENARIO_ICONS[session.scenarioId] ?? '💬'}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{session.scenarioName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(session.createdAt).toLocaleString('ja-JP')} · {session.messageCount}メッセージ
                  </p>
                </div>
                <ScoreLabel score={session.score} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
