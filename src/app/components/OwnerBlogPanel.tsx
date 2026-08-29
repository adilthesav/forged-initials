import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, BookOpen, Search, AlertTriangle, ExternalLink } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  date: string;
  read_time: number;
  cover_image: string;
  cover_alt: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  published: boolean;
  created_at?: string;
}

const ADMIN_TOKEN = 'forgedadmin2026';
const CATEGORIES = ['Care & Maintenance', 'Gift Guides', 'Behind the Craft', 'Education', 'Style Tips'];

const BLANK: Omit<BlogPost, 'id' | 'created_at'> = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'Style Tips',
  tags: [],
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  read_time: 3,
  cover_image: '',
  cover_alt: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  published: false,
};

async function blogFetch(method: string, body?: object) {
  const res = await fetch('/.netlify/functions/admin-blog', {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function PostForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<BlogPost>;
  onSave: (data: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<BlogPost>>({ ...BLANK, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagsStr, setTagsStr] = useState((initial.tags || []).join(', '));
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  const set = (key: keyof BlogPost, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleTitleChange = (val: string) => {
    set('title', val);
    if (!initial.id) set('slug', slugify(val));
    if (!initial.id && !form.seo_title) set('seo_title', `${val} | Forged Initials`);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.excerpt) {
      setError('Title, slug, and excerpt are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) };
      await onSave(payload);
    } catch (e: any) {
      setError(e.message || 'Save failed.');
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(15,12,9,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-800">{initial.id ? 'Edit Post' : 'New Post'}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
              <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onCancel} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-all">
              <X className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>
        <div className="flex border-b border-stone-100 px-6">
          {(['content', 'seo'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="py-3 px-1 mr-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all capitalize" style={activeTab === tab ? { borderColor: '#c9a84c', color: '#8a6010' } : { borderColor: 'transparent', color: '#a8a29e' }}>
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}</div>}
          {activeTab === 'content' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={labelCls}>Title *</label><input className={inputCls} value={form.title || ''} onChange={e => handleTitleChange(e.target.value)} placeholder="How to Care for Your Jewelry" /></div>
              <div><label className={labelCls}>Slug *</label><input className={inputCls} value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="how-to-care-for-your-jewelry" /></div>
              <div><label className={labelCls}>Category</label><select className={inputCls} value={form.category || ''} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className={labelCls}>Date</label><input className={inputCls} value={form.date || ''} onChange={e => set('date', e.target.value)} placeholder="August 1, 2026" /></div>
              <div><label className={labelCls}>Read Time (min)</label><input type="number" min="1" className={inputCls} value={form.read_time || 3} onChange={e => set('read_time', parseInt(e.target.value) || 3)} /></div>
              <div className="col-span-2"><label className={labelCls}>Excerpt * (shown in listing)</label><textarea className={inputCls} rows={2} value={form.excerpt || ''} onChange={e => set('excerpt', e.target.value)} placeholder="A brief summary that appears on the blog listing page…" /></div>
              <div className="col-span-2"><label className={labelCls}>Cover Image URL</label><input className={inputCls} value={form.cover_image || ''} onChange={e => set('cover_image', e.target.value)} placeholder="https://images.unsplash.com/…" /></div>
              <div className="col-span-2"><label className={labelCls}>Cover Alt Text</label><input className={inputCls} value={form.cover_alt || ''} onChange={e => set('cover_alt', e.target.value)} placeholder="Describe the image for accessibility" /></div>
              <div className="col-span-2"><label className={labelCls}>Tags (comma-separated)</label><input className={inputCls} value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="jewelry care, stainless steel, tips" /></div>
              <div className="col-span-2">
                <label className={labelCls}>Content (HTML)</label>
                <textarea className={`${inputCls} font-mono text-xs`} rows={16} value={form.content || ''} onChange={e => set('content', e.target.value)} placeholder={'<h2>Section Title</h2>\n<p>Your paragraph here…</p>\n<ul>\n  <li>Point one</li>\n</ul>'} />
                <p className="text-[10px] text-stone-400 mt-1">Write standard HTML. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;.</p>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!form.published} onChange={e => set('published', e.target.checked)} />
                  <div className="w-10 h-6 bg-stone-200 peer-checked:bg-amber-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className="text-sm font-semibold text-stone-700">{form.published ? 'Published (visible on blog)' : 'Draft (hidden from visitors)'}</span>
              </div>
            </div>
          )}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div><label className={labelCls}>SEO Title</label><input className={inputCls} value={form.seo_title || ''} onChange={e => set('seo_title', e.target.value)} placeholder="How to Care for Your Jewelry | Forged Initials" /></div>
              <div><label className={labelCls}>SEO Description</label><textarea className={inputCls} rows={3} value={form.seo_description || ''} onChange={e => set('seo_description', e.target.value)} placeholder="150–160 character description for search engines…" /><p className="text-[10px] text-stone-400 mt-1">{(form.seo_description || '').length} / 160 chars</p></div>
              <div><label className={labelCls}>SEO Keywords</label><input className={inputCls} value={form.seo_keywords || ''} onChange={e => set('seo_keywords', e.target.value)} placeholder="jewelry care, stainless steel jewelry, tarnish-free" /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SetupBanner() {
  const [open, setOpen] = useState(false);
  const sql = `CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  category text,
  tags text[],
  date text,
  read_time int DEFAULT 3,
  cover_image text,
  cover_alt text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON blog_posts
  FOR SELECT USING (published = true);
CREATE POLICY "Service role full" ON blog_posts
  USING (true) WITH CHECK (true);`;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800 mb-1">One-time Supabase setup required</p>
          <p className="text-xs text-amber-700 mb-3">The blog needs a <code className="bg-amber-100 px-1 rounded">blog_posts</code> table in your Supabase project. Run the SQL below in the <strong>Supabase SQL Editor</strong> once.</p>
          <button onClick={() => setOpen(o => !o)} className="text-xs font-bold text-amber-700 hover:underline">{open ? 'Hide SQL ▲' : 'Show SQL ▼'}</button>
          {open && <pre className="mt-3 text-[10px] font-mono bg-stone-900 text-green-300 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">{sql}</pre>}
          <div className="mt-3">
            <a href="https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/sql/new" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 underline">
              Open Supabase SQL Editor <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => { if (pw === ADMIN_TOKEN) { onAuth(); } else { setErr(true); setPw(''); } };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-white px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-stone-100">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)' }}><BookOpen className="w-6 h-6 text-amber-900" /></div>
        <h1 className="text-xl font-bold text-stone-800 text-center mb-1">Blog Admin</h1>
        <p className="text-stone-400 text-sm text-center mb-6">Forged Initials</p>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Admin password" className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all ${err ? 'border-red-400 bg-red-50' : 'border-stone-200'}`} />
        {err && <p className="text-red-500 text-xs mt-1.5">Incorrect password.</p>}
        <button onClick={submit} className="w-full py-3 mt-4 rounded-xl text-sm font-bold transition-all" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>Enter</button>
      </div>
    </div>
  );
}

export function OwnerBlogPanel() {
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [dbError, setDbError] = useState(false);

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    setDbError(false);
    try {
      const data = await blogFetch('GET');
      if (Array.isArray(data)) { setPosts(data); } else { setDbError(true); }
    } catch { setDbError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const handleSave = async (data: Partial<BlogPost>) => {
    const action = data.id ? 'update' : 'create';
    const result = await blogFetch('POST', { action, ...data });
    if (result?.error) throw new Error(JSON.stringify(result.error));
    await load();
    setEditing(null);
    toast(action === 'create' ? 'Post created!' : 'Post updated!');
  };

  const handleTogglePublished = async (post: BlogPost) => {
    await blogFetch('POST', { action: 'toggle_published', id: post.id, published: !post.published });
    await load();
    toast(post.published ? 'Post unpublished.' : 'Post published!');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await blogFetch('POST', { action: 'delete', id: deleteId });
    setDeleteId(null);
    await load();
    toast('Post deleted.');
  };

  const filtered = posts.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pt-20 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Blog Admin</h1>
            <p className="text-stone-400 text-sm mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''} · {posts.filter(p => p.published).length} published</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 hover:bg-stone-50 transition-all"><RefreshCw className="w-4 h-4 text-stone-500" /></button>
            <button onClick={() => setEditing({ ...BLANK })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}><Plus className="w-4 h-4" /> New Post</button>
          </div>
        </div>
        {dbError && <SetupBanner />}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-stone-200" />
            <p className="text-stone-400 font-medium mb-1">{dbError ? 'Run the SQL setup above to create the blog_posts table.' : 'No posts yet.'}</p>
            {!dbError && <button onClick={() => setEditing({ ...BLANK })} className="text-amber-600 text-sm font-semibold hover:underline mt-1">Create your first post</button>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(post => (
              <div key={post.id} className="bg-white rounded-2xl border border-stone-100 px-4 py-3 flex items-center gap-4 hover:border-amber-200 transition-all group">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  {post.cover_image ? <img src={post.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-stone-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-stone-800 text-sm truncate group-hover:text-amber-800 transition-colors">{post.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0" style={post.published ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a' } : { background: 'rgba(120,113,108,0.1)', color: '#78716c' }}>
                      {post.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 truncate">{post.category} · {post.date} · {post.read_time} min read</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleTogglePublished(post)} title={post.published ? 'Unpublish' : 'Publish'} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-all">
                    {post.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-stone-400" />}
                  </button>
                  {post.published && <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-all" title="View post"><ExternalLink className="w-3.5 h-3.5 text-stone-400" /></a>}
                  <button onClick={() => setEditing(post)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-amber-50 transition-all"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                  <button onClick={() => setDeleteId(post.id)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {editing && <PostForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,12,9,0.7)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-stone-800 mb-2">Delete this post?</h3>
            <p className="text-stone-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
      {toastMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">{toastMsg}</div>}
    </div>
  );
}
