import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Mail, Clock, Instagram, Facebook, Twitter, Send, Paperclip, X, ImageIcon, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

// Compress an image File to a JPEG under maxBytes using Canvas
async function compressImage(file: File, maxBytes = 700_000): Promise<{ data: string; type: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let quality = 0.85;
      let scale = 1;
      const canvas = document.createElement('canvas');

      const tryCompress = () => {
        canvas.width  = Math.round(img.naturalWidth  * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64  = dataUrl.split(',')[1];
        const bytes   = Math.round((base64.length * 3) / 4);

        if (bytes <= maxBytes || quality <= 0.3) {
          resolve({ data: base64, type: 'image/jpeg' });
        } else if (quality > 0.4) {
          quality -= 0.15;
          tryCompress();
        } else {
          scale *= 0.8;
          quality = 0.7;
          tryCompress();
        }
      };
      tryCompress();
    };
    img.onerror = () => {
      // Not a renderable image — fall back to raw base64
      const reader = new FileReader();
      reader.onload = () => resolve({
        data: (reader.result as string).split(',')[1],
        type: file.type,
      });
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

// Read a non-image file as base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
}

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.size <= 20 * 1024 * 1024);
    setAttachments(prev => [...prev, ...files].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (i: number) => setAttachments(prev => prev.filter((_, idx) => idx !== i));

  const formatBytes = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Process files: compress images, read others as base64
      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          const isImage = file.type.startsWith('image/');
          const { data, type } = isImage
            ? await compressImage(file, 700_000)
            : { data: await fileToBase64(file), type: file.type };
          return { name: file.name, type, size: file.size, data };
        })
      );

      // Call Netlify Function (auto-deploys with every push)
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, attachments: attachmentData }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({ type: 'success', message: result.message || "Message sent! We'll get back to you soon." });
        setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
        setAttachments([]);
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send. Please reach us on Instagram or Telegram.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-24 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <Badge className="mb-3 md:mb-4">Get in Touch</Badge>
          <h2 className="text-3xl md:text-5xl mb-3 md:mb-4">Contact Us</h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto px-4">
            Have questions about our custom letter jewelry? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="border-border">
            <CardContent className="p-5 md:p-8">
              <h3 className="mb-4 md:mb-6 text-xl md:text-2xl">Send us a message</h3>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <label htmlFor="firstName" className="text-sm md:text-base">First Name</label>
                    <Input id="firstName" placeholder="John" className="bg-input-background h-10 md:h-11 text-base" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label htmlFor="lastName" className="text-sm md:text-base">Last Name</label>
                    <Input id="lastName" placeholder="Doe" className="bg-input-background h-10 md:h-11 text-base" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label htmlFor="email" className="text-sm md:text-base">Email</label>
                  <Input id="email" type="email" placeholder="john@example.com" className="bg-input-background h-10 md:h-11 text-base" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label htmlFor="phone" className="text-sm md:text-base">Phone (Optional)</label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="bg-input-background h-10 md:h-11 text-base" value={formData.phone} onChange={handleInputChange} />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label htmlFor="subject" className="text-sm md:text-base">Subject</label>
                  <Input id="subject" placeholder="How can we help you?" className="bg-input-background h-10 md:h-11 text-base" value={formData.subject} onChange={handleInputChange} required />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label htmlFor="message" className="text-sm md:text-base">Message</label>
                  <Textarea id="message" placeholder="Tell us more about your inquiry..." rows={5} className="bg-input-background text-base" value={formData.message} onChange={handleInputChange} required />
                </div>

                {/* File attachment area */}
                <div className="space-y-2">
                  <label className="text-sm md:text-base">
                    Attachments <span className="text-foreground/40 font-normal">(optional — up to 5 files, 20MB each)</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-200"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.size <= 20 * 1024 * 1024);
                      setAttachments(prev => [...prev, ...files].slice(0, 5));
                    }}
                  >
                    <Paperclip className="w-5 h-5 mx-auto mb-1.5 text-foreground/40" />
                    <p className="text-sm text-foreground/60">
                      <span className="text-primary font-medium">Click to attach</span> or drag & drop
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">Images, PDFs, or any file — images compressed automatically</p>
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/40 rounded-lg px-3 py-2">
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                          <span className="text-sm flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-foreground/40 flex-shrink-0">{formatBytes(file.size)}</span>
                          <button type="button" onClick={() => removeFile(i)} className="text-foreground/40 hover:text-destructive transition-colors flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 md:h-12 text-base" disabled={isSubmitting}>
                  {isSubmitting
                    ? (attachments.length > 0 ? 'Sending message + files...' : 'Sending...')
                    : (attachments.length > 0 ? `Send Message + ${attachments.length} file${attachments.length > 1 ? 's' : ''}` : 'Send Message')}
                </Button>

                {submitStatus.type && (
                  <div className={`p-3 rounded-lg text-sm ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-4 md:space-y-6">
            <Card className="border-border">
              <CardContent className="p-5 md:p-8">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl">Contact Information</h3>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-base md:text-lg">Email</h4>
                      <p className="text-sm md:text-base text-foreground/60 break-all">forgedinitals@outlook.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-base md:text-lg">Direct Contact (Fastest Response)</h4>
                      <p className="text-sm md:text-base text-foreground/60 mb-2">For direct and immediate assistance:</p>
                      <div className="space-y-1">
                        <p className="text-sm md:text-base text-foreground/80">📸 <span className="font-medium text-primary">Instagram</span> - DM us anytime</p>
                        <p className="text-sm md:text-base text-foreground/80">📘 <span className="font-medium text-primary">Facebook</span> - Quick responses</p>
                        <p className="text-sm md:text-base text-foreground/80">💬 <span className="font-medium text-primary">Telegram</span> - Message <a href="https://t.me/adilali08" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">@adilali08</a></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Send className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 text-base md:text-lg">Telegram Group</h4>
                      <p className="text-sm md:text-base text-foreground/60 mb-2">Join our community group for updates</p>
                      <a href="https://t.me/forgedinitals" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm md:text-base text-primary hover:underline">
                        <Send className="w-4 h-4" /> t.me/forgedinitals
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-base md:text-lg">Response Time</h4>
                      <p className="text-sm md:text-base text-foreground/60">Usually within 24 hours</p>
                      <p className="text-xs md:text-sm text-foreground/50">Monday - Saturday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-muted/30">
              <CardContent className="p-5 md:p-8">
                <h3 className="mb-3 md:mb-4 text-xl md:text-2xl">Follow Us</h3>
                <p className="text-sm md:text-base text-foreground/60 mb-4 md:mb-6">Stay connected for the latest designs and behind-the-scenes content.</p>
                <div className="flex gap-3 flex-wrap">
                  <Button size="icon" variant="outline" className="rounded-full h-12 w-12" asChild>
                    <a href="https://www.instagram.com/forged_initials/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full h-12 w-12" asChild>
                    <a href="https://www.facebook.com/share/1GG4H5dfQx/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full h-12 w-12" asChild>
                    <a href="https://x.com/forged_initails?s=21" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X"><Twitter className="w-5 h-5" /></a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
