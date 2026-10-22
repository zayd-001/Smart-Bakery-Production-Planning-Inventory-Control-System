import React, { useState, useMemo, useCallback } from 'react';
import {
  TabId,
  ProductParams,
  CapacityLimits,
  InventoryState,
  EOQState,
} from './types/bakery';
import {
  INITIAL_BREAD,
  INITIAL_CAKE,
  INITIAL_CAPACITY,
  INITIAL_INVENTORY,
  INITIAL_EOQ,
  getInitialScenario,
  solveIntegerOptimization,
  generateCSV,
  formatIDR,
} from './utils/solver';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { OptimizationView } from './components/OptimizationView';
import { PlanView } from './components/PlanView';
import { InventoryView } from './components/InventoryView';
import { EOQView } from './components/EOQView';
import { ReportsView } from './components/ReportsView';
import { AboutView } from './components/AboutView';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('tab-dashboard');
  const [bread, setBread] = useState<ProductParams>({ ...INITIAL_BREAD });
  const [cake, setCake] = useState<ProductParams>({ ...INITIAL_CAKE });
  const [capacity, setCapacity] = useState<CapacityLimits>({ ...INITIAL_CAPACITY });
  const [inventory, setInventory] = useState<InventoryState>({ ...INITIAL_INVENTORY });
  const [eoq, setEOQ] = useState<EOQState>({ ...INITIAL_EOQ });
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Compute optimization solution deterministically
  const solution = useMemo(() => {
    return solveIntegerOptimization(bread, cake, capacity);
  }, [bread, cake, capacity]);

  // Formatted timestamp
  const timestamp = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const showFeedback = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  const handleLoadScenario = useCallback(() => {
    try {
      const initial = getInitialScenario();
      setBread(initial.bread);
      setCake(initial.cake);
      setCapacity(initial.capacity);
      setInventory(initial.inventory);
      setEOQ(initial.eoq);

      showFeedback(
        'Standard UPNVJ demonstration benchmark scenario loaded successfully. All product, capacity, inventory, and EOQ parameters restored to baseline.',
        'success'
      );
    } catch {
      showFeedback('Failed to load standard benchmark scenario.', 'error');
    }
  }, []);

  const handleSolve = useCallback(() => {
    setIsSolving(true);
    setTimeout(() => {
      setIsSolving(false);
      showFeedback(
        `Optimization solved: Optimal integer mix is ${solution.x} units Bread and ${solution.y} units Cake (Max Profit: ${formatIDR(solution.profit)}).`,
        'success'
      );
    }, 250);
  }, [solution]);

  const handleExportCSV = useCallback(() => {
    try {
      const csvContent = generateCSV(bread, cake, capacity, inventory, eoq, solution);
      // Prepend UTF-8 Byte Order Mark (\uFEFF) for Microsoft Excel compatibility
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `UPNVJ_Bakery_Optimization_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showFeedback('Dataset successfully exported as CSV file (Excel-compatible UTF-8).', 'success');
    } catch {
      showFeedback('Failed to export CSV file. Please retry.', 'error');
    }
  }, [bread, cake, capacity, inventory, eoq, solution]);

  const handlePrint = useCallback(() => {
    // Switch to executive reports tab so the full formal document is visible on screen
    setActiveTab('tab-reports');
    showFeedback(
      'Formal Executive Audit Report opened for printing. Triggering print dialog (Tip: Use Ctrl+P / Cmd+P or your browser Print option anytime).',
      'info'
    );
    try {
      window.focus();
      setTimeout(() => {
        try {
          window.print();
        } catch (err) {
          console.warn('Browser print dialog could not be opened automatically:', err);
        }
      }, 200);
    } catch (err) {
      console.warn('Print trigger error:', err);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex app-layout font-sans text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* Sidebar for Desktop & Off-canvas Drawer for Mobile/Tablet */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Viewport */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-8 overflow-y-auto main-viewport">
        {/* Top Action Bar */}
        <TopBar
          activeTab={activeTab}
          onLoadScenario={handleLoadScenario}
          onSolve={handleSolve}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          isSolving={isSolving}
        />

        {/* Action Feedback Notification Banner */}
        {feedback && (
          <div
            className={`no-print mb-4 p-3 rounded-lg border text-xs flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150 ${
              feedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="font-medium break-words">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors shrink-0"
              aria-label="Dismiss feedback"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Views (Screen Mode) */}
        <div className="tab-pane-content">
          {activeTab === 'tab-dashboard' && (
            <DashboardView
              bread={bread}
              cake={cake}
              capacity={capacity}
              inventory={inventory}
              solution={solution}
            />
          )}

          {activeTab === 'tab-optimization' && (
            <OptimizationView
              bread={bread}
              setBread={setBread}
              cake={cake}
              setCake={setCake}
              capacity={capacity}
              setCapacity={setCapacity}
              solution={solution}
              onSolve={handleSolve}
            />
          )}

          {activeTab === 'tab-plan' && (
            <PlanView
              bread={bread}
              cake={cake}
              capacity={capacity}
              inventory={inventory}
              solution={solution}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'tab-inventory' && (
            <InventoryView
              bread={bread}
              cake={cake}
              capacity={capacity}
              setCapacity={setCapacity}
              inventory={inventory}
              setInventory={setInventory}
              solution={solution}
            />
          )}

          {activeTab === 'tab-eoq' && <EOQView eoq={eoq} setEOQ={setEOQ} />}

          {activeTab === 'tab-reports' && (
            <ReportsView
              bread={bread}
              cake={cake}
              capacity={capacity}
              inventory={inventory}
              eoq={eoq}
              solution={solution}
              timestamp={timestamp}
              onExportCSV={handleExportCSV}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'tab-about' && <AboutView />}
        </div>

        {/* Print-Only Report Container (Activated during browser print) */}
        <div className="print-report-container print-only">
          <ReportsView
            bread={bread}
            cake={cake}
            capacity={capacity}
            inventory={inventory}
            eoq={eoq}
            solution={solution}
            timestamp={timestamp}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
          />
        </div>
      </main>
    </div>
  );
}
