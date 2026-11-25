import express from 'express';
import type { Request, Response } from 'express';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import 'dotenv/config';

interface PortfolioItemPayload {
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

interface StoredCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.resolve(process.cwd());
const DATA_DIR = path.resolve(ROOT_DIR, 'src', 'data');
const PROJECTS_FILE = path.resolve(DATA_DIR, 'projectsData.ts');
const AUTH_STORE_FILE = path.resolve(ROOT_DIR, '.admin-auth.json');

if (!PROJECTS_FILE.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid projectsData.ts path configuration.');
}
if (!AUTH_STORE_FILE.startsWith(ROOT_DIR + path.sep)) {
  throw new Error('Invalid auth store path configuration.');
}

const PLACEHOLDER_IDS = [
  1710000001,
  1710000002,
  1710000003,
  1710000004,
  1710000005,
  1710000006,
];

const PLACEHOLDER_TITLES = [
  'Kyoto Artisan Cafe & Roastery',
  'Siam Bistro Modern Dining Experience',
  'Marina Horizon Residences & Architecture',
  'Apex Prime Real Estate',
];

const PLACEHOLDER_ID_SET = new Set<number>(PLACEHOLDER_IDS);
const PLACEHOLDER_TITLE_SET = new Set<string>(PLACEHOLDER_TITLES);

// Simple in-memory rate limiting for auth-protected endpoints
const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILED_ATTEMPTS = 15;
const RATE_WINDOW_MS = 5 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

function getConfiguredEnvPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw;
  }
  return null;
}

