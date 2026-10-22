import React from 'react';

interface PrintHeaderProps {
  timestamp: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ timestamp }) => {
  const [logoError, setLogoError] = React.useState(false);

  return (
    <header className="print-only mb-6 pb-4 border-b-2 border-slate-900">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 bg-white border border-slate-300 rounded">
          {!logoError ? (
            <img
              src="https://i.ibb.co.com/wNLd1f82/UPNVJ-LOGO.png"
              alt="UPNVJ Official Logo"
              className="max-w-full max-h-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="font-extrabold text-xs text-slate-800 text-center">UPNVJ</div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Universitas Pembangunan Nasional Veteran Jakarta
          </h2>
          <h3 className="text-[11px] font-semibold text-slate-700">
            Faculty of Engineering &bull; Department of Industrial Engineering
          </h3>
          <p className="text-[10px] text-slate-600">
            Logic Programming Final Project &bull; Academic Year 2026 &bull; Class A &bull; Group 1
          </p>
          <h1 className="text-sm font-extrabold text-slate-900 mt-0.5">
            Smart Bakery Production Planning &amp; Inventory Control System
          </h1>
        </div>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-600 border-t border-slate-200 mt-2 pt-1 font-mono-numbers">
        <span><strong>Report Generated:</strong> {timestamp}</span>
        <span><strong>Planning Horizon:</strong> Daily Production Cycle (1 Shift / 8 Hours)</span>
        <span><strong>Verification:</strong> Integer Mathematical Optimal Verified</span>
      </div>
    </header>
  );
};
