'use client';

import { useState, useEffect } from 'react';
import { fetchLevels } from '@/lib/api';
import { LevelInfo, QuizConfig } from '@/types/question';

interface QuizSetupProps {
  courseType: 'vocabulary' | 'grammar' | 'reading' | 'exam';
  onStart: (config: QuizConfig) => void;
}

const COUNT_OPTIONS = [5, 10, 15, 20] as const;

const TYPE_OPTIONS = [
  { value: undefined, label: 'すべて' },
  { value: 'vocabulary' as const, label: '単語' },
  { value: 'grammar' as const, label: '文法' },
] as const;

const courseLabels = {
  vocabulary: '単語',
  grammar: '文法',
  reading: '長文読解',
  exam: '検定対策',
};

export default function QuizSetup({ courseType, onStart }: QuizSetupProps) {
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedCount, setSelectedCount] = useState<5 | 10 | 15 | 20>(10);
  const [selectedType, setSelectedType] = useState<'vocabulary' | 'grammar' | undefined>(
    courseType === 'vocabulary' ? 'vocabulary'
    : courseType === 'grammar' ? 'grammar'
    : undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API からレベル一覧を取得
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const typeFilter = courseType === 'vocabulary' ? 'vocabulary'
          : courseType === 'grammar' ? 'grammar'
          : undefined;
        const data = await fetchLevels(typeFilter);
        setLevels(data.levels);
        if (data.levels.length > 0) {
          setSelectedLevel(data.levels[0].level);
        }
      } catch (e) {
        console.error(e);
        setError('レベル情報の取得に失敗しました。APIエンドポイントを確認してください。');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedLevelInfo = levels.find((l) => l.level === selectedLevel);
  const maxAvailable = selectedLevelInfo?.questionCount ?? 0;
  // 選択可能な問題数（そのレベルにある問題数の上限内）
  const availableCounts = COUNT_OPTIONS.filter((c) => c <= maxAvailable);

  const handleStart = () => {
    onStart({
      level: selectedLevel,
      count: selectedCount,
      type: selectedType,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">レベルを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-red-200">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-700 font-bold mb-2">接続エラー</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border-2 border-red-100">

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <span className="text-5xl">🇮🇩</span>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            {courseLabels[courseType]}コース
          </h1>
          <p className="mt-2 text-gray-500">レベルと問題数を選んでスタート</p>
        </div>

        {/* レベル選択 */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            レベル選択
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
            {levels.map((lv) => (
              <button
                key={lv.level}
                onClick={() => {
                  setSelectedLevel(lv.level);
                  // 選択中のcountが新レベルの問題数を超えていたらリセット
                  if (selectedCount > lv.questionCount) {
                    const valid = COUNT_OPTIONS.filter((c) => c <= lv.questionCount);
                    if (valid.length > 0) setSelectedCount(valid[valid.length - 1]);
                  }
                }}
                className={`py-2 px-1 rounded-xl text-sm font-bold transition-all border-2 ${
                  selectedLevel === lv.level
                    ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <div>{lv.level}</div>
                <div className="text-xs opacity-70">{lv.questionCount}問</div>
              </button>
            ))}
          </div>
          {selectedLevelInfo && (
            <p className="mt-2 text-xs text-gray-500 text-right">
              {selectedLevelInfo.label} — {selectedLevelInfo.questionCount}問収録
            </p>
          )}
        </div>

        {/* 問題数選択 */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            問題数
          </label>
          <div className="grid grid-cols-4 gap-3">
            {COUNT_OPTIONS.map((c) => {
              const disabled = c > maxAvailable;
              return (
                <button
                  key={c}
                  onClick={() => !disabled && setSelectedCount(c)}
                  disabled={disabled}
                  className={`py-3 rounded-xl text-lg font-bold transition-all border-2 ${
                    selectedCount === c && !disabled
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
                      : disabled
                      ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  {c}問
                </button>
              );
            })}
          </div>
        </div>

        {/* タイプ選択（exam のみ表示。vocabulary/grammar は強制されるため非表示） */}
        {courseType === 'exam' && (
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              問題タイプ
            </label>
            <div className="flex gap-3">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSelectedType(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                    selectedType === opt.value
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* スタートボタン */}
        <button
          onClick={handleStart}
          disabled={availableCounts.length === 0}
          className={`w-full py-4 rounded-2xl text-white text-lg font-extrabold transition-all shadow-xl ${
            availableCounts.length > 0
              ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 hover:scale-[1.02]'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {availableCounts.length === 0
            ? 'このレベルにはまだ問題がありません'
            : `Level ${selectedLevel} を ${selectedCount}問 スタート！`}
        </button>
      </div>
    </div>
  );
}
