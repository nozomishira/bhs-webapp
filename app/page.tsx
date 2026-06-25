'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getTotalStats } from '@/utils/storage';

export default function Home() {
  const [stats, setStats] = useState({ totalLessons: 0, averageAccuracy: 0 });

  useEffect(() => {
    setStats(getTotalStats());
  }, []);

  const courses = [
    {
      id: 'vocabulary',
      title: '単語',
      icon: '📚',
      description: 'インドネシア語の基本的な単語を学習します',
      color: 'from-orange-400 to-orange-600',
      href: '/quiz/vocabulary',
      external: false,
    },
    {
      id: 'grammar',
      title: '文法',
      icon: '✍️',
      description: 'インドネシア語の文法規則を理解します',
      color: 'from-red-400 to-red-600',
      href: '/quiz/grammar',
      external: false,
    },
    {
      id: 'reading',
      title: '長文読解',
      icon: '📖',
      description: '長めのテキストを読んで理解を深めます',
      color: 'from-amber-400 to-amber-600',
      href: '/quiz/reading',
      external: false,
    },
    {
      id: 'examInfo',
      title: '検定情報',
      icon: '🏅',
      description: '公式サイトで最新の検定情報をチェックします',
      color: 'from-yellow-400 to-yellow-600',
      href: 'https://www.i-kentei.com/',
      external: true,
    },
    {
      id: 'examPrep',
      title: '検定対策',
      icon: '🧠',
      description: '検定用の問題集で合格を目指します',
      color: 'from-amber-500 to-yellow-600',
      href: '/quiz/exam',
      external: false,
    },
    {
      id: 'blog',
      title: 'インドネシアブログ',
      icon: '✈️',
      description: 'インドネシア文化と言語について学びます',
      color: 'from-rose-400 to-rose-600',
      href: '/blog',
      external: false,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.14),transparent_25%)] pointer-events-none" />
      <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-white/20 blur-3xl opacity-70" />

      <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-white/90 px-5 py-2 text-sm font-semibold text-orange-700 shadow-sm">
              <span className="text-xl">🇮🇩</span>
              いま始める、暮らしに近いインドネシア語
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
                旅行でも勉強でも使える、
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">本物のインドネシア語</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                単語・会話・文法・検定対策に加えて、現地の文化や食も一緒に学べる
                学習ポータルです。毎日15分で実践力を伸ばしましょう。
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/quiz/vocabulary" className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-4 text-white font-semibold shadow-xl shadow-red-200/40 transition hover:bg-red-700">
                まずは単語から
              </Link>
              <Link href="/blog" className="inline-flex items-center justify-center rounded-full border border-red-300 bg-white px-8 py-4 text-red-700 font-semibold shadow-sm transition hover:bg-red-50">
                コラムを見る
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/50">
                <p className="text-sm font-semibold text-orange-600">FEATURE</p>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">旅先ですぐに使える表現</h2>
                <p className="mt-3 text-slate-700">空港・レストラン・ホテルなど、実際の場面を想定した問題で学べます。</p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/50">
                <p className="text-sm font-semibold text-orange-600">OUTCOME</p>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">検定にも対応</h2>
                <p className="mt-3 text-slate-700">JLPTのようにレベルごとの学習設計で、段階的に実力を伸ばせます。</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-slate-100/80 shadow-2xl shadow-red-200">
            <div className="relative h-[560px] sm:h-[540px] md:h-[520px] lg:h-[580px]">
              <Image
                src="/images/harry-kessell-eE2trMn-6a0-unsplash.jpg"
                alt="Indonesia learning"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 520px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] bg-white/95 p-6 shadow-xl border border-slate-200 backdrop-blur">
                <p className="text-sm text-slate-500">今日のレッスン</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">「旅の会話」ミニクイズ</h2>
                <p className="mt-2 text-slate-700">食事・買い物・挨拶まで、現地で役立つ表現を短時間でチェック。</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">学習の流れ</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">毎日の学習が続く理由</h2>
            </div>
            <p className="max-w-xl text-base text-slate-700">短時間で取り組める構成と、使える表現を中心にした問題で気軽に毎日続けられます。</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-orange-100 text-orange-700 font-bold text-lg">1</div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">シンプルな単語カード</h3>
              <p className="mt-3 text-slate-700">身近な表現から始めて、少しずつ語彙を定着させます。</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-red-100 text-red-700 font-bold text-lg">2</div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">実践的な文法パート</h3>
              <p className="mt-3 text-slate-700">会話で使いやすい文法を、例文と一緒に理解します。</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 font-bold text-lg">3</div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">読み物で文化を体感</h3>
              <p className="mt-3 text-slate-700">文化や旅行内容も一緒に学び、言葉の意味がもっと深まります。</p>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-red-600 to-orange-600 p-6 shadow-xl flex flex-col justify-center">
            <p className="text-sm font-semibold text-white/80">特徴</p>
            <h3 className="mt-3 text-2xl font-bold text-white">実践重視の学習設計</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex gap-2 text-white/95 text-sm">
                <span>✓</span>
                旅行会話・検定対策
              </li>
              <li className="flex gap-2 text-white/95 text-sm">
                <span>✓</span>
                文化コラム付き
              </li>
              <li className="flex gap-2 text-white/95 text-sm">
                <span>✓</span>
                短時間で毎日続く
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-orange-100 to-amber-50 p-8 shadow-xl">
            <p className="text-sm font-semibold text-orange-700">注目コース</p>
            <div className="mt-6 space-y-4">
              {courses.map((course) => {
                const Wrapper = course.external ? 'a' : Link;
                const wrapperProps = course.external
                  ? { href: course.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: course.href };

                return (
                  <Wrapper
                    key={course.id}
                    {...wrapperProps}
                    className="block rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xl font-bold text-slate-900">{course.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                      </div>
                      <div className="text-3xl">{course.icon}</div>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        </section>

        {stats.totalLessons > 0 && (
          <section className="mt-16 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-orange-600">あなたの学習</p>
                <p className="mt-4 text-4xl font-bold text-slate-900">{stats.totalLessons}</p>
                <p className="text-slate-600 mt-2">レッスン完了</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-600">正答率</p>
                <p className="mt-4 text-4xl font-bold text-slate-900">{stats.averageAccuracy}%</p>
                <p className="text-slate-600 mt-2">平均スコア</p>
              </div>
            </div>
          </section>
        )}

        <div className="mt-16 text-center">
          <Link href="/quiz/vocabulary" className="inline-flex items-center justify-center rounded-full bg-red-600 px-10 py-4 text-white font-bold shadow-xl shadow-red-200/40 transition hover:bg-red-700 hover:scale-105">
            さっそく学習を始める 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}
