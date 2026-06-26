import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What materials are used in your jewelry?",
    answer: "All our jewelry is crafted from 925 Sterling Silver, ensuring quality and durability. Each piece is handcrafted by Adil Ali with precision and care."
  },
  {
    question: "How much does each letter cost?",
    answer: "We offer five sizes with fixed pricing: Extra Small ($1), Small ($2), Medium ($3), Large ($4), and Extra Large ($5) per piece. Shipping is a flat $10 via FedEx Ground to Houston."
  },
  {
    question: "Can I order multiple letters?",
    answer: "Yes! You can order multiple letters with individual quantities and sizes. For example, you could order A×30 (Medium), B×42 (Large), D×11 (Small) all in one order. Each letter can have its own quantity and size."
  },
  {
    question: "What sizes are available?",
    answer: "We offer five sizes: Extra Small ($1), Small ($2), Medium ($3), Large ($4), and Extra Large ($5) per piece. Each letter in your order can have its own individual size!"
  },
  {
    question: "Where do you ship to?",
    answer: "We currently only ship to Houston, Texas via FedEx Ground for a flat rate of $10. We specialize in serving the Houston community."
  },
  {
    question: "How do I place an order?",
    answer: "Select your desired letters (A-Z) and quantities, choose your size (Extra Small/Small/Medium/Large/Extra Large), enter your Houston shipping address, and pay securely via Stripe checkout (Card, Cash App, or Link). You'll receive a confirmation email with your order details."
  },
  {
    question: "How can I contact you?",
    answer: "We prefer communication through social media for order inquiries and custom requests. Follow us on Instagram, Facebook, or Twitter @forgedinitials."
  },
  {
    question: "How long does production take?",
    answer: "Each piece is handcrafted to order. Production typically takes 2-5 business days, with delivery within 3-7 days after shipping via FedEx Ground to Houston."
  },
  {
    question: "Is this real sterling silver?",
    answer: "Yes! All our jewelry is made from genuine 925 Sterling Silver. This means it contains 92.5% pure silver, which is the standard for quality sterling silver jewelry."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, Cash App, and Link through our secure Stripe checkout for convenient payment options."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-zinc-900 to-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="mb-3 md:mb-4 text-amber-400 text-3xl md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto px-2">
            Everything you need to know about our handcrafted sterling silver letter jewelry.
            Can't find what you're looking for? Reach out via social media!
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-amber-400/30 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex items-center justify-between gap-3 md:gap-4 hover:bg-zinc-800/50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="text-white pr-4 md:pr-8 text-sm md:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`flex-shrink-0 w-5 h-5 text-amber-400 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-4 md:px-6 pb-4 md:pb-5 pt-2 text-sm md:text-base text-zinc-400 border-t border-zinc-800">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-12 text-center px-2">
          <p className="text-sm md:text-base text-zinc-400 mb-4">
            Still have questions?
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4">
            <a
              href="https://instagram.com/forgedinitials"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 md:px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all duration-300 text-sm md:text-base text-center"
            >
              Contact on Instagram
            </a>
            <a
              href="https://facebook.com/forgedinitials"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 md:px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all duration-300 border border-zinc-700 text-sm md:text-base text-center"
            >
              Message on Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
