import { useState } from 'react';
import { ArrowLeft, Clock, Tag, ChevronRight, BookOpen, TrendingUp } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from '../data/blogPosts';

interface BlogPageProps {
  onNavigate: (page: string) => void;
}

function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-amber-100/60 hover:border-amber-200 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1"
    >
      {/* Cover image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={post.coverImage}
          alt={post.coverAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span
          className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(201,168,76,0.9)', color: '#2a1800' }}
        >
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3 text-[11px] text-stone-400 font-medium">
          <span>{post.date}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime} min read
          </span>
        </div>

        <h2 className="font-bold text-stone-800 text-base sm:text-lg leading-snug mb-2 group-hover:text-amber-800 transition-colors duration-200">
          {post.title}
        </h2>

        <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-amber-600 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
            Read <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

function PostView({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-8 hover:gap-3 transition-all duration-200 group mt-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
        Back to Journal
      </button>

      {/* Category + date */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010', border: '1px solid rgba(201,168,76,0.3)' }}
        >
          {post.category}
        </span>
        <span className="text-stone-400 text-xs">{post.date}</span>
        <span className="text-stone-300">·</span>
        <span className="text-stone-400 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />{post.readTime} min read
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 leading-tight mb-4">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 border-l-2 border-amber-300 pl-4 italic">
        {post.excerpt}
      </p>

      {/* Cover image */}
      <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9]">
        <img src={post.coverImage} alt={post.coverAlt} className="w-full h-full object-cover" />
      </div>

      {/* Body content */}
      <div
        className="prose prose-stone prose-sm sm:prose-base max-w-none
          prose-headings:font-bold prose-headings:text-stone-800
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
          prose-p:text-stone-600 prose-p:leading-relaxed
          prose-li:text-stone-600 prose-li:leading-relaxed
          prose-strong:text-stone-800 prose-strong:font-semibold
          prose-ul:pl-5 prose-ul:space-y-1"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      <div className="mt-12 pt-8 border-t border-stone-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-1.5">
          <Tag className="w-3 h-3" /> Tags
        </p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-stone-50 text-stone-500 border border-stone-200">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filtered = activeCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory);

  const featured = BLOG_POSTS[0];

  if (selectedPost) {
    return (
      <div className="pt-4 min-h-screen bg-gradient-to-b from-amber-50/40 to-white">
        <PostView post={selectedPost} onBack={() => setSelectedPost(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-stone-50/30">
      {/* Header */}
      <div className="pt-12 pb-10 text-center px-4">
        <p className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{ color: '#c9a84c' }}>
          ✦ The Forged Journal ✦
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mb-4 tracking-tight">
          Stories, Tips & Craft
        </h1>
        <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Everything we know about sterling silver jewelry — care, craft, style, and the story behind each piece.
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

        {/* Featured post */}
        <div
          onClick={() => setSelectedPost(featured)}
          className="group cursor-pointer relative rounded-3xl overflow-hidden mb-12 aspect-[21/9] min-h-[280px]"
        >
          <img
            src={featured.coverImage}
            alt={featured.coverAlt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <span
              className="w-fit text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{ background: 'rgba(201,168,76,0.9)', color: '#2a1800' }}
            >
              {featured.category}
            </span>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl max-w-lg leading-snug mb-2 group-hover:text-amber-100 transition-colors duration-200">
              {featured.title}
            </h2>
            <p className="text-white/70 text-sm max-w-md line-clamp-2 mb-4">{featured.excerpt}</p>
            <span className="text-amber-400 text-sm font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200">
              Read Article <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 flex-shrink-0"
              style={
                activeCategory === cat
                  ? { background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', border: '1px solid rgba(201,168,76,0.4)', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                  : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-2 mb-6 text-stone-400 text-xs">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
          {activeCategory !== 'All' && (
            <>
              <span>·</span>
              <span className="text-amber-600 font-medium">{activeCategory}</span>
              <button onClick={() => setActiveCategory('All')} className="text-stone-400 hover:text-stone-600 underline underline-offset-2 ml-1">
                Clear
              </button>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No articles in this category yet.</p>
            <button onClick={() => setActiveCategory('All')} className="mt-2 text-amber-600 text-sm font-semibold hover:underline">
              View all articles
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
