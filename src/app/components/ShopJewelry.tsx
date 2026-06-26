import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
const pushBackEarringsImage = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80';
const separatedLettersImage = 'https://images.unsplash.com/photo-1677201794527-a30a488f33a7?w=600&q=80';
const connectedNameplateImage = 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80';
const barStyleImage = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80';

export function ShopJewelry() {
  return (
    <section id="shop-jewelry" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-3 h-3 mr-2" />
            Shop Jewelry
          </Badge>
          <h2 className="mb-4">Ready-Made Pieces</h2>
          <p className="text-muted-foreground">
            Browse our collection of handcrafted sterling silver jewelry, ready to ship.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Initial Pendants */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2">Initial Pendants</h3>
                  <p className="text-muted-foreground text-sm">
                    Classic letter pendants in 925 Sterling Silver
                  </p>
                </div>
              </div>
              
              {/* Pendant Style Showcase */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-muted-foreground">Available Pendant Styles:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {/* Separated Letters */}
                  <div className="space-y-2">
                    <div className="relative bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg p-3 min-h-[140px] flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors">
                      <ImageWithFallback 
                        src={separatedLettersImage}
                        alt="Separated Letters Style"
                        className="w-full h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold">Separated</p>
                      <p className="text-[10px] text-muted-foreground">Individual letters</p>
                    </div>
                  </div>

                  {/* Connected Nameplate */}
                  <div className="space-y-2">
                    <div className="relative bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg p-3 min-h-[140px] flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors">
                      <ImageWithFallback 
                        src={connectedNameplateImage}
                        alt="Connected Nameplate Style"
                        className="w-full h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold">Connected</p>
                      <p className="text-[10px] text-muted-foreground">Fused nameplate</p>
                    </div>
                  </div>

                  {/* Bar Style */}
                  <div className="space-y-2">
                    <div className="relative bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg p-3 min-h-[140px] flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors">
                      <ImageWithFallback 
                        src={barStyleImage}
                        alt="Bar Style Pendant"
                        className="w-full h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold">Bar Style</p>
                      <p className="text-[10px] text-muted-foreground">Vertical mount</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 border-t pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available in sizes XS-XL</span>
                  <Badge variant="secondary">Custom Orders</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Each initial is handcrafted to order. Visit Custom Orders section to request your personalized piece.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Push Back Earrings */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
            <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 p-8 flex items-center justify-center min-h-[240px]">
              <div className="relative w-full max-w-[280px] group-hover:scale-105 transition-transform duration-500">
                <ImageWithFallback 
                  src={pushBackEarringsImage}
                  alt="Sterling Silver Push Back Earrings"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2">Push Back Earrings</h3>
                  <p className="text-muted-foreground text-sm">
                    Secure sterling silver push back earring backs
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 pl-16">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available in sizes XS-XL</span>
                  <Badge variant="secondary">Custom Orders</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Premium earring backs made to your specifications. Contact us through social media to place your order.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            All shop items are made to order. Visit the Custom Orders section below to request your personalized jewelry, 
            or contact us through Instagram, Facebook, or Twitter to discuss your vision.
          </p>
        </div>
      </div>
    </section>
  );
}
