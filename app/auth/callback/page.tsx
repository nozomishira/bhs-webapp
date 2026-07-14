'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { handleCallback } from '@/lib/auth';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('認可コードが見つかりません');
      return;
    }

    handleCallback(code).then((success) => {
      if (success) {
        // フルリロードで localStorage からトークンを読み込ませる
        window.location.href = '/';
      } else {
        setError('ログインに失敗しました。もう一度お試しください。');
      }
    });
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <a href="/" className="text-blue-600 underline">ホームに戻る</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
        <p className="text-gray-600">ログイン中...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
