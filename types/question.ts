export interface Question {
  id: string;
  type: 'vocabulary' | 'grammar';
  question: string;
  options: string[];
  correctAnswer: number; // 0-3の選択肢インデックス
  explanation: string;
  category: string;
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
