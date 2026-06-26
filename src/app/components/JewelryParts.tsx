import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Settings, Sparkles, ShoppingBag } from 'lucide-react';
const bailSizesImage = '/bail-sizes.jpeg';
const prongSizesImage = '/prong-sizes.jpeg';

export function JewelryParts() {
  const bailPricing = [
    { size: 'XS', description: 'Tiny / light pendants', price: '$1.50', includes: 'Includes jump ring' },
    { size: 'S', description: 'Small–medium pendants', price: '$2.00', includes: 'Includes jump ring' },
    { size: 'M', description: 'Medium–large pendants', price: '$2.50', includes: 'Includes jump ring' },
    { size: 'L', description: 'Large / heavy pendants', price: '$3.00', includes: 'Includes jump ring' },
  ];

  const prongPricing = [
    { size: '½ Carat', description: 'Small stones', price: '$1.75', setting: '4mm–5mm stones' },
    { size: '1 Carat', description: 'Large stones', price: '$2.75', setting: '8mm–10mm stones' },
  ];

  const additionalParts = [
    { name: 'Extra Jump Ring', description: 'Individual jump ring (any size)', price: '$0.50' },
  ];

  return (
    <section id="jewelry-parts" className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16">
          <Badge variant="outline" className="mb-3 md:mb-4 text-xs md:text-sm">
            <ShoppingBag className="w-3 h-3 mr-2" />
            Premium Jewelry Parts
          </Badge>
          <h2 className="mb-3 md:mb-4 text-2xl md:text-3xl lg:text-4xl">Sterling Silver Components</h2>
          <p className="text-sm md:text-base text-muted-foreground px-4">
            Authentic 925 sterling silver bails, prongs, and findings. Perfect for jewelers and DIY enthusiasts. Houston delivery only.
          </p>
        </div>

        {/* Bail Size Comparison Showcase */}
        <div className="max-w-5xl mx-auto mb-12 md:mb-16">
          <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-xl">
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col items-center gap-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl md:text-2xl">Bail Size Comparison</h3>
                  <p className="text-sm text-muted-foreground">
                    See the actual size differences of our handcrafted sterling silver bails
                  </p>
                </div>
                
                <div className="relative w-full">
                  <img 
                    src={bailSizesImage} 
                    alt="Sterling Silver Bail Sizes - XS, Small, Medium, Large" 
                    className="w-full h-auto rounded-lg shadow-lg border-2 border-white"
                  />
                  
                  {/* Size Labels Overlay */}
                  <div className="grid grid-cols-4 gap-2 mt-4 px-4 md:px-8">
                    <div className="text-center">
                      <Badge variant="secondary" className="w-full justify-center">XS</Badge>
                      <p className="text-xs text-muted-foreground mt-1">$1.50</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary" className="w-full justify-center">Small</Badge>
                      <p className="text-xs text-muted-foreground mt-1">$2.00</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary" className="w-full justify-center">Medium</Badge>
                      <p className="text-xs text-muted-foreground mt-1">$2.50</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary" className="w-full justify-center">Large</Badge>
                      <p className="text-xs text-muted-foreground mt-1">$3.00</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/80 px-4 py-2 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>All bails include built-in jump ring • 925 Sterling Silver</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prong Size Comparison Showcase */}
        <div className="max-w-5xl mx-auto mb-12 md:mb-16">
          <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-xl">
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col items-center gap-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl md:text-2xl">Prong Size Comparison</h3>
                  <p className="text-sm text-muted-foreground">
                    See the actual size differences of our handcrafted sterling silver prongs
                  </p>
                </div>
                
                <div className="relative w-full">
                  <img 
                    src={prongSizesImage} 
                    alt="Sterling Silver Prong Sizes - Half-Carat and 1 Carat" 
                    className="w-full h-auto rounded-lg shadow-lg border-2 border-white"
                  />
                  
                  {/* Size Labels Overlay */}
                  <div className="grid grid-cols-2 gap-4 mt-4 px-4 md:px-12 max-w-2xl mx-auto">
                    <div className="text-center">
                      <Badge variant="secondary" className="w-full justify-center">1 Carat</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Large prong</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary" className="w-full justify-center">½ Carat</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Small prong</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/80 px-4 py-2 rounded-full">
                  <Settings className="w-3 h-3" />
                  <span>Precision prong settings for stones • 925 Sterling Silver</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Sterling Silver Bails */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Sterling Silver Bails
              </CardTitle>
              <p className="text-sm text-muted-foreground">Each bail includes built-in jump ring</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Best For</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bailPricing.map((bail) => (
                      <TableRow key={bail.size}>
                        <TableCell>
                          <Badge variant="outline">{bail.size}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{bail.description}</div>
                            <div className="text-xs text-muted-foreground">{bail.includes}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{bail.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Sterling Silver Prongs */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Sterling Silver Prongs
              </CardTitle>
              <p className="text-sm text-muted-foreground">Precision prong settings for stones</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Best For</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prongPricing.map((prong) => (
                      <TableRow key={prong.size}>
                        <TableCell>
                          <Badge variant="outline">{prong.size}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{prong.description}</div>
                            <div className="text-xs text-muted-foreground">{prong.setting}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{prong.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Parts */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Additional Findings & Parts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {additionalParts.map((part, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-sm">{part.name}</div>
                      <div className="text-xs text-muted-foreground">{part.description}</div>
                    </div>
                    <div className="font-semibold">{part.price}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 max-w-3xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <p className="text-sm">
                <strong>Parts Only:</strong> All items sold as individual components. We specialize in premium 925 sterling silver findings for professional jewelers and DIY creators. Flat-rate $10 FedEx Ground shipping to Houston addresses only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}