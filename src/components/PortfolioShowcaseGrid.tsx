import React from 'react';
import {
  ExternalLink,
  Trash2,
  Maximize2,
  Eye,
  Layers,
  Lock,
  CheckCircle2,
  Database
} from 'lucide-react';
import { PortfolioItem } from '@/src/data/projectsData';
import { normalizeGithubUrl, getGithubDisplay, normalizeWebUrl } from '@/src/utils/github';

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
  items: PortfolioItem[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onViewItem: (item: PortfolioItem) => void;
  onDeleteItem: (id: number) => void;
  onOpenBackupModal: () => void;
}

export const PortfolioShowcaseGrid: React.FC<PortfolioShowcaseGridProps> = ({
  items,
  categories,
  activeCategory,
  onCategoryChange,
  onViewItem,
  onDeleteItem,
  onOpenBackupModal,
}) => {
  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-20 bg-slate-900/50 border-t border-slate-800/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Production Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">My Previous Work</h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Client engineering deliverables and verified WebP optimizations with dynamic GitHub and Live project links.
          </p>

          {/* Persistent status & backup manager action */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong className="text-white">{items.length} Projects</strong> Live &amp; Persistent
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenBackupModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Backup &amp; Export Data
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid: 3 columns desktop, 2 tablet, 1 mobile */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-2xl max-w-xl mx-auto border border-slate-800">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">
              No previous work found under &ldquo;{activeCategory}&rdquo;.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Upload and convert an image using the tool above and click &ldquo;Save to My Previous Work&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((project) => {
              const hasValidGithub = Boolean(project.githubUrl && project.githubUrl.trim());
              const formattedGithub = hasValidGithub ? normalizeGithubUrl(project.githubUrl) : '';
              const githubDisplay = hasValidGithub ? getGithubDisplay(project.githubUrl) : '';
              const hasValidLive = Boolean(project.liveUrl && project.liveUrl.trim());
              const formattedLive = hasValidLive ? normalizeWebUrl(project.liveUrl) : '';

              return (
                <div
                  key={project.id}
                  className="glass-card rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 group relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg bg-slate-900/80"
                >
                  <div>
                    {/* Hero Website Screenshot at Top */}
                    <div
                      onClick={() => onViewItem(project)}
                      className="h-52 bg-slate-950 overflow-hidden relative border-b border-slate-800/80 cursor-pointer group/img"
                      title="Click to view full preview in big window"
                    >
                      <img
                        src={project.dataUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-indigo-500/30 backdrop-blur-sm">
                          <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                          View in Big Window
                        </span>
                      </div>

                      {/* Delete Button (Protected with Admin Password) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(project.id);
                        }}
                        title="Delete with admin password"
                        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs transition-colors shadow-lg backdrop-blur-sm z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* WebP Image Conversion Badge */}
                      {project.sizeKb && (
                        <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 border border-slate-800">
                          {project.sizeKb} KB
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      {/* Category Badge & Deployed Build Status */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                          {project.category}
                        </span>
                        {project.isPermanent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Deployed Build
                          </span>
                        )}
                      </div>

                      {/* Live URL Title */}
                      <div className="mt-2">
                        {hasValidLive ? (
                          <a
                            href={formattedLive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/title inline-flex items-center gap-1.5 text-base font-bold text-white hover:text-indigo-400 transition-colors leading-snug"
                            title={`Open live project: ${project.title}`}
                          >
                            <span>{project.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/title:text-indigo-400 transition-colors shrink-0" />
                          </a>
                        ) : (
                          <h3
                            onClick={() => onViewItem(project)}
                            className="text-base font-bold text-white leading-snug cursor-pointer hover:text-indigo-400 transition-colors"
                            title="Click to view details"
                          >
                            {project.title}
                          </h3>
                        )}
                      </div>

                      {/* CAR Context Snippet */}
                      {project.description && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      {/* GitHub Link Box with Graceful Private Repository Fallback */}
                      <div className="mt-3.5">
                        {hasValidGithub ? (
                          <a
                            href={formattedGithub}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-indigo-500/60 text-xs transition-all group/repo shadow-inner"
                            title={`Open ${project.title} repository on GitHub`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <GithubIcon className="w-3.5 h-3.5 text-slate-400 group-hover/repo:text-white shrink-0" />
                              <span className="truncate font-mono text-[11px] text-indigo-300 group-hover/repo:text-indigo-200">
                                {githubDisplay}
                              </span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover/repo:text-white shrink-0 ml-1.5" />
                          </a>
                        ) : (
                          /* Graceful fallback: Private Repository */
                          <div
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 select-none cursor-not-allowed"
                            title="Repository is private or proprietary"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="font-mono text-[11px] text-slate-400">
                                Private Repository
                              </span>
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                              Private
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* "View Project" CTA Button */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    {hasValidLive ? (
                      <a
                        href={formattedLive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 group/btn"
                        title="Open live website in new tab"
                      >
                        <span>View Project</span>
                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onViewItem(project)}
                        className="flex-1 py-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-2 border border-indigo-500/30"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Project</span>
                      </button>
                    )}

                    {/* Quick Fullscreen Inspector Button */}
                    <button
                      type="button"
                      onClick={() => onViewItem(project)}
                      className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-800 hover:border-slate-700 shrink-0 cursor-pointer"
                      title="Inspect image in big window"
                    >
                      <Maximize2 className="w-4 h-4 text-slate-400 hover:text-indigo-400 transition-colors" />
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
