import Image from 'next/image';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'インドネシア語の基本表現',
      excerpt: 'インドネシアへの旅に必要な基本的な挨拶と表現を学ぼう',
      date: '2026年5月1日',
      category: '日常会話',
      imageSrc: '/images/afif-ramdhasuma-XYQPyn4KkiY-unsplash.jpg',
    },
    {
      id: 2,
      title: 'バリ島の文化と言語',
      excerpt: 'バリ島の独特な文化とそこで使われる言語について',
      date: '2026年4月28日',
      category: '文化',
      imageSrc: '/images/pukpik-aB46yUmsMp0-unsplash.jpg',
    },
    {
      id: 3,
      title: 'インドネシア料理と食べ物の名前',
      excerpt: 'インドネシアの美味しい料理と、その名前をインドネシア語で学ぼう',
      date: '2026年4月25日',
      category: '文化',
      imageSrc: '/images/ifan-bima-B04Xpnu5JQ4-unsplash.jpg',
    },
    {
      id: 4,
      title: 'インドネシア検定の勉強法',
      excerpt: '効率的な勉強法で検定合格を目指そう',
      date: '2026年4月22日',
      category: '学習法',
      imageSrc: '/images/sebastian-pena-lambarri-U_i6h9Y50wQ-unsplash.jpg',
    },
    {
      id: 5,
      title: 'ジャカルタの見どころ',
      excerpt: 'インドネシアの首都ジャカルタの魅力を発見',
      date: '2026年4月19日',
      category: '旅行',
      imageSrc: '/images/jason-cooper-XEhchWQuWyM-unsplash.jpg',
    },
    {
      id: 6,
      title: 'インドネシア語のイントネーション',
      excerpt: 'ネイティブのようなイントネーションを身につけるコツ',
      date: '2026年4月16日',
      category: '発音',
      imageSrc: '/images/steve-douglas-ioJVccFmWxE-unsplash.jpg',
    },
  ];

  const categories = ['すべて', '日常会話', '文化', '学習法', '旅行', '発音'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            インドネシアブログ ✈️
          </h1>
          <p className="text-xl text-gray-700 font-medium mb-8">
            インドネシア文化、言語、旅行情報をお届けします
          </p>

          <div className="relative overflow-hidden rounded-[2rem] border border-red-100 shadow-2xl h-72 md:h-80">
            <Image
              src="/images/jeremy-bishop-QUwLZNchflk-unsplash.jpg"
              alt="Indonesia travel"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-orange-500/30" />
            <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                旅と学びをつなぐ
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                本場の空気を感じるインドネシア学習メディア
              </h2>
              <p className="mt-3 max-w-xl text-sm md:text-base text-white/90">
                言葉だけでなく、現地の文化や食、旅行スポットもいっしょに学べるブログです。
              </p>
            </div>
          </div>
        </div>

        {/* カテゴリーフィルター */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                category === 'すべて'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-red-100 border-2 border-red-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ブログ記事グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer overflow-hidden border-2 border-red-100"
            >
              {/* 記事の画像 */}
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={post.imageSrc}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* コンテンツ */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-600 font-medium">{post.date}</span>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {post.title}
                </h2>

                <p className="text-gray-700 text-sm mb-4">{post.excerpt}</p>

                <div className="text-red-600 font-bold hover:text-red-700">
                  続きを読む →
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 記事がもっとあることを示唆 */}
        <div className="text-center">
          <p className="text-gray-700 mb-4 font-medium">もっと記事を見る</p>
          <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg">
            すべての記事を表示
          </button>
        </div>
      </div>
    </div>
  );
}
