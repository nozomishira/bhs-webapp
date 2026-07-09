'use client';

import { ChatEvaluation } from '@/lib/api';

interface ChatEvaluationModalProps {
  evaluation: ChatEvaluation;
  onClose: () => void;
}

function ScoreBar({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{score}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ChatEvaluationModal({ evaluation, onClose }: ChatEvaluationModalProps) {
  const totalPct = evaluation.totalScore;
  const grade =
    totalPct >= 90 ? { label: 'S', color: 'text-yellow-500' } :
    totalPct >= 80 ? { label: 'A', color: 'text-green-600' } :
    totalPct >= 70 ? { label: 'B', color: 'text-blue-600' } :
    totalPct >= 60 ? { label: 'C', color: 'text-orange-600' } :
    { label: 'D', color: 'text-red-600' };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="p-6 text-center border-b border-gray-100">
          <p className="text-sm text-gray-500 mb-2">採点結果</p>
          <p className={`text-6xl font-extrabold ${grade.color}`}>{grade.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{evaluation.totalScore}<span className="text-lg text-gray-400">/100</span></p>
        </div>

        {/* 各観点のスコア */}
        <div className="p-6">
          <ScoreBar score={evaluation.grammar.score} max={30} label="文法の正確さ" />
          <ScoreBar score={evaluation.spelling.score} max={20} label="スペル・綴り" />
          <ScoreBar score={evaluation.vocabulary.score} max={20} label="語彙の適切さ" />
          <ScoreBar score={evaluation.communication.score} max={20} label="コミュニケーション力" />
          <ScoreBar score={evaluation.naturalness.score} max={10} label="自然さ" />
        </div>

        {/* 良かった点 */}
        {evaluation.goodPoints.length > 0 && (
          <div className="px-6 pb-4">
            <p className="font-bold text-green-700 mb-2">🌟 良かった点</p>
            <ul className="space-y-1">
              {evaluation.goodPoints.map((point, i) => (
                <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-green-500">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 改善点 */}
        {evaluation.improvements.length > 0 && (
          <div className="px-6 pb-4">
            <p className="font-bold text-orange-700 mb-2">📝 改善ポイント</p>
            <ul className="space-y-1">
              {evaluation.improvements.map((point, i) => (
                <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 各観点のコメント */}
        <div className="px-6 pb-6">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-500 hover:text-gray-700">詳細コメントを見る</summary>
            <div className="mt-3 space-y-2 text-gray-600">
              <p><span className="font-medium">文法:</span> {evaluation.grammar.comment}</p>
              <p><span className="font-medium">スペル:</span> {evaluation.spelling.comment}</p>
              <p><span className="font-medium">語彙:</span> {evaluation.vocabulary.comment}</p>
              <p><span className="font-medium">コミュニケーション:</span> {evaluation.communication.comment}</p>
              <p><span className="font-medium">自然さ:</span> {evaluation.naturalness.comment}</p>
            </div>
          </details>
        </div>

        {/* 閉じるボタン */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
