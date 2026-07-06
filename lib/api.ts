/**
 * bhs-webapi クライアント
 *
 * 静的エクスポート (output: 'export') のためすべて Client-side fetch。
 * NEXT_PUBLIC_API_BASE_URL が未設定の場合はローカルの mock データにフォールバック。
 */
import { ApiQuestion, LevelInfo } from '@/types/question';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// --------------------------------------------------------
// 共通 fetch ラッパー
// --------------------------------------------------------
async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    // 静的サイトなので cache: 'no-store' でフレッシュなデータを取得
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  const json = await res.json();
  // API は { success: true, data: ... } の形式
  return (json.data ?? json) as T;
}

// --------------------------------------------------------
// GET /levels
// --------------------------------------------------------
export async function fetchLevels(): Promise<{ levels: LevelInfo[]; maxLevel: number }> {
  return apiFetch('/levels');
}

// --------------------------------------------------------
// GET /questions?level=&count=&type=
// --------------------------------------------------------
export interface FetchQuestionsParams {
  level: number;
  count: number;
  type?: 'vocabulary' | 'grammar';
}

export async function fetchQuestions(
  params: FetchQuestionsParams
): Promise<{ questions: ApiQuestion[]; level: number; count: number }> {
  const qs = new URLSearchParams({
    level: String(params.level),
    count: String(params.count),
    ...(params.type ? { type: params.type } : {}),
  });
  return apiFetch(`/questions?${qs.toString()}`);
}

// --------------------------------------------------------
// POST /sessions
// --------------------------------------------------------
export interface SaveSessionParams {
  level: number;
  questionCount: number;
  score: number;
  totalQuestions: number;
  courseType: string;
}

export async function saveSession(params: SaveSessionParams): Promise<{ sessionId: string }> {
  const url = `${API_BASE}/sessions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    // セッション保存失敗はサイレントに処理（クイズ体験を壊さない）
    console.warn(`saveSession failed: ${res.status}`);
    return { sessionId: '' };
  }

  const json = await res.json();
  return json.data ?? json;
}
