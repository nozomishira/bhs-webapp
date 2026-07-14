'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleCallback } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
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
        router.replace('/');
      } else {
        setError('ログインに失敗しました。もう一度お試しください。');
      }
    });
  }, [searchParams, router]);

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
