import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sliders,
  CalendarCheck,
  Boxes,
  Scale,
  FileSpreadsheet,
  GraduationCap,
  X,
} from 'lucide-react';
import { TabId } from '../types/bakery';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen = false,
  onClose,
}) => {
  const [logoError, setLogoError] = useState(false);

  const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tab-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tab-optimization', label: 'Production Optimization', icon: Sliders },
    { id: 'tab-plan', label: 'Production Plan (MPS)', icon: CalendarCheck },
    { id: 'tab-inventory', label: 'Inventory Control', icon: Boxes },
    { id: 'tab-eoq', label: 'EOQ & Replenishment', icon: Scale },
    { id: 'tab-reports', label: 'Executive Reports', icon: FileSpreadsheet },
    { id: 'tab-about', label: 'About Project', icon: GraduationCap },
  ];

  const handleItemClick = (id: TabId) => {
    onTabChange(id);
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-y-auto">
      <div>
        {/* Brand & Institution */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 bg-white rounded-md p-1.5 shadow-xs flex items-center justify-center">
              {!logoError ? (
                <img
                  src="https://i.ibb.co.com/wNLd1f82/UPNVJ-LOGO.png"
                  alt="UPNVJ Official Logo"
                  className="max-w-full max-h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-black text-xs text-slate-900">UPNVJ</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-wider text-white uppercase truncate">
                UPN VETERAN JAKARTA
              </span>
              <span className="text-[11px] font-semibold text-amber-400 truncate">
                Industrial Engineering
              </span>
              <span className="text-[10px] text-slate-400">
                Logic Programming 2026
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Cohort Meta */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-amber-300">Class A &bull; Group 1</span>
          <span className="text-slate-400 text-[10px]">Operations Research</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Team Block */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 mt-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Student Engineering Team
        </div>
        <div className="text-[11px] text-slate-300 font-medium space-y-0.5 leading-snug">
          <div className="truncate">1. A. K. Atinnaputri (2610312026)</div>
          <div className="truncate">2. Z. Asyita (2610312007)</div>
          <div className="truncate">3. A. Z. Saleem (2610312901)</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 bg-slate-900 text-slate-200 flex-col shrink-0 border-r border-slate-800 no-print min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Off-canvas Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-slate-200 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
