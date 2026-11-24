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
  AlertCircle,
  MapPin,
  Pencil,
  Sun,
  Moon
} from 'lucide-react';
import darkInfraBg from '@/src/assets/images/dark_infra_bg_1793338562027.jpg';
import realUserFace from '@/src/assets/images/real_user_face_centered.png';
import {
  PortfolioItem,
  HARDCODED_PROJECTS,
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

const CATEGORIES = ['All', 'E-commerce', 'Real Estate', 'Restaurant', 'Cafes', 'Salon and BeautyParlour'];

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
  const [projectCategory, setProjectCategory] = useState<string>('Custom Web');
  const [projectGithubUrl, setProjectGithubUrl] = useState<string>('');
  const [projectLiveUrl, setProjectLiveUrl] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');

  // Portfolio & Filter States - 12 verified deliverables hardcoded directly; new projects automatically integrated
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('my_portfolio_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly filter out any legacy placeholder projects
          const validSavedItems = parsed.filter(
            (item: any) =>
              item &&
              !PLACEHOLDER_PROJECT_IDS.has(Number(item.id)) &&
              !PLACEHOLDER_PROJECT_TITLES.has(String(item.title).trim())
          );

          // Find newly created custom projects (not part of the 12 hardcoded base)
          const hardcodedIds = new Set(HARDCODED_PROJECTS.map((p) => p.id));
          const newlyAddedProjects = validSavedItems.filter(
            (item: PortfolioItem) => !hardcodedIds.has(item.id)
          );

          // Hardcoded 12 projects are guaranteed permanent and intact; newly added projects are automatically integrated
          return [...newlyAddedProjects, ...HARDCODED_PROJECTS];
        }
      }
    } catch {
      // Fallback
    }
    return HARDCODED_PROJECTS;
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Password Modals (Delete & Save)
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');

  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [savePassword, setSavePassword] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');

  // Edit Project Modal
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<PortfolioItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('Custom Web');
  const [editGithubUrl, setEditGithubUrl] = useState<string>('');
  const [editLiveUrl, setEditLiveUrl] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDataUrl, setEditDataUrl] = useState<string>('');
  const [editSizeKb, setEditSizeKb] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  // Privacy & Policy Modal
  const [policyModalOpen, setPolicyModalOpen] = useState<boolean>(false);

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

  // Safe Light / Dark theme state (preserves current Warm Alabaster light aesthetic as default)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('devsupport_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('devsupport_theme', theme);
    } catch {
      // Storage unavailable
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
        setSaveModalOpen(false);
        setEditModalOpen(false);
        setBackupModalOpen(false);
        setPolicyModalOpen(false);
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

  const ADMIN_PASSWORD = 'Nay#-%"(202)!';

  const handleSaveToPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webpDataUrl) {
      showToast('Please convert an image first.');
      return;
    }
    setSavePassword('');
    setSaveError('');
    setSaveModalOpen(true);
  };

  const confirmSaveToPortfolio = () => {
    if (savePassword !== ADMIN_PASSWORD) {
      setSaveError('Incorrect password! Please enter the correct administrator password.');
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
    setSaveModalOpen(false);
    setSavePassword('');
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
      const hardcodedIds = new Set(INITIAL_PORTFOLIO_ITEMS.map((p) => p.id));
      const userCustom = prev.filter(
        (item) =>
          !hardcodedIds.has(item.id) &&
          !PLACEHOLDER_PROJECT_IDS.has(item.id) &&
          !PLACEHOLDER_PROJECT_TITLES.has(item.title)
      );
      const cleaned = [...userCustom, ...INITIAL_PORTFOLIO_ITEMS];
      try {
        localStorage.setItem('my_portfolio_items', JSON.stringify(cleaned));
      } catch {
        // Ignore
      }
      return cleaned;
    });
    setBackupModalOpen(false);
    showToast('Cleaned all placeholder projects! All 12 active projects are preserved.');
  };

  const promptDelete = (id: number) => {
    setItemToDeleteId(id);
    setDeletePassword('');
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const ADMIN_DELETE_PASSWORD = ADMIN_PASSWORD;

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

  const handleStartEdit = (project: PortfolioItem) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditCategory(project.category);
    setEditGithubUrl(project.githubUrl || '');
    setEditLiveUrl(project.liveUrl || '');
    setEditDescription(project.description || '');
    setEditDataUrl(project.dataUrl || '');
    setEditSizeKb(project.sizeKb || '');
    setEditPassword('');
    setEditError('');
    setEditModalOpen(true);
  };

  const confirmSaveEdit = () => {
    if (!editingProject) return;
    if (editPassword !== ADMIN_PASSWORD) {
      setEditError('Incorrect administrator password!');
      return;
    }
    if (!editTitle.trim()) {
      setEditError('Project title cannot be empty.');
      return;
    }

    const safeGithubUrl = editGithubUrl.trim() ? normalizeGithubUrl(editGithubUrl.trim()) : undefined;
    const safeLiveUrl = editLiveUrl.trim() ? normalizeWebUrl(editLiveUrl.trim()) : undefined;

    setPortfolioItems((prev) =>
      prev.map((item) => {
        if (item.id === editingProject.id) {
          return {
            ...item,
            title: editTitle.trim(),
            category: editCategory,
            description: editDescription.trim(),
            githubUrl: safeGithubUrl,
            liveUrl: safeLiveUrl,
            dataUrl: editDataUrl.trim() || item.dataUrl,
            sizeKb: editSizeKb.trim() || item.sizeKb,
          };
        }
        return item;
      })
    );

    setEditModalOpen(false);
    setEditingProject(null);
    showToast(`Saved changes to "${editTitle.trim()}"!`);
  };

  const handleResetToDefaults = () => {
    setPortfolioItems(INITIAL_PORTFOLIO_ITEMS);
    try {
      localStorage.setItem('my_portfolio_items', JSON.stringify(INITIAL_PORTFOLIO_ITEMS));
    } catch {
      // Ignore
    }
    setBackupModalOpen(false);
    showToast('Reset portfolio to the 12 default deliverables!');
  };

  const filteredItems =
    activeCategory === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-[var(--bg-canvas)] text-[var(--text-secondary)] min-h-screen flex flex-col selection:bg-[var(--btn-primary-bg)] selection:text-[var(--btn-primary-text)] relative transition-colors duration-200">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Locked, Non-scrollable Ambient Canvas */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-[var(--bg-canvas)] transition-colors duration-200"
        aria-hidden="true"
      >
        <img
          src={darkInfraBg}
          alt="Infrastructure Background"
          className="w-full h-full object-cover scale-110 filter blur-[40px] opacity-[0.03] brightness-125"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[var(--bg-canvas)] opacity-95" />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 glass-nav border-b border-[var(--border-subtle)] backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--btn-primary-bg)] border border-[var(--border-gold)] flex items-center justify-center font-bold text-[var(--btn-primary-text)] text-base shadow-[var(--card-shadow)]">
              DS
            </div>
            <div>
              <span className="text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                devsupport<span className="text-[var(--accent-gold)]">.asia</span>
              </span>
              <span className="block text-[11px] text-[var(--text-secondary)] font-medium">Web Engineering Services</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#about" className="hover:text-[var(--text-primary)] transition-colors duration-200">
              About
            </a>
            <a href="#services" className="hover:text-[var(--text-primary)] transition-colors duration-200">
              Services
            </a>
            <a href="#converter" className="hover:text-[var(--text-gold)] transition-colors duration-200 flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
              <Zap className="w-4 h-4 text-[var(--accent-gold)] fill-[var(--accent-gold)]" /> WebP Converter
            </a>
            <a href="#portfolio" className="hover:text-[var(--text-primary)] transition-colors duration-200">
              Portfolio
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-[10px] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span>Dark</span>
                </>
              )}
            </button>
            <a
              href="#contact"
              className="px-4 py-2 rounded-[12px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] font-semibold border border-[var(--btn-primary-bg)] hover:border-[var(--btn-primary-hover-bg)] shadow-sm transition-all duration-300 flex items-center gap-1.5"
            >
              Contact Us
            </a>
          </nav>

          {/* Mobile Menu Actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-gold)] transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[var(--accent-gold)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--accent-gold)]" />
              )}
            </button>
            <a
              href="#contact"
              className="px-3.5 py-1.5 rounded-[10px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold transition-colors"
            >
              Contact
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-gold)] transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 py-4 space-y-3 shadow-[var(--card-shadow)]">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5"
            >
              About
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5"
            >
              Services &amp; Pricing
            </a>
            <a
              href="#converter"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--text-gold)] py-1.5 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-[var(--accent-gold)]" /> WebP Converter
            </a>
            <a
              href="#portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5"
            >
              Portfolio &amp; Work
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 rounded-[12px] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold shadow-sm"
            >
              Direct Consultation &amp; Contact
            </a>
          </div>
        )}
      </header>

      {/* Main Content Stream */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="about" className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          {/* Calm, minimal radial-masked background dot matrix & ambient glow (Hero only) */}
          <div
            className="hero-ambient-pattern absolute inset-0 pointer-events-none select-none"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-7">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-gold)] text-xs font-semibold shadow-[var(--card-shadow)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]"></span>
                  <span>Available for New Projects across Asia & Global</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)] leading-[1.12] [text-wrap:balance]">
                  High-Performance Web Solutions & Custom Infrastructure
                </h1>

                <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  We build fast, secure, and compliance-ready web applications for businesses across Asia and globally.
                  From modern responsive frontend design to lightweight image optimization pipelines.
                </p>

                {/* Technology Skills Grid directly inside left column */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
                  {/* 1. JavaScript */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5 rounded" viewBox="0 0 32 32">
                        <rect width="32" height="32" rx="4" fill="#F7DF1E"/>
                        <path fill="#000000" d="M18.8 22.8c.8 1.3 1.9 2.1 3.5 2.1 1.6 0 2.6-.8 2.6-2 0-1.4-1.1-1.9-3-2.7-2.6-1.1-4.3-2.5-4.3-5.2 0-2.6 2-4.5 5.2-4.5 2.2 0 3.8.8 4.9 2.7l-2.5 1.6c-.6-1.1-1.4-1.6-2.4-1.6-1.2 0-2 .7-2 1.6 0 1.1.8 1.6 2.6 2.3 2.8 1.2 4.7 2.6 4.7 5.6 0 3.1-2.4 5-5.8 5-3.3 0-5.3-1.6-6.3-3.6l2.8-1.7zm-9.3-12.2h3.4v10.5c0 2.6-1.2 3.8-3.5 3.8-.9 0-2-.3-2.8-.7l.6-2.7c.6.3 1.1.5 1.6.5.8 0 1.3-.4 1.3-1.2V10.6z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">JavaScript</span>
                  </div>

                  {/* 2. Python */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32">
                        <path fill="#3776AB" d="M15.9 3c-6.8 0-6.4 2.9-6.4 2.9l.01 3h6.5v.9H6.8S3 9.4 3 16.2c0 6.9 3.3 6.6 3.3 6.6h2v-2.8s-.1-3.3 3.3-3.3h5.7s3.2.1 3.2-3.1V6.1s.5-3.1-6.6-3.1zm-3.6 2c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3c0-.7.6-1.3 1.3-1.3z"/>
                        <path fill="#FFD438" d="M16.1 29c6.8 0 6.4-2.9 6.4-2.9l-.01-3h-6.5v-.9h9.2s3.8.4 3.8-6.4c0-6.9-3.3-6.6-3.3-6.6h-2v2.8s.1 3.3-3.3 3.3h-5.7s-3.2-.1-3.2 3.1v7.5s-.5 3.1 6.6 3.1zm3.6-2c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3c0 .7-.6 1.3-1.3 1.3z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">Python</span>
                  </div>

                  {/* 3. HTML5/CSS3 */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32">
                        <path fill="#E34F26" d="M5 3l2.4 24.3L16 30l8.6-2.7L27 3H5z"/>
                        <path fill="#EF652A" d="M16 5.2v22.4l6.5-2.1L24.8 5.2H16z"/>
                        <path fill="#FFFFFF" d="M16 11.2v3.5h3.4l-.3 3.4H16v3.4h5.6l.8-9.4H16zm0 10.3l-.1.1-2.9-.8-.2-2.1h-2.5l.4 3.8 5.3 1.5v-2.5z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">HTML5/CSS3</span>
                  </div>

                  {/* 4. Three.js / WebGL */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="4" fill="#090D16" stroke="#2A3447"/>
                        <path d="M7 23.5L16 8l9 15.5H7z" stroke="#60A5FA" strokeWidth="1.8" fill="#3B82F6" fillOpacity="0.2"/>
                        <path d="M16 8v15.5m0-15.5L11.5 23.5m4.5-15.5L20.5 23.5" stroke="#93C5FD" strokeWidth="1.2"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">Three.js / WebGL</span>
                  </div>

                  {/* 5. GSAP Scroll */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="4" fill="#0A1810" stroke="#0E3D22"/>
                        <path d="M16 5l8 4.6v9.2L16 23.4l-8-4.6V9.6L16 5z" stroke="#0AE448" strokeWidth="1.8" fill="#0AE448" fillOpacity="0.15"/>
                        <circle cx="16" cy="16" r="2" fill="#0AE448"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">GSAP Scroll</span>
                  </div>

                  {/* 6. React */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="4" fill="#0A1520" stroke="#132B40"/>
                        <ellipse cx="16" cy="16" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3"/>
                        <ellipse cx="16" cy="16" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3" transform="rotate(60 16 16)"/>
                        <ellipse cx="16" cy="16" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3" transform="rotate(120 16 16)"/>
                        <circle cx="16" cy="16" r="1.6" fill="#61DAFB"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">React</span>
                  </div>

                  {/* 7. TypeScript */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32">
                        <rect width="32" height="32" rx="4" fill="#3178C6"/>
                        <path fill="#FFFFFF" d="M15.5 12.8H9.8V15h2v8.5h2.4V15h2v-2.2zm4.1 6.3c.7.5 1.5.8 2.3.8.9 0 1.4-.4 1.4-1 0-.6-.5-.9-1.8-1.4-1.8-.7-2.9-1.5-2.9-3.2 0-1.8 1.4-3.1 3.6-3.1 1.3 0 2.4.4 3.1.9l-.7 1.8c-.6-.4-1.4-.7-2.3-.7-.8 0-1.3.4-1.3.9 0 .5.5.8 1.7 1.2 2 .8 3 1.7 3 3.3 0 2-1.5 3.3-3.8 3.3-1.6 0-2.8-.5-3.6-1.1l.7-1.8z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">TypeScript</span>
                  </div>

                  {/* 8. Tailwind CSS */}
                  <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover overflow-hidden">
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="4" fill="#0B132B" stroke="#1E293B"/>
                        <path fill="#38BDF8" d="M16 10.5c-2.4 0-3.9 1.2-4.5 3.6 1-.9 2.1-1.2 3.3-.8.7.2 1.2.7 1.7 1.3 1 1 2 2.2 4.5 2.2 2.4 0 3.9-1.2 4.5-3.6-1 .9-2.1 1.2-3.3.8-.7-.2-1.2-.7-1.7-1.3-1-1-2-2.2-4.5-2.2zm-4.5 5.4c-2.4 0-3.9 1.2-4.5 3.6 1-.9 2.1-1.2 3.3-.8.7.2 1.2.7 1.7 1.3 1 1 2 2.2 4.5 2.2 2.4 0 3.9-1.2 4.5-3.6-1 .9-2.1 1.2-3.3.8-.7-.2-1.2-.7-1.7-1.3-1-1-2-2.2-4.5-2.2z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">Tailwind CSS</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-3">
                  <a
                    href="#converter"
                    className="px-6 py-3.5 rounded-[12px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] font-semibold text-center border border-[var(--btn-primary-bg)] hover:border-[var(--btn-primary-hover-bg)] shadow-[var(--card-shadow)] transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-all" />
                    Try WebP Optimizer
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="#services"
                    className="px-6 py-3.5 rounded-[12px] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] font-semibold text-center transition-all duration-200 border border-[var(--border-subtle)] hover:border-[var(--border-gold)] shadow-[var(--card-shadow)] flex items-center justify-center gap-2"
                  >
                    Explore Pricing
                  </a>
                </div>
              </div>

              {/* Feature Card / Commitment */}
              <div className="lg:col-span-5">
                <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 border border-[var(--border-subtle)] relative overflow-hidden shadow-[var(--card-shadow)]">
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[var(--bg-gold-tint)] rounded-full blur-3xl pointer-events-none"></div>

                  <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-6 flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-[var(--accent-gold)]" /> Client Commitment
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      <div className="p-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-gold)] shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--text-primary)]">99.9% Server Uptime Guarantee</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          Managed cloud hosting infrastructure hosted on global CDN networks with automatic redundancy.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      <div className="p-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-gold)] shrink-0">
                        <Gauge className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--text-primary)]">Lightweight & Fast Load Times</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          Built using modern WebP formats and clean, asset-optimized code structures for ultra-low latency.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      <div className="p-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-gold)] shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--text-primary)]">Asia-Pacific Region Optimization</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          Tailored routing and DNS edge nodes for Singapore, Japan, Thailand, Hong Kong, and international markets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Pricing Section */}
        <section id="services" className="py-24 bg-[var(--bg-section-alt)] border-y border-[var(--border-subtle)] transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-gold)] bg-[var(--bg-gold-tint)] px-3.5 py-1.5 rounded-[12px] border border-[var(--border-gold)]">
                Transparent Packages
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.025em] mt-4">
                Transparent Service Pricing
              </h2>
              <p className="text-[var(--text-secondary)] mt-3 text-sm sm:text-base leading-relaxed">
                Turnkey web development and maintenance packages crafted for high reliability and clean execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Pricing Card 1 */}
              <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover relative flex flex-col justify-between group">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-gold)] uppercase tracking-[0.12em] mb-2">Essential</div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-[-0.02em]">Website Build</h3>
                  <div className="my-5 flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums">$500</span>
                    <span className="text-[var(--text-secondary)] ml-2 text-sm">/ one-time</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Complete customized single-page or multi-page website design tailored to your corporate standards.
                  </p>
                  <ul className="space-y-3.5 text-sm text-[var(--text-secondary)] mb-8">
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Fully Responsive Single-Page Architecture
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Optimized Images &amp; Fast Page Speed
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Domain Setup &amp; DNS Configuration
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Mobile-First Design System
                    </li>
                  </ul>
                </div>

                <a
                  href="#contact"
                  className="w-full py-3 px-4 rounded-[12px] bg-[var(--bg-subtle)] hover:bg-[var(--btn-primary-bg)] text-[var(--text-primary)] hover:text-[var(--btn-primary-text)] font-semibold text-sm text-center transition-all duration-300 border border-[var(--border-subtle)] hover:border-[var(--btn-primary-bg)] flex items-center justify-center gap-2"
                >
                  Order Website Build
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Pricing Card 2 */}
              <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 border border-[var(--border-gold)] shadow-[var(--card-shadow)] luxury-card-hover relative flex flex-col justify-between">
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border border-[var(--border-gold)] text-[11px] font-bold rounded-[10px] uppercase tracking-[0.1em] shadow-sm">
                  POPULAR
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-gold)] uppercase tracking-[0.12em] mb-2">Operations</div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-[-0.02em]">Managed Hosting &amp; Support</h3>
                  <div className="my-5 flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums">$70</span>
                    <span className="text-[var(--text-secondary)] ml-2 text-sm">/ month</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Continuous hosting, SSL maintenance, DNS health monitoring, security patches, and minor updates included.
                  </p>
                  <ul className="space-y-3.5 text-sm text-[var(--text-secondary)] mb-8">
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Enterprise Hosting &amp; Automated SSL Certificates
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      DNS Record Management &amp; Verification Support
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      24/7 Uptime Monitoring &amp; Rapid Incident Response
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Monthly Code &amp; Security Review
                    </li>
                  </ul>
                </div>

                <a
                  href="#contact"
                  className="w-full py-3 px-4 rounded-[12px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] font-semibold text-sm text-center shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Start Managed Plan
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Pricing Card 3: Advanced, Futuristic & New Designed Website */}
              <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 border border-[var(--border-gold)] shadow-[var(--card-shadow)] luxury-card-hover relative flex flex-col justify-between group">
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-[var(--accent-gold)] text-[#0B0D12] text-[11px] font-bold rounded-[10px] uppercase tracking-[0.08em] shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  ADVANCE &amp; FUTURISTIC
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-gold)] uppercase tracking-[0.12em] mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]"></span>
                    Next-Gen Architecture
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-[-0.02em] flex items-center gap-2">
                    Futuristic &amp; New Designed
                  </h3>
                  <div className="my-5 flex flex-wrap items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums">
                      $1000 – $12K
                    </span>
                    <span className="text-[var(--text-secondary)] text-xs sm:text-sm">/ custom scope</span>
                  </div>

                  <div className="p-3.5 mb-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)]" />
                      Monthly Support:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[8px] bg-[var(--bg-gold-tint)] text-[var(--text-gold-strong)] font-bold uppercase tracking-wider text-[11px] border border-[var(--border-gold)]">
                      FREE Included
                    </span>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Advanced, futuristic, cutting-edge new design tailored to high-growth brands. Every single service is included with ongoing monthly support at no extra cost.
                  </p>

                  <ul className="space-y-3.5 text-sm text-[var(--text-secondary)] mb-8">
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span><strong className="text-[var(--text-primary)]">Every Service Included:</strong> UI/UX, Build, APIs &amp; SEO</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span><strong className="text-[var(--text-primary)]">Free Monthly Support:</strong> 24/7 care, updates &amp; uptime</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Futuristic, Motion-Rich &amp; 3D/Micro-Interactive UI</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Full WebP Asset Pipeline &amp; Sub-Second Latency</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-gold-tint)] flex items-center justify-center text-[var(--text-gold)] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Dedicated Lead Engineer &amp; Priority Channel</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="#contact"
                  className="w-full py-3 px-4 rounded-[12px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] font-semibold text-sm text-center shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Request Futuristic Project
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive WebP Converter Section */}
        <section id="converter" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-3.5 py-1.5 rounded-[12px] bg-[var(--bg-gold-tint)] border border-[var(--border-gold)] text-[var(--text-gold)] text-[11px] font-semibold uppercase tracking-[0.14em] inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--accent-gold)]" /> Instant Utility Tool
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.025em] mt-4">
              Live Client-Side WebP Converter
            </h2>
            <p className="text-[var(--text-secondary)] mt-3 text-sm sm:text-base leading-relaxed">
              Upload any local JPG or PNG image. It converts directly in your browser using the HTML5 Canvas API —
              generating shortened Blob URLs, base64 Data URLs, and direct download links.
            </p>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[12px] p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? 'border-[var(--accent-gold)] bg-[var(--bg-gold-tint)] scale-[0.99]'
                  : 'border-[var(--border-dashed)] hover:border-[var(--accent-gold)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)]'
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
                <div className="w-16 h-16 rounded-[12px] bg-[var(--bg-surface)] text-[var(--text-gold)] flex items-center justify-center mx-auto text-2xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    Click to upload or drag &amp; drop JPG, PNG, or WebP
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                    Files are processed 100% locally in your browser. No files are uploaded to any server.
                  </p>
                </div>
                {currentFile && (
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] font-mono border border-[var(--border-subtle)]">
                      Loaded: {currentFile.name}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compression Quality Slider */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-subtle)] p-5 rounded-[12px] border border-[var(--border-subtle)]">
              <label htmlFor="qualityRange" className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--accent-gold)]" />
                WebP Compression Quality:{' '}
                <span className="text-[var(--text-gold)] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-[8px] text-xs tabular-nums">
                  {quality}%
                </span>
              </label>
              <div className="flex items-center gap-4 w-full sm:w-72">
                <span className="text-xs text-[var(--text-secondary)] tabular-nums">10%</span>
                <input
                  type="range"
                  id="qualityRange"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-[#B48A3E]"
                />
                <span className="text-xs text-[var(--text-secondary)] tabular-nums">100%</span>
              </div>
            </div>

            {/* Conversion Output Container */}
            {webpDataUrl && (
              <div className="mt-8 space-y-6 animate-fadeIn">
                <hr className="border-[var(--border-subtle)]" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Preview Box */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Image Preview (WebP)
                      </span>
                      {isProcessing && (
                        <span className="text-xs text-[var(--text-gold)] animate-pulse flex items-center gap-1">
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
                      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4 flex items-center justify-center overflow-hidden min-h-[220px] max-h-[360px] cursor-pointer group/preview relative"
                      title="Click to view in big window"
                    >
                      <img
                        src={webpDataUrl}
                        alt="WebP Output Preview"
                        className="max-h-72 object-contain rounded-[10px] shadow-sm transition-transform duration-300 group-hover/preview:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-[#111827]/30 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-[12px] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-[var(--border-subtle)] backdrop-blur-sm">
                          <Maximize2 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                          View in Big Window
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] flex justify-between bg-[var(--bg-subtle)] p-3.5 rounded-[12px] border border-[var(--border-subtle)] tabular-nums">
                      <span>
                        Original File: <strong className="text-[var(--text-primary)]">{origSizeKb} KB</strong>
                      </span>
                      <span>
                        Converted WebP: <strong className="text-[var(--text-emerald)] font-bold">{webpSizeKb} KB</strong>
                        {Number(origSizeKb) > 0 && Number(webpSizeKb) > 0 && (
                          <span className="text-[var(--text-emerald)] opacity-85 ml-1.5">
                            ({Math.max(0, Math.round((1 - Number(webpSizeKb) / Number(origSizeKb)) * 100))}% saved)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Output Links & Save Form */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Shortened Blob URL (Browser Memory Link)
                        </label>
                        <button
                          type="button"
                          onClick={() => copyText(blobUrl, 'Blob URL')}
                          className="text-[11px] text-[var(--text-gold)] hover:text-[var(--text-primary)] flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          {copiedKey === 'Blob URL' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy URL
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={blobUrl}
                        className="w-full p-2.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>

                    {/* Save to Portfolio Form */}
                    <form onSubmit={handleSaveToPortfolio} className="p-8 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                          Save To &ldquo;My Previous Work&rdquo;
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Project Title (e.g. Cafe Hero)"
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          className="px-3 py-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)]"
                        />
                        <select
                          value={projectCategory}
                          onChange={(e) => setProjectCategory(e.target.value)}
                          className="px-3 py-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                        >
                          <option value="E-commerce">E-commerce</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Restaurant">Restaurant</option>
                          <option value="Cafes">Cafes</option>
                          <option value="Salon and BeautyParlour">Salon and BeautyParlour</option>
                          <option value="Custom Web">Custom Web</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-placeholder)]">
                            <GithubIcon className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            placeholder="GitHub Repository URL (e.g. nayem1816/e-shop or https://github.com/nayem1816)"
                            value={projectGithubUrl}
                            onChange={(e) => setProjectGithubUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] font-mono"
                          />
                        </div>
                        {projectGithubUrl.trim() && (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-gold)] text-[11px]">
                            <span className="text-[var(--text-secondary)] truncate font-mono">
                              Active Target: <span className="text-[var(--text-primary)]">{normalizeGithubUrl(projectGithubUrl)}</span>
                            </span>
                            <a
                              href={normalizeGithubUrl(projectGithubUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--text-gold)] hover:text-[var(--text-primary)] font-semibold flex items-center gap-1 shrink-0 ml-2"
                            >
                              Test Link ↗
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Live Demo URL (Optional) */}
                      <div className="space-y-1.5">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-placeholder)]">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            placeholder="Live Demo URL (Optional, e.g. https://e-shop-demo.devsupport.asia)"
                            value={projectLiveUrl}
                            onChange={(e) => setProjectLiveUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] font-mono"
                          />
                        </div>
                        {projectLiveUrl.trim() && (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-emerald-soft)] text-[11px]">
                            <span className="text-[var(--text-secondary)] truncate font-mono">
                              Live Site: <span className="text-[var(--text-emerald)]">{normalizeWebUrl(projectLiveUrl)}</span>
                            </span>
                            <a
                              href={normalizeWebUrl(projectLiveUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--text-emerald)] hover:text-[var(--text-primary)] font-semibold flex items-center gap-1 shrink-0 ml-2"
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
                        className="w-full px-3 py-2.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] resize-none leading-relaxed"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] font-semibold text-xs rounded-[12px] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Save to My Previous Work (Password Protected)</span>
                      </button>
                    </form>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a
                        href={webpDataUrl}
                        download={`${(projectTitle || 'optimized-image').toLowerCase().replace(/\s+/g, '-')}.webp`}
                        className="w-full py-2.5 px-4 rounded-[12px] bg-[var(--accent-gold)] hover:opacity-90 text-[#0B0D12] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
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
          onEditItem={handleStartEdit}
          onDeleteItem={promptDelete}
          onOpenBackupModal={() => setBackupModalOpen(true)}
        />

        {/* Contact Section */}
        <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-16">
          <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 sm:p-10 lg:p-12 border border-[var(--border-subtle)] relative overflow-hidden shadow-[var(--card-shadow)]">
            {/* Subtle ambient champagne glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[var(--bg-gold-tint)] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--bg-gold-tint)] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="px-3.5 py-1.5 rounded-[12px] bg-[var(--bg-gold-tint)] border border-[var(--border-gold)] text-[var(--text-gold)] text-[11px] font-semibold uppercase tracking-[0.14em] inline-flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  Direct Consultation &amp; Support
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-[-0.025em]">
                  Connect Directly With The Engineer
                </h2>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                  Ready to deploy your public portfolio, accelerate page speed, or build customized infrastructure? Reach out directly via WhatsApp, Phone, or Email.
                </p>
              </div>

              {/* Personal Information & Direct Contact Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--bg-subtle)] p-8 rounded-[12px] border border-[var(--border-subtle)]">
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
                    <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-2 border-[var(--border-gold)] shadow-[var(--card-shadow)] ring-4 ring-[var(--bg-gold-tint)] bg-[var(--bg-surface)] flex items-center justify-center p-1">
                      <img
                        src={realUserFace}
                        alt="MD Nayem Hosen - Real Face Photo"
                        className="w-full h-full object-cover object-center rounded-full transition-transform duration-500 group-hover:scale-105"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    {/* Active Status Badge */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-1 rounded-[12px] text-[11px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Available for Projects
                    </div>
                  </div>

                  <div className="mt-6 space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-[-0.02em]">MD Nayem Hosen</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-gold)] font-semibold">Lead Web Engineer &amp; Infrastructure Specialist</p>
                    <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                      <span>Chandana Chourasta, Gajipur Mahanagar, Gajipur, Dhaka 1702</span>
                    </p>
                  </div>
                </div>

                {/* Personal Information Channels */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* WhatsApp Channel */}
                  <div className="p-5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-[var(--card-shadow)]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-[12px] bg-[var(--bg-subtle)] text-[var(--text-emerald)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
                        <MessageCircle className="w-5 h-5 text-[var(--text-emerald)]" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-emerald)] flex items-center gap-1">
                          WhatsApp Number
                        </span>
                        <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-mono tracking-tight">+8801825468599</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">Instant messaging &bull; Quick project discussion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <a
                        href="https://wa.me/8801825468599?text=Hello%20MD%20Nayem%20Hosen,%20I%20would%20like%20to%20discuss%20a%20web%20project%20with%20DevSupport%20Asia."
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-[10px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat on WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText('+8801825468599', 'WhatsApp Number')}
                        className="p-2 rounded-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                        title="Copy WhatsApp Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Phone Channel */}
                  <div className="p-5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-[var(--card-shadow)]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-[12px] bg-[var(--bg-subtle)] text-[var(--text-gold)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5 text-[var(--text-gold)]" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-gold)]">
                          Mobile Number
                        </span>
                        <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-mono tracking-tight">+8801825468599</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">Direct phone call &bull; Priority consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <a
                        href="tel:+8801825468599"
                        className="px-3.5 py-2 rounded-[10px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-300"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Directly
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText('+8801825468599', 'Mobile Number')}
                        className="p-2 rounded-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                        title="Copy Mobile Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Email Channel */}
                  <div className="p-5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-[var(--card-shadow)]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-[12px] bg-[var(--bg-subtle)] text-[var(--text-gold)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
                        <Mail className="w-5 h-5 text-[var(--text-gold)]" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-gold)]">
                          Official Email
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] font-mono truncate">
                          websitedeldevelop@gmail.com
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] truncate">
                          Agency: support@devsupport.asia
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <a
                        href="mailto:websitedeldevelop@gmail.com?cc=support@devsupport.asia&subject=Web%20Project%20Inquiry%20-%20DevSupport%20Asia"
                        className="px-3.5 py-2 rounded-[10px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-300"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Send Email
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText('websitedeldevelop@gmail.com', 'Email Address')}
                        className="p-2 rounded-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Commitment Badges */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                    <div className="p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                      <span>Response within 15 minutes</span>
                    </div>
                    <div className="p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                      <span>Asia &amp; Global Remote Service</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom links */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  Chandana Chourasta, Gajipur Mahanagar, Gajipur, Dhaka 1702
                </span>
                <span className="text-[var(--border-subtle)] hidden sm:inline">&bull;</span>
                <a
                  href="mailto:websitedeldevelop@devsupport.asia"
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--accent-gold)]" /> websitedeldevelop@devsupport.asia
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-4 sm:py-5 text-center sm:text-left text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          <p className="leading-snug">&copy; 2026 devsupport.asia. All rights reserved. Professional Web Engineering Services.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-1.5 text-[var(--text-secondary)]">
            <a href="#about" className="hover:text-[var(--text-primary)] transition-colors">About</a>
            <a href="#services" className="hover:text-[var(--text-primary)] transition-colors">Services</a>
            <a href="#converter" className="hover:text-[var(--text-primary)] transition-colors">Converter</a>
            <a href="#portfolio" className="hover:text-[var(--text-primary)] transition-colors">Portfolio</a>
            <button
              type="button"
              onClick={() => setPolicyModalOpen(true)}
              className="text-[var(--text-gold)] hover:text-[var(--text-primary)] font-semibold transition-colors flex items-center gap-1 cursor-pointer hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              Privacy &amp; Policy
            </button>
          </div>
        </div>
      </footer>

      {/* Big Window / Image Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-fadeIn"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image Big Window View"
        >
          <div
            className="bg-[var(--bg-surface)] rounded-[12px] max-w-5xl w-full max-h-[92vh] border border-[var(--border-subtle)] shadow-[var(--modal-shadow)] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-subtle)]">
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden pr-2">
                <span className="px-2.5 py-0.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider text-[var(--text-gold)] bg-[var(--bg-gold-tint)] border border-[var(--border-gold)] shrink-0">
                  {lightboxItem.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate tracking-[-0.015em]">
                  {lightboxItem.title}
                </h3>
                {lightboxItem.sizeKb && (
                  <span className="hidden sm:inline-block text-xs font-mono text-[var(--text-gold-strong)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] shrink-0">
                    {lightboxItem.sizeKb} KB
                  </span>
                )}
              </div>

              {/* Explicit Exit Button */}
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="px-3.5 py-1.5 rounded-[10px] bg-[var(--bg-surface)] hover:bg-rose-600 text-[var(--text-primary)] hover:text-white text-xs font-bold transition-all border border-[var(--border-subtle)] hover:border-rose-600 flex items-center gap-1.5 shadow-sm shrink-0 ml-2 cursor-pointer"
                title="Exit Big Window (Esc)"
              >
                <X className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[var(--bg-subtle)] min-h-[260px] sm:min-h-[400px]">
              <img
                src={lightboxItem.dataUrl}
                alt={lightboxItem.title}
                className="max-h-[60vh] sm:max-h-[68vh] max-w-full object-contain rounded-[12px] shadow-[var(--card-shadow)] border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              />
            </div>

            {/* Modal Description Showcase (when user clicks View) */}
            {lightboxItem.description && (
              <div className="px-6 sm:px-8 py-4 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--accent-gold)] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-[var(--text-gold)] uppercase tracking-wider mb-0.5">
                    Project Description
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                    {lightboxItem.description}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Live Demonstration Link */}
            {lightboxItem.liveUrl && (
              <div className="px-6 sm:px-8 py-3.5 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-emerald)] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Live Project Demonstration
                    </div>
                    <div className="text-xs font-mono text-[var(--text-primary)] truncate">
                      {normalizeWebUrl(lightboxItem.liveUrl)}
                    </div>
                  </div>
                </div>
                <a
                  href={normalizeWebUrl(lightboxItem.liveUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-[10px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
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
              <div className="px-6 sm:px-8 py-3.5 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--accent-gold)] flex items-center justify-center shrink-0">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      GitHub Repository
                    </div>
                    <div className="text-xs font-mono text-[var(--text-primary)] truncate">
                      {getGithubDisplay(lightboxItem.githubUrl)}
                    </div>
                  </div>
                </div>
                <a
                  href={normalizeGithubUrl(lightboxItem.githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--btn-primary-bg)] text-[var(--text-primary)] hover:text-[var(--btn-primary-text)] text-xs font-semibold flex items-center gap-1.5 border border-[var(--border-subtle)] hover:border-[var(--btn-primary-bg)] shrink-0 transition-colors"
                  title="Open GitHub repository in new tab"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Open Repo</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            ) : (
              <div className="px-6 sm:px-8 py-3.5 bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Source Code
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">
                      Repository Private (Proprietary / Client Protected)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  Private
                </span>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="px-6 sm:px-8 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[var(--text-secondary)] hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border-subtle)]">ESC</kbd> or click outside to exit
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <a
                  href={lightboxItem.dataUrl}
                  download={`${lightboxItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`}
                  className="px-4 py-2 rounded-[10px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Image
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxItem(null)}
                  className="px-4 py-2 rounded-[10px] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] text-xs font-semibold transition-colors border border-[var(--border-subtle)] flex items-center gap-1.5 cursor-pointer"
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
        <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 max-w-sm w-full border border-[var(--border-subtle)] space-y-4 shadow-[var(--modal-shadow)] relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-rose-soft)] border border-[var(--border-rose-soft)] text-[var(--text-rose)] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-[-0.02em]">Password Required</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Enter administrator password to delete this item from your portfolio.
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
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-rose-500 placeholder-[var(--text-placeholder)]"
              />
              {deleteError && <p className="text-xs text-[var(--text-rose)] mt-1.5">{deleteError}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[10px] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 max-w-sm w-full border border-[var(--border-subtle)] space-y-4 shadow-[var(--modal-shadow)] relative">
            <button
              onClick={() => setSaveModalOpen(false)}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-gold-tint)] border border-[var(--border-gold)] text-[var(--text-gold)] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-[-0.02em]">Password Required</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Enter administrator password to save this project to your portfolio.
            </p>

            <div>
              <input
                type="password"
                placeholder="Enter Password"
                value={savePassword}
                onChange={(e) => {
                  setSavePassword(e.target.value);
                  setSaveError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmSaveToPortfolio();
                }}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)]"
              />
              {saveError && <p className="text-xs text-[var(--text-rose)] mt-1.5">{saveError}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="flex-1 py-2.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[10px] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSaveToPortfolio}
                className="flex-1 py-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] rounded-[10px] text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModalOpen && editingProject && (
        <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 max-w-lg w-full border border-[var(--border-subtle)] space-y-4 shadow-[var(--modal-shadow)] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setEditingProject(null);
              }}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-subtle)] text-[var(--accent-gold)] flex items-center justify-center border border-[var(--border-subtle)]">
                <Pencil className="w-5 h-5 text-[var(--accent-gold)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-[-0.02em]">Edit Project Details</h3>
                <p className="text-xs text-[var(--text-secondary)]">Modify information, links, and preview for this project</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmSaveEdit();
              }}
              className="space-y-3.5 pt-2"
            >
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)]"
                  placeholder="Project title..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] cursor-pointer"
                  >
                    <option value="E-commerce">E-commerce</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafes">Cafes</option>
                    <option value="Salon and BeautyParlour">Salon and BeautyParlour</option>
                    <option value="Custom Web">Custom Web</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Size Badge (KB)</label>
                  <input
                    type="text"
                    value={editSizeKb}
                    onChange={(e) => setEditSizeKb(e.target.value)}
                    placeholder="e.g. 52.4"
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Live Website URL</label>
                <input
                  type="text"
                  value={editLiveUrl}
                  onChange={(e) => setEditLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">GitHub Repository URL</label>
                <input
                  type="text"
                  value={editGithubUrl}
                  onChange={(e) => setEditGithubUrl(e.target.value)}
                  placeholder="https://github.com/nayemurrr/..."
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Image URL / Preview Asset</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editDataUrl}
                    onChange={(e) => setEditDataUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] font-mono"
                  />
                  {editDataUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--border-subtle)] shrink-0 bg-[var(--bg-subtle)]">
                      <img src={editDataUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Summary of tech stack, features, and deliverable..."
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)] resize-none"
                />
              </div>

              {/* Password Protection */}
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <label className="text-xs font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  Administrator Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter administrator password to save edits"
                  value={editPassword}
                  onChange={(e) => {
                    setEditPassword(e.target.value);
                    setEditError('');
                  }}
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] placeholder-[var(--text-placeholder)]"
                />
                {editError && <p className="text-xs text-[var(--text-rose)] mt-1.5">{editError}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 py-2.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[10px] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] rounded-[10px] text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deployment & Backup Manager Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-[12px] p-8 max-w-lg w-full border border-[var(--border-subtle)] space-y-5 shadow-[var(--modal-shadow)] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setBackupModalOpen(false);
                setImportError('');
              }}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-subtle)] text-[var(--accent-gold)] flex items-center justify-center border border-[var(--border-subtle)]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-[-0.02em]">Portfolio Data &amp; Deployment Manager</h3>
                <p className="text-xs text-[var(--text-secondary)]">Ensure all projects remain permanent and visible across every deployment</p>
              </div>
            </div>

            {/* Health status banner */}
            <div className="p-4 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--text-emerald)] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-[var(--text-primary)] mb-0.5">Deployment Persistence Active</div>
                <div className="text-[var(--text-secondary)] leading-relaxed">
                  Your portfolio currently has <strong className="text-[var(--text-emerald)]">{portfolioItems.length} active projects</strong> with verified GitHub URLs. They are bundled directly into the code and will never disappear on Render, Vercel, or custom domains.
                </div>
              </div>
            </div>

            {/* Export and Backup Section */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                1. Save &amp; Backup Your Projects
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2.5 rounded-[10px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Backup JSON
                </button>
                <button
                  type="button"
                  onClick={handleCopyDeploymentJson}
                  className="px-4 py-2.5 rounded-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-2 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[var(--accent-gold)]" />
                  Copy Project JSON
                </button>
              </div>
            </div>

            {/* Import / Restore Section */}
            <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
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
                  className="text-[11px] text-[var(--text-gold)] hover:text-[var(--text-primary)] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
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
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono resize-none placeholder-[var(--text-placeholder)]"
              />

              {importError && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-rose)]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importJsonText.trim() && (
                <button
                  type="button"
                  onClick={() => handleImportJson(importJsonText)}
                  className="w-full py-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] font-semibold text-xs rounded-[10px] transition-colors shadow-sm cursor-pointer"
                >
                  Import Pasted Projects
                </button>
              )}
            </div>

            {/* Scrub placeholder projects */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Need to scrub old placeholder items?</span>
              <button
                type="button"
                onClick={handleScrubPlaceholders}
                className="text-[var(--text-secondary)] hover:text-[var(--text-gold)] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scrub Placeholder Projects
              </button>
            </div>

            {/* Reset to Default 12 Deliverables */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Reset to original 12 deliverables?</span>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset 12 Projects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy and Policy Modal */}
      {policyModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-[12px] max-w-3xl w-full border border-[var(--border-subtle)] shadow-[var(--modal-shadow)] relative max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4 bg-[var(--bg-subtle)]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-surface)] text-[var(--accent-gold)] flex items-center justify-center border border-[var(--border-subtle)] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-[var(--accent-gold)]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight tracking-[-0.02em]">
                    DevSupport Asia — Terms of Service, Business Policies &amp; Privacy Notice
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[var(--text-secondary)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[var(--text-gold-strong)]">
                      Effective Date: November 2026
                    </span>
                    <span>&bull;</span>
                    <a
                      href="https://www.devsupport.asia/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--text-gold)] hover:text-[var(--text-primary)] font-mono flex items-center gap-1"
                    >
                      https://www.devsupport.asia/
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span>&bull;</span>
                    <span className="text-[var(--text-primary)] font-medium">Provider: DevSupport Asia</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-surface)] transition-colors shrink-0 cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface)]">
              {/* Part 1 */}
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-[8px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-gold)] text-xs font-bold uppercase tracking-wider">
                  Part 1: Terms of Service &amp; Business Operations
                </div>

                <div className="space-y-2 p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-mono font-bold">1</span>
                    Scope of Work &amp; Project Onboarding
                  </h4>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm pl-8">
                    DevSupport Asia provides custom web development, UI/UX design, WebGL/Three.js interactivity, performance optimization, and managed web infrastructure services. All project engagements begin with initial consultation and requirement alignment.
                  </p>
                </div>

                <div className="space-y-2 p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-mono font-bold">2</span>
                    Pricing, Mockup Confirmation &amp; Payment Terms
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] pl-8">
                    <p>
                      <strong className="text-[var(--text-primary)]">Initial Deposit:</strong> Once the initial design mockup or project architecture is presented and confirmed by the client, a 50% deposit is required before full-scale development and staging begin.
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Final Balance:</strong> The remaining 50% balance must be settled upon final client review and approval prior to live production transfer.
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Refund Policy:</strong> Once full ownership and files are transferred to the client, payments are non-refundable.
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Design Licensing &amp; Purchases:</strong> If a client wishes to purchase or adapt any existing UI layout or portfolio design showcased on devsupport.asia, they must initiate direct contact with DevSupport Asia via the official email or WhatsApp details provided in our contact section.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-mono font-bold">3</span>
                    Rapid Deployment &amp; Handover Guarantee
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] pl-8">
                    <p>
                      <strong className="text-[var(--text-gold-strong)]">12-Hour Deployment Window:</strong> Upon final payment confirmation and client greenlight, DevSupport Asia commits to transferring full ownership, hosting configuration, and live site deployment within less than 12 hours.
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Ownership Transfer:</strong> Full rights to custom codebase, assets, and configured files belong to the client upon completion of payment.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-mono font-bold">4</span>
                    Managed Hosting, Support &amp; Emergency Recovery (Bundled Package)
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] pl-8">
                    <p>
                      <strong className="text-[var(--text-primary)]">Unified All-in-One Package:</strong> Our project packages strictly integrate custom web development alongside our mandatory Managed Hosting &amp; Support infrastructure. Though listed as descriptive line items, they form a single, non-severable service package upon purchase.
                    </p>
                    <p>
                      <strong className="text-[var(--text-gold-strong)]">6-Hour Emergency System Restoration:</strong> If a client website experiences an unexpected outage, system break, or critical technical failure, the client should send an immediate email notification to DevSupport Asia support. DevSupport Asia guarantees active intervention to resolve the issue and restore the site to a fully functional live state within 6 hours of receiving the report.
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Monthly Infrastructure Retainer:</strong> To ensure peak loading speed, continuous security monitoring, high-availability uptime, and performance maintenance, clients must maintain the recurring monthly Managed Hosting &amp; Support fee.
                    </p>
                    <p>
                      <strong className="text-[var(--text-rose)]">Service Interruption Notice:</strong> If the monthly Managed Hosting &amp; Support fee is unpaid or delinquent, DevSupport Asia cannot continue maintaining, securing, or hosting the website online. Unmaintained instances will be temporarily suspended or offline by the following monthly cycle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 2 */}
              <div className="space-y-4 pt-2">
                <div className="inline-block px-3 py-1 rounded-[8px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-gold)] text-xs font-bold uppercase tracking-wider">
                  Part 2: Privacy Policy
                </div>

                <div className="space-y-2 p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-mono font-bold">1</span>
                    Information Collection
                  </h4>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)] pl-8">
                    <p>We collect minimal personal details necessary for processing service requests, executing project contracts, and delivering technical support. This includes:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
                      <li>Contact details (Name, Email Address, WhatsApp/Phone Number).</li>
                      <li>Billing, domain credentials, and technical project assets.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-mono font-bold">2</span>
                    Use of Information
                  </h4>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)] pl-8">
                    <p>Collected information is used exclusively to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
                      <li>Communicate regarding project deliverables, mockups, and handover schedules.</li>
                      <li>Provision, maintain, and bill for Managed Hosting &amp; Support services.</li>
                      <li>Provide technical assistance and respond to emergency restoration requests made via our official channels.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <h4 className="text-[var(--text-primary)] font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-mono font-bold">3</span>
                    Data Protection &amp; Confidentiality
                  </h4>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm pl-8">
                    DevSupport Asia enforces strict access controls. Client credentials, API keys, source codes, and communication logs are never sold, rented, or shared with unauthorized third parties.
                  </p>
                </div>
              </div>

              {/* Part 3 */}
              <div className="space-y-4 pt-2">
                <div className="inline-block px-3 py-1 rounded-[8px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-gold-strong)] text-xs font-bold uppercase tracking-wider">
                  Part 3: Contact &amp; Direct Inquiries
                </div>

                <div className="p-5 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <p>
                    For project consultations, mockup approvals, hosting management, emergency site recovery, or custom design purchases, reach out directly through our official points of contact:
                  </p>
                  <div className="pt-1 space-y-1.5 pl-2 font-mono text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-gold)]">
                      <span className="font-bold text-[var(--text-primary)] font-sans">Official Website:</span>
                      <a href="https://www.devsupport.asia/" target="_blank" rel="noreferrer" className="underline hover:text-[var(--text-primary)]">
                        https://www.devsupport.asia/
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="font-bold text-[var(--text-primary)] font-sans">Direct Channels:</span>
                      <span>Email / WhatsApp (accessible via the contact section on devsupport.asia)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                devsupport.asia &bull; Formal Business Agreement
              </span>
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="px-5 py-2.5 rounded-[10px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                I Understand &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-[12px] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-semibold shadow-[var(--modal-shadow)] border border-[var(--border-gold)] flex items-center gap-2.5 animate-bounce-short">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
