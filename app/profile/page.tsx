'use client';

import { useState, useEffect } from 'react';
import { fetchProfile, updateProfile, UserProfile } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

const GENDER_OPTIONS = [
  { value: 'unspecified', label: '未設定' },
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // フォーム state
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('ログインが必要です');
      setLoading(false);
      return;
    }

    fetchProfile()
      .then((p) => {
        setProfile(p);
        setDisplayName(p.displayName);
        setGender(p.gender);
        setBio(p.bio);
      })
      .catch((e) => {
        console.error(e);
        setError('プロフィールの取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updateProfile({ displayName, gender, bio });
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-lg mx-auto pt-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8">プロフィール</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* メールアドレス（読み取り専用） */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
            <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600 text-sm">{profile?.email}</p>
          </div>

          {/* ユーザー名 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ユーザー名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm"
              placeholder="表示名を入力（30文字以内）"
            />
          </div>

          {/* 性別 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">性別</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm"
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* プロフィール */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm resize-none"
              placeholder="自己紹介を入力（200文字以内）"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/200</p>
          </div>

          {/* エラー / 成功メッセージ */}
          {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
          {success && <p className="text-green-600 text-sm font-bold">保存しました</p>}

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
