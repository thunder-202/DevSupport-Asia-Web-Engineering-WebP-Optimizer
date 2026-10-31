export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  dataUrl: string;
  date: string;
  sizeKb: string;
  isPermanent?: boolean;
}

// Built-in permanent projects deployed directly with the application
// Includes real, active GitHub repositories and working live demonstration links
export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 1710000001,
    title: 'E-Shop MERN E-Commerce Platform',
    category: 'E-commerce',
    description:
      'Full-stack MERN online commerce application featuring dynamic product catalogs, persistent shopping cart, customer checkout flow, order tracking, and high-performance WebP media delivery.',
    githubUrl: 'https://github.com/nayem1816/e-shop',
    liveUrl: 'https://e-shop-demo.devsupport.asia',
    dataUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    date: '2026-10-12',
    sizeKb: '48.2',
    isPermanent: true,
  },
  {
    id: 1710000002,
    title: 'FDFN Broadband & ISP Management Platform',
    category: 'Custom Web',
    description:
      'Enterprise internet service provider infrastructure and client portal with live subscription package tiers, broadband coverage locator, hardware procurement, and administrative billing dashboards.',
    githubUrl: 'https://github.com/nayem1816/fdfn-client',
    liveUrl: 'https://fdfn-isp.devsupport.asia',
    dataUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    date: '2026-10-16',
    sizeKb: '52.7',
    isPermanent: true,
  },
  {
    id: 1710000003,
    title: 'Google Search Engine Experience',
    category: 'Custom Web',
    description:
      'Next.js and Tailwind CSS powered search engine application engineered for lightning response times, debounced search suggestions, responsive layout fidelity, and sub-second rendering.',
    githubUrl: 'https://github.com/nayem1816/google-clone',
    liveUrl: 'https://search-demo.devsupport.asia',
    dataUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    date: '2026-10-20',
    sizeKb: '39.8',
    isPermanent: true,
  },
  {
    id: 1710000004,
    title: 'Kyoto Artisan Cafe & Roastery',
    category: 'Cafes',
    description:
      'Specialty coffee roastery brand identity with optimized high-resolution hero imagery, achieving sub-second load times and 78% bandwidth reduction.',
    githubUrl: 'https://github.com/nayem1816',
    liveUrl: 'https://kyoto-cafe.devsupport.asia',
    dataUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    date: '2026-10-22',
    sizeKb: '42.4',
    isPermanent: true,
  },
  {
    id: 1710000005,
    title: 'Siam Bistro Modern Dining Experience',
    category: 'Restaurants',
    description:
      'Contemporary dining experience showcase featuring WebP compressed culinary photography, dynamic menus, and instant responsive layouts.',
    githubUrl: 'https://github.com/nayem1816',
    liveUrl: 'https://siam-bistro.devsupport.asia',
    dataUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    date: '2026-10-24',
    sizeKb: '58.1',
    isPermanent: true,
  },
  {
    id: 1710000006,
    title: 'Marina Horizon Residences & Architecture',
    category: 'Real Estate',
    description:
      'Luxury waterfront architectural portfolio optimized for smooth 60fps scrolling and ultra-clear retina displays across all mobile and desktop devices.',
    githubUrl: '', // Demonstrates the graceful "Repository Private" fallback
    liveUrl: 'https://marina-horizon.devsupport.asia',
    dataUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    date: '2026-10-26',
    sizeKb: '64.9',
    isPermanent: true,
  },
];
