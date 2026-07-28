
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sparkles, Package, Truck } from 'lucide-react';
const portraitImage = '/adil-portrait.jpeg';

export function About() {
  const features = [
    {
      icon: Sparkles,
      title: 'Handcrafted Letters',
      content: 'Every letter is individually forged and handcrafted with precision. Each piece is custom made to order in 925 sterling silver—designed to last and tell your unique story.',
    },
    {
      icon: Package,
      title: 'Quality Parts',
      content: 'We also offer premium sterling silver jewelry components—bails, prongs, and findings. Professional-grade parts for jewelers and DIY creators.',
    },
    {
      icon: Truck,
      title: 'Houston Delivery',
      content: 'Serving the Houston area exclusively with $10 flat-rate FedEx Ground shipping. Local focus means faster delivery and personalized service.',
    },
  ];

  return (
    <section id="about" className="py-12 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 md:mb-6">
              The Story Behind Every Letter
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Custom handcrafted letter jewelry and quality sterling silver components.
            </p>
          </div>

          <Card className="mb-10 md:mb-16 overflow-hidden border-border">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-square md:aspect-auto">
                <ImageWithFallback
                  src={portraitImage}
                  alt="Adil Ali, Founder of Forged Initials"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6 md:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <h3 className="text-2xl md:text-3xl mb-1">About Forged Initials</h3>
                  <p className="text-sm md:text-base font-semibold mb-1" style={{ color: '#c9a84c' }}>Family-Owned · Houston, Texas</p>
                  <p className="text-xs md:text-sm text-foreground/50">Founded by Adil Ali · Operated under Ahmed Kassim</p>
                </div>
                <div className="space-y-3 md:space-y-4 text-sm md:text-base text-foreground/80">
                  <p>
                    Forged Initials is a family-owned jewelry brand inspired by the belief that a single letter can represent identity, memories, and the people who matter most.
                  </p>
                  <p>
                    Founded by Adil Ali and operated as a family business under Ahmed Kassim, every aspect of the brand — from product design and the online experience to customer service — is built around simplicity, authenticity, and attention to detail.
                  </p>
                  <p>
                    Our collection features personalized initial pendants crafted from genuine 925 sterling silver, designed to be timeless, versatile, and suitable for everyday wear. We also offer quality sterling silver components for artisans and makers who create their own pieces.
                  </p>
                  <p>
                    Based in Houston, Texas, every order is carefully packaged and shipped with care. We're grateful for the opportunity to create pieces that become part of your story.
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-5 md:gap-8 mb-10 md:mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border">
                  <CardContent className="p-5 md:p-8">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <h3 className="text-lg md:text-xl mb-3">{feature.title}</h3>
                    <p className="text-sm md:text-base text-foreground/70 leading-relaxed">
                      {feature.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="overflow-hidden border-border">
            <div className="relative aspect-video md:aspect-[21/9]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1727924306332-7e981ef2f7e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwbWFrZXIlMjBjcmFmdGluZyUyMHdvcmtzaG9wJTIwaGFuZHN8ZW58MXx8fHwxNzYwNzIzNzY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Jewelry making workspace"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-5 md:p-12 text-white">
                  <p className="text-lg md:text-2xl mb-2">
                    "A single letter can represent everything that matters."
                  </p>
                  <p className="text-xs md:text-base text-white/80">
                    — Forged Initials, Houston Texas
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
