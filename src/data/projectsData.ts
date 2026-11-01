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

// Specific IDs and Titles of the 6 placeholder projects to remove
export const PLACEHOLDER_PROJECT_IDS = new Set<number>([
  1710000001,
  1710000002,
  1710000003,
  1710000004,
  1710000005,
  1710000006,
]);

export const PLACEHOLDER_PROJECT_TITLES = new Set<string>([
  'E-Shop MERN E-Commerce Platform',
  'FDFN Broadband & ISP Management Platform',
  'Google Search Engine Experience',
  'Kyoto Artisan Cafe & Roastery',
  'Siam Bistro Modern Dining Experience',
  'Marina Horizon Residences & Architecture',
]);

// Initial portfolio items without any placeholder projects
export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [];
