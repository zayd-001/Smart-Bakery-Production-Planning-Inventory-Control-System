import React from 'react';
import { OptimizationSolution, CapacityLimits, InventoryState, EOQItem } from '../../types/bakery';
import { formatIDR, calculateEOQItem } from '../../utils/solver';

interface ProductionChartProps {
  x: number;
  y: number;
  breadName: string;
  cakeName: string;
  maxDemandBread: number;
  maxDemandCake: number;
}

export const ProductionChart: React.FC<ProductionChartProps> = ({
  x,
  y,
  breadName,
  cakeName,
  maxDemandBread,
  maxDemandCake,
}) => {
  const maxVal = Math.max(maxDemandBread, maxDemandCake, x, y, 10);
  const w = 480;
  const h = 220;
  const pad = { top: 35, right: 30, bottom: 45, left: 50 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const scaleY = (v: number) => chartH - (v / maxVal) * chartH;

  const bDemH = (maxDemandBread / maxVal) * chartH;
  const bProdH = (x / maxVal) * chartH;
  const cDemH = (maxDemandCake / maxVal) * chartH;
  const cProdH = (y / maxVal) * chartH;

  return (
    <div className="w-full h-56 flex items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        {/* Horizontal grid lines */}
        <line x1={pad.left} y1={pad.top + scaleY(0)} x2={w - pad.right} y2={pad.top + scaleY(0)} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={pad.left} y1={pad.top + scaleY(maxVal / 2)} x2={w - pad.right} y2={pad.top + scaleY(maxVal / 2)} stroke="#f1f5f9" strokeDasharray="4" />
        <line x1={pad.left} y1={pad.top} x2={w - pad.right} y2={pad.top} stroke="#f1f5f9" strokeDasharray="4" />

        {/* Y Axis ticks */}
        <text x={pad.left - 10} y={pad.top + scaleY(maxVal) + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono-numbers">{maxVal}</text>
        <text x={pad.left - 10} y={pad.top + scaleY(maxVal / 2) + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono-numbers">{Math.round(maxVal / 2)}</text>
        <text x={pad.left - 10} y={pad.top + scaleY(0) + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono-numbers">0</text>

        {/* Group 1: Bread */}
        <rect x={pad.left + 50} y={pad.top + scaleY(maxDemandBread)} width="38" height={bDemH} fill="#e2e8f0" rx="3" />
        <rect x={pad.left + 94} y={pad.top + scaleY(x)} width="38" height={bProdH} fill="#d97706" rx="3" />
        <text x={pad.left + 69} y={pad.top + scaleY(maxDemandBread) - 6} fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle" className="font-mono-numbers">{maxDemandBread}</text>
        <text x={pad.left + 113} y={pad.top + scaleY(x) - 6} fill="#d97706" fontSize="11" fontWeight="800" textAnchor="middle" className="font-mono-numbers">{x}</text>
        <text x={pad.left + 91} y={h - 14} fill="#1e293b" fontSize="11" fontWeight="600" textAnchor="middle">{breadName.split(' ')[0]} (x*)</text>

        {/* Group 2: Cake */}
        <rect x={pad.left + 220} y={pad.top + scaleY(maxDemandCake)} width="38" height={cDemH} fill="#e2e8f0" rx="3" />
        <rect x={pad.left + 264} y={pad.top + scaleY(y)} width="38" height={cProdH} fill="#0284c7" rx="3" />
        <text x={pad.left + 239} y={pad.top + scaleY(maxDemandCake) - 6} fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle" className="font-mono-numbers">{maxDemandCake}</text>
        <text x={pad.left + 283} y={pad.top + scaleY(y) - 6} fill="#0284c7" fontSize="11" fontWeight="800" textAnchor="middle" className="font-mono-numbers">{y}</text>
        <text x={pad.left + 261} y={h - 14} fill="#1e293b" fontSize="11" fontWeight="600" textAnchor="middle">{cakeName.split(' ')[0]} (y*)</text>

        {/* Legend */}
        <rect x={w - 200} y="8" width="10" height="10" fill="#e2e8f0" rx="2" />
        <text x={w - 185} y="17" fill="#64748b" fontSize="10">Max Demand</text>
        <rect x={w - 105} y="8" width="10" height="10" fill="#d97706" rx="2" />
        <text x={w - 90} y="17" fill="#1e293b" fontSize="10" fontWeight="600">Optimal (x*, y*)</text>
      </svg>
    </div>
  );
};

interface CapacityGaugesProps {
  ovenUtil: number;
  laborUtil: number;
  ovenUsed: number;
  ovenCap: number;
  laborUsed: number;
  laborCap: number;
}

export const CapacityGauges: React.FC<CapacityGaugesProps> = ({
  ovenUtil,
  laborUtil,
  ovenUsed,
  ovenCap,
  laborUsed,
  laborCap,
}) => {
  const w = 500;
  const h = 220;

  const renderGauge = (
    cx: number,
    cy: number,
    r: number,
    pct: number,
    labelLine1: string,
    labelLine2: string,
    sub: string,
    color: string
  ) => {
    const capped = Math.min(100, Math.max(0, pct));
    const strokeW = 12;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (capped / 100) * circumference;

    return (
      <g>
        {/* Subtle inner circle backdrop */}
        <circle cx={cx} cy={cy} r={r - strokeW / 2} fill="#f8fafc" />
        {/* Background track circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeW} />
        {/* Progress gauge arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Prominent Primary Metric: Percentage */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill="#0f172a"
          className="font-mono-numbers"
        >
          {pct.toFixed(1)}%
        </text>
        {/* Balanced multi-line indicator label formatted within circle margins */}
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          letterSpacing="0.05em"
          fill="#475569"
        >
          {labelLine1}
        </text>
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          letterSpacing="0.05em"
          fill="#475569"
        >
          {labelLine2}
        </text>
        {/* Capacity ratio figure securely enclosed inside circle boundary */}
        <text
          x={cx}
          y={cy + 38}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="600"
          fill="#64748b"
          className="font-mono-numbers"
        >
          {sub}
        </text>
      </g>
    );
  };

  const ovenColor = ovenUtil >= 98 ? '#dc2626' : ovenUtil >= 85 ? '#d97706' : '#059669';
  const laborColor = laborUtil >= 98 ? '#dc2626' : laborUtil >= 85 ? '#d97706' : '#0284c7';

  return (
    <div className="w-full h-56 flex items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full max-h-56" preserveAspectRatio="xMidYMid meet">
        {renderGauge(
          135,
          110,
          70,
          ovenUtil,
          'OVEN THERMAL',
          'LOAD',
          `${ovenUsed.toFixed(0)} / ${ovenCap} min`,
          ovenColor
        )}
        {renderGauge(
          365,
          110,
          70,
          laborUtil,
          'WORKFORCE',
          'LABOR LOAD',
          `${laborUsed.toFixed(0)} / ${laborCap} min`,
          laborColor
        )}
      </svg>
    </div>
  );
};

interface MaterialsFlowChartProps {
  solution: OptimizationSolution;
  inventory: InventoryState;
}

export const MaterialsFlowChart: React.FC<MaterialsFlowChartProps> = ({ solution, inventory }) => {
  const materials = [
    {
      name: 'Flour (kg)',
      initial: inventory.flour.stock,
      used: solution.used.flour,
      end: inventory.flour.stock - solution.used.flour,
      ss: inventory.flour.ss,
    },
    {
      name: 'Sugar (kg)',
      initial: inventory.sugar.stock,
      used: solution.used.sugar,
      end: inventory.sugar.stock - solution.used.sugar,
      ss: inventory.sugar.ss,
    },
    {
      name: 'Eggs (pcs)',
      initial: inventory.eggs.stock,
      used: solution.used.eggs,
      end: inventory.eggs.stock - solution.used.eggs,
      ss: inventory.eggs.ss,
    },
  ];

  const w = 920;
  const h = 230;
  const pad = { top: 32, right: 50, bottom: 25, left: 110 };
  const rowHeight = 56;

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Legend */}
        <rect x={pad.left} y="6" width="12" height="12" fill="#d97706" rx="2" />
        <text x={pad.left + 16} y="16" fill="#1e293b" fontSize="10.5" fontWeight="600">Shift Consumed</text>

        <rect x={pad.left + 140} y="6" width="12" height="12" fill="#059669" rx="2" />
        <text x={pad.left + 156} y="16" fill="#1e293b" fontSize="10.5" fontWeight="600">Ending Balance</text>

        <line x1={pad.left + 300} y1="12" x2={pad.left + 325} y2="12" stroke="#dc2626" strokeWidth="2" strokeDasharray="3" />
        <text x={pad.left + 332} y="16" fill="#dc2626" fontSize="10.5" fontWeight="700">Safety Stock Threshold (SS)</text>

        {materials.map((mat, idx) => {
          const yPos = pad.top + idx * rowHeight;
          const maxVal = Math.max(mat.initial, 1);
          const usableW = w - pad.left - pad.right;

          const usedW = (Math.max(0, mat.used) / maxVal) * usableW;
          const endW = (Math.max(0, mat.end) / maxVal) * usableW;
          const ssX = pad.left + (mat.ss / maxVal) * usableW;

          return (
            <g key={mat.name}>
              {/* Row Label */}
              <text x={pad.left - 12} y={yPos + 18} textAnchor="end" fontSize="11.5" fontWeight="700" fill="#0f172a">
                {mat.name}
              </text>

              {/* Background Bar */}
              <rect x={pad.left} y={yPos} width={usableW} height="26" fill="#f1f5f9" rx="4" />

              {/* Consumed */}
              <rect x={pad.left} y={yPos} width={usedW} height="26" fill="#d97706" rx="4 0 0 4" />

              {/* Ending Stock */}
              <rect x={pad.left + usedW} y={yPos} width={endW} height="26" fill="#059669" opacity="0.85" />

              {/* Safety Stock Line */}
              <line x1={ssX} y1={yPos - 4} x2={ssX} y2={yPos + 30} stroke="#dc2626" strokeWidth="2" strokeDasharray="3" />

              {/* Labels */}
              <text x={pad.left + 8} y={yPos + 17} fill="#ffffff" fontSize="10" fontWeight="700" className="font-mono-numbers">
                {mat.used.toFixed(1)} used
              </text>
              <text x={pad.left + usedW + 8} y={yPos + 17} fill="#ffffff" fontSize="10" fontWeight="700" className="font-mono-numbers">
                {mat.end.toFixed(1)} end
              </text>
              <text x={usableW + pad.left - 8} y={yPos + 17} fill="#64748b" fontSize="10" fontWeight="600" textAnchor="end" className="font-mono-numbers">
                Stock: {mat.initial}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface EOQCurveChartProps {
  itemKey: string;
  itemName: string;
  itemUnit: string;
  eoqParam: EOQItem;
}

export const EOQCurveChart: React.FC<EOQCurveChartProps> = ({
  itemName,
  itemUnit,
  eoqParam,
}) => {
  const eoqRes = calculateEOQItem(eoqParam.D, eoqParam.S, eoqParam.H, eoqParam.pack);
  if (!eoqRes.valid) return <div className="p-4 text-xs text-slate-500">Invalid parameters for EOQ curve.</div>;

  const w = 820;
  const h = 250;
  const pad = { top: 30, right: 35, bottom: 45, left: 80 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const minQ = Math.max(10, Math.floor(eoqRes.practicalQ * 0.35));
  const maxQ = Math.floor(eoqRes.practicalQ * 2.2);
  const steps = 40;
  const qStep = (maxQ - minQ) / steps;

  const pointsOrder: { q: number; cost: number }[] = [];
  const pointsHold: { q: number; cost: number }[] = [];
  const pointsTotal: { q: number; cost: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const q = minQ + i * qStep;
    const oCost = (eoqParam.D / q) * eoqParam.S;
    const hCost = (q / 2) * eoqParam.H;
    const tCost = oCost + hCost;

    pointsOrder.push({ q, cost: oCost });
    pointsHold.push({ q, cost: hCost });
    pointsTotal.push({ q, cost: tCost });
  }

  const yMax = eoqRes.totalCost * 1.55;

  const scaleX = (q: number) => pad.left + ((q - minQ) / (maxQ - minQ)) * chartW;
  const scaleY = (c: number) => pad.top + chartH - (Math.min(c, yMax) / yMax) * chartH;

  const pathOrder = pointsOrder
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.q)} ${scaleY(pt.cost)}`)
    .join(' ');
  const pathHold = pointsHold
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.q)} ${scaleY(pt.cost)}`)
    .join(' ');
  const pathTotal = pointsTotal
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.q)} ${scaleY(pt.cost)}`)
    .join(' ');

  const eoqX = scaleX(eoqRes.practicalQ);
  const eoqY = scaleY(eoqRes.totalCost);

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Axes */}
        <line x1={pad.left} y1={pad.top + chartH} x2={w - pad.right} y2={pad.top + chartH} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#94a3b8" strokeWidth="1.5" />

        {/* Curves */}
        <path d={pathOrder} fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="4" />
        <path d={pathHold} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4" />
        <path d={pathTotal} fill="none" stroke="#0f172a" strokeWidth="3" />

        {/* Vertical EOQ Indicator */}
        <line x1={eoqX} y1={pad.top} x2={eoqX} y2={pad.top + chartH} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3" />
        <circle cx={eoqX} cy={eoqY} r="5" fill="#dc2626" />

        {/* Annotations */}
        <text x={eoqX + 8} y={eoqY - 8} fill="#0f172a" fontSize="11" fontWeight="800">
          EOQ = {eoqRes.practicalQ} {itemUnit} (Min Cost: {formatIDR(eoqRes.totalCost)})
        </text>

        {/* Axis Labels */}
        <text x={w / 2} y={h - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">
          Order Lot Size Q ({itemUnit}) - {itemName}
        </text>
        <text
          x="20"
          y={pad.top + chartH / 2}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="#475569"
          transform={`rotate(-90 20 ${pad.top + chartH / 2})`}
        >
          Annual Cost (IDR)
        </text>

        {/* Legend */}
        <line x1={w - 300} y1="14" x2={w - 280} y2="14" stroke="#0f172a" strokeWidth="3" />
        <text x={w - 272} y="17" fontSize="10.5" fontWeight="700">Total Relevant Cost (TRC)</text>

        <line x1={w - 300} y1="28" x2={w - 280} y2="28" stroke="#0284c7" strokeWidth="2" strokeDasharray="4" />
        <text x={w - 272} y="31" fontSize="10.5" fill="#0284c7">Ordering Cost (TOC)</text>

        <line x1={w - 140} y1="28" x2={w - 120} y2="28" stroke="#d97706" strokeWidth="2" strokeDasharray="4" />
        <text x={w - 112} y="31" fontSize="10.5" fill="#d97706">Holding Cost (THC)</text>
      </svg>
    </div>
  );
};
