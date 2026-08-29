import { useState, useMemo, useEffect } from 'react';
import { Eye, BookOpen, Search, X, ExternalLink } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from '../data/blogPosts';

const ADMIN_TOKEN = 'forgedadmin2026';

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => { if (pw === ADMIN_TOKEN) onAuth(); else { setErr(true); setPw(''); } };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-white px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-stone-100">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)' }}>
          <BookOpen className="w-6 h-6 text-amber-900" />
        </div>
        <h1 className="text-xl font-bold text-stone-800 text-center mb-1">Blog Admin</h1>
        <p className="text-stone-400 text-sm text-center mb-6">Forged Initials</p>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Admin password"
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all ${err ? 'border-red-400 bg-red-50' : 'border-stone-200'}`} />
        {err && <p className="text-red-500 text-xs mt-1.5">Incorrect password.</p>}
        <button onClick={submit} className="w-full py-3 mt-4 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>Enter</button>
      </div>
    </div>
  );
}

function PostViewer({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(15,12,9,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010' }}>{post.category}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>Published</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-50 transition-all">
              <ExternalLink className="w-3 h-3" /> View Live
            </a>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-all">
              <X className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>
        {post.coverImage && (
          <div className="aspect-[16/7] overflow-hidden">
            <img src={post.coverImage} alt={post.coverAlt} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <p className="text-[11px] text-stone-400 mb-2">{post.date} · {post.readTime} min read</p>
          <h2 className="text-xl font-bold text-stone-800 mb-3 leading-snug">{post.title}</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-4 border-l-2 border-amber-300 pl-3 italic">{post.excerpt}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-50 text-stone-500 border border-stone-200">{tag}</span>)}
          </div>
          <div className="bg-stone-50 rounded-xl p-4 text-xs text-stone-500 space-y-1">
            <p><span className="font-semibold text-stone-700">SEO Title:</span> {post.seoTitle}</p>
            <p><span className="font-semibold text-stone-700">SEO Desc:</span> {post.seoDescription}</p>
            <p><span className="font-semibold text-stone-700">Slug:</span> /blog/{post.slug}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OwnerBlogPanel() {
  const [authed, setAuthed] = useState(false);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<BlogPost | null>(null);

  const filtered = useMemo(() =>
    !search ? BLOG_POSTS : BLOG_POSTS.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pt-20 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Blog Admin</h1>
            <p className="text-stone-400 text-sm mt-0.5">{BLOG_POSTS.length} posts · {BLOG_POSTS.length} published</p>
          </div>
          <a href="/blog" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-amber-200 text-amber-700 hover:bg-amber-50 transition-all">
            <ExternalLink className="w-4 h-4" /> View Blog
          </a>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-all"
            placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {BLOG_CATEGORIES.filter(c => c !== 'All').map(cat => (
            <span key={cat} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 bg-white">{cat}</span>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-stone-100 px-4 py-3 flex items-center gap-4 hover:border-amber-200 transition-all group">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                {post.coverImage
                  ? <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-stone-300" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-stone-800 text-sm truncate group-hover:text-amber-800 transition-colors">{post.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>Live</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 truncate">{post.category} · {post.date} · {post.readTime} min read</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setViewing(post)} title="Preview" className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-amber-50 transition-all">
                  <Eye className="w-4 h-4 text-amber-600" />
                </button>
                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" title="View live"
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-all">
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-stone-200" />
            <p className="text-stone-400 font-medium">No posts match your search.</p>
          </div>
        )}

        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700">
          <p className="font-semibold mb-1">To add or edit blog posts</p>
          <p>Update <code className="bg-amber-100 px-1 rounded font-mono">src/app/data/blogPosts.ts</code> in GitHub and commit — changes go live on the next Netlify deploy.</p>
        </div>
      </div>

      {viewing && <PostViewer post={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
