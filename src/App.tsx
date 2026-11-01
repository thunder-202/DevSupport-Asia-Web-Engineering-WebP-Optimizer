import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Gauge,
  Sparkles,
  Sliders,
  UploadCloud,
  Copy,
  Check,
  Download,
  Bookmark,
  Trash2,
  Lock,
  X,
  Mail,
  ExternalLink,
  ChevronRight,
  Server,
  Zap,
  Globe,
  Layers,
  ArrowRight,
  Phone,
  MessageCircle,
  Menu,
  Clock,
  UserCheck,
  Maximize2,
  Eye,
  ImagePlus,
  FileText,
  Database,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import darkInfraBg from '@/src/assets/images/dark_infra_bg_1793338562027.jpg';
import realUserFace from '@/src/assets/images/real_user_face_centered.png';
import {
  PortfolioItem,
  INITIAL_PORTFOLIO_ITEMS,
  PLACEHOLDER_PROJECT_IDS,
  PLACEHOLDER_PROJECT_TITLES
} from '@/src/data/projectsData';
import { normalizeGithubUrl, getGithubDisplay, normalizeWebUrl } from '@/src/utils/github';
import PortfolioShowcaseGrid from '@/src/components/PortfolioShowcaseGrid';

export type { PortfolioItem };

// Crisp standard GitHub SVG icon
function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const CATEGORIES = ['All', 'Restaurants', 'Cafes', 'E-commerce', 'Real Estate', 'Custom Web'];

