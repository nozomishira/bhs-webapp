'use client';

import { useState, useEffect } from 'react';
import QuizCard from '@/app/components/QuizCard';
import { Question, QuizState } from '@/types/question';
import { saveQuizProgress } from '@/utils/storage';
import questionsData from '@/data/questions.json';

interface QuizPageProps {
  courseType: 'vocabulary' | 'grammar' | 'reading' | 'exam';
}

const courseTitles = {
  vocabulary: '単語',
  grammar: '文法',
  reading: '長文読解',
  exam: 'インドネシア語検定',
};

export default function QuizPage({ courseType }: QuizPageProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // コースタイプに応じてフィルタリング
    let filtered = questionsData as Question[];
    
    if (courseType === 'vocabulary') {
      filtered = filtered.filter(q => q.type === 'vocabulary');
    } else if (courseType === 'grammar') {
      filtered = filtered.filter(q => q.type === 'grammar');
    }
    // readingとexamはサンプルなので、全問を使用
    
    setQuestions(filtered);
  }, [courseType]);

  useEffect(() => {
    if (isComplete && questions.length > 0) {
      saveQuizProgress(courseType, quizState.score, questions.length);
    }
  }, [isComplete, courseType, quizState.score, questions.length]);

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const progress = quizState.currentQuestionIndex + 1;
  const totalQuestions = questions.length;

  const handleSelectAnswer = (index: number) => {
    if (quizState.answered) return;

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
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setQuizState({
      currentQuestionIndex: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
    });
    setIsComplete(false);
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((quizState.score / totalQuestions) * 100);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-red-200">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">完了！🎉</h1>
          <div className="mb-6">
            <p className="text-7xl font-bold text-red-600">
              {quizState.score}/{totalQuestions}
            </p>
            <p className="text-2xl text-gray-700 mt-2 font-bold">正解率: {percentage}%</p>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border-2 border-red-300">
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
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
            >
              もう一度チャレンジ
            </button>
            <a
              href="/"
              className="block px-6 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-all"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            {courseTitles[courseType]}コース
          </h1>
          <p className="text-gray-700 font-medium">楽しく学習しましょう</p>
        </div>

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-800">
              問題 {progress} / {totalQuestions}
            </span>
            <span className="text-sm font-bold text-gray-800">
              正解: {quizState.score} / {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-red-600 to-orange-600 h-3 rounded-full transition-all"
              style={{ width: `${(progress / totalQuestions) * 100}%` }}
            ></div>
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

        {/* 次ボタン */}
        {quizState.answered && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
            >
              {progress === totalQuestions ? '完了' : '次へ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
