import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Tag, RefreshCw } from 'lucide-react';

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

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let buffer: string[] = [];
  let key = 0;

  const flush = () => {
    const text = buffer.join(' ').trim();
    if (text) elements.push(<p key={key++} className="text-stone-600 leading-relaxed text-base sm:text-lg mb-5">{text}</p>);
    buffer = [];
  };

  for (const line of lines) {
    const t = line.trim();

    const imgMatch = t.match(/^\[IMAGE:\s*(.+)\]$/i);
    if (imgMatch) { flush(); elements.push(<img key={key++} src={imgMatch[1]} alt="" className="w-full rounded-2xl my-6 object-cover max-h-[500px]" loading="lazy" />); continue; }

    const videoMatch = t.match(/^\[VIDEO:\s*(.+)\]$/i);
    if (videoMatch) { flush(); elements.push(<video key={key++} src={videoMatch[1]} controls className="w-full rounded-2xl my-6 bg-black max-h-[500px]" />); continue; }

    const ytMatch = t.match(/^\[YOUTUBE:\s*([a-zA-Z0-9_-]{11})\]$/i);
    if (ytMatch) {
      flush();
      elements.push(
        <div key={key++} className="relative w-full rounded-2xl overflow-hidden my-6" style={{ paddingBottom: '56.25%' }}>
          <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            className="absolute inset-0 w-full h-full" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      );
      continue;
    }

    const socialMatch = t.match(/^\[(TIKTOK|INSTAGRAM|FACEBOOK|EMBED):\s*(.+)\]$/i);
    if (socialMatch) {
      flush();
      const icons: Record<string, string> = { TIKTOK: '🎵', INSTAGRAM: '📸', FACEBOOK: '📘', EMBED: '🔗' };
      const labels: Record<string, string> = { TIKTOK: 'Watch on TikTok', INSTAGRAM: 'View on Instagram', FACEBOOK: 'View on Facebook', EMBED: 'View Content' };
      const platform = socialMatch[1].toUpperCase();
      elements.push(
        <a key={key++} href={socialMatch[2]} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-200 transition-all my-6 group">
          <span className="text-2xl">{icons[platform]}</span>
          <div>
            <p className="text-sm font-semibold text-stone-700 group-hover:text-amber-800">{labels[platform]}</p>
            <p className="text-xs text-stone-400 truncate max-w-xs">{socialMatch[2]}</p>
          </div>
          <span className="ml-auto text-xs text-amber-600 font-semibold">Open ↗</span>
        </a>
      );
      continue;
    }

    if (t === '') { flush(); continue; }
    buffer.push(t);
  }
  flush();
  return elements;
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${slug}&published=eq.true`, {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setPost(data[0]);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
    </div>
  );

  if (notFound || !post) return (
    <div className="pt-24 pb-20 text-center min-h-screen">
      <p className="text-stone-500 text-lg mb-4">Article not found.</p>
      <button onClick={() => navigate('/blog')} className="text-amber-700 font-semibold hover:underline">
        ← Back to Journal
      </button>
    </div>
  );

  const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="pt-4 min-h-screen bg-gradient-to-b from-amber-50/40 to-white">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <button onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-8 hover:gap-3 transition-all group mt-8">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Journal
        </button>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {post.tags[0] && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010', border: '1px solid rgba(201,168,76,0.3)' }}>
              {post.tags[0]}
            </span>
          )}
          <span className="text-stone-400 text-xs">{date}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 leading-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 border-l-2 border-amber-300 pl-4 italic">
            {post.excerpt}
          </p>
        )}

        {post.cover_image_url && (
          <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9]">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="mt-2">{renderContent(post.content)}</div>

        {post.tags.length > 0 && (
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
        )}
      </article>
    </div>
  );
}
