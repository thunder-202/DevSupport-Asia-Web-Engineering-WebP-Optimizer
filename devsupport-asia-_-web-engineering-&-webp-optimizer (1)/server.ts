import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.PORTFOLIO_ADMIN_PASSWORD || 'Nay#-%"(202)!';

const PROJECTS_TS_PATH = path.resolve(__dirname, 'src/data/projectsData.ts');
const PROJECTS_JSON_DIR = path.resolve(__dirname, 'data');
const PROJECTS_JSON_PATH = path.resolve(PROJECTS_JSON_DIR, 'projects.json');

interface PortfolioItem {
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

const PLACEHOLDER_IDS = new Set<number>([
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,
  1710000001, 1710000002, 1710000003, 1710000004, 1710000005, 1710000006,
]);

const PLACEHOLDER_TITLES = new Set<string>([
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

function isPlaceholder(item: unknown): boolean {
  if (!item || typeof item !== 'object') return true;
  const p = item as Partial<PortfolioItem>;
  if (PLACEHOLDER_IDS.has(Number(p.id))) return true;
  if (p.title && PLACEHOLDER_TITLES.has(String(p.title).trim())) return true;
  return false;
}

function sanitizeItems(rawItems: unknown): PortfolioItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .filter((item) => !isPlaceholder(item))
    .map((item, idx) => {
      const p = item as Record<string, unknown>;
      const normalized: PortfolioItem = {
        id: typeof p.id === 'number' && !Number.isNaN(p.id) ? p.id : Date.now() + idx,
        title: String(p.title || `Project #${idx + 1}`).trim(),
        category: String(p.category || 'Custom Web').trim(),
        description: p.description ? String(p.description).trim() : '',
        dataUrl: String(p.dataUrl || ''),
        date: String(p.date || new Date().toISOString().split('T')[0]),
        sizeKb: String(p.sizeKb || ''),
        isPermanent: true,
      };
      if (p.githubUrl && String(p.githubUrl).trim()) {
        normalized.githubUrl = String(p.githubUrl).trim();
      }
      if (p.liveUrl && String(p.liveUrl).trim()) {
        normalized.liveUrl = String(p.liveUrl).trim();
      }
      return normalized;
    });
}

function readHardcodedFromTsFile(): PortfolioItem[] {
  try {
    if (!fs.existsSync(PROJECTS_TS_PATH)) return [];
    const content = fs.readFileSync(PROJECTS_TS_PATH, 'utf-8');
    const match = content.match(
      /\/\/ @HARDCODED_PROJECTS_START[\s\S]*?export const HARDCODED_PROJECTS:\s*PortfolioItem\[\]\s*=\s*(\[[\s\S]*?\]);[\s\S]*?\/\/ @HARDCODED_PROJECTS_END/
    );
    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      return sanitizeItems(parsed);
    }
  } catch (err) {
    console.error('Failed to read projects from projectsData.ts:', err);
  }
  return [];
}

function readStoredProjects(): PortfolioItem[] {
  try {
    if (fs.existsSync(PROJECTS_JSON_PATH)) {
      const raw = fs.readFileSync(PROJECTS_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return sanitizeItems(parsed);
    }
  } catch (err) {
    console.error('Failed to read projects.json:', err);
  }
  return readHardcodedFromTsFile();
}

function writeHardcodedProjects(items: PortfolioItem[]): { hardcodedToSource: boolean; savedJson: boolean } {
  const clean = sanitizeItems(items);
  const serializedArray = JSON.stringify(clean, null, 2);

  let savedJson = false;
  let hardcodedToSource = false;

  try {
    if (!fs.existsSync(PROJECTS_JSON_DIR)) {
      fs.mkdirSync(PROJECTS_JSON_DIR, { recursive: true });
    }
    fs.writeFileSync(PROJECTS_JSON_PATH, serializedArray + '\n', 'utf-8');
    savedJson = true;
  } catch (err) {
    console.error('Could not write data/projects.json:', err);
  }

  try {
    if (fs.existsSync(PROJECTS_TS_PATH)) {
      const currentTs = fs.readFileSync(PROJECTS_TS_PATH, 'utf-8');
      const replacementBlock = `// @HARDCODED_PROJECTS_START\nexport const HARDCODED_PROJECTS: PortfolioItem[] = ${serializedArray};\n// @HARDCODED_PROJECTS_END`;
      const markerRegex = /\/\/ @HARDCODED_PROJECTS_START[\s\S]*?\/\/ @HARDCODED_PROJECTS_END/;
      if (markerRegex.test(currentTs)) {
        const updatedTs = currentTs.replace(markerRegex, replacementBlock);
        fs.writeFileSync(PROJECTS_TS_PATH, updatedTs, 'utf-8');
        hardcodedToSource = true;
      }
    }
  } catch (err) {
    console.error('Could not update src/data/projectsData.ts directly:', err);
  }

  return { hardcodedToSource, savedJson };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/projects', (_req, res) => {
    const items = readStoredProjects();
    res.json({ ok: true, items });
  });

  app.post('/api/projects/sync', (req, res) => {
    const { password, items } = req.body || {};
    if (password !== ADMIN_PASSWORD) {
      res.status(403).json({ ok: false, error: 'Invalid administrator password.' });
      return;
    }
    if (!Array.isArray(items)) {
      res.status(400).json({ ok: false, error: 'Expected items array.' });
      return;
    }

    const clean = sanitizeItems(items);
    const result = writeHardcodedProjects(clean);
    res.json({
      ok: true,
      items: clean,
      hardcodedToSource: result.hardcodedToSource,
      savedJson: result.savedJson,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
