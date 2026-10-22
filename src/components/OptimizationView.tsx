import React from 'react';
import { ProductParams, CapacityLimits, OptimizationSolution } from '../types/bakery';
import { formatIDR } from '../utils/solver';

interface OptimizationViewProps {
  bread: ProductParams;
  setBread: React.Dispatch<React.SetStateAction<ProductParams>>;
  cake: ProductParams;
  setCake: React.Dispatch<React.SetStateAction<ProductParams>>;
  capacity: CapacityLimits;
  setCapacity: React.Dispatch<React.SetStateAction<CapacityLimits>>;
  solution: OptimizationSolution;
  onSolve: () => void;
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({
  bread,
  setBread,
  cake,
  setCake,
  capacity,
  setCapacity,
  solution,
  onSolve,
}) => {
  const pB = Math.max(0, bread.sellingPrice - bread.variableCost);
  const pC = Math.max(0, cake.sellingPrice - cake.variableCost);

  const constraintsRows = [
    {
      dim: 'Flour Material Limit',
      expr: `${bread.flour}x + ${cake.flour}y <= ${capacity.flour} kg`,
      used: `${solution.used.flour.toFixed(2)} kg`,
      rhs: `${capacity.flour.toFixed(1)} kg`,
      slack: `${solution.slack.flour.toFixed(2)} kg`,
      util: solution.utilization.flour,
    },
    {
      dim: 'Sugar Material Limit',
      expr: `${bread.sugar}x + ${cake.sugar}y <= ${capacity.sugar} kg`,
      used: `${solution.used.sugar.toFixed(2)} kg`,
      rhs: `${capacity.sugar.toFixed(1)} kg`,
      slack: `${solution.slack.sugar.toFixed(2)} kg`,
      util: solution.utilization.sugar,
    },
    {
      dim: 'Fresh Eggs Inventory Limit',
      expr: `${bread.eggs}x + ${cake.eggs}y <= ${capacity.eggs} pcs`,
      used: `${solution.used.eggs.toFixed(0)} pcs`,
      rhs: `${capacity.eggs} pcs`,
      slack: `${solution.slack.eggs.toFixed(0)} pcs`,
      util: solution.utilization.eggs,
    },
    {
      dim: 'Baking Oven Thermal Time',
      expr: `${bread.oven}x + ${cake.oven}y <= ${capacity.oven} min`,
      used: `${solution.used.oven.toFixed(1)} min`,
      rhs: `${capacity.oven} min`,
      slack: `${solution.slack.oven.toFixed(1)} min`,
      util: solution.utilization.oven,
    },
    {
      dim: 'Workforce Labor Working Time',
      expr: `${bread.labor}x + ${cake.labor}y <= ${capacity.labor} min`,
      used: `${solution.used.labor.toFixed(1)} min`,
      rhs: `${capacity.labor} min`,
      slack: `${solution.slack.labor.toFixed(1)} min`,
      util: solution.utilization.labor,
    },
    {
      dim: 'Artisan Bread Market Demand Cap',
      expr: `x <= ${bread.maxDemand} units`,
      used: `${solution.x} units`,
      rhs: `${bread.maxDemand} units`,
      slack: `${bread.maxDemand - solution.x} units`,
      util: (solution.x / (bread.maxDemand || 1)) * 100,
    },
    {
      dim: 'Signature Cake Market Demand Cap',
      expr: `y <= ${cake.maxDemand} units`,
      used: `${solution.y} units`,
      rhs: `${cake.maxDemand} units`,
      slack: `${cake.maxDemand - solution.y} units`,
      util: (solution.y / (cake.maxDemand || 1)) * 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Production Optimization Parameter Configuration</h2>
        <p className="text-xs text-slate-500">
          Define product pricing, unit BOM conversion rates, and scarce factory capacity limits to solve for the profit-maximizing integer batch allocation.
        </p>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Product X: Bread */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Product X
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Artisan Bread Parameters</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500">Unit Contribution ($P_b$)</span>
              <div className="text-sm font-bold text-amber-700 font-mono-numbers">{formatIDR(pB)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={bread.name}
                onChange={(e) => setBread({ ...bread, name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Daily Demand (units)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={bread.maxDemand}
                onChange={(e) => setBread({ ...bread, maxDemand: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selling Price (IDR/unit)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={bread.sellingPrice}
                onChange={(e) => setBread({ ...bread, sellingPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Variable Cost (IDR/unit)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={bread.variableCost}
                onChange={(e) => setBread({ ...bread, variableCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
              />
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              Technical Coefficients (BOM Conversion per Unit)
            </h4>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Flour (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bread.flour}
                  onChange={(e) => setBread({ ...bread, flour: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sugar (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bread.sugar}
                  onChange={(e) => setBread({ ...bread, sugar: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Eggs (pcs)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={bread.eggs}
                  onChange={(e) => setBread({ ...bread, eggs: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs mt-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Oven Time (min/unit)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={bread.oven}
                  onChange={(e) => setBread({ ...bread, oven: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Labor Time (min/unit)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={bread.labor}
                  onChange={(e) => setBread({ ...bread, labor: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Y: Cake */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                Product Y
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Signature Chiffon Cake Parameters</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500">Unit Contribution ($P_c$)</span>
              <div className="text-sm font-bold text-sky-700 font-mono-numbers">{formatIDR(pC)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={cake.name}
                onChange={(e) => setCake({ ...cake, name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Daily Demand (units)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={cake.maxDemand}
                onChange={(e) => setCake({ ...cake, maxDemand: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selling Price (IDR/unit)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={cake.sellingPrice}
                onChange={(e) => setCake({ ...cake, sellingPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Variable Cost (IDR/unit)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={cake.variableCost}
                onChange={(e) => setCake({ ...cake, variableCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers"
              />
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              Technical Coefficients (BOM Conversion per Unit)
            </h4>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Flour (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cake.flour}
                  onChange={(e) => setCake({ ...cake, flour: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sugar (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cake.sugar}
                  onChange={(e) => setCake({ ...cake, sugar: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Eggs (pcs)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cake.eggs}
                  onChange={(e) => setCake({ ...cake, eggs: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs mt-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Oven Time (min/unit)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cake.oven}
                  onChange={(e) => setCake({ ...cake, oven: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Labor Time (min/unit)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cake.labor}
                  onChange={(e) => setCake({ ...cake, labor: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-2 py-1 border border-slate-300 rounded-md focus:border-sky-500 focus:outline-none font-mono-numbers text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Capacity Limits */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Shared Factory Capacities &amp; Raw Material Availability Constraints (RHS Bounds)
            </h3>
            <p className="text-xs text-slate-500">Planning Horizon: 1 Single Day Shift (8 Working Hours)</p>
          </div>
          <button
            type="button"
            onClick={onSolve}
            className="self-start sm:self-auto px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            Run Optimization Engine
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Available Flour (kg)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={capacity.flour}
              onChange={(e) => setCapacity({ ...capacity, flour: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Available Sugar (kg)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={capacity.sugar}
              onChange={(e) => setCapacity({ ...capacity, sugar: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Available Eggs (pcs)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={capacity.eggs}
              onChange={(e) => setCapacity({ ...capacity, eggs: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1" title="e.g. 1.5 ovens @ 8h = 720 min">
              Oven Capacity (min)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={capacity.oven}
              onChange={(e) => setCapacity({ ...capacity, oven: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1" title="e.g. 2.5 workers @ 8h = 1200 min">
              Labor Capacity (min)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={capacity.labor}
              onChange={(e) => setCapacity({ ...capacity, labor: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
            />
          </div>
        </div>
      </div>

      {/* Constraints Evaluation Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Linear Integer Programming Mathematical Resolution</h3>
          <p className="text-xs text-slate-500">
            System of linear inequalities evaluated at optimal candidate tuple $(x^*={solution.x}, y^*={solution.y})$
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
          <table className="w-full min-w-[640px] text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Constraint Dimension</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Formulation Expression ($A \cdot X \le B$)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Used / LHS</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Limit / RHS</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Slack ($S_i$)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Utilization</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {constraintsRows.map((r) => {
                const isBinding = r.util >= 99.0;
                return (
                  <tr key={r.dim} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.dim}</td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-[11px]">{r.expr}</td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-slate-900 text-right">{r.used}</td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">{r.rhs}</td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">{r.slack}</td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-right">
                      <span className={r.util >= 95 ? 'text-rose-700' : r.util >= 80 ? 'text-amber-700' : 'text-emerald-700'}>
                        {r.util.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          isBinding
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        }`}
                      >
                        {isBinding ? 'Binding (Bottleneck)' : 'Feasible (Slack)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Diagnostic box */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Industrial Engineering Sensitivity Diagnostic:</strong>
          <p className="mt-1">
            Constraints categorized as <em>Binding (Bottleneck)</em> possess near-zero slack variables (S<sub>i</sub> &approx; 0).
            In linear programming duality, these binding constraints yield positive shadow prices (&lambda;<sub>i</sub> &gt; 0).
            To expand daily operating profit beyond <strong>{formatIDR(solution.profit)}</strong>, plant management should focus capital expenditures on expanding these specific binding resources (e.g. procuring supplementary egg batches or staging an additional oven shift).
          </p>
        </div>
      </div>
    </div>
  );
};
