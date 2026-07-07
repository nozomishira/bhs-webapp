'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { path: '/', label: 'ホーム' },
    { path: '/quiz/vocabulary', label: '単語' },
    { path: '/quiz/grammar', label: '文法' },
    { path: '/quiz/reading', label: '長文' },
    { path: '/quiz/exam', label: '検定' },
    { path: '/blog', label: 'ブログ' },
  ];

  return (
    <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg relative overflow-hidden">
      {/* バティック風背景パターン */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl transform group-hover:scale-110 transition-transform">🇮🇩</span>
            <span className="text-xl font-bold text-white">インドネシア語検定</span>
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-white text-red-700 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
