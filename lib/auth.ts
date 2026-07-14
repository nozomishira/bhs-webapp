/**
 * Cognito 認証ユーティリティ
 * Hosted UI (PKCE フロー) を使用
 */

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '';
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI ?? '';
const LOGOUT_URI = process.env.NEXT_PUBLIC_AUTH_LOGOUT_URI ?? '';

// トークンをメモリに保持（XSS 対策として localStorage より安全）
let accessToken: string | null = null;
let idToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: number = 0;

// --------------------------------------------------------
// PKCE ヘルパー
// --------------------------------------------------------
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, length);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// --------------------------------------------------------
// ログイン
// --------------------------------------------------------
export async function login(): Promise<void> {
  // 古い PKCE 情報をクリア
  sessionStorage.removeItem('pkce_code_verifier');

  const codeVerifier = generateRandomString(64);
  const codeChallenge = base64urlEncode(await sha256(codeVerifier));

  sessionStorage.setItem('pkce_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid email profile',
    identity_provider: 'Google',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  window.location.href = `https://${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
}

// --------------------------------------------------------
// コールバック処理（認可コード → トークン交換）
// --------------------------------------------------------
export async function handleCallback(code: string): Promise<boolean> {
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  if (!codeVerifier) {
    console.error('PKCE code_verifier not found');
    return false;
  }

  try {
    const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
      }),
    });

    if (!res.ok) {
      console.error('Token exchange failed:', await res.text());
      return false;
    }

    const data = await res.json();
    setTokens(data.access_token, data.id_token, data.refresh_token, data.expires_in);
    sessionStorage.removeItem('pkce_code_verifier');
    return true;
  } catch (err) {
    console.error('Token exchange error:', err);
    return false;
  }
}

// --------------------------------------------------------
// トークンリフレッシュ
// --------------------------------------------------------
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      console.error('Token refresh failed');
      clearTokens();
      return false;
    }

    const data = await res.json();
    setTokens(data.access_token, data.id_token, refreshToken, data.expires_in);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// --------------------------------------------------------
// トークン管理
// --------------------------------------------------------
function setTokens(access: string, id: string, refresh: string | null, expiresIn: number): void {
  accessToken = access;
  idToken = id;
  refreshToken = refresh ?? refreshToken;
  tokenExpiry = Date.now() + expiresIn * 1000;

  // localStorage に保存（ページ遷移でメモリが消えるため）
  localStorage.setItem('bhs_access_token', access);
  localStorage.setItem('bhs_id_token', id);
  localStorage.setItem('bhs_token_expiry', String(tokenExpiry));
  if (refresh) {
    localStorage.setItem('bhs_refresh_token', refresh);
  }
}

function clearTokens(): void {
  accessToken = null;
  idToken = null;
  refreshToken = null;
  tokenExpiry = 0;
  localStorage.removeItem('bhs_access_token');
  localStorage.removeItem('bhs_id_token');
  localStorage.removeItem('bhs_refresh_token');
  localStorage.removeItem('bhs_token_expiry');
}

// --------------------------------------------------------
// 公開 API
// --------------------------------------------------------

/** 有効なアクセストークンを取得。期限切れならリフレッシュを試みる */
export async function getAccessToken(): Promise<string | null> {
  // メモリになければ localStorage から復元
  if (!accessToken) {
    const stored = localStorage.getItem('bhs_access_token');
    const storedExpiry = localStorage.getItem('bhs_token_expiry');
    if (stored && storedExpiry) {
      accessToken = stored;
      idToken = localStorage.getItem('bhs_id_token');
      refreshToken = localStorage.getItem('bhs_refresh_token');
      tokenExpiry = Number(storedExpiry);
    }
  }

  // トークンが有効期限内ならそのまま返す
  if (accessToken && Date.now() < tokenExpiry - 60000) {
    return accessToken;
  }

  // リフレッシュを試みる
  if (!refreshToken) {
    refreshToken = localStorage.getItem('bhs_refresh_token');
  }
  if (refreshToken) {
    const success = await refreshAccessToken();
    if (success) return accessToken;
  }

  return null;
}

/** ログイン済みかどうか（同期的に判定） */
export function isAuthenticated(): boolean {
  if (accessToken) return true;
  return !!(localStorage.getItem('bhs_access_token') || localStorage.getItem('bhs_refresh_token'));
}

/** ログアウト */
export function logout(): void {
  clearTokens();
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: LOGOUT_URI,
  });
  window.location.href = `https://${COGNITO_DOMAIN}/logout?${params.toString()}`;
}

/** ID トークンからユーザー情報を取得 */
export function getUserInfo(): { email?: string; name?: string; picture?: string } | null {
  const token = idToken ?? localStorage.getItem('bhs_id_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

/** 初期化（ページロード時にトークンを復元） */
export async function initAuth(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