function readClaimedCredential(): StoredCredential | null {
  try {
    if (!fs.existsSync(AUTH_STORE_FILE)) return null;
    const raw = fs.readFileSync(AUTH_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoredCredential>;
    if (
      typeof parsed.salt === 'string' &&
      parsed.salt.length >= 16 &&
      typeof parsed.hash === 'string' &&
      parsed.hash.length === 128
    ) {
      return {
        salt: parsed.salt,
        hash: parsed.hash,
        claimedAt: typeof parsed.claimedAt === 'string' ? parsed.claimedAt : '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

function isAuthConfigured(): boolean {
  return Boolean(getConfiguredEnvPassword() || readClaimedCredential());
}

function verifyAdminPassword(submitted: string): boolean {
  if (typeof submitted !== 'string' || submitted.length === 0 || submitted.length > 256) {
    return false;
  }

  const envPassword = getConfiguredEnvPassword();
  if (envPassword) {
    const submittedDigest = crypto.createHash('sha256').update(submitted).digest();
    const expectedDigest = crypto.createHash('sha256').update(envPassword).digest();
    return crypto.timingSafeEqual(submittedDigest, expectedDigest);
  }

  const claimed = readClaimedCredential();
  if (!claimed) {
    return false;
  }

  try {
    const derived = crypto.scryptSync(submitted, claimed.salt, 64);
    const stored = Buffer.from(claimed.hash, 'hex');
    if (derived.length !== stored.length) return false;
    return crypto.timingSafeEqual(derived, stored);
  } catch {
    return false;
  }
}

function sanitizeHttpUrl(rawUrl: unknown): string | undefined {
  if (typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function sanitizeImageSrc(rawSrc: unknown): string | null {
  if (typeof rawSrc !== 'string') return null;
  const trimmed = rawSrc.trim();
  if (!trimmed) return null;

  if (/^data:image\/(webp|png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/assets/') && !trimmed.includes('..')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

function sanitizeProjects(rawProjects: unknown): PortfolioItemPayload[] | null {
  if (!Array.isArray(rawProjects) || rawProjects.length === 0 || rawProjects.length > 500) {
    return null;
  }

  const seenIds = new Set<number>();
  const sanitized: PortfolioItemPayload[] = [];

  for (let i = 0; i < rawProjects.length; i++) {
    const item = rawProjects[i];
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;

    const id = Number(record.id);
    if (!Number.isFinite(id) || id <= 0 || seenIds.has(id)) {
      return null;
    }

    const title = typeof record.title === 'string' ? record.title.trim().slice(0, 160) : '';
    if (!title) return null;

    if (PLACEHOLDER_ID_SET.has(id) || PLACEHOLDER_TITLE_SET.has(title)) {
      continue;
    }

    const category =
      typeof record.category === 'string' && record.category.trim()
        ? record.category.trim().slice(0, 80)
        : 'Custom Web';

    const dataUrl = sanitizeImageSrc(record.dataUrl);
    if (!dataUrl) return null;

    const description =
      typeof record.description === 'string' && record.description.trim()
        ? record.description.trim().slice(0, 4000)
        : undefined;

    const githubUrl = sanitizeHttpUrl(record.githubUrl);
    const liveUrl = sanitizeHttpUrl(record.liveUrl);
    const date =
      typeof record.date === 'string' && record.date.trim()
        ? record.date.trim().slice(0, 32)
        : new Date().toISOString().split('T')[0];
    const sizeKb =
      typeof record.sizeKb === 'string' && record.sizeKb.trim()
        ? record.sizeKb.trim().slice(0, 24)
        : '50.0';
    const isPermanent = typeof record.isPermanent === 'boolean' ? record.isPermanent : true;

    seenIds.add(id);

    const entry: PortfolioItemPayload = {
      id,
      title,
      category,
      ...(description ? { description } : {}),
      ...(githubUrl ? { githubUrl } : {}),
      ...(liveUrl ? { liveUrl } : {}),
      dataUrl,
      date,
      sizeKb,
      isPermanent,
    };
    sanitized.push(entry);
  }

  return sanitized.length > 0 ? sanitized : null;
}

function buildProjectsDataFileContent(projects: PortfolioItemPayload[]): string {
  const serializedProjects = JSON.stringify(projects, null, 2);
  const serializedPlaceholderIds = JSON.stringify(PLACEHOLDER_IDS, null, 2);
  const serializedPlaceholderTitles = JSON.stringify(PLACEHOLDER_TITLES, null, 2);

  return `export interface PortfolioItem {
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

// Specific IDs and Titles of any legacy placeholder sample projects to ignore
export const PLACEHOLDER_PROJECT_IDS = new Set<number>(${serializedPlaceholderIds});

export const PLACEHOLDER_PROJECT_TITLES = new Set<string>(${serializedPlaceholderTitles});

// Real Production Deliverables with verified live deployments and GitHub repositories
export const HARDCODED_PROJECTS: PortfolioItem[] = ${serializedProjects};

// Initial default items guaranteed to render statically on any external visitor/reviewer load
export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = HARDCODED_PROJECTS;
`;
}

async function readProjectsFromDisk(): Promise<PortfolioItemPayload[] | null> {
  try {
    const stat = fs.statSync(PROJECTS_FILE);
    const modUrl = `${pathToFileURL(PROJECTS_FILE).href}?t=${stat.mtimeMs}`;
    const mod = (await import(modUrl)) as { HARDCODED_PROJECTS?: PortfolioItemPayload[] };
    if (Array.isArray(mod.HARDCODED_PROJECTS)) {
      return mod.HARDCODED_PROJECTS;
    }
    return null;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '15mb' }));

  let viteServer: {
    middlewares: express.RequestHandler;
    moduleGraph: { invalidateAll: () => void };
  } | null = null;
  let lastProjectsMtime = 0;
  try {
    lastProjectsMtime = fs.statSync(PROJECTS_FILE).mtimeMs;
  } catch {
    lastProjectsMtime = 0;
  }

  const syncViteCacheWithDisk = () => {
    if (!viteServer) return;
    try {
      const mtime = fs.statSync(PROJECTS_FILE).mtimeMs;
      if (mtime !== lastProjectsMtime) {
        lastProjectsMtime = mtime;
        viteServer.moduleGraph.invalidateAll();
      }
    } catch {
      // Ignore stat errors
    }
  };

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    viteServer = await createServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
  }

  app.use((_req: Request, _res: Response, next) => {
    syncViteCacheWithDisk();
    next();
  });

  // Auth status endpoint (safe public boolean, never exposes credentials)
  app.get('/api/auth/status', (_req: Request, res: Response) => {
    res.json({ configured: isAuthConfigured() });
  });

  // One-time first-run admin password setup when no .env ADMIN_PASSWORD or claimed hash exists
  app.post('/api/auth/claim', (req: Request, res: Response) => {
    if (isAuthConfigured()) {
      res.status(409).json({ error: 'Administrator password is already configured.' });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const payload: StoredCredential = {
      salt,
      hash,
      claimedAt: new Date().toISOString(),
    };

    const tempAuthFile = `${AUTH_STORE_FILE}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempAuthFile, JSON.stringify(payload, null, 2), { mode: 0o600 });
    fs.renameSync(tempAuthFile, AUTH_STORE_FILE);

    res.json({ ok: true, configured: true });
  });

  // Live read endpoint so client always gets all projects saved in src/data/projectsData.ts
  app.get('/api/projects', async (_req: Request, res: Response) => {
    const diskProjects = await readProjectsFromDisk();
    if (!diskProjects) {
      res.status(200).json({ projects: null });
      return;
    }
    res.json({ projects: diskProjects });
  });

  // Authenticated endpoint that persists portfolio updates directly into src/data/projectsData.ts
  app.post('/api/projects/sync', (req: Request, res: Response) => {
    const clientIp = req.ip || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({ error: 'Too many failed password attempts. Please wait a few minutes.' });
      return;
    }

    if (!isAuthConfigured()) {
      res.status(403).json({
        error: 'Administrator password not configured yet. Please set a password first.',
        needsSetup: true,
      });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!verifyAdminPassword(password)) {
      recordFailedAttempt(clientIp);
      res.status(401).json({ error: 'Incorrect password! Please enter the correct administrator password.' });
      return;
    }

    clearFailedAttempts(clientIp);

    const sanitizedProjects = sanitizeProjects(req.body?.projects);
    if (!sanitizedProjects) {
      res.status(400).json({ error: 'Invalid portfolio project payload.' });
      return;
    }

    const fileContent = buildProjectsDataFileContent(sanitizedProjects);
    const tempFile = path.resolve(DATA_DIR, `.projectsData.${process.pid}.${Date.now()}.tmp.ts`);
    if (!tempFile.startsWith(DATA_DIR + path.sep)) {
      res.status(500).json({ error: 'Invalid target directory.' });
      return;
    }

    try {
      fs.writeFileSync(tempFile, fileContent, 'utf-8');
      fs.renameSync(tempFile, PROJECTS_FILE);
      if (viteServer) {
        viteServer.moduleGraph.invalidateAll();
      }
      res.json({ ok: true, count: sanitizedProjects.length, projects: sanitizedProjects });
    } catch (err) {
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch {
        // Ignore cleanup failure
      }
      const message = err instanceof Error ? err.message : 'Failed to write projects file.';
      res.status(500).json({ error: message });
    }
  });

  if (viteServer) {
    app.use(viteServer.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
