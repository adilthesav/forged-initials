import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, BookOpen, Lock, Image, Video, Link2, Youtube } from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  published: boolean;
}

const BLANK: BlogPost = { title: '', slug: '', excerpt: '', content: '', cover_image_url: '', tags: [], published: false };
const ADMIN_TOKEN = 'forgedadmin2026';

async function blogFetch(method: string, body?: object) {
  const res = await fetch('/.netlify/functions/admin-blogs', {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function uploadMedia(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const res = await fetch('/.netlify/functions/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify({ filename: file.name, contentType: file.type, base64 }),
  });
  const { url, error } = await res.json();
  if (error) throw new Error(error);
  return url;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function detectVideoEmbed(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `[YOUTUBE: ${ytMatch[1]}]`;
  // TikTok
  if (url.includes('tiktok.com')) return `[TIKTOK: ${url}]`;
  // Instagram
  if (url.includes('instagram.com')) return `[INSTAGRAM: ${url}]`;
  // Facebook
  if (url.includes('facebook.com')) return `[FACEBOOK: ${url}]`;
  // Generic video file
  if (/\.(mp4|webm|mov|avi)(\?|$)/i.test(url)) return `[VIDEO: ${url}]`;
  // Generic image
  if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url)) return `[IMAGE: ${url}]`;
  return `[EMBED: ${url}]`;
}

function MediaToolbar({ onInsert, uploading, setUploading }: {
  onInsert: (text: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      onInsert(`\n[IMAGE: ${url}]\n`);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (imageRef.current) imageRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      onInsert(`\n[VIDEO: ${url}]\n`);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (videoRef.current) videoRef.current.value = '';
    }
  };

  const handleUrlEmbed = () => {
    if (!urlValue.trim()) return;
    const marker = detectVideoEmbed(urlValue.trim());
    onInsert(`\n${marker}\n`);
    setUrlValue('');
    setShowUrlInput(false);
  };

  return (
    <div className="border border-stone-200 rounded-t-lg bg-stone-50 px-3 py-2 flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-1">Insert:</span>

      <input ref={imageRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <button type="button" onClick={() => imageRef.current?.click()} disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all disabled:opacity-50">
        <Image className="w-3.5 h-3.5 text-amber-600" />
        {uploading ? 'Uploading…' : 'Image'}
      </button>

      <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
      <button type="button" onClick={() => videoRef.current?.click()} disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all disabled:opacity-50">
        <Video className="w-3.5 h-3.5 text-amber-600" />
        Video File
      </button>

      <button type="button" onClick={() => setShowUrlInput(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all">
        <Youtube className="w-3.5 h-3.5 text-red-500" />
        YouTube / TikTok / Social
      </button>

      {showUrlInput && (
        <div className="w-full flex gap-2 mt-1">
          <input
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUrlEmbed()}
            placeholder="Paste YouTube, TikTok, Instagram, or Facebook URL…"
            className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-amber-400"
            autoFocus
          />
          <button onClick={handleUrlEmbed}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setShowUrlInput(false); setUrlValue(''); }}
            className="px-2 py-1.5 rounded-lg text-xs bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function PostForm({ initial, onSave, onCancel, saving }: {
  initial: BlogPost; onSave: (p: BlogPost) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const set = (k: keyof BlogPost, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
  };

  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) {
      set('content', form.content + text);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newContent = form.content.substring(0, start) + text + form.content.substring(end);
    set('content', newContent);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + text.length;
      el.focus();
    }, 0);
  };

  return (
    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-stone-800">{form.id ? 'Edit Post' : 'New Blog Post'}</h3>

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Title *</label>
        <input value={form.title} onChange={e => handleTitleChange(e.target.value)}
          placeholder="e.g. How to Care for Sterling Silver"
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">URL Slug *</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">/blog/</span>
          <input value={form.slug} onChange={e => set('slug', slugify(e.target.value))}
            placeholder="how-to-care-for-sterling-silver"
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Short Description</label>
        <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
          placeholder="A brief summary shown in the blog list…"
          rows={2} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 resize-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Cover Image URL</label>
        <input value={form.cover_image_url} onChange={e => set('cover_image_url', e.target.value)}
          placeholder="https://… paste a direct image link"
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        {form.cover_image_url && (
          <img src={form.cover_image_url} alt="cover" className="mt-2 h-32 w-full object-cover rounded-xl border border-stone-200" />
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-2 block">
          Article Content
          <span className="text-stone-400 font-normal ml-2">— use the toolbar to insert images & videos</span>
        </label>
        <MediaToolbar onInsert={insertAtCursor} uploading={uploading} setUploading={setUploading} />
        <textarea
          ref={textareaRef}
          value={form.content}
          onChange={e => set('content', e.target.value)}
          placeholder={"Write your article here...\n\nUse the toolbar above to insert images and videos.\n\nSeparate paragraphs with a blank line."}
          rows={14}
          className="w-full px-3 py-2 text-sm border border-stone-200 border-t-0 rounded-b-lg bg-white focus:outline-none focus:border-amber-400 resize-y"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Tags (comma separated)</label>
        <input
          value={form.tags.join(', ')}
          onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="sterling silver, care tips, jewelry"
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="published-chk" checked={form.published}
          onChange={e => set('published', e.target.checked)} className="w-4 h-4 accent-amber-500" />
        <label htmlFor="published-chk" className="text-xs font-semibold text-stone-600">
          Published (visible to visitors on /blog)
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || uploading || !form.title || !form.slug}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
          <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save Post'}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

function LoginGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const attempt = () => {
    if (password === ADMIN_TOKEN) { sessionStorage.setItem('fi_blog_admin', 'yes'); onUnlock(); }
    else { setError(true); setPassword(''); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/30 to-white px-4">
      <div className="bg-white rounded-3xl border border-stone-100 p-8 w-full max-w-sm text-center"
        style={{ boxShadow: '0 8px 40px rgba(201,168,76,0.1)' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)' }}>
          <Lock className="w-7 h-7 text-amber-900" />
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-1">Blog Admin</h2>
        <p className="text-stone-400 text-sm mb-6">Enter your password to manage posts</p>
        <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && attempt()} placeholder="Password" autoFocus
          className={`w-full px-4 py-3 text-sm border rounded-xl text-center tracking-widest focus:outline-none mb-2 ${error ? 'border-red-300 bg-red-50' : 'border-stone-200 focus:border-amber-400'}`} />
        {error && <p className="text-red-400 text-xs mb-3">Incorrect password.</p>}
        <button onClick={attempt} className="w-full py-3 rounded-xl font-semibold text-sm hover:scale-105 transition-all mt-2"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
          Unlock
        </button>
      </div>
    </div>
  );
}

function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await blogFetch('GET');
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (post: BlogPost) => {
    setSaving(true);
    try {
      if (post.id) await blogFetch('PATCH', post);
      else await blogFetch('POST', post);
      await load();
      setEditing(null);
      setAdding(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await blogFetch('DELETE', { id });
    await load();
  };

  const handleTogglePublished = async (post: BlogPost) => {
    await blogFetch('PATCH', { id: post.id, published: !post.published });
    await load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white pt-6 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Blog Management</h1>
            <p className="text-stone-500 text-sm mt-0.5">Write and publish posts to The Forged Journal</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-all">
              <RefreshCw className="w-4 h-4 text-stone-500" />
            </button>
            <button onClick={() => { setAdding(true); setEditing(null); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>
        </div>

        {adding && (
          <div className="mb-6">
            <PostForm initial={BLANK} onSave={handleSave} onCancel={() => setAdding(false)} saving={saving} />
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-stone-400">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />Loading posts…
          </div>
        )}

        {!loading && posts.length === 0 && !adding && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-stone-200" />
            <p className="text-stone-400 font-medium">No posts yet.</p>
            <p className="text-stone-300 text-sm mt-1">Click "New Post" to write your first article.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id}>
                {editing?.id === post.id ? (
                  <PostForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
                ) : (
                  <div className={`bg-white rounded-2xl border p-4 ${post.published ? 'border-stone-100' : 'border-dashed border-stone-200 opacity-70'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
                        {post.cover_image_url
                          ? <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-stone-200" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-stone-800 text-sm truncate">{post.title}</span>
                          {post.published
                            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Live</span>
                            : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">Draft</span>}
                        </div>
                        <p className="text-stone-400 text-xs mt-0.5">/blog/{post.slug}</p>
                        {post.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleTogglePublished(post)} title={post.published ? 'Unpublish' : 'Publish'}
                          className="p-1.5 rounded-lg hover:bg-stone-100 transition-all">
                          {post.published ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-stone-300" />}
                        </button>
                        <button onClick={() => { setEditing(post as BlogPost); setAdding(false); }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 transition-all">
                          <Edit2 className="w-4 h-4 text-amber-600" />
                        </button>
                        <button onClick={() => handleDelete(post.id!, post.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminBlogPanel() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('fi_blog_admin') === 'yes');
  if (!unlocked) return <LoginGate onUnlock={() => setUnlocked(true)} />;
  return <BlogAdmin />;
}
