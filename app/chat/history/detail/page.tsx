'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchChatHistoryDetail, ChatHistoryDetail } from '@/lib/api';
import ChatEvaluationModal from '@/app/components/ChatEvaluationModal';

function HistoryDetailContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  const [detail, setDetail] = useState<ChatHistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEval, setShowEval] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetchChatHistoryDetail(sessionId)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!sessionId || !detail) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-red-600 font-bold">履歴が見つかりません</p>
          <Link href="/chat/history" className="mt-4 inline-block text-blue-600 underline">一覧に戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/chat/history" className="text-gray-500 hover:text-red-600 font-bold text-lg">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">{detail.scenarioName}</h1>
          <p className="text-xs text-gray-400">
            {new Date(detail.createdAt).toLocaleString('ja-JP')}
          </p>
        </div>
        {detail.evaluation && (
          <button
            onClick={() => setShowEval(true)}
            className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600"
          >
            採点結果
          </button>
        )}
        <a
          href="/chat.html"
          onClick={(e) => {
            e.preventDefault();
            localStorage.setItem('bhs_resume_chat', JSON.stringify({
              scenarioId: detail.scenarioId,
              messages: detail.messages,
              sessionId: detail.sessionId,
            }));
            window.location.href = '/chat.html';
          }}
          className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700"
        >
          再開する
        </a>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {detail.messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-br-sm'
                  : 'bg-white text-slate-800 border border-gray-200 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {showEval && detail.evaluation && (
        <ChatEvaluationModal
          evaluation={detail.evaluation}
          onClose={() => setShowEval(false)}
        />
      )}
    </div>
  );
}

export default function ChatHistoryDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    }>
      <HistoryDetailContent />
    </Suspense>
  );
}
