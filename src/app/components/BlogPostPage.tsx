import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug) || null;

  if (!post) {
    return (
      <div className="pt-24 pb-20 text-center min-h-screen">
        <p className="text-stone-500 text-lg mb-4">Article not found.</p>
        <button onClick={() => navigate('/blog')} className="text-amber-700 font-semibold hover:underline">← Back to Journal</button>
      </div>
    );
  }

  return (
    <div className="pt-4 min-h-screen bg-gradient-to-b from-amber-50/40 to-white">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-8 hover:gap-3 transition-all duration-200 group mt-8">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Journal
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010', border: '1px solid rgba(201,168,76,0.3)' }}>{post.category}</span>
          <span className="text-stone-400 text-xs">{post.date}</span>
          <span className="text-stone-300">·</span>
          <span className="text-stone-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min read</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 leading-tight mb-4">{post.title}</h1>
        <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 border-l-2 border-amber-300 pl-4 italic">{post.excerpt}</p>

        <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9]">
          <img src={post.coverImage} alt={post.coverAlt} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-stone prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:text-stone-800 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-li:leading-relaxed prose-strong:text-stone-800 prose-strong:font-semibold prose-ul:pl-5 prose-ul:space-y-1"
          dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="mt-12 pt-8 border-t border-stone-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-1.5"><Tag className="w-3 h-3" /> Tags</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => <span key={tag} className="text-xs px-3 py-1 rounded-full bg-stone-50 text-stone-500 border border-stone-200">{tag}</span>)}
          </div>
        </div>
      </article>
    </div>
  );
}
