import { bookCallUrl } from '../utils/booking';

export function BookCallLink({ orderNumber }: { orderNumber: string }) {
  return (
    <a href={bookCallUrl(orderNumber)} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-blue-700 hover:underline">
      Book a call about this order
    </a>
  );
}
