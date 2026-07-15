'use client';

import { useState, useRef, useEffect } from 'react';
import { postChat, evaluateChat, saveChatHistory, ChatMessage, ChatEvaluation } from '@/lib/api';
import ChatEvaluationModal from './ChatEvaluationModal';

interface ChatWindowProps {
  scenarioId: string;
  onBack: () => void;
  initialMessages?: ChatMessage[];
  resumeSessionId?: string;
}

const SCENARIO_NAMES: Record<string, string> = {
  airport: '空港',
  market: '市場・買い物',
  restaurant: 'レストラン',
  hotel: 'ホテル',
  free: 'フリー会話',
};

export default function ChatWindow({ scenarioId, onBack, initialMessages, resumeSessionId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(resumeSessionId);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ChatEvaluation | null>(null);
  const savedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 初回: AI からの最初の挨拶を取得（initialMessages がある場合はスキップ）
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) return;

    const getGreeting = async () => {
      setLoading(true);
      try {
        const res = await postChat({
          scenarioId,
          messages: [{ role: 'user', content: 'こんにちは、会話を始めましょう' }],
        });
        setMessages([
          { role: 'user', content: 'こんにちは、会話を始めましょう' },
          { role: 'assistant', content: res.reply },
        ]);
      } catch (e) {
        console.error(e);
        setError('AI との接続に失敗しました');
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    };
    getGreeting();
  }, [scenarioId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await postChat({
        scenarioId,
        messages: newMessages,
      });
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      console.error(e);
      setError('応答の取得に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEvaluate = async () => {
    if (messages.length < 2 || evaluating) return;
    setEvaluating(true);
    setError(null);

    try {
      const res = await evaluateChat({ scenarioId, messages });
      setEvaluation(res.evaluation);

      // 採点結果を含めて即座に保存（同じsessionIdなら上書き）
      const userMessageCount = messages.filter((m) => m.role === 'user').length;
      if (userMessageCount >= 2) {
        const result = await saveChatHistory({
          scenarioId,
          scenarioName: SCENARIO_NAMES[scenarioId] ?? scenarioId,
          messages,
          evaluation: res.evaluation,
          ...(currentSessionId ? { sessionId: currentSessionId } : {}),
        });
        if (result.sessionId) {
          setCurrentSessionId(result.sessionId);
        }
        savedRef.current = true;
      }
    } catch (e) {
      console.error(e);
      setError('採点に失敗しました。もう一度お試しください。');
    } finally {
      setEvaluating(false);
    }
  };

  const handleEndChat = async () => {
    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    // 既に保存済み（採点時に保存）ならスキップ
    if (userMessageCount >= 2 && !savedRef.current) {
      const result = await saveChatHistory({
        scenarioId,
        scenarioName: SCENARIO_NAMES[scenarioId] ?? scenarioId,
        messages,
        ...(currentSessionId ? { sessionId: currentSessionId } : {}),
      });
      if (result.sessionId) {
        setCurrentSessionId(result.sessionId);
      }
    }
    onBack();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">
            {SCENARIO_NAMES[scenarioId] ?? 'チャット'}
          </h1>
          <p className="text-xs text-gray-400">AI会話練習</p>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={messages.length < 2 || evaluating || loading}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {evaluating ? '採点中...' : '採点する'}
        </button>
        <button
          onClick={handleEndChat}
          disabled={messages.length < 2 || loading || evaluating}
          className="px-4 py-2 bg-gray-500 text-white text-sm font-bold rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          保存して終了
        </button>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
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

        {/* ローディング表示 */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-200 shadow-sm">
              <span className="animate-pulse">考え中...</span>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="インドネシア語または日本語で入力..."
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            送信
          </button>
        </div>
      </div>

      {/* 採点結果モーダル */}
      {evaluation && (
        <ChatEvaluationModal
          evaluation={evaluation}
          onClose={() => setEvaluation(null)}
        />
      )}
    </div>
  );
}
