import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section id="home" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1725368844213-c167fe556f98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzaWx2ZXIlMjBqZXdlbHJ5fGVufDF8fHx8MTc2MDgxMDU5NXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Luxury silver jewelry"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Mobile: strong top-down overlay. Desktop: right-fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/75 to-background/60 md:bg-gradient-to-r md:from-background/95 md:via-background/75 md:to-background/30" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10 py-12 md:py-0">
        {/* Mobile: center-aligned. Desktop: left-aligned */}
        <div className="max-w-2xl mx-auto md:mx-0 text-center md:text-left">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-5 md:mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs sm:text-sm text-white/90 font-medium tracking-wide">Handcrafted Sterling Silver</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl mb-4 md:mb-6 leading-[1.1] tracking-tight">
            Express Yourself
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              with Forged Initials
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-7 md:mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
            Custom handcrafted letter jewelry made to order in 925 Sterling Silver.
            Every piece tells your story.
          </p>

          {/* CTA buttons — stacked on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
            <Button
              size="lg"
              className="w-full sm:w-auto min-h-[52px] text-base font-semibold rounded-xl shadow-lg shadow-primary/20 group"
              asChild
            >
              <a href="#custom-orders">
                Request Your Letters
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-h-[52px] text-base rounded-xl bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              asChild
            >
              <a href="#gallery">View Gallery</a>
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-10 md:mt-16 pt-6 md:pt-8 border-t border-white/10">
            {[
              { value: 'Custom', label: 'Made to Order' },
              { value: '925', label: 'Sterling Silver' },
              { value: 'A–Z', label: 'All Letters' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center md:text-left">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-[11px] sm:text-xs md:text-sm text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
