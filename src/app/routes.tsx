import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { HomePage } from './pages/HomePage';
import { Contact } from './components/Contact';
import { FAQPage } from './components/FAQPage';
import { TrackOrder } from './components/TrackOrder';
import { BlogPage } from './components/BlogPage';
import { BlogPostPage } from './components/BlogPostPage';
import { ShopSection } from './components/ShopSection';
import { OwnerProductPanel } from './components/OwnerProductPanel';
import { SuccessPage } from './components/SuccessPage';
import { CancelPage } from './components/CancelPage';
import { TestSystem } from './components/TestSystem';
import { QuickEmailGenerator } from './components/QuickEmailGenerator';
import { ShopifyCallback } from './components/ShopifyCallback';
import { OwnerBlogPanel } from './components/OwnerBlogPanel';

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
      { path: 'admin-shop', Component: OwnerProductPanel },
      { path: 'admin-blog', Component: OwnerBlogPanel },
      { path: 'test', Component: () => <div className="pt-20 pb-20 bg-slate-50 min-h-screen"><TestSystem onNavigate={() => {}} /></div> },
      { path: 'email', Component: () => <div className="pt-20 pb-20 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen"><QuickEmailGenerator onNavigate={() => {}} /></div> },
    ],
  },
  { path: '/success', Component: SuccessPage },
  { path: '/cancel', Component: CancelPage },
  { path: '/shopify/callback', Component: ShopifyCallback },
]);
