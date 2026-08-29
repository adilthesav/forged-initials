import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, BookOpen, Search, X, Save, ExternalLink, AlertTriangle } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from '../data/blogPosts';

const ADMIN_TOKEN = 'forgedadmin2026';
const STORAGE_KEY = 'forged_blog_posts';

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadPosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // First visit: seed with static posts
  const seeded = BLOG_POSTS.map(p => ({ ...p }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function savePosts(posts: BlogPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function newId() {
  return `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const BLANK_POST: BlogPost = {
  id: '',
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'Style Tips',
  tags: [],
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  readTime: 3,
  coverImage: '',
  coverAlt: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

// ── Auth Gate ─────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => { if (pw === ADMIN_TOKEN) onAuth(); else { setErr(true); setPw(''); } };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-white px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-stone-100">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)' }}>
          <BookOpen className="w-6 h-6 text-amber-900" />
        </div>
        <h1 className="text-xl font-bold text-stone-800 text-center mb-1">Blog Admin</h1>
        <p className="text-stone-400 text-sm text-center mb-6">Forged Initials</p>
        <input type="password" value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Admin password"
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all ${err ? 'border-red-400 bg-red-50' : 'border-stone-200'}`}
        />
        {err && <p className="text-red-500 text-xs mt-1.5">Incorrect password.</p>}
        <button onClick={submit} className="w-full py-3 mt-4 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
          Enter
        </button>
      </div>
    </div>
  );
}

// ── Post Form Modal ───────────────────────────────────────────────────────────
function PostForm({ initial, onSave, onCancel }: {
  initial: BlogPost;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<BlogPost>({ ...initial });
  const [tagsStr, setTagsStr] = useState(initial.tags.join(', '));
  const [tab, setTab] = useState<'content' | 'seo'>('content');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (k: keyof BlogPost, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (val: string) => {
    set('title', val);
    if (!initial.id) set('slug', slugify(val));
    if (!form.seoTitle) set('seoTitle', `${val} | Forged Initials`);
  };

  const handleSave = () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.excerpt.trim()) { setError('Excerpt is required.'); return; }
    const slug = form.slug.trim() || slugify(form.title);
    onSave({ ...form, slug, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) });
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(15,12,9,0.72)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-800">{initial.id ? 'Edit Post' : 'New Post'}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={onCancel}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-all">
              <X className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-6">
          {(['content', 'seo'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="py-3 px-1 mr-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all capitalize"
              style={tab === t ? { borderColor: '#c9a84c', color: '#8a6010' } : { borderColor: 'transparent', color: '#a8a29e' }}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          {tab === 'content' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Title *</label>
                <input className={inputCls} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Your post title" />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input className={inputCls} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated-from-title" />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                  {BLOG_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} placeholder="August 29, 2026" />
              </div>
              <div>
                <label className={labelCls}>Read Time (min)</label>
                <input type="number" min="1" className={inputCls} value={form.readTime} onChange={e => set('readTime', parseInt(e.target.value) || 1)} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Excerpt *</label>
                <textarea className={inputCls} rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Brief summary shown on the blog listing page…" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Cover Image URL</label>
                <input className={inputCls} value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://images.unsplash.com/…" />
                {form.coverImage && (
                  <img src={form.coverImage} alt="" className="mt-2 w-full h-32 object-cover rounded-xl border border-stone-200" />
                )}
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Cover Alt Text</label>
                <input className={inputCls} value={form.coverAlt} onChange={e => set('coverAlt', e.target.value)} placeholder="Describe the image for accessibility" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Tags (comma-separated)</label>
                <input className={inputCls} value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="jewelry care, stainless steel, tips" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Content (HTML)</label>
                <textarea className={`${inputCls} font-mono text-xs`} rows={16} value={form.content}
                  onChange={e => set('content', e.target.value)}
                  placeholder={'<h2>Section Title</h2>\n<p>Your paragraph here…</p>\n<ul>\n  <li>Point one</li>\n</ul>'} />
                <p className="text-[10px] text-stone-400 mt-1">Use standard HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;</p>
              </div>
            </div>
          )}

          {tab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>SEO Title</label>
                <input className={inputCls} value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="Post Title | Forged Initials" />
              </div>
              <div>
                <label className={labelCls}>SEO Description</label>
                <textarea className={inputCls} rows={3} value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} placeholder="150–160 character description…" />
                <p className="text-[10px] text-stone-400 mt-1">{form.seoDescription.length} / 160 chars</p>
              </div>
              <div>
                <label className={labelCls}>SEO Keywords</label>
                <input className={inputCls} value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} placeholder="jewelry, stainless steel, personalized" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Post Preview Modal ────────────────────────────────────────────────────────
function PostPreview({ post, onClose }: { post: BlogPost; onClose: () => void }) {
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
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010' }}>{post.category}</span>
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
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-50 text-stone-500 border border-stone-200">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export function OwnerBlogPanel() {
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [previewing, setPreviewing] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (authed) setPosts(loadPosts());
  }, [authed]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleSave = (post: BlogPost) => {
    let updated: BlogPost[];
    if (post.id) {
      updated = posts.map(p => p.id === post.id ? post : p);
      showToast('Post updated!');
    } else {
      updated = [{ ...post, id: newId() }, ...posts];
      showToast('Post created!');
    }
    savePosts(updated);
    setPosts(updated);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updated = posts.filter(p => p.id !== deleteId);
    savePosts(updated);
    setPosts(updated);
    setDeleteId(null);
    showToast('Post deleted.');
  };

  const filtered = useMemo(() =>
    !search ? posts : posts.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ), [posts, search]);

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pt-20 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Blog Admin</h1>
            <p className="text-stone-400 text-sm mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/blog" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> View Blog
            </a>
            <button onClick={() => setEditing({ ...BLANK_POST })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all"
            placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {BLOG_CATEGORIES.filter(c => c !== 'All').map(cat => (
            <button key={cat} onClick={() => setSearch(cat)}
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 bg-white hover:border-amber-300 hover:text-amber-700 transition-all">
              {cat}
            </button>
          ))}
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-red-200 text-red-400 bg-white hover:bg-red-50 transition-all">
              ✕ Clear
            </button>
          )}
        </div>

        {/* Post list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-stone-200" />
            <p className="text-stone-400 font-medium mb-2">{posts.length === 0 ? 'No posts yet.' : 'No posts match your search.'}</p>
            {posts.length === 0 && (
              <button onClick={() => setEditing({ ...BLANK_POST })}
                className="text-amber-600 text-sm font-semibold hover:underline">
                Create your first post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(post => (
              <div key={post.id}
                className="bg-white rounded-2xl border border-stone-100 px-4 py-3 flex items-center gap-4 hover:border-amber-200 transition-all group">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  {post.coverImage
                    ? <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-stone-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-stone-800 text-sm truncate group-hover:text-amber-800 transition-colors">{post.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>Live</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                    {post.category} · {post.date} · {post.readTime} min read
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setPreviewing(post)} title="Preview"
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-amber-50 transition-all">
                    <Eye className="w-4 h-4 text-amber-600" />
                  </button>
                  <button onClick={() => setEditing({ ...post })} title="Edit"
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-amber-50 transition-all">
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" title="View live"
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-all">
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </a>
                  <button onClick={() => setDeleteId(post.id)} title="Delete"
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit form */}
      {editing && (
        <PostForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {/* Preview modal */}
      {previewing && (
        <PostPreview post={previewing} onClose={() => setPreviewing(null)} />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,12,9,0.7)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-stone-800 mb-2">Delete this post?</h3>
            <p className="text-stone-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
          {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
