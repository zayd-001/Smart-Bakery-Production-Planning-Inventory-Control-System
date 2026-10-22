import React, { useState } from 'react';
import { RotateCcw, Play, Download, Printer, Menu } from 'lucide-react';
import { TabId } from '../types/bakery';

interface TopBarProps {
  activeTab: TabId;
  onLoadScenario: () => void;
  onSolve: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  onToggleMobileMenu?: () => void;
  isSolving?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onLoadScenario,
  onSolve,
  onExportCSV,
  onPrint,
  onToggleMobileMenu,
  isSolving,
}) => {
  const [logoError, setLogoError] = useState(false);

  const titles: Record<TabId, { title: string; subtitle: string }> = {
    'tab-dashboard': {
      title: 'Executive Operations Dashboard',
      subtitle: 'Production & Resource Optimization Overview',
    },
    'tab-optimization': {
      title: 'Integer Linear Programming Formulation',
      subtitle: 'Profit Maximization with Binding Capacity Matrix',
    },
    'tab-plan': {
      title: 'Master Production Schedule (MPS)',
      subtitle: 'Exploded BOM Dispatch & Workstation Workload Allocation',
    },
    'tab-inventory': {
      title: 'Raw Material Inventory Control & Buffer Surveillance',
      subtitle: 'Safety Stock Integrity & What-If Simulation Engine',
    },
    'tab-eoq': {
      title: 'Economic Order Quantity (EOQ) Lot Sizing',
      subtitle: 'Harris-Wilson Cost Equilibrium Model for Procurement',
    },
    'tab-reports': {
      title: 'Executive Engineering Audit Report',
      subtitle: 'Certified Decision Support & Archival Export',
    },
    'tab-about': {
      title: 'Academic Identity & Systems Engineering Documentation',
      subtitle: 'UPNVJ Industrial Engineering & Lean Manufacturing Muda Alignment',
    },
  };

  const { title, subtitle } = titles[activeTab] || titles['tab-dashboard'];

  return (
    <header className="pb-4 mb-5 border-b border-slate-200 no-print space-y-3.5">
      {/* Mobile Top Bar Bar with Menu Button & Logo */}
      <div className="flex items-center justify-between lg:hidden pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 shrink-0 bg-white rounded p-1 border border-slate-200 flex items-center justify-center">
            {!logoError ? (
              <img
                src="https://i.ibb.co.com/wNLd1f82/UPNVJ-LOGO.png"
                alt="UPNVJ Official Logo"
                className="max-w-full max-h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="font-extrabold text-[10px] text-slate-900">UPNVJ</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider truncate">
              UPNVJ Industrial Engineering
            </span>
            <span className="text-[10px] text-amber-700 font-semibold truncate">
              Smart Bakery PPIC &bull; 2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700 leading-relaxed break-words">
            Decision Support System &bull; {subtitle}
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight break-words mt-0.5">
            {title}
          </h1>
        </div>

        {/* Action Controls - Accessible and wrap cleanly */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onLoadScenario}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs whitespace-nowrap min-h-[34px]"
            title="Restore standard UPNVJ demonstration benchmark scenario"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Load Scenario</span>
          </button>

          <button
            type="button"
            onClick={onSolve}
            disabled={isSolving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 active:bg-slate-950 transition-colors shadow-2xs disabled:opacity-50 whitespace-nowrap min-h-[34px]"
            title="Solve integer optimization model with current parameters"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSolving ? 'Solving...' : 'Solve Optimizer'}</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs whitespace-nowrap min-h-[34px]"
            title="Download genuine CSV tabular dataset"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs whitespace-nowrap min-h-[34px]"
            title="Open browser print dialog for formal executive report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
