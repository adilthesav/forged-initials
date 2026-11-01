import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { HomePage } from './pages/HomePage';
import { Contact } from './components/Contact';
import { FAQPage } from './components/FAQPage';
import { TrackOrder } from './components/TrackOrder';
import { BlogPage } from './components/BlogPage';
import { BlogPostPage } from './components/BlogPostPage';
import { ShopSection } from './components/ShopSection';
import { PromotedPicks } from './components/PromotedPicks';
import { OwnerProductPanel } from './components/OwnerProductPanel';
import { SuccessPage } from './components/SuccessPage';
import { CancelPage } from './components/CancelPage';
import { ShopifyCallback } from './components/ShopifyCallback';
import { OwnerBlogPanel } from './components/OwnerBlogPanel';
import { PayOrderPage } from './components/PayOrderPage';
import { EditRequestPage } from './components/EditRequestPage';
import { OwnerOrdersPanel } from './components/OwnerOrdersPanel';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'contact', Component: () => <div className="pt-20"><Contact /></div> },
      { path: 'faq', Component: FAQPage },
      { path: 'track', Component: TrackOrder },
      { path: 'blog', Component: BlogPage },
      { path: 'blog/:slug', Component: BlogPostPage },
      { path: 'shop', Component: () => <div className="pt-4"><ShopSection /></div> },
      { path: 'selected', Component: () => <div className="pt-4"><ShopSection type="selected" /></div> },
      { path: 'picks', Component: PromotedPicks },
      { path: 'admin-shop', Component: OwnerProductPanel },
      { path: 'admin-orders', Component: OwnerOrdersPanel },
      { path: 'pay/:token', Component: PayOrderPage },
      { path: 'request/:token', Component: EditRequestPage },
      { path: 'admin-blog', Component: OwnerBlogPanel },
    ],
  },
  { path: '/success', Component: SuccessPage },
  { path: '/cancel', Component: CancelPage },
  { path: '/shopify/callback', Component: ShopifyCallback },
]);
