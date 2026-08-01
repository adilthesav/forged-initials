import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Clock, ChevronRight, BookOpen, TrendingUp, RefreshCw } from 'lucide-react';

const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  published: boolean;
  created_at: string;
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <article onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-amber-100/60 hover:border-amber-200 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1">
      <div className="relative overflow-hidden aspect-[16/9] bg-stone-100">
        {post.cover_image_url
          ? <img src={post.cover_image_url} alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-stone-200" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {post.tags[0] && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(201,168,76,0.9)', color: '#2a1800' }}>
            {post.tags[0]}
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3 text-[11px] text-stone-400 font-medium">
          <span>{date}</span>
        </div>
        <h2 className="font-bold text-stone-800 text-base sm:text-lg leading-snug mb-2 group-hover:text-amber-800 transition-colors duration-200">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
        )}
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

export function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    setLoading(true);
    fetch(`${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` },
    })
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('Could not load posts.'); setLoading(false); });
  }, []);

  const allTags = ['All', ...Array.from(new Set(posts.flatMap(p => p.tags)))];
  const filtered = activeTag === 'All' ? posts : posts.filter(p => p.tags.includes(activeTag));
  const featured = filtered[0];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400 flex-col gap-3">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="text-amber-600 font-semibold text-sm hover:underline">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-stone-50/30">
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

        {posts.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No articles published yet.</p>
            <p className="text-sm mt-1 text-stone-300">Check back soon.</p>
          </div>
        )}

        {featured && (
          <div onClick={() => navigate(`/blog/${featured.slug}`)}
            className="group cursor-pointer relative rounded-3xl overflow-hidden mb-12 aspect-[21/9] min-h-[280px] bg-stone-100">
            {featured.cover_image_url
              ? <img src={featured.cover_image_url} alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              : <div className="absolute inset-0 flex items-center justify-center bg-stone-100"><BookOpen className="w-16 h-16 text-stone-200" /></div>}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Latest</span>
              </div>
              <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl max-w-lg leading-snug mb-2 group-hover:text-amber-100 transition-colors">
                {featured.title}
              </h2>
              {featured.excerpt && <p className="text-white/70 text-sm max-w-md line-clamp-2 mb-4">{featured.excerpt}</p>}
              <span className="text-amber-400 text-sm font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Read Article <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}

        {allTags.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 flex-shrink-0"
                style={activeTag === tag
                  ? { background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', border: '1px solid rgba(201,168,76,0.4)', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                  : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center gap-2 mb-6 text-stone-400 text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} onClick={() => navigate(`/blog/${post.slug}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
