import { UserProgress, QuizProgress } from '@/types/question';

const STORAGE_KEY = 'bhs_user_progress';

export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function saveQuizProgress(
  courseId: string,
  score: number,
  total: number
): void {
  if (typeof window === 'undefined') return;
  
  const progress = getUserProgress();
  const current = progress[courseId] || {
    courseId,
    totalAttempts: 0,
    correctAnswers: 0,
    lastAttempted: new Date().toISOString(),
  };

  current.totalAttempts += 1;
  current.correctAnswers += score;
  current.lastAttempted = new Date().toISOString();

  if (score === total) {
    current.completedAt = new Date().toISOString();
  }

  progress[courseId] = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getCourseStats(courseId: string): {
  attempts: number;
  accuracy: number;
} {
  const progress = getUserProgress();
  const course = progress[courseId];

  if (!course) {
    return { attempts: 0, accuracy: 0 };
  }

  return {
    attempts: course.totalAttempts,
    accuracy: course.totalAttempts > 0
      ? Math.round((course.correctAnswers / (course.totalAttempts * 10)) * 100)
      : 0,
  };
}

export function getTotalStats(): {
  totalLessons: number;
  averageAccuracy: number;
} {
  const progress = getUserProgress();
  const courses = Object.values(progress);

  if (courses.length === 0) {
    return { totalLessons: 0, averageAccuracy: 0 };
  }

  const totalAttempts = courses.reduce((sum, c) => sum + c.totalAttempts, 0);
  const totalCorrect = courses.reduce((sum, c) => sum + c.correctAnswers, 0);

  return {
    totalLessons: totalAttempts,
    averageAccuracy: totalAttempts > 0
      ? Math.round((totalCorrect / (totalAttempts * 10)) * 100)
      : 0,
  };
}
