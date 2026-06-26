import { FAQ } from './FAQ';
import { SchemaMarkup, SchemaTypes } from './SchemaMarkup';

export function FAQPage() {
  return (
    <>
      {/* FAQ Schema for SEO */}
      <SchemaMarkup type={SchemaTypes.FAQ} />
      
      <div className="pt-20">
        <FAQ />
      </div>
    </>
  );
}