export default function App() {
  // Converter States
  const [quality, setQuality] = useState<number>(85);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [webpDataUrl, setWebpDataUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [origSizeKb, setOrigSizeKb] = useState<string>('0');
  const [webpSizeKb, setWebpSizeKb] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Save to Portfolio Form
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectCategory, setProjectCategory] = useState<string>('Restaurants');
  const [projectGithubUrl, setProjectGithubUrl] = useState<string>('');
  const [projectLiveUrl, setProjectLiveUrl] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');

  // Portfolio & Filter States - Preserves the manually added active projects and removes placeholder projects
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('my_portfolio_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out the 6 placeholder projects while strictly preserving the manually added active projects
          const activeProjects = parsed.filter(
            (item: PortfolioItem) =>
              !PLACEHOLDER_PROJECT_IDS.has(item.id) &&
              !PLACEHOLDER_PROJECT_TITLES.has(item.title) &&
              item.isPermanent !== true
          );

          // Return the active projects keeping live links and github links untouched
          return activeProjects;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PORTFOLIO_ITEMS;
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Password Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');

  // Deployment & Backup Modal
  const [backupModalOpen, setBackupModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast, Mobile Menu & Lightbox Big Window
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync portfolio items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('my_portfolio_items', JSON.stringify(portfolioItems));
    } catch {
      // Storage quota or error handling
    }
  }, [portfolioItems]);

  // Handle ESC key to exit modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
        setDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const processFile = (file: File, targetQuality: number = quality) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      showToast('Please select a JPG or PNG image file.');
      return;
    }

    setIsProcessing(true);
    setCurrentFile(file);
    setOrigSizeKb((file.size / 1024).toFixed(1));

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const q = targetQuality / 100;
        const generatedDataUrl = canvas.toDataURL('image/webp', q);
        setWebpDataUrl(generatedDataUrl);

        // Approximate size in KB from Base64
        const head = 'data:image/webp;base64,';
        const webpBytes = Math.round(((generatedDataUrl.length - head.length) * 3) / 4);
        setWebpSizeKb((webpBytes / 1024).toFixed(1));

        // Create Blob URL
        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
              }
              const newBlobUrl = URL.createObjectURL(blob);
              setBlobUrl(newBlobUrl);
            }
            setIsProcessing(false);
            showToast('Optimized to WebP successfully!');
          },
          'image/webp',
          q
        );
      };
      img.onerror = () => {
        setIsProcessing(false);
        showToast('Failed to load image.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQualityChange = (newVal: number) => {
    setQuality(newVal);
    if (currentFile) {
      processFile(currentFile, newVal);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const copyText = (text: string, keyName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(keyName);
        showToast(`Copied ${keyName} to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2000);
      },
      () => {
        showToast('Could not copy to clipboard.');
      }
    );
  };

  const handleSaveToPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webpDataUrl) {
      showToast('Please convert an image first.');
      return;
    }

    const title = projectTitle.trim() || `Optimized Project #${portfolioItems.length + 1}`;
    const safeGithubUrl = projectGithubUrl.trim() ? normalizeGithubUrl(projectGithubUrl.trim()) : undefined;
    const safeLiveUrl = projectLiveUrl.trim() ? normalizeWebUrl(projectLiveUrl.trim()) : undefined;
    const newItem: PortfolioItem = {
      id: Date.now(),
      title,
      category: projectCategory,
      description: projectDescription.trim(),
      githubUrl: safeGithubUrl,
      liveUrl: safeLiveUrl,
      dataUrl: webpDataUrl,
      date: new Date().toISOString().split('T')[0],
      sizeKb: webpSizeKb,
      isPermanent: false,
    };

    setPortfolioItems((prev) => [newItem, ...prev]);
    setProjectTitle('');
    setProjectGithubUrl('');
    setProjectLiveUrl('');
    setProjectDescription('');
    showToast(`Saved "${title}" to My Previous Work!`);

    // Smooth scroll to portfolio section
    const target = document.getElementById('portfolio');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(portfolioItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devsupport-portfolio-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Downloaded portfolio backup JSON!');
  };

  const handleCopyDeploymentJson = () => {
    copyText(JSON.stringify(portfolioItems, null, 2), 'Deployment JSON');
  };

  const handleImportJson = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setImportError('Invalid JSON format: Expected an array of projects.');
        return;
      }
      if (parsed.length === 0) {
        setImportError('JSON array is empty.');
        return;
      }
      // Sanitize each item
      const validItems: PortfolioItem[] = parsed.map((item, idx) => ({
        id: typeof item.id === 'number' ? item.id : Date.now() + idx,
        title: String(item.title || `Project #${idx + 1}`),
        category: String(item.category || 'Custom Web'),
        description: item.description ? String(item.description) : '',
        githubUrl: item.githubUrl ? normalizeGithubUrl(String(item.githubUrl)) : undefined,
        liveUrl: item.liveUrl ? normalizeWebUrl(String(item.liveUrl)) : undefined,
        dataUrl: String(item.dataUrl || ''),
        date: String(item.date || new Date().toISOString().split('T')[0]),
        sizeKb: String(item.sizeKb || '50.0'),
        isPermanent: Boolean(item.isPermanent),
      }));

      // Merge with existing
      const existingIds = new Set(portfolioItems.map((p) => p.id));
      const newItems = validItems.filter((p) => !existingIds.has(p.id));
      setPortfolioItems([...newItems, ...portfolioItems]);
      setBackupModalOpen(false);
      setImportJsonText('');
      setImportError('');
      showToast(`Imported ${newItems.length} projects successfully!`);
    } catch (err: any) {
      setImportError(`Failed to parse JSON: ${err.message || 'Invalid syntax'}`);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleImportJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleScrubPlaceholders = () => {
    setPortfolioItems((prev) => {
      const cleaned = prev.filter(
        (item) => !PLACEHOLDER_PROJECT_IDS.has(item.id) && !PLACEHOLDER_PROJECT_TITLES.has(item.title) && item.isPermanent !== true
      );
      try {
        localStorage.setItem('my_portfolio_items', JSON.stringify(cleaned));
      } catch {
        // Ignore
      }
      return cleaned;
    });
    setBackupModalOpen(false);
    showToast('Cleaned all placeholder projects! Your 12 active projects are preserved.');
  };

  const promptDelete = (id: number) => {
    setItemToDeleteId(id);
    setDeletePassword('');
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const ADMIN_DELETE_PASSWORD = 'Nay#-%"(202)!';

  const confirmDelete = () => {
    if (deletePassword === ADMIN_DELETE_PASSWORD) {
      setPortfolioItems(portfolioItems.filter((item) => item.id !== itemToDeleteId));
      setDeleteModalOpen(false);
      setItemToDeleteId(null);
      showToast('Item deleted successfully.');
    } else {
      setDeleteError('Incorrect password! Please enter the correct administrator password.');
    }
  };

  const filteredItems =
    activeCategory === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-indigo-600 selection:text-white relative">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Locked, Non-scrollable Blurry Background Image */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        <img
          src={darkInfraBg}
          alt="Infrastructure Background"
          className="w-full h-full object-cover scale-110 filter blur-[40px] opacity-25 brightness-75 contrast-125"
          loading="eager"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 glass-nav border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
              DS
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                devsupport<span className="text-indigo-400">.asia</span>
              </span>
              <span className="block text-[11px] text-slate-400 font-medium">Web Engineering Services</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-indigo-400 transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-indigo-400 transition-colors">
              Services
            </a>
            <a href="#converter" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> WebP Converter
            </a>
            <a href="#portfolio" className="hover:text-indigo-400 transition-colors">
              Portfolio
            </a>
            <a
              href="#contact"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              Contact Us
            </a>
          </nav>

          {/* Mobile Menu Actions */}
          <div className="md:hidden flex items-center gap-2">
            <a
              href="#contact"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Contact
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card border-b border-slate-800 px-4 py-4 space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
            >
              About
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
            >
              Services &amp; Pricing
            </a>
            <a
              href="#converter"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 py-1.5 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-400" /> WebP Converter
            </a>
            <a
              href="#portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
            >
              Portfolio &amp; Work
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
            >
              Direct Consultation &amp; Contact
            </a>
          </div>
        )}
      </header>

      {/* Main Content Stream */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Available for New Projects across Asia & Global</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                High-Performance Web Solutions & Custom Infrastructure
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                We build fast, secure, and compliance-ready web applications for businesses across Asia and globally.
                From modern responsive frontend design to lightweight image optimization pipelines.
              </p>

              {/* Technology Skills Grid directly inside left column */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* 1. JavaScript */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-yellow-500/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5 rounded" viewBox="0 0 32 32">
                      <rect width="32" height="32" rx="4" fill="#F7DF1E"/>
                      <path fill="#000000" d="M18.8 22.8c.8 1.3 1.9 2.1 3.5 2.1 1.6 0 2.6-.8 2.6-2 0-1.4-1.1-1.9-3-2.7-2.6-1.1-4.3-2.5-4.3-5.2 0-2.6 2-4.5 5.2-4.5 2.2 0 3.8.8 4.9 2.7l-2.5 1.6c-.6-1.1-1.4-1.6-2.4-1.6-1.2 0-2 .7-2 1.6 0 1.1.8 1.6 2.6 2.3 2.8 1.2 4.7 2.6 4.7 5.6 0 3.1-2.4 5-5.8 5-3.3 0-5.3-1.6-6.3-3.6l2.8-1.7zm-9.3-12.2h3.4v10.5c0 2.6-1.2 3.8-3.5 3.8-.9 0-2-.3-2.8-.7l.6-2.7c.6.3 1.1.5 1.6.5.8 0 1.3-.4 1.3-1.2V10.6z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">JavaScript</span>
                </div>

                {/* 2. Python */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32">
                      <path fill="#3776AB" d="M15.9 3c-6.8 0-6.4 2.9-6.4 2.9l.01 3h6.5v.9H6.8S3 9.4 3 16.2c0 6.9 3.3 6.6 3.3 6.6h2v-2.8s-.1-3.3 3.3-3.3h5.7s3.2.1 3.2-3.1V6.1s.5-3.1-6.6-3.1zm-3.6 2c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3c0-.7.6-1.3 1.3-1.3z"/>
                      <path fill="#FFD438" d="M16.1 29c6.8 0 6.4-2.9 6.4-2.9l-.01-3h-6.5v-.9h9.2s3.8.4 3.8-6.4c0-6.9-3.3-6.6-3.3-6.6h-2v2.8s.1 3.3-3.3 3.3h-5.7s-3.2-.1-3.2 3.1v7.5s-.5 3.1 6.6 3.1zm3.6-2c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3c0 .7-.6 1.3-1.3 1.3z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">Python</span>
                </div>

                {/* 3. HTML5/CSS3 */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32">
                      <path fill="#E34F26" d="M5 3l2.4 24.3L16 30l8.6-2.7L27 3H5z"/>
                      <path fill="#EF652A" d="M16 5.2v22.4l6.5-2.1L24.8 5.2H16z"/>
                      <path fill="#FFFFFF" d="M16 11.2v3.5h3.4l-.3 3.4H16v3.4h5.6l.8-9.4H16zm0 10.3l-.1.1-2.9-.8-.2-2.1h-2.5l.4 3.8 5.3 1.5v-2.5z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">HTML5/CSS3</span>
                </div>

                {/* 4. Three.js / WebGL */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-400/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="4" fill="#090D16" stroke="#2A3447"/>
                      <path d="M7 23.5L16 8l9 15.5H7z" stroke="#60A5FA" strokeWidth="1.8" fill="#3B82F6" fillOpacity="0.2"/>
                      <path d="M16 8v15.5m0-15.5L11.5 23.5m4.5-15.5L20.5 23.5" stroke="#93C5FD" strokeWidth="1.2"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">Three.js / WebGL</span>
                </div>

                {/* 5. GSAP Scroll */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="4" fill="#0A1810" stroke="#0E3D22"/>
                      <path d="M16 5l8 4.6v9.2L16 23.4l-8-4.6V9.6L16 5z" stroke="#0AE448" strokeWidth="1.8" fill="#0AE448" fillOpacity="0.15"/>
                      <circle cx="16" cy="16" r="2" fill="#0AE448"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">GSAP Scroll</span>
                </div>

                {/* 6. React */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="4" fill="#0A1520" stroke="#132B40"/>
                      <ellipse cx="16" cy="16" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3"/>
                      <ellipse cx="16" cy="16" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3" transform="rotate(60 16 16)"/>
                      <ellipse cx="16" cy="16" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3" transform="rotate(120 16 16)"/>
                      <circle cx="16" cy="16" r="1.6" fill="#61DAFB"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">React</span>
                </div>

                {/* 7. TypeScript */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-600/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32">
                      <rect width="32" height="32" rx="4" fill="#3178C6"/>
                      <path fill="#FFFFFF" d="M15.5 12.8H9.8V15h2v8.5h2.4V15h2v-2.2zm4.1 6.3c.7.5 1.5.8 2.3.8.9 0 1.4-.4 1.4-1 0-.6-.5-.9-1.8-1.4-1.8-.7-2.9-1.5-2.9-3.2 0-1.8 1.4-3.1 3.6-3.1 1.3 0 2.4.4 3.1.9l-.7 1.8c-.6-.4-1.4-.7-2.3-.7-.8 0-1.3.4-1.3.9 0 .5.5.8 1.7 1.2 2 .8 3 1.7 3 3.3 0 2-1.5 3.3-3.8 3.3-1.6 0-2.8-.5-3.6-1.1l.7-1.8z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">TypeScript</span>
                </div>

                {/* 8. Tailwind CSS */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors overflow-hidden">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="4" fill="#0B132B" stroke="#1E293B"/>
                      <path fill="#38BDF8" d="M16 10.5c-2.4 0-3.9 1.2-4.5 3.6 1-.9 2.1-1.2 3.3-.8.7.2 1.2.7 1.7 1.3 1 1 2 2.2 4.5 2.2 2.4 0 3.9-1.2 4.5-3.6-1 .9-2.1 1.2-3.3.8-.7-.2-1.2-.7-1.7-1.3-1-1-2-2.2-4.5-2.2zm-4.5 5.4c-2.4 0-3.9 1.2-4.5 3.6 1-.9 2.1-1.2 3.3-.8.7.2 1.2.7 1.7 1.3 1 1 2 2.2 4.5 2.2 2.4 0 3.9-1.2 4.5-3.6-1 .9-2.1 1.2-3.3.8-.7-.2-1.2-.7-1.7-1.3-1-1-2-2.2-4.5-2.2z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">Tailwind CSS</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-3">
                <a
                  href="#converter"
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-center shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
                  Try WebP Optimizer
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#services"
                  className="px-6 py-3.5 rounded-xl glass-card hover:bg-slate-800 text-slate-200 font-semibold text-center transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  Explore Pricing
                </a>
              </div>
            </div>

            {/* Feature Card / Commitment */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden shadow-2xl">
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" /> Client Commitment
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-200">99.9% Server Uptime Guarantee</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Managed cloud hosting infrastructure hosted on global CDN networks with automatic redundancy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-200">Lightweight & Fast Load Times</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Built using modern WebP formats and clean, asset-optimized code structures for ultra-low latency.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-200">Asia-Pacific Region Optimization</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Tailored routing and DNS edge nodes for Singapore, Japan, Thailand, Hong Kong, and international markets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Pricing Section */}
        <section id="services" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Transparent Packages
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Transparent Service Pricing</h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Turnkey web development and maintenance packages crafted for high reliability and clean execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Pricing Card 1 */}
              <div className="glass-card rounded-2xl p-8 border border-slate-800 relative hover:border-slate-700 transition-all flex flex-col justify-between group">
                <div>
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Essential</div>
                  <h3 className="text-2xl font-bold text-white">Website Build</h3>
                  <div className="my-5 flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">$500</span>
                    <span className="text-slate-400 ml-2 text-sm">/ one-time</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    Complete customized single-page or multi-page website design tailored to your corporate standards.
                  </p>
                  <ul className="space-y-3.5 text-sm text-slate-300 mb-8">
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Fully Responsive Single-Page Architecture
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Optimized Images & Fast Page Speed
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Domain Setup & DNS Configuration
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Mobile-First Design System
                    </li>
                  </ul>
                </div>

                <a
                  href="#contact"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm text-center transition-colors border border-slate-700 flex items-center justify-center gap-2"
                >
                  Order Website Build
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Pricing Card 2 */}
              <div className="glass-card rounded-2xl p-8 border border-indigo-500/60 relative hover:border-indigo-400 transition-all bg-gradient-to-b from-indigo-950/30 via-slate-900/80 to-slate-900/90 flex flex-col justify-between shadow-xl shadow-indigo-950/40">
                <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md">
                  POPULAR
                </div>
                <div>
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Operations</div>
                  <h3 className="text-2xl font-bold text-white">Managed Hosting & Support</h3>
                  <div className="my-5 flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">$70</span>
                    <span className="text-slate-400 ml-2 text-sm">/ month</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Continuous hosting, SSL maintenance, DNS health monitoring, security patches, and minor updates included.
                  </p>
                  <ul className="space-y-3.5 text-sm text-slate-300 mb-8">
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Enterprise Hosting & Automated SSL Certificates
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      DNS Record Management & Verification Support
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      24/7 Uptime Monitoring & Rapid Incident Response
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Monthly Code & Security Review
                    </li>
                  </ul>
                </div>

                <a
                  href="#contact"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm text-center shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  Start Managed Plan
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Pricing Card 3: Advanced, Futuristic & New Designed Website */}
              <div className="glass-card rounded-2xl p-8 border border-cyan-500/60 relative hover:border-cyan-400 transition-all bg-gradient-to-b from-cyan-950/30 via-slate-900/90 to-slate-900/95 flex flex-col justify-between shadow-2xl shadow-cyan-950/50 group">
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-200" />
                  ADVANCE &amp; FUTURISTIC
                </div>
                <div>
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Next-Gen Architecture
                  </div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    Futuristic &amp; New Designed
                  </h3>
                  <div className="my-5 flex flex-wrap items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 tracking-tight">
                      $1000 – $12K
                    </span>
                    <span className="text-slate-400 text-xs sm:text-sm">/ custom scope</span>
                  </div>

                  <div className="p-3 mb-5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
                    <span className="text-cyan-200 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Monthly Support:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-[11px] border border-emerald-500/30">
                      FREE Included
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Advanced, futuristic, cutting-edge new design tailored to high-growth brands. Every single service is included with ongoing monthly support at no extra cost.
                  </p>

                  <ul className="space-y-3.5 text-sm text-slate-300 mb-8">
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span><strong>Every Service Included:</strong> UI/UX, Build, APIs &amp; SEO</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span><strong>Free Monthly Support:</strong> 24/7 care, updates &amp; uptime</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Futuristic, Motion-Rich &amp; 3D/Micro-Interactive UI</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Full WebP Asset Pipeline &amp; Sub-Second Latency</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Dedicated Lead Engineer &amp; Priority Channel</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="#contact"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold text-sm text-center shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
                >
                  Request Futuristic Project
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive WebP Converter Section */}
        <section id="converter" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Instant Utility Tool
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Live Client-Side WebP Converter</h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
              Upload any local JPG or PNG image. It converts directly in your browser using the HTML5 Canvas API —
              generating shortened Blob URLs, base64 Data URLs, and direct download links.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-indigo-400 bg-indigo-950/40 scale-[0.99]'
                  : 'border-slate-700 hover:border-indigo-500 bg-slate-900/50 hover:bg-slate-900/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-2xl border border-indigo-500/20 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-200">
                    Click to upload or drag &amp; drop JPG, PNG, or WebP
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Files are processed 100% locally in your browser. No files are uploaded to any server.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add new Image
                  </button>
                  {currentFile && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-indigo-300 font-mono border border-slate-700/60">
                      Loaded: {currentFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compression Quality Slider */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/70 p-4 sm:p-5 rounded-xl border border-slate-800">
              <label htmlFor="qualityRange" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                WebP Compression Quality:{' '}
                <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-xs">
                  {quality}%
                </span>
              </label>
              <div className="flex items-center gap-4 w-full sm:w-72">
                <span className="text-xs text-slate-500">10%</span>
                <input
                  type="range"
                  id="qualityRange"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-xs text-slate-500">100%</span>
              </div>
            </div>

            {/* Conversion Output Container */}
            {webpDataUrl && (
              <div className="mt-8 space-y-6 animate-fadeIn">
                <hr className="border-slate-800" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Preview Box */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Image Preview (WebP)
                      </span>
                      {isProcessing && (
                        <span className="text-xs text-amber-400 animate-pulse flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Converting...
                        </span>
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setLightboxItem({
                          id: 999998,
                          title: projectTitle.trim() || 'Converted WebP Preview',
                          category: projectCategory,
                          description: projectDescription.trim(),
                          dataUrl: webpDataUrl,
                          date: '',
                          sizeKb: webpSizeKb,
                        })
                      }
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-center overflow-hidden min-h-[220px] max-h-[360px] cursor-pointer group/preview relative"
                      title="Click to view in big window"
                    >
                      <img
                        src={webpDataUrl}
                        alt="WebP Output Preview"
                        className="max-h-72 object-contain rounded-lg shadow-md transition-transform duration-300 group-hover/preview:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-indigo-500/30 backdrop-blur-sm">
                          <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                          View in Big Window
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-indigo-600/20 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        Add new Image
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 flex justify-between px-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span>
                        Original File: <strong className="text-slate-200">{origSizeKb} KB</strong>
                      </span>
                      <span>
                        Converted WebP: <strong className="text-emerald-400 font-bold">{webpSizeKb} KB</strong>
                        {Number(origSizeKb) > 0 && Number(webpSizeKb) > 0 && (
                          <span className="text-emerald-400/80 ml-1.5">
                            ({Math.max(0, Math.round((1 - Number(webpSizeKb) / Number(origSizeKb)) * 100))}% saved)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Output Links & Save Form */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          Shortened Blob URL (Browser Memory Link)
                        </label>
                        <button
                          type="button"
                          onClick={() => copyText(blobUrl, 'Blob URL')}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                        >
                          {copiedKey === 'Blob URL' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy URL
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={blobUrl}
                        className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 focus:outline-none mb-3"
                      />

                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          Base64 Data URL (Full Image Code)
                        </label>
                        <button
                          type="button"
                          onClick={() => copyText(webpDataUrl, 'Data URL')}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                        >
                          {copiedKey === 'Data URL' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy Base64
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={webpDataUrl}
                        rows={3}
                        className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Save to Portfolio Form */}
                    <form onSubmit={handleSaveToPortfolio} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                          Save To &ldquo;My Previous Work&rdquo;
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Project Title (e.g. Cafe Hero)"
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                        <select
                          value={projectCategory}
                          onChange={(e) => setProjectCategory(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Restaurants">Restaurants</option>
                          <option value="Cafes">Cafes</option>
                          <option value="E-commerce">E-commerce</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Custom Web">Custom Web</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <GithubIcon className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            placeholder="GitHub Repository URL (e.g. nayem1816/e-shop or https://github.com/nayem1816)"
                            value={projectGithubUrl}
                            onChange={(e) => setProjectGithubUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-mono"
                          />
                        </div>
                        {projectGithubUrl.trim() && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-indigo-500/30 text-[11px]">
                            <span className="text-slate-400 truncate font-mono">
                              Active Target: <span className="text-indigo-300">{normalizeGithubUrl(projectGithubUrl)}</span>
                            </span>
                            <a
                              href={normalizeGithubUrl(projectGithubUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-white font-semibold flex items-center gap-1 shrink-0 ml-2"
                            >
                              Test Link ↗
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Live Demo URL (Optional) */}
                      <div className="space-y-1.5">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            placeholder="Live Demo URL (Optional, e.g. https://e-shop-demo.devsupport.asia)"
                            value={projectLiveUrl}
                            onChange={(e) => setProjectLiveUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-mono"
                          />
                        </div>
                        {projectLiveUrl.trim() && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-emerald-500/30 text-[11px]">
                            <span className="text-slate-400 truncate font-mono">
                              Live Site: <span className="text-emerald-300">{normalizeWebUrl(projectLiveUrl)}</span>
                            </span>
                            <a
                              href={normalizeWebUrl(projectLiveUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-white font-semibold flex items-center gap-1 shrink-0 ml-2"
                            >
                              Test Live ↗
                            </a>
                          </div>
                        )}
                      </div>

                      <textarea
                        placeholder="Project Description (e.g. Ultra-fast loading hero visual with 75% file compression and smooth responsive rendering)"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none leading-relaxed"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Save to My Previous Work
                      </button>
                    </form>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a
                        href={webpDataUrl}
                        download={`${(projectTitle || 'optimized-image').toLowerCase().replace(/\s+/g, '-')}.webp`}
                        className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download WebP
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Dynamic Portfolio Showcase Grid Component */}
        <PortfolioShowcaseGrid
          items={portfolioItems}
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onViewItem={setLightboxItem}
          onDeleteItem={promptDelete}
          onOpenBackupModal={() => setBackupModalOpen(true)}
        />

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-16">
          <div className="glass-card rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800 relative overflow-hidden shadow-2xl">
            {/* Ambient background glows */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Direct Consultation &amp; Support
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Connect Directly With The Engineer
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Ready to deploy your public portfolio, accelerate page speed, or build customized infrastructure? Reach out directly via WhatsApp, Phone, or Email.
                </p>
              </div>

              {/* Personal Information & Direct Contact Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/70 p-6 sm:p-8 rounded-2xl border border-slate-800/90 shadow-inner">
                {/* Portrait Column */}
                <div className="lg:col-span-5 flex flex-col items-center text-center">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() =>
                      setLightboxItem({
                        id: 999999,
                        title: 'MD Nayem Hosen - Lead Web Engineer',
                        category: 'Engineer Profile',
                        dataUrl: realUserFace,
                        date: '',
                        sizeKb: '',
                      })
                    }
                    title="Click to view photo in big window"
                  >
                    <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-2 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 ring-4 ring-indigo-500/20 bg-slate-900 flex items-center justify-center p-1">
                      <img
                        src={realUserFace}
                        alt="MD Nayem Hosen - Real Face Photo"
                        className="w-full h-full object-cover object-center rounded-full transition-transform duration-500 group-hover:scale-105"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    {/* Active Status Badge */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available for Projects
                    </div>
                  </div>

                  <div className="mt-5 space-y-1">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">MD Nayem Hosen</h3>
                    <p className="text-xs sm:text-sm text-indigo-400 font-semibold">Lead Web Engineer &amp; Infrastructure Specialist</p>
                    <p className="text-xs text-slate-400">DevSupport Asia &bull; Asia &amp; Global Operations</p>
                  </div>
                </div>

                {/* Personal Information Channels */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* WhatsApp Channel */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <MessageCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          WhatsApp Number
                        </span>
                        <p className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">+8801825468599</p>
                        <p className="text-[11px] text-slate-400">Instant messaging &bull; Quick project discussion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <a
                        href="https://wa.me/8801825468599?text=Hello%20MD%20Nayem%20Hosen,%20I%20would%20like%20to%20discuss%20a%20web%20project%20with%20DevSupport%20Asia."
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat on WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText('+8801825468599', 'WhatsApp Number')}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy WhatsApp Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Phone Channel */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                          Mobile Number
                        </span>
                        <p className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">+8801825468599</p>
                        <p className="text-[11px] text-slate-400">Direct phone call &bull; Priority consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <a
                        href="tel:+8801825468599"
                        className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Directly
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText('+8801825468599', 'Mobile Number')}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy Mobile Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Email Channel */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                        <Mail className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                          Official Email
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white font-mono truncate">
                          websitedeldevelop@gmail.com
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Agency: support@devsupport.asia
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <a
                        href="mailto:websitedeldevelop@gmail.com?cc=support@devsupport.asia&subject=Web%20Project%20Inquiry%20-%20DevSupport%20Asia"
                        className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Send Email
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText('websitedeldevelop@gmail.com', 'Email Address')}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy Email"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Commitment Badges */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Response within 15 minutes</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Asia &amp; Global Remote Service</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom links */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <a
                  href="mailto:support@devsupport.asia"
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> support@devsupport.asia
                </a>
                <span className="text-slate-700 hidden sm:inline">&bull;</span>
                <a
                  href="https://devsupport.asia"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Visit devsupport.asia
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 glass-card">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 devsupport.asia. All rights reserved. Professional Web Engineering Services.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#converter" className="hover:text-white transition-colors">Converter</a>
            <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
          </div>
        </div>
      </footer>

      {/* Big Window / Image Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-fadeIn"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image Big Window View"
        >
          <div
            className="glass-card bg-slate-900/95 rounded-2xl max-w-5xl w-full max-h-[92vh] border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden pr-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                  {lightboxItem.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {lightboxItem.title}
                </h3>
                {lightboxItem.sizeKb && (
                  <span className="hidden sm:inline-block text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    {lightboxItem.sizeKb} KB
                  </span>
                )}
              </div>

              {/* Explicit Exit Button */}
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 hover:border-rose-500 flex items-center gap-1.5 shadow-md shrink-0 ml-2"
                title="Exit Big Window (Esc)"
              >
                <X className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto p-3 sm:p-6 flex items-center justify-center bg-slate-950/90 min-h-[260px] sm:min-h-[400px]">
              <img
                src={lightboxItem.dataUrl}
                alt={lightboxItem.title}
                className="max-h-[60vh] sm:max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/80"
              />
            </div>

            {/* Modal Description Showcase (when user clicks View) */}
            {lightboxItem.description && (
              <div className="px-4 sm:px-6 py-3.5 bg-slate-950/95 border-t border-slate-800/90 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-0.5">
                    Project Description
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                    {lightboxItem.description}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Live Demonstration Link */}
            {lightboxItem.liveUrl && (
              <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Live Project Demonstration
                    </div>
                    <div className="text-xs font-mono text-emerald-300 truncate">
                      {normalizeWebUrl(lightboxItem.liveUrl)}
                    </div>
                  </div>
                </div>
                <a
                  href={normalizeWebUrl(lightboxItem.liveUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 shrink-0 transition-colors"
                  title="Open live website in new tab"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Visit Live Site</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            )}

            {/* Modal GitHub Repository Showcase with Fallback */}
            {lightboxItem.githubUrl ? (
              <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      GitHub Repository
                    </div>
                    <div className="text-xs font-mono text-indigo-300 truncate">
                      {getGithubDisplay(lightboxItem.githubUrl)}
                    </div>
                  </div>
                </div>
                <a
                  href={normalizeGithubUrl(lightboxItem.githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/30 shrink-0 transition-colors"
                  title="Open GitHub repository in new tab"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Open Repo</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            ) : (
              <div className="px-4 sm:px-6 py-3 bg-slate-950/80 border-t border-slate-800/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Source Code
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Repository Private (Proprietary / Client Protected)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  Private
                </span>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">ESC</kbd> or click outside to exit
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <a
                  href={lightboxItem.dataUrl}
                  download={`${lightboxItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Image
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Exit Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full border border-slate-800 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Password Required</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter administrator password (<span className="font-mono text-slate-300">Nay#-%&quot;(202)!</span>) to delete this item
              from your portfolio.
            </p>

            <div>
              <input
                type="password"
                placeholder="Enter Password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmDelete();
                }}
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 placeholder-slate-600"
              />
              {deleteError && <p className="text-xs text-rose-400 mt-1.5">{deleteError}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-rose-600/30"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deployment & Backup Manager Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-lg w-full border border-slate-800 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setBackupModalOpen(false);
                setImportError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Portfolio Data &amp; Deployment Manager</h3>
                <p className="text-xs text-slate-400">Ensure all projects remain permanent and visible across every deployment</p>
              </div>
            </div>

            {/* Health status banner */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-white mb-0.5">Deployment Persistence Active</div>
                <div className="text-slate-300 leading-relaxed">
                  Your portfolio currently has <strong className="text-emerald-400">{portfolioItems.length} active projects</strong> with verified GitHub URLs. They are bundled directly into the code and will never disappear on Render, Vercel, or custom domains.
                </div>
              </div>
            </div>

            {/* Export and Backup Section */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Save &amp; Backup Your Projects
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Backup JSON
                </button>
                <button
                  type="button"
                  onClick={handleCopyDeploymentJson}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-indigo-400" />
                  Copy Project JSON
                </button>
              </div>
            </div>

            {/* Import / Restore Section */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Restore or Import Projects
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  ref={importFileInputRef}
                  onChange={handleFileImport}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => importFileInputRef.current?.click()}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload .json file
                </button>
              </div>

              <textarea
                rows={3}
                placeholder="Or paste exported projects JSON array here to restore..."
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono resize-none placeholder-slate-600"
              />

              {importError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importJsonText.trim() && (
                <button
                  type="button"
                  onClick={() => handleImportJson(importJsonText)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md shadow-emerald-600/20"
                >
                  Import Pasted Projects
                </button>
              )}
            </div>

            {/* Scrub placeholder projects */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need to scrub old placeholder items?</span>
              <button
                type="button"
                onClick={handleScrubPlaceholders}
                className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scrub Placeholder Projects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl border border-indigo-400 flex items-center gap-2 animate-bounce-short">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
