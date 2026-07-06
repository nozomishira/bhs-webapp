'use client';

import { ApiQuestion } from '@/types/question';

interface QuizCardProps {
  question: ApiQuestion;
  selectedAnswer: number | null;
  answered: boolean;
  onSelectAnswer: (index: number) => void;
}

export default function QuizCard({
  question,
  selectedAnswer,
  answered,
  onSelectAnswer,
}: QuizCardProps) {
  const getButtonStyle = (index: number) => {
    const baseStyle =
      'w-full p-4 text-left rounded-lg border-2 transition-all font-medium';

    if (!answered) {
      return `${baseStyle} border-gray-300 hover:border-red-500 cursor-pointer hover:bg-red-50`;
    }

    // 回答済みの場合
    if (index === question.correctAnswer) {
      return `${baseStyle} border-green-500 bg-green-100 text-green-900`;
    }

    if (index === selectedAnswer && index !== question.correctAnswer) {
      return `${baseStyle} border-red-500 bg-red-100 text-red-900`;
    }

    return `${baseStyle} border-gray-300 text-gray-600`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
        {/* 問題タイプバッジ */}
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
              question.type === 'vocabulary'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {question.type === 'vocabulary' ? '単語問題' : '文法問題'}
          </span>
          <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
            {question.category}
          </span>
        </div>

        {/* 問題文 */}
        <h2 className="text-xl font-bold mb-6 text-gray-800">{question.question}</h2>

        {/* 選択肢 */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !answered && onSelectAnswer(index)}
              disabled={answered}
              className={getButtonStyle(index)}
            >
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-current mr-3 font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 説明 */}
        {answered && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg">
            <p className="font-bold text-orange-900 mb-2">💡 解説</p>
            <p className="text-orange-900">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
