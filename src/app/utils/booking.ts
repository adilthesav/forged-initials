export const BOOK_CALL_URL = 'https://cal.com/adilthesav-h9hqgq/talk-with-forged-initials';

// Fills in the booking form's order number question, so customers don't need to remember it
export function bookCallUrl(orderNumber: string) {
  return `${BOOK_CALL_URL}?orderNumber=${encodeURIComponent(orderNumber)}`;
}
