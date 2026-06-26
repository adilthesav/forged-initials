import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const sizes = [
  {
    id: 1,
    name: 'Extra Small',
    price: '$1',
    dimensions: '3.3mm × 2.1mm',
    description: 'Ultra delicate',
    fontSize: 28,
  },
  {
    id: 2,
    name: 'Small',
    price: '$2',
    dimensions: '4.8mm × 3.1mm',
    description: 'Delicate and subtle',
    fontSize: 42,
  },
  {
    id: 3,
    name: 'Medium',
    price: '$3',
    dimensions: '6.9mm × 4.5mm',
    description: 'Perfect everyday wear',
    fontSize: 60,
  },
  {
    id: 4,
    name: 'Large',
    price: '$4',
    dimensions: '8.5mm × 5.5mm',
    description: 'Bold statement piece',
    fontSize: 80,
  },
  {
    id: 5,
    name: 'Extra Large',
    price: '$5',
    dimensions: '9.5mm × 6.2mm',
    description: 'Maximum impact',
    fontSize: 104,
  },
];

export function SizeComparison() {
  return (
    <section className="py-12 md:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <Badge className="mb-3 md:mb-4 text-xs md:text-sm">Size Guide</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4">
            Choose Your Perfect Size
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-foreground/60 max-w-2xl mx-auto px-4">
            Each letter is available in five sizes to suit your style. All measurements are approximate and may vary slightly due to the handcrafted nature of each piece.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
          {sizes.map((size) => (
            <Card key={size.id} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="text-center mb-3 md:mb-4">
                  <h3 className="mb-1 text-sm md:text-base">{size.name}</h3>
                  <p className="text-base md:text-lg text-primary mb-1">{size.price}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">{size.dimensions}</p>
                  <p className="text-[10px] md:text-xs text-foreground/60">{size.description}</p>
                </div>
                
                <div className="flex items-center justify-center rounded-lg min-h-[120px] md:min-h-[160px] lg:min-h-[200px]"
                  style={{ background: 'linear-gradient(135deg, #f5f0e8, #ede8dc)' }}>
                  <span
                    style={{
                      fontSize: size.fontSize,
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontWeight: 700,
                      lineHeight: 1,
                      background: 'linear-gradient(145deg, #d4a843, #b8952e, #e8c96a, #a07820)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 1px 2px rgba(160,120,32,0.3))',
                    }}
                  >
                    A
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 md:mt-12 text-center bg-muted/30 rounded-lg p-4 md:p-6 max-w-3xl mx-auto">
          <p className="text-xs md:text-sm text-foreground/70">
            <strong>Note:</strong> Sizing may appear different based on the letter shape and design. Contact us for specific measurements for your chosen letter.
          </p>
        </div>
      </div>
    </section>
  );
}