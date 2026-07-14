/**
 * bhs-webapi クライアント
 *
 * 静的エクスポート (output: 'export') のためすべて Client-side fetch。
 * NEXT_PUBLIC_API_BASE_URL が未設定の場合はローカルの mock データにフォールバック。
 */
import { ApiQuestion, LevelInfo } from '@/types/question';
import { getAccessToken } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// --------------------------------------------------------
// 共通 fetch ラッパー
// --------------------------------------------------------
async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    cache: 'no-store',
  });

  if (res.status === 401) {
    // トークン無効 → ログインページへ
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}

// --------------------------------------------------------
// GET /levels
// --------------------------------------------------------
export async function fetchLevels(type?: 'vocabulary' | 'grammar'): Promise<{ levels: LevelInfo[]; maxLevel: number }> {
  const qs = type ? `?type=${type}` : '';
  return apiFetch(`/levels${qs}`);
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
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

// --------------------------------------------------------
// Chat API
// --------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatScenario {
  id: string;
  name: string;
  description: string;
}

export async function fetchChatScenarios(): Promise<{ scenarios: ChatScenario[] }> {
  return apiFetch('/chat/scenarios');
}

export interface PostChatParams {
  scenarioId: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  scenarioId: string;
  usage: { inputTokens: number; outputTokens: number };
}

export async function postChat(params: PostChatParams): Promise<ChatResponse> {
  const url = `${API_BASE}/chat`;
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Chat API error ${res.status}: ${errorBody}`);
  }

  const json = await res.json();
  return (json.data ?? json) as ChatResponse;
}

// --------------------------------------------------------
// POST /chat/evaluate - 採点
// --------------------------------------------------------

export interface EvaluationCategory {
  score: number;
  comment: string;
}

export interface ChatEvaluation {
  totalScore: number;
  grammar: EvaluationCategory;
  spelling: EvaluationCategory;
  vocabulary: EvaluationCategory;
  communication: EvaluationCategory;
  naturalness: EvaluationCategory;
  goodPoints: string[];
  improvements: string[];
}

export interface EvaluateResponse {
  evaluation: ChatEvaluation;
  scenarioId: string;
  messageCount: number;
}

export async function evaluateChat(params: PostChatParams): Promise<EvaluateResponse> {
  const url = `${API_BASE}/chat/evaluate`;
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Evaluate API error ${res.status}: ${errorBody}`);
  }

  const json = await res.json();
  return (json.data ?? json) as EvaluateResponse;
}

// --------------------------------------------------------
// Chat History API
// --------------------------------------------------------

export interface ChatHistoryItem {
  sessionId: string;
  scenarioId: string;
  scenarioName: string;
  messageCount: number;
  score: number | null;
  createdAt: string;
}

export async function fetchChatHistory(): Promise<{ sessions: ChatHistoryItem[] }> {
  return apiFetch('/chat/history');
}

export interface ChatHistoryDetail {
  sessionId: string;
  scenarioId: string;
  scenarioName: string;
  messages: ChatMessage[];
  evaluation: ChatEvaluation | null;
  createdAt: string;
}

export async function fetchChatHistoryDetail(sessionId: string): Promise<ChatHistoryDetail> {
  return apiFetch(`/chat/history/${sessionId}`);
}

export interface SaveChatHistoryParams {
  scenarioId: string;
  scenarioName: string;
  messages: ChatMessage[];
  evaluation?: ChatEvaluation;
}

export async function saveChatHistory(params: SaveChatHistoryParams): Promise<{ sessionId: string }> {
  const url = `${API_BASE}/chat/history`;
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    console.warn(`saveChatHistory failed: ${res.status}`);
    return { sessionId: '' };
  }

  const json = await res.json();
  return (json.data ?? json) as { sessionId: string };
}

// --------------------------------------------------------
// Profile API
// --------------------------------------------------------

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  gender: string;
  bio: string;
  createdAt: string;
}

export async function fetchProfile(): Promise<UserProfile> {
  return apiFetch('/profile');
}

export interface UpdateProfileParams {
  displayName?: string;
  gender?: string;
  bio?: string;
}

export async function updateProfile(params: UpdateProfileParams): Promise<UserProfile> {
  const url = `${API_BASE}/profile`;
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Update profile failed: ${res.status}`);
  }

  const json = await res.json();
  return (json.data ?? json) as UserProfile;
}
