export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string
  category: string;
  tags: string[];
  date: string;
  readTime: number; // minutes
  coverImage: string;
  coverAlt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export const BLOG_CATEGORIES = [
  'All',
  'Care & Maintenance',
  'Gift Guides',
  'Behind the Craft',
  'Education',
  'Style Tips',
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-care-for-sterling-silver-jewelry',
    title: 'How to Care for Your Sterling Silver Jewelry',
    excerpt: 'Sterling silver is beautiful, durable, and timeless — but it does require a little love. Here\'s everything you need to know to keep your pieces shining for years.',
    category: 'Care & Maintenance',
    tags: ['sterling silver', 'jewelry care', 'cleaning tips', 'tarnish prevention'],
    date: 'June 10, 2026',
    readTime: 5,
    coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
    coverAlt: 'Sterling silver jewelry being polished',
    seoTitle: 'How to Care for Sterling Silver Jewelry | Forged Initials',
    seoDescription: 'Learn how to clean, store, and protect your sterling silver jewelry. Expert tips from Forged Initials to prevent tarnish and keep your pieces looking their best.',
    seoKeywords: 'sterling silver care, clean silver jewelry, prevent tarnish, silver jewelry maintenance',
    content: `
<h2>Why Sterling Silver Tarnishes</h2>
<p>Sterling silver is 92.5% pure silver alloyed with copper and other metals for strength — that's what the "925" stamp means. The copper content, while necessary for durability, reacts with sulfur in the air and on skin to form a dark layer called tarnish. This is completely natural and entirely reversible.</p>

<h2>Everyday Habits That Make a Big Difference</h2>
<ul>
  <li><strong>Put jewelry on last.</strong> Perfume, hairspray, and lotions contain chemicals that accelerate tarnishing. Let products dry before wearing your pieces.</li>
  <li><strong>Take it off before swimming.</strong> Chlorine in pools and salt in the ocean both aggressively attack silver.</li>
  <li><strong>Remove before cleaning.</strong> Household cleaners — especially bleach — can permanently damage silver.</li>
  <li><strong>Wear it often.</strong> The natural oils in your skin actually help keep silver polished. Silver that sits unworn tarnishes faster.</li>
</ul>

<h2>How to Clean Your Silver at Home</h2>
<p>For light tarnish, warm water and a few drops of mild dish soap work beautifully. Gently scrub with a soft-bristle toothbrush, rinse thoroughly, and pat dry with a lint-free cloth.</p>
<p>For stubborn tarnish, create a paste with baking soda and water. Apply with a soft cloth using small circular motions, rinse, and dry completely. Never use abrasive scrubbing pads — they will scratch the surface.</p>
<p>A silver polishing cloth is the fastest option for a quick shine before wearing. Keep one at your vanity and give your pieces a quick buff whenever you notice dulling.</p>

<h2>Proper Storage</h2>
<p>Air exposure is tarnish's best friend. Store your silver in an airtight bag or a jewelry box lined with anti-tarnish cloth. Keep individual pieces in separate pouches to prevent scratching. Adding a small chalk piece or silica gel packet to your storage area absorbs moisture and slows oxidation significantly.</p>

<h2>When to See a Professional</h2>
<p>If your piece has deep scratches, heavily embedded tarnish, or damaged prongs holding stones, bring it to a professional jeweler. Re-polishing can restore most pieces to near-original condition. For Forged Initials custom pieces, reach out to us directly — we're happy to advise on restoring your specific item.</p>
    `,
  },

  {
    id: '2',
    slug: 'what-makes-sterling-silver-special-guide-to-925',
    title: 'What Makes Sterling Silver Special: A Complete Guide to 925 Silver',
    excerpt: 'With so many metal options available, why does sterling silver remain the gold standard for handcrafted jewelry? We break down what makes 925 silver truly worth it.',
    category: 'Education',
    tags: ['925 silver', 'sterling silver', 'silver alloy', 'fine jewelry metals'],
    date: 'May 28, 2026',
    readTime: 6,
    coverImage: 'https://images.unsplash.com/photo-1567937926466-054ccbe7cc19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200',
    coverAlt: 'Close up of a metal object with engraved writing — sterling silver hallmark',
    seoTitle: 'What is 925 Sterling Silver? Complete Guide | Forged Initials',
    seoDescription: 'Discover what makes 925 sterling silver the preferred choice for fine handcrafted jewelry. Learn about purity, durability, and why it outperforms plated alternatives.',
    seoKeywords: '925 sterling silver, what is sterling silver, silver purity, fine jewelry metals, silver vs plated',
    content: `
<h2>The 925 Stamp Explained</h2>
<p>When you see "925" stamped on a piece of jewelry, it means the metal is 92.5% pure silver, with the remaining 7.5% made up of copper, zinc, or other alloys. Pure silver (999) is too soft for jewelry that holds its shape through daily wear — the alloy gives sterling silver the strength to last generations while retaining silver's signature luster and value.</p>

<h2>Sterling Silver vs. Silver-Plated</h2>
<p>This is the most important distinction in silver jewelry. Silver-plated pieces have a base of cheaper metal (usually brass or copper) coated with a thin layer of silver. Over time — often within months — that coating wears through to reveal the base metal underneath, which can cause skin discoloration and dramatically changes the appearance.</p>
<p>Sterling silver is solid 925 throughout. When it tarnishes or shows wear, polishing restores it to the same quality metal beneath. It won't "wear through" because there's nothing different underneath — it's silver all the way down.</p>

<h2>Hypoallergenic Properties</h2>
<p>High-quality sterling silver is generally well-tolerated even by people with metal sensitivities. The key is quality: lower-grade alloys sometimes use nickel, which is a common allergen. At Forged Initials, we use nickel-free sterling silver specifically for this reason. If you've had reactions to silver jewelry before, the culprit was likely nickel in the alloy, not the silver itself.</p>

<h2>Value Over Time</h2>
<p>Sterling silver jewelry holds intrinsic value as a precious metal. Unlike costume jewelry that has no material value once it's worn out, a sterling silver piece can be melted, refined, and repurposed. It's a minor consideration for most buyers, but it speaks to the material's authenticity and lasting worth.</p>

<h2>Why We Choose Sterling Silver for Every Piece</h2>
<p>At Forged Initials, we work exclusively in 925 sterling silver because it gives us the best canvas for our craft. It takes detail beautifully, holds edges sharply, polishes to a brilliant finish, and withstands the texturing and forming processes we use to create custom letter jewelry. We've tried other metals. We always come back to silver.</p>
    `,
  },

  {
    id: '3',
    slug: 'custom-letter-jewelry-perfect-personalized-gift',
    title: 'Custom Letter Jewelry: The Perfect Personalized Gift for Any Occasion',
    excerpt: 'From initials to meaningful words, custom letter jewelry creates a connection that no off-the-shelf piece can match. Here\'s how to choose the perfect one.',
    category: 'Gift Guides',
    tags: ['personalized gifts', 'custom jewelry', 'letter jewelry', 'gift ideas', 'initials'],
    date: 'May 14, 2026',
    readTime: 4,
    coverImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80',
    coverAlt: 'Custom sterling silver letter jewelry laid out on a marble surface',
    seoTitle: 'Custom Letter Jewelry Gift Ideas | Forged Initials Houston',
    seoDescription: 'Discover why custom sterling silver letter jewelry makes the most meaningful personalized gift. Shop initials, names, and custom pieces handcrafted in Houston.',
    seoKeywords: 'custom letter jewelry gift, personalized jewelry Houston, sterling silver initials, custom jewelry gift ideas',
    content: `
<h2>Why Personalized Jewelry Hits Different</h2>
<p>There's a reason personalized gifts consistently rank as the most treasured. A piece chosen specifically for someone — their initial, their child's letter, a meaningful word — communicates a level of thoughtfulness that no generic gift can replicate. Custom letter jewelry takes this a step further by turning that meaning into something they can wear every day.</p>

<h2>Choosing the Right Letter or Initials</h2>
<p>The most common choices are the recipient's first initial, their last name initial, or the first initial of someone they love — a child, partner, or parent. Couples often exchange each other's initials. Parents collect initials of their children. The options are personal and endless.</p>
<p>If you're unsure, first initials are the safest choice for most recipients. For a more distinctive piece, consider a monogram arrangement using first, middle, and last initial.</p>

<h2>Size Matters More Than You Think</h2>
<p>At Forged Initials, our letters come in multiple sizes. Smaller pieces (around 10–15mm) read as delicate and layerable — perfect for everyday wear, stacking with other jewelry, or a subtle personal touch. Larger letters (20mm and above) make a bolder statement and wear beautifully as solo statement pieces or pendants.</p>
<p>Consider the recipient's typical style. Do they wear a lot of jewelry or very little? Minimalist wearers usually prefer something subtle. Those who love to layer and stack often appreciate a larger, chunkier letter they can build around.</p>

<h2>Bail and Prong Options</h2>
<p>A bail is what allows a letter to become a pendant on a chain. We offer bails as an add-on, so any of our letters can become a necklace. Prongs are added to convert a letter into a ring setting or to give a decorative dimensional effect. These customization options mean one letter can become several completely different pieces.</p>

<h2>Occasions That Call for Custom Letter Jewelry</h2>
<ul>
  <li><strong>Birthdays</strong> — especially milestone birthdays (16, 18, 21, 30, 50)</li>
  <li><strong>Graduations</strong> — a first initial to mark a major chapter</li>
  <li><strong>Mother's Day</strong> — children's initials, the most meaningful gift a parent can receive</li>
  <li><strong>Valentine's Day</strong> — a partner's initial or the first letter of something meaningful</li>
  <li><strong>Christmas</strong> — personal without requiring deep knowledge of their taste</li>
  <li><strong>New babies</strong> — the baby's initial for the parent, or a piece to grow into</li>
</ul>

<h2>How to Order from Forged Initials</h2>
<p>Every piece is made to order. Use our Custom Order form to select your letter, size, finish, and any add-ons like bails or prongs. We'll confirm your order details and get to work. Pieces ship via FedEx Ground to the Houston area, so plan ahead for time-sensitive gifts.</p>
    `,
  },

  {
    id: '4',
    slug: 'how-our-custom-jewelry-is-made',
    title: 'From Raw Silver to Finished Piece: How Our Custom Jewelry Is Made',
    excerpt: 'Every letter that leaves our workshop has been touched, shaped, and refined by hand. We pull back the curtain on our craft and show you exactly what goes into each piece.',
    category: 'Behind the Craft',
    tags: ['handcrafted jewelry', 'jewelry making', 'sterling silver craft', 'custom jewelry process'],
    date: 'April 30, 2026',
    readTime: 7,
    coverImage: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=80',
    coverAlt: 'Jeweler working on sterling silver piece at a workbench',
    seoTitle: 'How Our Handcrafted Sterling Silver Jewelry Is Made | Forged Initials',
    seoDescription: 'Go behind the scenes at Forged Initials and see exactly how our custom sterling silver letter jewelry is handcrafted from raw silver to finished piece.',
    seoKeywords: 'handcrafted jewelry process, how jewelry is made, custom silver jewelry Houston, sterling silver fabrication',
    content: `
<h2>It Starts with the Metal</h2>
<p>Every piece begins with 925 sterling silver sheet or wire, sourced specifically for jewelry-grade applications. We inspect each batch for purity and consistency before it ever touches our tools. The quality of what you start with determines the ceiling of what you can create.</p>

<h2>Cutting and Forming</h2>
<p>Letter shapes are traced or templated onto the silver sheet, then cut using jeweler's saws and shears. This stage requires patience and precision — a slightly uneven cut at this stage means more work correcting it later. After rough cutting, files and sanding sticks bring edges to their final crisp shape.</p>
<p>Three-dimensional letters require forming the flat-cut shape around mandrels and stakes to create curves and depth. This is where the work becomes genuinely sculptural — we're translating a flat sheet of metal into something with volume and presence.</p>

<h2>Texturing and Surface Work</h2>
<p>Depending on the design, surfaces may be hammered, stamped, or brushed at this stage. We offer both high-polish finishes (mirror-bright) and matte/brushed finishes. The surface treatment is applied before any assembly so that every face of the piece gets consistent treatment — not just the sides visible after joining.</p>

<h2>Soldering and Assembly</h2>
<p>If a piece has multiple components — a bail for pendant conversion, prong settings, or compound letter forms — they're joined using silver solder at this stage. Soldering silver requires precise heat control. Too little and the joint won't flow; too much and you risk melting the surrounding metal. Each solder joint is cleaned, filed flush, and inspected before moving on.</p>

<h2>Finishing</h2>
<p>Final finishing involves progressively finer grits of sandpaper to remove any tool marks, followed by polishing compounds on a buffing wheel for high-polish pieces. Matte finishes are achieved with wire brushing or specific abrasive compounds that leave a consistent satin texture.</p>
<p>The piece is then cleaned ultrasonically to remove all compounds and residues, leaving the silver bright and ready for inspection.</p>

<h2>Quality Check and Shipping</h2>
<p>Every finished piece is checked against the original order — correct letter, correct size, correct finish, correct add-ons. We inspect edges, surfaces, solder joints, and overall proportions before packaging. Pieces ship in a custom jewelry box via FedEx Ground.</p>
<p>This entire process, from blank sheet to packaged piece, typically takes several business days depending on complexity and current order volume. We don't rush. A piece meant to last years deserves the time to do it right.</p>
    `,
  },

  {
    id: '5',
    slug: 'how-to-style-letter-jewelry',
    title: 'How to Style Letter Jewelry: Layering, Stacking, and Making It Your Own',
    excerpt: 'A single initial can anchor an entire look. Here\'s how to style sterling silver letter jewelry for everyday wear, layering, and special occasions.',
    category: 'Style Tips',
    tags: ['jewelry styling', 'layering jewelry', 'letter jewelry style', 'silver jewelry fashion'],
    date: 'April 15, 2026',
    readTime: 4,
    coverImage: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=80',
    coverAlt: 'Layered silver jewelry necklaces styled together',
    seoTitle: 'How to Style Sterling Silver Letter Jewelry | Forged Initials',
    seoDescription: 'Learn how to style, layer, and stack sterling silver letter jewelry for any occasion. Tips on chain lengths, mixing metals, and building a signature jewelry look.',
    seoKeywords: 'how to style letter jewelry, layering necklaces, sterling silver styling, jewelry stacking tips',
    content: `
<h2>The Power of a Single Initial</h2>
<p>A letter pendant on a simple chain is one of the most versatile pieces you can own. It reads as personal without being overtly flashy, pairs with virtually any outfit, and immediately gives an outfit a focal point. If you're new to jewelry or building a minimal collection, a single initial pendant is the smartest starting point.</p>

<h2>Chain Length Makes Everything</h2>
<p>The chain length determines how your pendant reads. A 16-inch chain sits at the collarbone — ideal for V-necks, scoop necks, and boat necks. An 18-inch chain drops slightly lower, more versatile across necklines. 20 inches or more creates a longer, more relaxed drop that layers beautifully over other pieces or looks great solo over a plain tee.</p>
<p>When layering multiple chains with letter pendants, vary the lengths by at least 2 inches between each layer so they each get visual breathing room.</p>

<h2>Layering Multiple Letters</h2>
<p>Layering initials has become a defining jewelry trend because it's so personal. Common combinations: your own initial + a partner's initial, two children's initials, or three letters spelling a meaningful word or name abbreviated.</p>
<p>For clean layering, keep all pieces in the same metal (all sterling silver reads as intentional; mixing metals requires more styling intention). Vary the letter sizes slightly — a larger statement letter at one length and a smaller, more delicate letter at another creates visual hierarchy instead of competition.</p>

<h2>Mixing with Other Jewelry</h2>
<p>Sterling silver letter pendants play well with delicate chains, simple hoops, small stud earrings, and minimalist rings. The key is balance — if the letter pendant is the statement, keep everything else quiet. If you're wearing bold earrings or a chunky ring, keep the pendant simple and let it support rather than compete.</p>

<h2>Everyday vs. Occasion Wear</h2>
<p>Smaller letters in a simple pendant format are ideal for daily wear — low-profile enough to not catch on clothing, light enough to forget you're wearing them, durable enough to handle the day. Larger, more sculptural letters with texture or prong details work best for occasions where the piece can be seen and appreciated up close.</p>

<h2>Caring for Styled Pieces</h2>
<p>When pieces are layered and touching, they can tangle and cause friction wear. Store layered necklaces separately when not in use, or hang them on individual hooks. Clasp them closed before storing to prevent chains knotting.</p>
    `,
  },
];
