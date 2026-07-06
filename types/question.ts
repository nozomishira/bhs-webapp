export interface Question {
  id: string;
  type: 'vocabulary' | 'grammar';
  question: string;
  options: string[];
  correctAnswer: number; // 0-3の選択肢インデックス
  explanation: string;
  category: string;
}

/** API から返ってくる問題型 (questionId ベース) */
export interface ApiQuestion {
  questionId: string;
  level: number;
  type: 'vocabulary' | 'grammar';
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  indonesianWord?: string;
}

/** /levels エンドポイントのレスポンス */
export interface LevelInfo {
  level: number;
  label: string;
  questionCount: number;
}

/** クイズ開始前にユーザーが選択する設定 */
export interface QuizConfig {
  level: number;
  count: 5 | 10 | 15 | 20;
  type?: 'vocabulary' | 'grammar';
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answered: boolean;
  selectedAnswer: number | null;
}

export interface QuizProgress {
  courseId: string;
  totalAttempts: number;
  correctAnswers: number;
  lastAttempted: string; // ISO date string
  completedAt?: string;
}

export interface UserProgress {
  [courseId: string]: QuizProgress;
}
