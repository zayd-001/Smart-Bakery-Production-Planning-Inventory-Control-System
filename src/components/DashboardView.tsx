import React from 'react';
import {
  ProductParams,
  CapacityLimits,
  InventoryState,
  OptimizationSolution,
} from '../types/bakery';
import { formatIDR } from '../utils/solver';
import {
  ProductionChart,
  CapacityGauges,
  MaterialsFlowChart,
} from './charts/DashboardCharts';

interface DashboardViewProps {
  bread: ProductParams;
  cake: ProductParams;
  capacity: CapacityLimits;
  inventory: InventoryState;
  solution: OptimizationSolution;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bread,
  cake,
  capacity,
  inventory,
  solution,
}) => {
  const ovenPct = solution.utilization.oven;
  const laborPct = solution.utilization.labor;

  // Inventory alert calculation
  let shortageCount = 0;
  let lowSafetyCount = 0;
  (['flour', 'sugar', 'eggs'] as const).forEach((key) => {
    const end = inventory[key].stock - solution.used[key];
    const ss = inventory[key].ss;
    if (end < 0) shortageCount++;
    else if (end < ss) lowSafetyCount++;
  });

  // Binding bottlenecks
  const binding: string[] = [];
  if (solution.slack.oven < 1.0) binding.push('Oven Thermal Capacity (Minutes)');
  if (solution.slack.labor < 1.0) binding.push('Direct Labor Time (Minutes)');
  if (solution.slack.flour < 0.2) binding.push('Flour Inventory (kg)');
  if (solution.slack.sugar < 0.2) binding.push('Sugar Inventory (kg)');
  if (solution.slack.eggs < 1.0) binding.push('Fresh Eggs Inventory (pcs)');
  if (solution.x === bread.maxDemand) binding.push(`${bread.name} Market Demand Cap`);
  if (solution.y === cake.maxDemand) binding.push(`${cake.name} Market Demand Cap`);

  const pB = bread.sellingPrice - bread.variableCost;
  const pC = cake.sellingPrice - cake.variableCost;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Academic Project Identity Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-amber-400">
            <span>UPNVJ Industrial Engineering</span>
            <span aria-hidden="true">&bull;</span>
            <span>Logic Programming Final Project 2026</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white break-words">
            Integrated Smart Bakery Operations &amp; Resource Optimization
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Mathematical decision-support framework integrating Linear Integer Programming (x*, y*), Resource Bottleneck Analysis, Ending Inventory Balances (I_end = I_0 - C), and Harris-Wilson EOQ Formulation.
          </p>
        </div>
        <div className="flex flex-row sm:flex-row lg:flex-col gap-3 shrink-0 bg-slate-800/80 p-3 sm:p-3.5 rounded-lg border border-slate-700/60 text-xs">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-medium block">Cohort / Group</span>
            <div className="font-bold text-white whitespace-nowrap">Class A &bull; Group 1</div>
          </div>
          <div className="pl-3 border-l border-slate-700 sm:border-l sm:pl-3 lg:border-l-0 lg:border-t lg:pt-2 lg:pl-0">
            <span className="text-[10px] uppercase text-slate-400 font-medium block">Optimization Algorithm</span>
            <div className="font-bold text-amber-300 whitespace-nowrap">Integer Branch Search</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Fully responsive across Mobile, Tablet, and Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3.5">
        {/* Bread Output */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Bread Output</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">x*</span>
          </div>
          <div className="my-2 min-w-0">
            <span className="text-2xl font-black text-slate-900 font-mono-numbers">{solution.x}</span>
            <span className="text-xs text-slate-500 ml-1">units</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate" title={`Demand: ${solution.x}/${bread.maxDemand}`}>
            Demand: {solution.x}/{bread.maxDemand} ({((solution.x / (bread.maxDemand || 1)) * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Cake Output */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Cake Output</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded shrink-0">y*</span>
          </div>
          <div className="my-2 min-w-0">
            <span className="text-2xl font-black text-slate-900 font-mono-numbers">{solution.y}</span>
            <span className="text-xs text-slate-500 ml-1">units</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate" title={`Demand: ${solution.y}/${cake.maxDemand}`}>
            Demand: {solution.y}/{cake.maxDemand} ({((solution.y / (cake.maxDemand || 1)) * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Max Projected Profit - Prevents overflow with responsive sizing, min-w-0, and flexible container */}
        <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-2xs flex flex-col justify-between min-w-0 sm:col-span-2 lg:col-span-1 2xl:col-span-1 bg-gradient-to-b from-white to-amber-50/40">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 truncate">Max Projected Profit</span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">P*</span>
          </div>
          <div className="my-2 min-w-0">
            <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono-numbers tracking-tight break-words block">
              {formatIDR(solution.profit)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">Daily net contribution</div>
        </div>

        {/* Oven Utilization */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Oven Load</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${ovenPct >= 95 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
              Time
            </span>
          </div>
          <div className="my-1.5 min-w-0">
            <span className="text-2xl font-black text-slate-900 font-mono-numbers">{ovenPct.toFixed(1)}%</span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full ${ovenPct >= 95 ? 'bg-red-600' : ovenPct >= 80 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                style={{ width: `${Math.min(100, ovenPct)}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono-numbers truncate">
            {solution.used.oven.toFixed(0)} / {capacity.oven} min
          </div>
        </div>

        {/* Labor Utilization */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Labor Load</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${laborPct >= 95 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
              Work
            </span>
          </div>
          <div className="my-1.5 min-w-0">
            <span className="text-2xl font-black text-slate-900 font-mono-numbers">{laborPct.toFixed(1)}%</span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full ${laborPct >= 95 ? 'bg-red-600' : laborPct >= 80 ? 'bg-amber-500' : 'bg-sky-600'}`}
                style={{ width: `${Math.min(100, laborPct)}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono-numbers truncate">
            {solution.used.labor.toFixed(0)} / {capacity.labor} min
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">PPIC Alerts</span>
            <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">Stock</span>
          </div>
          <div className="my-2 min-w-0">
            <span className={`text-2xl font-black font-mono-numbers ${shortageCount > 0 ? 'text-red-600' : lowSafetyCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {shortageCount + lowSafetyCount}
            </span>
            <span className="text-xs text-slate-500 ml-1">flags</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {shortageCount} short &bull; {lowSafetyCount} &lt; safety
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs min-w-0">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">Production Output &amp; Demand Realization</h3>
            <p className="text-xs text-slate-500">Units produced (x*, y*) vs Maximum Daily Customer Demand</p>
          </div>
          <div className="w-full overflow-hidden">
            <ProductionChart
              x={solution.x}
              y={solution.y}
              breadName={bread.name}
              cakeName={cake.name}
              maxDemandBread={bread.maxDemand}
              maxDemandCake={cake.maxDemand}
            />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs min-w-0">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">Capacity Utilization Diagnostics</h3>
            <p className="text-xs text-slate-500">Oven Thermal Hours vs Workforce Labor Working Minutes</p>
          </div>
          <div className="w-full overflow-hidden">
            <CapacityGauges
              ovenUtil={ovenPct}
              laborUtil={laborPct}
              ovenUsed={solution.used.oven}
              ovenCap={capacity.oven}
              laborUsed={solution.used.labor}
              laborCap={capacity.labor}
            />
          </div>
        </div>
      </div>

      {/* Materials Flow Chart */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs min-w-0">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-900">Raw Material Inventory Flow &amp; Buffer Integrity</h3>
          <p className="text-xs text-slate-500">
            Initial Stock (I_0) vs Planned Shift Consumption (C) vs Ending Balance (I_end) relative to Safety Stock (SS)
          </p>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[620px]">
            <MaterialsFlowChart solution={solution} inventory={inventory} />
          </div>
        </div>
      </div>

      {/* Operational Synthesis & Limiting Bottlenecks */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
          <h3 className="text-sm font-bold text-slate-900">Operational Synthesis &amp; Limiting Resource Bottlenecks</h3>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 self-start sm:self-auto">
            Industrial Engineering Directive
          </span>
        </div>
        <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed break-words">
          <p>
            <strong>Master Decision Recommendation:</strong> Dispatch production for{' '}
            <strong className="text-slate-900">{solution.x} units</strong> of {bread.name} and{' '}
            <strong className="text-slate-900">{solution.y} units</strong> of {cake.name} during the next 8-hour shift.
            This integer product mix achieves the global maximum net contribution profit of{' '}
            <strong className="text-amber-700 font-mono-numbers">{formatIDR(solution.profit)}</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-semibold text-slate-800">Active Limiting Constraints:</span>
            {binding.length > 0 ? (
              binding.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded"
                >
                  {b}
                </span>
              ))
            ) : (
              <span className="text-slate-500">No active bottlenecks (excess facility capacity).</span>
            )}
          </div>
          <p className="text-slate-600 text-xs">
            <strong>Operations Research Trade-Off Analysis:</strong> {cake.name} provides a higher unit margin ({formatIDR(pC)} vs {formatIDR(pB)}), but consumes {((cake.labor / bread.labor) * 100).toFixed(0)}% more labor minutes and {((cake.eggs / bread.eggs) * 100).toFixed(0)}% more eggs per unit. The mathematical solver balanced these competing resource demands to avoid oven starvation and eliminate finished goods spoilage.
          </p>
        </div>
      </div>
    </div>
  );
};
