import { Badge } from './ui/card';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sparkles, Package, Shield, Truck } from 'lucide-react';
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
          {/* Header */}
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 md:mb-6">
              The Story Behind Every Letter
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Custom handcrafted letter jewelry and quality sterling silver components.
            </p>
          </div>

          {/* Intro Card */}
          <Card className="mb-10 md:mb-16 overflow-hidden border-border">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-square md:aspect-auto">
                <ImageWithFallback
                  src={portraitImage}
                  alt="Adil, Owner of Forged Initials"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6 md:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <h3 className="text-2xl md:text-3xl mb-2">Hi, I'm Adil</h3>
                  <p className="text-sm md:text-base text-foreground/60">Owner of Forged Initials</p>
                </div>
                <div className="space-y-3 md:space-y-4 text-sm md:text-base text-foreground/80">
                  <p>
                    I started this brand from a simple love for detail — and a fascination with how a single letter can hold meaning, memory, and identity.
                  </p>
                  <p>
                    Every piece I craft begins as a blank idea and transforms into something personal. Whether it's the first letter of a name, a symbol of love, or a mark of self-expression, I hand-forge each one with care and precision.
                  </p>
                  <p>
                    I also offer quality sterling silver jewelry components for makers who want to create their own pieces. Every order is carefully packaged and shipped to Houston addresses.
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Feature Cards */}
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

          {/* Workshop Image */}
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
                    "Every letter tells a story"
                  </p>
                  <p className="text-xs md:text-base text-white/80">
                    — Adil, Creator & Founder of Forged Initials
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
