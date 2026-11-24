import React from 'react';
import {
  ExternalLink,
  Trash2,
  Maximize2,
  Eye,
  Layers,
  Lock,
  Database,
  Pencil
} from 'lucide-react';
import { PortfolioItem, HARDCODED_PROJECTS } from '@/src/data/projectsData';
import { getGithubDisplay } from '@/src/utils/github';

// Crisp GitHub SVG icon
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

export interface PortfolioShowcaseGridProps {
  items?: PortfolioItem[];
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onViewItem?: (item: PortfolioItem) => void;
  onEditItem?: (item: PortfolioItem) => void;
  onDeleteItem?: (id: number) => void;
  onOpenBackupModal?: () => void;
}

export const PortfolioShowcaseGrid: React.FC<PortfolioShowcaseGridProps> = ({
  items,
  categories = ['All', 'E-commerce', 'Real Estate', 'Restaurant', 'Cafes', 'Salon and BeautyParlour'],
  activeCategory = 'All',
  onCategoryChange,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onOpenBackupModal,
}) => {
  // Uses state items directly so custom edits and changes persist cleanly
  const displayPool = items !== undefined ? items : HARDCODED_PROJECTS;

  const matchesCategory = (itemCategory: string, selectedCategory: string) => {
    const normalizedItem = itemCategory.trim().toLowerCase();
    const normalizedSelected = selectedCategory.trim().toLowerCase();
    if (normalizedItem === normalizedSelected) return true;
    if (normalizedSelected === 'restaurant') {
      return normalizedItem === 'restaurant' || normalizedItem === 'restaurants';
    }
    if (normalizedSelected === 'cafes') {
      return normalizedItem === 'cafes' || normalizedItem === 'cafe' || normalizedItem === 'cafee';
    }
    if (normalizedSelected === 'salon and beautyparlour') {
      return (
        normalizedItem === 'salon and beautyparlour' ||
        normalizedItem === 'salon & beauty parlour' ||
        normalizedItem === 'salon and beauty parlour' ||
        normalizedItem === 'salon' ||
        normalizedItem === 'beauty parlour' ||
        normalizedItem === 'beautyparlour'
      );
    }
    return false;
  };

  const filteredItems =
    activeCategory === 'All'
      ? displayPool
      : displayPool.filter((item) => matchesCategory(item.category, activeCategory));

  return (
    <section id="portfolio" className="py-24 bg-[var(--bg-canvas)] border-t border-[var(--border-subtle)] scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-gold)] bg-[var(--bg-gold-tint)] px-3.5 py-1.5 rounded-[12px] border border-[var(--border-gold)]">
            Production Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.025em] mt-4">
            My Previous Work
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 text-sm sm:text-base leading-relaxed">
            Client engineering deliverables and verified WebP optimizations with dynamic GitHub and Live project links.
          </p>

          {/* Persistent status badge & backup action */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-[var(--card-shadow)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
              <span>
                <strong className="text-[var(--text-primary)] font-semibold tabular-nums">{displayPool.length} Projects</strong> Live &amp; Active
              </span>
            </div>
            {onOpenBackupModal && (
              <button
                type="button"
                onClick={onOpenBackupModal}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[12px] bg-[var(--bg-surface)] hover:bg-[var(--btn-primary-bg)] text-[var(--text-primary)] hover:text-[var(--btn-primary-text)] border border-[var(--border-subtle)] hover:border-[var(--btn-primary-bg)] text-xs font-semibold transition-all duration-200 shadow-[var(--card-shadow)] cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                Backup &amp; Export Data
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange && onCategoryChange(cat)}
                  className={`px-5 py-2.5 rounded-[12px] text-xs font-semibold tracking-wide transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)] shadow-[var(--card-shadow)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-gold)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Gallery Grid: 3 columns desktop, 2 tablet, 1 mobile */}
        {filteredItems.length === 0 ? (
          <div className="p-8 sm:py-16 text-center bg-[var(--bg-surface)] rounded-[12px] max-w-xl mx-auto border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
            <Layers className="w-10 h-10 text-[var(--accent-gold)] opacity-80 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No projects found under &ldquo;{activeCategory}&rdquo;.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Select &ldquo;All&rdquo; to view all verified engineering deliverables.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((project) => {
              const hasValidGithub = Boolean(project.githubUrl && project.githubUrl.trim());
              const githubDisplay = hasValidGithub ? getGithubDisplay(project.githubUrl) : '';
              const hasValidLive = Boolean(project.liveUrl && project.liveUrl.trim());

              return (
                <div
                  key={project.id}
                  className="bg-[var(--bg-surface)] rounded-[12px] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--card-shadow)] luxury-card-hover group relative flex flex-col justify-between"
                >
                  <div>
                    {/* Hero Website Screenshot at Top */}
                    <div
                      onClick={() => onViewItem && onViewItem(project)}
                      className="h-52 bg-[var(--bg-image-frame)] overflow-hidden relative border-b border-[var(--border-subtle)] cursor-pointer group/img"
                      title="Click to view full preview in big window"
                    >
                      <img
                        src={project.dataUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-[#111827]/35 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-2 rounded-[12px] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-[var(--border-subtle)] backdrop-blur-sm">
                          <Maximize2 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                          View in Big Window
                        </span>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        {onEditItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditItem(project);
                            }}
                            title="Edit project details"
                            className="w-8 h-8 rounded-[10px] bg-[var(--bg-surface)] hover:bg-[var(--btn-primary-bg)] text-[var(--text-primary)] hover:text-[var(--btn-primary-text)] border border-[var(--border-subtle)] flex items-center justify-center text-xs transition-all duration-200 shadow-sm backdrop-blur-sm cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(project.id);
                            }}
                            title="Delete with admin password"
                            className="w-8 h-8 rounded-[10px] bg-[var(--bg-surface)] hover:bg-rose-600 text-[var(--text-rose)] hover:text-white border border-[var(--border-subtle)] hover:border-rose-600 flex items-center justify-center text-xs transition-all duration-200 shadow-sm backdrop-blur-sm cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* WebP Image Conversion Badge */}
                      {project.sizeKb && (
                        <span className="absolute bottom-3 left-3 bg-[var(--bg-surface)] backdrop-blur-md px-2.5 py-1 rounded-[8px] text-[11px] font-mono font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-sm tabular-nums">
                          {project.sizeKb} KB
                        </span>
                      )}
                    </div>

                    <div className="p-8 pb-6">
                      {/* Category Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-[8px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-gold)] bg-[var(--bg-gold-tint)] border border-[var(--border-gold)]">
                          {project.category}
                        </span>
                      </div>

                      {/* Live URL Title */}
                      <div className="mt-3">
                        {hasValidLive ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/title inline-flex items-center gap-1.5 text-lg font-bold text-[var(--text-primary)] hover:text-[var(--text-gold)] transition-colors duration-200 leading-snug tracking-[-0.018em]"
                            title={`Open live project: ${project.title}`}
                          >
                            <span>{project.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover/title:text-[var(--accent-gold)] transition-colors shrink-0" />
                          </a>
                        ) : (
                          <h3
                            onClick={() => onViewItem && onViewItem(project)}
                            className="text-lg font-bold text-[var(--text-primary)] leading-snug tracking-[-0.018em] cursor-pointer hover:text-[var(--text-gold)] transition-colors duration-200"
                            title="Click to view details"
                          >
                            {project.title}
                          </h3>
                        )}
                      </div>

                      {/* CAR Context Snippet */}
                      {project.description && (
                        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-2.5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      {/* GitHub Link Box with Disabled 'Private Repository' Fallback */}
                      <div className="mt-5">
                        {hasValidGithub ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] hover:bg-[var(--bg-subtle-hover)] text-xs transition-all duration-200 group/repo"
                            title={`Open ${project.title} repository on GitHub`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <GithubIcon className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover/repo:text-[var(--text-primary)] shrink-0 transition-colors" />
                              <span className="truncate font-mono text-[11px] text-[var(--text-secondary)] group-hover/repo:text-[var(--text-primary)] transition-colors">
                                {githubDisplay}
                              </span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover/repo:text-[var(--accent-gold)] shrink-0 ml-1.5 transition-colors" />
                          </a>
                        ) : (
                          /* Disabled Tag: Private Repository */
                          <div
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] select-none cursor-not-allowed"
                            title="Repository is private or proprietary"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                                Private Repository
                              </span>
                            </span>
                            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                              Private
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* "View Project" CTA Button mapped directly to liveUrl */}
                  <div className="px-8 pb-8 pt-0 flex items-center gap-2.5">
                    {hasValidLive ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-[12px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold tracking-wide text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 shadow-sm group/btn"
                        title="Open live website in new tab"
                      >
                        <span>View Project</span>
                        <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onViewItem && onViewItem(project)}
                        className="flex-1 py-2.5 px-4 rounded-[12px] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--btn-primary-text)] hover:text-[var(--btn-primary-hover-text)] text-xs font-semibold tracking-wide text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Project</span>
                      </button>
                    )}

                    {/* Quick Fullscreen Inspector Button */}
                    <button
                      type="button"
                      onClick={() => onViewItem && onViewItem(project)}
                      className="p-2.5 rounded-[12px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all duration-200 border border-[var(--border-subtle)] hover:border-[var(--border-gold)] shrink-0 cursor-pointer"
                      title="Inspect image in big window"
                    >
                      <Maximize2 className="w-4 h-4 transition-colors" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioShowcaseGrid;
