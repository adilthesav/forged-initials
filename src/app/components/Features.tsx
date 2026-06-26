import { Gem, Shield, Truck, Sparkles } from 'lucide-react';

const features = [
  { icon: Gem,      title: 'Premium Materials',   description: 'Authentic 925 sterling silver for lasting quality and shine.', color: 'from-amber-400/20 to-yellow-400/10', iconColor: 'text-amber-600' },
  { icon: Sparkles, title: 'Handcrafted Design',   description: 'Each letter individually forged and finished by hand.', color: 'from-purple-400/20 to-violet-400/10', iconColor: 'text-purple-600' },
  { icon: Shield,   title: 'Quality Guarantee',    description: 'We stand behind every piece with a craftsmanship commitment.', color: 'from-green-400/20 to-emerald-400/10', iconColor: 'text-green-600' },
  { icon: Truck,    title: '$10 Flat Shipping',     description: 'FedEx Ground to Houston. Fast, reliable, flat-rate delivery.', color: 'from-blue-400/20 to-sky-400/10', iconColor: 'text-blue-600' },
];

export function Features() {
  return (
    <section className="py-10 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Mobile: horizontal scroll. Desktop: 4-col grid */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`flex-shrink-0 w-[72vw] max-w-[260px] md:w-auto md:max-w-none rounded-2xl bg-gradient-to-br ${f.color} border border-black/5 p-5 md:p-6`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 md:mb-4`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1.5">{f.title}</h3>
                <p className="text-xs md:text-sm text-foreground/60 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
