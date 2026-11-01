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

// Legacy and removed non-existent placeholder project IDs to strictly ignore and scrub
export const PLACEHOLDER_PROJECT_IDS = new Set<number>([
  101,
  102,
  103,
  104,
  105,
  106,
  107,
  108,
  109,
  110,
  111,
  112,
  1710000001,
  1710000002,
  1710000003,
  1710000004,
  1710000005,
  1710000006,
]);

export const PLACEHOLDER_PROJECT_TITLES = new Set<string>([
  'FDFN Broadband & ISP Management Platform',
  'E-Shop MERN E-Commerce Platform',
  'Google Search Engine Experience',
  'TeleDoctor Healthcare & Telemedicine Portal',
  'React & Redux Shopping Experience',
  'Apex Banking & Financial Transaction System',
  'Anchorblock Task Management Platform',
  'Baran Fitness Club & Gym Membership Portal',
  'PrivaLink Secure Communication Utility',
  'Nova Boutique & Apparel E-Commerce Store',
  'Temperature Hot Global Weather Forecast App',
  'TaskMaster Cloud Todo & Productivity App',
  'Kyoto Artisan Cafe & Roastery',
  'Siam Bistro Modern Dining Experience',
  'Marina Horizon Residences & Architecture',
  'Apex Prime Real Estate',
]);

export function isPlaceholderProject(item: unknown): boolean {
  if (!item || typeof item !== 'object') return true;
  const candidate = item as Partial<PortfolioItem>;
  if (PLACEHOLDER_PROJECT_IDS.has(Number(candidate.id))) return true;
  if (candidate.title && PLACEHOLDER_PROJECT_TITLES.has(String(candidate.title).trim())) return true;
  return false;
}

// Projects added via the UI are automatically hardcoded directly into this array by the server
// @HARDCODED_PROJECTS_START
export const HARDCODED_PROJECTS: PortfolioItem[] = [];
// @HARDCODED_PROJECTS_END

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = HARDCODED_PROJECTS;

/**
 * Generates clean, valid TypeScript source code for src/data/projectsData.ts
 * with the provided projects hardcoded directly into HARDCODED_PROJECTS.
 */
export function serializeProjectsDataTs(items: PortfolioItem[]): string {
  const sanitized = items
    .filter((item) => !isPlaceholderProject(item))
    .map((item) => ({
      ...item,
      isPermanent: true,
    }));

  const serializedArray = JSON.stringify(sanitized, null, 2);

  return [
    'export interface PortfolioItem {',
    '  id: number;',
    '  title: string;',
    '  category: string;',
    '  description?: string;',
    '  githubUrl?: string;',
    '  liveUrl?: string;',
    '  dataUrl: string;',
    '  date: string;',
    '  sizeKb: string;',
    '  isPermanent?: boolean;',
    '}',
    '',
    'export const PLACEHOLDER_PROJECT_IDS = new Set<number>([',
    '  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,',
    '  1710000001, 1710000002, 1710000003, 1710000004, 1710000005, 1710000006,',
    ']);',
    '',
    'export const PLACEHOLDER_PROJECT_TITLES = new Set<string>([',
    "  'FDFN Broadband & ISP Management Platform',",
    "  'E-Shop MERN E-Commerce Platform',",
    "  'Google Search Engine Experience',",
    "  'TeleDoctor Healthcare & Telemedicine Portal',",
    "  'React & Redux Shopping Experience',",
    "  'Apex Banking & Financial Transaction System',",
    "  'Anchorblock Task Management Platform',",
    "  'Baran Fitness Club & Gym Membership Portal',",
    "  'PrivaLink Secure Communication Utility',",
    "  'Nova Boutique & Apparel E-Commerce Store',",
    "  'Temperature Hot Global Weather Forecast App',",
    "  'TaskMaster Cloud Todo & Productivity App',",
    "  'Kyoto Artisan Cafe & Roastery',",
    "  'Siam Bistro Modern Dining Experience',",
    "  'Marina Horizon Residences & Architecture',",
    "  'Apex Prime Real Estate',",
    ']);',
    '',
    'export function isPlaceholderProject(item: unknown): boolean {',
    "  if (!item || typeof item !== 'object') return true;",
    '  const candidate = item as Partial<PortfolioItem>;',
    '  if (PLACEHOLDER_PROJECT_IDS.has(Number(candidate.id))) return true;',
    '  if (candidate.title && PLACEHOLDER_PROJECT_TITLES.has(String(candidate.title).trim())) return true;',
    '  return false;',
    '}',
    '',
    '// @HARDCODED_PROJECTS_START',
    `export const HARDCODED_PROJECTS: PortfolioItem[] = ${serializedArray};`,
    '// @HARDCODED_PROJECTS_END',
    '',
    'export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = HARDCODED_PROJECTS;',
    '',
    'export function serializeProjectsDataTs(nextItems: PortfolioItem[]): string {',
    '  const clean = nextItems.filter((i) => !isPlaceholderProject(i)).map((i) => ({ ...i, isPermanent: true }));',
    '  return `// @HARDCODED_PROJECTS_START\\nexport const HARDCODED_PROJECTS: PortfolioItem[] = ${JSON.stringify(clean, null, 2)};\\n// @HARDCODED_PROJECTS_END\\n`;',
    '}',
    '',
  ].join('\n');
}
