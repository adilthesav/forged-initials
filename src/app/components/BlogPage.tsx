import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, ChevronRight, BookOpen, TrendingUp } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from '../data/blogPosts';

interface BlogPageProps {
  onNavigate?: (page: string) => void;
}

function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-amber-100/60 hover:border-amber-200 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img src={post.coverImage} alt={post.coverAlt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.9)', color: '#2a1800' }}>
          {post.category}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3 text-[11px] text-stone-400 font-medium">
          <span>{post.date}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min read</span>
        </div>
        <h2 className="font-bold text-stone-800 text-base sm:text-lg leading-snug mb-2 group-hover:text-amber-800 transition-colors duration-200">{post.title}</h2>
        <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">{tag}</span>
            ))}
          </div>
          <span className="text-amber-600 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200">Read <ChevronRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </article>
  );
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === activeCategory);
  const featured = BLOG_POSTS[0];
  const goToPost = (post: BlogPost) => navigate(`/blog/${post.slug}`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-stone-50/30">
      <div className="pt-12 pb-10 text-center px-4">
        <p className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{ color: '#c9a84c' }}>✦ The Forged Journal ✦</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mb-4 tracking-tight">Stories, Tips & Craft</h1>
        <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">Everything we know about sterling silver jewelry — care, craft, style, and the story behind each piece.</p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div onClick={() => goToPost(featured)} className="group cursor-pointer relative rounded-3xl overflow-hidden mb-12 aspect-[21/9] min-h-[280px]">
          <img src={featured.coverImage} alt={featured.coverAlt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <span className="w-fit text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3" style={{ background: 'rgba(201,168,76,0.9)', color: '#2a1800' }}>{featured.category}</span>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl max-w-lg leading-snug mb-2 group-hover:text-amber-100 transition-colors duration-200">{featured.title}</h2>
            <p className="text-white/70 text-sm max-w-md line-clamp-2 mb-4">{featured.excerpt}</p>
            <span className="text-amber-400 text-sm font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200">Read Article <ChevronRight className="w-4 h-4" /></span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {BLOG_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 flex-shrink-0"
              style={activeCategory === cat
                ? { background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', border: '1px solid rgba(201,168,76,0.4)', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6 text-stone-400 text-xs">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
          {activeCategory !== 'All' && (
            <><span>·</span><span className="text-amber-600 font-medium">{activeCategory}</span>
            <button onClick={() => setActiveCategory('All')} className="text-stone-400 hover:text-stone-600 underline underline-offset-2 ml-1">Clear</button></>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filtered.map(post => <PostCard key={post.id} post={post} onClick={() => goToPost(post)} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No articles in this category yet.</p>
            <button onClick={() => setActiveCategory('All')} className="mt-2 text-amber-600 text-sm font-semibold hover:underline">View all articles</button>
          </div>
        )}
      </div>
    </div>
  );
}
