import { useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Maximize2 } from 'lucide-react';
const extraSmallLetters = '/extra-small.jpeg';
const smallMediumLargeLetters = '/classic-range.jpeg';
const extraLargeLetters = '/extra-large.jpeg';

export function ProductShowcase() {
  return (
    <section id="gallery" className="py-12 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <Badge className="mb-3 md:mb-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-none shadow-lg text-xs md:text-sm">
            Complete Size Gallery
          </Badge>
          <h2 className="text-3xl md:text-5xl mb-3 md:mb-4">
            All Five Sizes Showcased
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto px-4">
            From ultra delicate to bold statement pieces, explore our complete range of handcrafted 925 Sterling Silver letters in all five sizes
          </p>
        </div>

        {/* Complete 5 Size Showcase */}
        <div className="max-w-7xl mx-auto mb-20">
          {/* Size Overview Bar */}
          <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 rounded-2xl p-1 shadow-2xl">
            <div className="bg-background rounded-xl p-4 md:p-6">
              <div className="grid grid-cols-5 gap-2 md:gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-1 md:mb-2 shadow-lg text-xs md:text-base">
                    <span>XS</span>
                  </div>
                  <div className="text-[10px] md:text-xs mb-1 hidden md:block">Extra Small</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">3.3mm</div>
                  <div className="text-xs md:text-sm text-primary mt-1">$1</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white mb-1 md:mb-2 shadow-lg text-xs md:text-base">
                    <span>S</span>
                  </div>
                  <div className="text-[10px] md:text-xs mb-1 hidden md:block">Small</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">4.8mm</div>
                  <div className="text-xs md:text-sm text-primary mt-1">$2</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mb-1 md:mb-2 shadow-lg ring-2 ring-purple-400 ring-offset-1 md:ring-offset-2 text-xs md:text-base">
                    <span>M</span>
                  </div>
                  <div className="text-[10px] md:text-xs mb-1 hidden md:block">Medium</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">6.9mm</div>
                  <div className="text-xs md:text-sm text-primary mt-1">$3</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white mb-1 md:mb-2 shadow-lg text-xs md:text-base">
                    <span>L</span>
                  </div>
                  <div className="text-[10px] md:text-xs mb-1 hidden md:block">Large</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">8.5mm</div>
                  <div className="text-xs md:text-sm text-primary mt-1">$4</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white mb-1 md:mb-2 shadow-lg text-xs md:text-base">
                    <span>XL</span>
                  </div>
                  <div className="text-[10px] md:text-xs mb-1 hidden md:block">Extra Large</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">9.5mm</div>
                  <div className="text-xs md:text-sm text-primary mt-1">$5</div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image - Small, Medium, Large (LARGER DISPLAY) */}
          <div className="mb-12">
            <Dialog>
              <DialogTrigger asChild>
                <Card className="overflow-hidden border-3 border-purple-300 hover:border-purple-500 transition-all shadow-2xl hover:shadow-purple-500/20 group bg-gradient-to-b from-purple-50/50 to-background max-w-5xl mx-auto cursor-pointer">
                  <div className="relative">
                    <div className="absolute top-3 md:top-6 left-3 md:left-6 z-10 flex flex-col gap-2 md:gap-3">
                      <div className="flex gap-1.5 md:gap-3 flex-wrap">
                        <Badge className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-none shadow-lg text-[10px] md:text-sm px-2 md:px-4 py-1 md:py-2">
                          Small
                        </Badge>
                        <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none shadow-lg text-[10px] md:text-sm px-2 md:px-4 py-1 md:py-2">
                          Medium
                        </Badge>
                        <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-none shadow-lg text-[10px] md:text-sm px-2 md:px-4 py-1 md:py-2">
                          Large
                        </Badge>
                      </div>
                      <div className="bg-white/95 backdrop-blur-sm px-2 md:px-4 py-1.5 md:py-2 rounded-lg shadow-md">
                        <div className="text-[10px] md:text-sm text-purple-900">4.8mm • 6.9mm • 8.5mm</div>
                      </div>
                    </div>
                    {/* Mobile: Click to Expand Indicator */}
                    <div className="absolute top-3 right-3 md:hidden z-10 bg-purple-600 text-white p-2 rounded-full shadow-lg">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 md:p-12 lg:p-20">
                      <ImageWithFallback
                        src={smallMediumLargeLetters}
                        alt="Small, Medium, and Large Sterling Silver Letters A-Z"
                        className="w-full h-auto object-contain rounded-lg shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-8 bg-gradient-to-b from-background to-purple-50/30">
                    <div className="text-center space-y-3 md:space-y-4">
                      <h4 className="text-purple-900 text-lg md:text-xl">Classic Range</h4>
                      <p className="text-sm md:text-base text-foreground/70 max-w-2xl mx-auto">
                        The most versatile sizes for everyday wear and statement pieces. <span className="md:hidden">Tap to enlarge.</span><span className="hidden md:inline">See all three sizes clearly displayed above.</span>
                      </p>
                      <div className="pt-3 md:pt-4 border-t border-purple-200">
                        <div className="flex justify-center gap-3 md:gap-6">
                          <div className="text-center">
                            <div className="text-xl md:text-2xl text-indigo-600 mb-1">$2</div>
                            <div className="text-xs md:text-sm text-muted-foreground">Small (4.8mm)</div>
                          </div>
                          <div className="border-l border-purple-200"></div>
                          <div className="text-center">
                            <div className="text-xl md:text-2xl text-purple-600 mb-1">$3</div>
                            <div className="text-xs md:text-sm text-muted-foreground">Medium (6.9mm)</div>
                          </div>
                          <div className="border-l border-purple-200"></div>
                          <div className="text-center">
                            <div className="text-xl md:text-2xl text-orange-600 mb-1">$4</div>
                            <div className="text-xs md:text-sm text-muted-foreground">Large (8.5mm)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-6xl p-2 md:p-6">
                <DialogTitle className="sr-only">Small, Medium, and Large Letters - Full View</DialogTitle>
                <DialogDescription className="sr-only">
                  Full size view of Small (4.8mm), Medium (6.9mm), and Large (8.5mm) sterling silver letters
                </DialogDescription>
                <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-4 md:p-8 rounded-lg">
                  <ImageWithFallback
                    src={smallMediumLargeLetters}
                    alt="Small, Medium, and Large Sterling Silver Letters A-Z - Full View"
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">Small (4.8mm) • Medium (6.9mm) • Large (8.5mm)</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Extra Small and Extra Large Side by Side */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Extra Small Size */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all shadow-xl hover:shadow-2xl group bg-gradient-to-b from-blue-50/50 to-background cursor-pointer">
                  <div className="relative">
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 z-10 flex flex-col gap-1.5 md:gap-2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none shadow-lg text-[10px] md:text-sm">
                        Extra Small
                      </Badge>
                      <div className="bg-white/95 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md">
                        <div className="text-[10px] md:text-xs text-blue-900">3.3mm × 2.1mm</div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 md:hidden z-10 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
                      <ImageWithFallback
                        src={extraSmallLetters}
                        alt="Extra Small Sterling Silver Letters A-Z - 3.3mm × 2.1mm"
                        className="w-full h-auto object-contain rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6 bg-gradient-to-b from-background to-blue-50/30">
                    <div className="text-center space-y-2 md:space-y-3">
                      <h4 className="text-blue-900">Ultra Delicate</h4>
                      <p className="text-xs md:text-sm text-foreground/70 min-h-[40px]">
                        Perfect for minimal, subtle designs and delicate jewelry pieces. <span className="md:hidden">Tap to enlarge.</span>
                      </p>
                      <div className="pt-2 md:pt-3 border-t border-blue-200">
                        <div className="text-2xl md:text-3xl text-blue-600 mb-1">$1.00</div>
                        <div className="text-xs text-foreground/60">per letter</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-4xl p-2 md:p-6">
                <DialogTitle className="sr-only">Extra Small Letters - Full View</DialogTitle>
                <DialogDescription className="sr-only">
                  Full size view of Extra Small (3.3mm × 2.1mm) sterling silver letters - ultra delicate design
                </DialogDescription>
                <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8 rounded-lg">
                  <ImageWithFallback
                    src={extraSmallLetters}
                    alt="Extra Small Sterling Silver Letters A-Z - Full View"
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <div className="text-center mt-4">
                  <h4 className="text-blue-900 mb-2">Extra Small - Ultra Delicate</h4>
                  <p className="text-sm text-muted-foreground">3.3mm × 2.1mm • $1.00 per letter</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Extra Large Size */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all shadow-xl hover:shadow-2xl group bg-gradient-to-b from-amber-50/50 to-background cursor-pointer">
                  <div className="relative">
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 z-10 flex flex-col gap-1.5 md:gap-2">
                      <Badge className="bg-gradient-to-r from-amber-600 to-amber-700 text-white border-none shadow-lg text-[10px] md:text-sm">
                        Extra Large
                      </Badge>
                      <div className="bg-white/95 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md">
                        <div className="text-[10px] md:text-xs text-amber-900">9.5mm × 6.2mm</div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 md:hidden z-10 bg-amber-600 text-white p-2 rounded-full shadow-lg">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50 p-4 md:p-8">
                      <ImageWithFallback
                        src={extraLargeLetters}
                        alt="Extra Large Sterling Silver Letters A-Z - 9.5mm × 6.2mm"
                        className="w-full h-auto object-contain rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6 bg-gradient-to-b from-background to-amber-50/30">
                    <div className="text-center space-y-2 md:space-y-3">
                      <h4 className="text-amber-900">Maximum Impact</h4>
                      <p className="text-xs md:text-sm text-foreground/70 min-h-[40px]">
                        Bold statement pieces that command attention and showcase craftsmanship. <span className="md:hidden">Tap to enlarge.</span>
                      </p>
                      <div className="pt-2 md:pt-3 border-t border-amber-200">
                        <div className="text-2xl md:text-3xl text-amber-600 mb-1">$5.00</div>
                        <div className="text-xs text-foreground/60">per letter</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-4xl p-2 md:p-6">
                <DialogTitle className="sr-only">Extra Large Letters - Full View</DialogTitle>
                <DialogDescription className="sr-only">
                  Full size view of Extra Large (9.5mm × 6.2mm) sterling silver letters - maximum impact design
                </DialogDescription>
                <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50 p-4 md:p-8 rounded-lg">
                  <ImageWithFallback
                    src={extraLargeLetters}
                    alt="Extra Large Sterling Silver Letters A-Z - Full View"
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <div className="text-center mt-4">
                  <h4 className="text-amber-900 mb-2">Extra Large - Maximum Impact</h4>
                  <p className="text-sm text-muted-foreground">9.5mm × 6.2mm • $5.00 per letter</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Size Progression Visual */}
          <div className="mt-8 md:mt-12 bg-gradient-to-r from-blue-100 via-purple-100 to-amber-100 rounded-2xl p-5 md:p-8 border-2 border-primary/20 shadow-lg">
            <h3 className="text-center mb-4 md:mb-6 text-xl md:text-2xl">Complete Size Progression</h3>
            <div className="flex items-end justify-center gap-2 md:gap-4 mb-4 md:mb-6">
              <div className="text-center">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full mb-1 md:mb-2 mx-auto shadow-md"></div>
                <div className="text-[10px] md:text-xs">XS</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-full mb-1 md:mb-2 mx-auto shadow-md"></div>
                <div className="text-[10px] md:text-xs">S</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-full mb-1 md:mb-2 mx-auto shadow-md ring-1 md:ring-2 ring-purple-400"></div>
                <div className="text-[10px] md:text-xs">M</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-600 rounded-full mb-1 md:mb-2 mx-auto shadow-md"></div>
                <div className="text-[10px] md:text-xs">L</div>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-600 rounded-full mb-1 md:mb-2 mx-auto shadow-md"></div>
                <div className="text-[10px] md:text-xs">XL</div>
              </div>
            </div>
            <div className="relative h-2 md:h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 rounded-full mb-3 md:mb-4 shadow-inner"></div>
            <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-0 text-xs md:text-sm text-center md:text-left">
              <div className="text-blue-700">3.3mm - Ultra Delicate</div>
              <div className="text-amber-700">9.5mm - Maximum Impact</div>
            </div>
          </div>
        </div>

        {/* All Letters Available */}
        <div className="text-center bg-gradient-to-br from-muted/50 to-background rounded-2xl p-5 md:p-8 max-w-4xl mx-auto border border-border shadow-lg">
          <h3 className="mb-2 md:mb-3 text-xl md:text-2xl">Complete A-Z Alphabet</h3>
          <p className="text-sm md:text-base text-foreground/60 mb-4 md:mb-6 px-2">
            Every letter handcrafted from 925 Sterling Silver, available in all five sizes
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-6">
            {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
              <div
                key={letter}
                className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-gradient-to-br from-background to-muted border-2 border-border rounded-lg hover:border-primary hover:shadow-md transition-all hover:scale-110 text-sm md:text-base"
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="text-xs md:text-sm text-foreground/50">
            Mix and match sizes for your perfect custom order
          </p>
        </div>
      </div>
    </section>
  );
}