'use client';

import { useState, useEffect, useCallback } from 'react';
import QuizCard from '@/app/components/QuizCard';
import QuizSetup from '@/app/components/QuizSetup';
import { ApiQuestion, QuizConfig, QuizState } from '@/types/question';
import { fetchQuestions, saveSession } from '@/lib/api';
import { saveQuizProgress } from '@/utils/storage';

interface QuizPageProps {
  courseType: 'vocabulary' | 'grammar' | 'reading' | 'exam';
}

const courseTitles: Record<QuizPageProps['courseType'], string> = {
  vocabulary: '単語',
  grammar: '文法',
  reading: '長文読解',
  exam: '検定対策',
};

type Phase = 'setup' | 'quiz' | 'complete';

export default function QuizPage({ courseType }: QuizPageProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
  });

  // セットアップ完了 → 問題を API から取得
  const handleSetupStart = useCallback(async (cfg: QuizConfig) => {
    setConfig(cfg);
    setLoadingQuestions(true);
    setFetchError(null);

    try {
      const data = await fetchQuestions({
        level: cfg.level,
        count: cfg.count,
        type: cfg.type,
      });
      setQuestions(data.questions);
      setQuizState({ currentQuestionIndex: 0, score: 0, answered: false, selectedAnswer: null });
      setPhase('quiz');
    } catch (e) {
      console.error(e);
      setFetchError('問題の取得に失敗しました。再度お試しください。');
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  // クイズ完了時に進捗を保存
  useEffect(() => {
    if (phase === 'complete' && config && questions.length > 0) {
      // localStorage に保存（既存の仕組みと互換）
      saveQuizProgress(courseType, quizState.score, questions.length);

      // API にも保存（失敗してもサイレント）
      saveSession({
        level: config.level,
        questionCount: config.count,
        score: quizState.score,
        totalQuestions: questions.length,
        courseType,
      }).catch((e) => console.warn('saveSession failed:', e));
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const progress = quizState.currentQuestionIndex + 1;
  const totalQuestions = questions.length;

  const handleSelectAnswer = (index: number) => {
    if (quizState.answered || !currentQuestion) return;
    const isCorrect = index === currentQuestion.correctAnswer;
    setQuizState((prev) => ({
      ...prev,
      answered: true,
      selectedAnswer: index,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        answered: false,
        selectedAnswer: null,
      }));
    } else {
      setPhase('complete');
    }
  };

  const handleRestart = () => {
    setPhase('setup');
    setQuestions([]);
    setConfig(null);
  };

  // ===== セットアップ画面 =====
  if (phase === 'setup') {
    if (loadingQuestions) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">問題を読み込み中...</p>
          </div>
        </div>
      );
    }
    if (fetchError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-red-200">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-700 font-bold mb-2">読み込みエラー</p>
            <p className="text-gray-600 text-sm">{fetchError}</p>
            <button
              onClick={() => { setFetchError(null); setConfig(null); }}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
            >
              もう一度設定する
            </button>
          </div>
        </div>
      );
    }
    return <QuizSetup courseType={courseType} onStart={handleSetupStart} />;
  }

  // ===== 完了画面 =====
  if (phase === 'complete') {
    const percentage = Math.round((quizState.score / totalQuestions) * 100);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-red-200">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            完了！🎉
          </h1>

          {config && (
            <p className="text-sm text-gray-500 mb-2">
              Level {config.level} — {courseTitles[courseType]}コース
            </p>
          )}

          <div className="mb-6">
            <p className="text-7xl font-bold text-red-600">
              {quizState.score}/{totalQuestions}
            </p>
            <p className="text-2xl text-gray-700 mt-2 font-bold">正解率: {percentage}%</p>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border-2 border-red-300">
            {percentage >= 80 && (
              <p className="text-lg font-bold text-green-700">素晴らしい成績です！🌟</p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-lg font-bold text-orange-700">よくできました！👍</p>
            )}
            {percentage < 60 && (
              <p className="text-lg font-bold text-rose-700">もう一度チャレンジしましょう！💪</p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
            >
              別のレベルに挑戦
            </button>
            <a
              href="/"
              className="block px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ===== クイズ画面 =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">

        {/* ヘッダー */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {courseTitles[courseType]}コース
            </h1>
            {config && (
              <p className="text-sm text-gray-500 mt-1">
                Level {config.level} — {totalQuestions}問
              </p>
            )}
          </div>
          <button
            onClick={handleRestart}
            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-1 transition-all"
          >
            最初から
          </button>
        </div>

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700">
              問題 {progress} / {totalQuestions}
            </span>
            <span className="text-sm font-bold text-gray-700">
              正解: {quizState.score} / {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(progress / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* クイズカード */}
        <div className="mb-8">
          {currentQuestion && (
            <QuizCard
              question={currentQuestion}
              selectedAnswer={quizState.selectedAnswer}
              answered={quizState.answered}
              onSelectAnswer={handleSelectAnswer}
            />
          )}
        </div>

        {/* 次へボタン */}
        {quizState.answered && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="px-10 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all hover:scale-105 shadow-lg"
            >
              {progress === totalQuestions ? '結果を見る' : '次の問題へ →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
