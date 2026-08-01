interface Props {
  content: string;
}

function YoutubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden my-6" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="YouTube video"
      />
    </div>
  );
}

function SocialEmbed({ platform, url }: { platform: string; url: string }) {
  const icons: Record<string, string> = {
    TIKTOK: '🎵', INSTAGRAM: '📸', FACEBOOK: '📘', EMBED: '🔗',
  };
  const labels: Record<string, string> = {
    TIKTOK: 'TikTok', INSTAGRAM: 'Instagram', FACEBOOK: 'Facebook', EMBED: 'View',
  };
  return (
    <div className="my-6">
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-200 transition-all group">
        <span className="text-2xl">{icons[platform] || '🔗'}</span>
        <div>
          <p className="text-sm font-semibold text-stone-700 group-hover:text-amber-800">{labels[platform] || 'View Content'}</p>
          <p className="text-xs text-stone-400 truncate max-w-xs">{url}</p>
        </div>
        <span className="ml-auto text-xs text-amber-600 font-semibold opacity-0 group-hover:opacity-100 transition-all">Open ↗</span>
      </a>
    </div>
  );
}

export function BlogContentRenderer({ content }: Props) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = (key: string) => {
    const text = paragraphBuffer.join(' ').trim();
    if (text) {
      elements.push(
        <p key={key} className="text-stone-700 leading-relaxed text-base sm:text-lg mb-4">
          {text}
        </p>
      );
    }
    paragraphBuffer = [];
  };

  lines.forEach((line, i) => {
    const key = `line-${i}`;
    const trimmed = line.trim();

    // IMAGE marker
    const imgMatch = trimmed.match(/^\[IMAGE:\s*(.+)\]$/i);
    if (imgMatch) {
      flushParagraph(`p-before-${i}`);
      elements.push(
        <img key={key} src={imgMatch[1]} alt="Blog image"
          className="w-full rounded-2xl my-6 object-cover max-h-[500px]"
          loading="lazy" />
      );
      return;
    }

    // VIDEO marker
    const videoMatch = trimmed.match(/^\[VIDEO:\s*(.+)\]$/i);
    if (videoMatch) {
      flushParagraph(`p-before-${i}`);
      elements.push(
        <video key={key} src={videoMatch[1]} controls
          className="w-full rounded-2xl my-6 max-h-[500px] bg-black">
          Your browser does not support video playback.
        </video>
      );
      return;
    }

    // YOUTUBE marker
    const ytMatch = trimmed.match(/^\[YOUTUBE:\s*([a-zA-Z0-9_-]{11})\]$/i);
    if (ytMatch) {
      flushParagraph(`p-before-${i}`);
      elements.push(<YoutubeEmbed key={key} videoId={ytMatch[1]} />);
      return;
    }

    // TIKTOK / INSTAGRAM / FACEBOOK / EMBED markers
    const socialMatch = trimmed.match(/^\[(TIKTOK|INSTAGRAM|FACEBOOK|EMBED):\s*(.+)\]$/i);
    if (socialMatch) {
      flushParagraph(`p-before-${i}`);
      elements.push(<SocialEmbed key={key} platform={socialMatch[1].toUpperCase()} url={socialMatch[2]} />);
      return;
    }

    // Empty line = paragraph break
    if (trimmed === '') {
      flushParagraph(`p-${i}`);
      return;
    }

    // Regular text
    paragraphBuffer.push(trimmed);
  });

  flushParagraph('p-final');

  return <div className="prose-content">{elements}</div>;
}
