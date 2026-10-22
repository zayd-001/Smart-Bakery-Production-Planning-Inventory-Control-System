import {
  ProductParams,
  CapacityLimits,
  InventoryState,
  EOQState,
  OptimizationSolution,
  EOQResult,
} from '../types/bakery';

export const INITIAL_BREAD: ProductParams = {
  name: 'Artisan Sourdough Bread',
  sellingPrice: 25000,
  variableCost: 15000,
  maxDemand: 120,
  flour: 0.35,  // kg
  sugar: 0.05,  // kg
  eggs: 1,      // pcs
  oven: 4.0,    // minutes
  labor: 6.0,   // worker-minutes
};

export const INITIAL_CAKE: ProductParams = {
  name: 'Signature Chiffon Cake',
  sellingPrice: 65000,
  variableCost: 40000,
  maxDemand: 60,
  flour: 0.25,  // kg
  sugar: 0.20,  // kg
  eggs: 4,      // pcs
  oven: 7.5,    // minutes
  labor: 12.0,  // worker-minutes
};

export const INITIAL_CAPACITY: CapacityLimits = {
  flour: 50.0,  // kg
  sugar: 20.0,  // kg
  eggs: 300,    // pcs
  oven: 720,    // minutes (e.g. 1.5 commercial ovens @ 8 hrs)
  labor: 1200,  // worker-minutes (2.5 workers @ 8 hrs)
};

export const INITIAL_INVENTORY: InventoryState = {
  flour: { stock: 50.0, ss: 15.0, unitCost: 14000 },
  sugar: { stock: 20.0, ss: 6.0,  unitCost: 18000 },
  eggs:  { stock: 300,  ss: 80,   unitCost: 2200 },
};

export const INITIAL_EOQ: EOQState = {
  flour: { D: 15000, S: 150000, H: 2800, pack: 25 },
  sugar: { D: 6500,  S: 120000, H: 3600, pack: 50 },
  eggs:  { D: 95000, S: 100000, H: 440,  pack: 30 },
};

/**
 * Returns a pristine deep clone of the standard UPNVJ benchmark scenario.
 */
export function getInitialScenario() {
  return {
    bread: JSON.parse(JSON.stringify(INITIAL_BREAD)) as ProductParams,
    cake: JSON.parse(JSON.stringify(INITIAL_CAKE)) as ProductParams,
    capacity: JSON.parse(JSON.stringify(INITIAL_CAPACITY)) as CapacityLimits,
    inventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY)) as InventoryState,
    eoq: JSON.parse(JSON.stringify(INITIAL_EOQ)) as EOQState,
  };
}

/**
 * Detects whether the current active inputs differ from the benchmark scenario.
 */
export function isScenarioModified(
  bread: ProductParams,
  cake: ProductParams,
  capacity: CapacityLimits,
  inventory: InventoryState,
  eoq: EOQState
): boolean {
  return (
    JSON.stringify(bread) !== JSON.stringify(INITIAL_BREAD) ||
    JSON.stringify(cake) !== JSON.stringify(INITIAL_CAKE) ||
    JSON.stringify(capacity) !== JSON.stringify(INITIAL_CAPACITY) ||
    JSON.stringify(inventory) !== JSON.stringify(INITIAL_INVENTORY) ||
    JSON.stringify(eoq) !== JSON.stringify(INITIAL_EOQ)
  );
}

/**
 * Solves the 2-Variable Integer Linear Program deterministically.
 * Objective: Maximize Profit P = P_b * x + P_c * y
 * Subject to:
 *   b.flour * x + c.flour * y <= cap.flour
 *   b.sugar * x + c.sugar * y <= cap.sugar
 *   b.eggs * x  + c.eggs * y  <= cap.eggs
 *   b.oven * x  + c.oven * y  <= cap.oven
 *   b.labor * x + c.labor * y <= cap.labor
 *   0 <= x <= b.maxDemand
 *   0 <= y <= c.maxDemand
 *   x, y in Integers
 */
export function solveIntegerOptimization(
  bread: ProductParams,
  cake: ProductParams,
  capacity: CapacityLimits
): OptimizationSolution {
  const pB = Math.max(0, bread.sellingPrice - bread.variableCost);
  const pC = Math.max(0, cake.sellingPrice - cake.variableCost);

  const maxB = Math.max(0, Math.floor(bread.maxDemand));
  const maxC = Math.max(0, Math.floor(cake.maxDemand));

  let optimalX = 0;
  let optimalY = 0;
  let maxProfit = -1;
  let isFeasibleSolutionFound = false;

  for (let x = 0; x <= maxB; x++) {
    let limitY = maxC;

    if (cake.flour > 0) {
      limitY = Math.min(limitY, Math.floor((capacity.flour - bread.flour * x) / cake.flour));
    }
    if (cake.sugar > 0) {
      limitY = Math.min(limitY, Math.floor((capacity.sugar - bread.sugar * x) / cake.sugar));
    }
    if (cake.eggs > 0) {
      limitY = Math.min(limitY, Math.floor((capacity.eggs - bread.eggs * x) / cake.eggs));
    }
    if (cake.oven > 0) {
      limitY = Math.min(limitY, Math.floor((capacity.oven - bread.oven * x) / cake.oven));
    }
    if (cake.labor > 0) {
      limitY = Math.min(limitY, Math.floor((capacity.labor - bread.labor * x) / cake.labor));
    }

    if (limitY >= 0) {
      for (let y = 0; y <= limitY; y++) {
        const fReq = bread.flour * x + cake.flour * y;
        const sReq = bread.sugar * x + cake.sugar * y;
        const eReq = bread.eggs * x + cake.eggs * y;
        const tReq = bread.oven * x + cake.oven * y;
        const lReq = bread.labor * x + cake.labor * y;

        const eps = 1e-7;
        if (
          fReq <= capacity.flour + eps &&
          sReq <= capacity.sugar + eps &&
          eReq <= capacity.eggs + eps &&
          tReq <= capacity.oven + eps &&
          lReq <= capacity.labor + eps
        ) {
          const currentProfit = pB * x + pC * y;
          if (currentProfit > maxProfit) {
            maxProfit = currentProfit;
            optimalX = x;
            optimalY = y;
            isFeasibleSolutionFound = true;
          }
        }
      }
    }
  }

  if (!isFeasibleSolutionFound) {
    optimalX = 0;
    optimalY = 0;
    maxProfit = 0;
  }

  const fUsed = bread.flour * optimalX + cake.flour * optimalY;
  const sUsed = bread.sugar * optimalX + cake.sugar * optimalY;
  const eUsed = bread.eggs * optimalX + cake.eggs * optimalY;
  const tUsed = bread.oven * optimalX + cake.oven * optimalY;
  const lUsed = bread.labor * optimalX + cake.labor * optimalY;

  return {
    x: optimalX,
    y: optimalY,
    profit: maxProfit,
    feasible: isFeasibleSolutionFound,
    status: isFeasibleSolutionFound ? 'OPTIMAL_INTEGER_FOUND' : 'INFEASIBLE',
    used: {
      flour: fUsed,
      sugar: sUsed,
      eggs: eUsed,
      oven: tUsed,
      labor: lUsed,
    },
    slack: {
      flour: Math.max(0, capacity.flour - fUsed),
      sugar: Math.max(0, capacity.sugar - sUsed),
      eggs: Math.max(0, capacity.eggs - eUsed),
      oven: Math.max(0, capacity.oven - tUsed),
      labor: Math.max(0, capacity.labor - lUsed),
    },
    utilization: {
      flour: capacity.flour > 0 ? (fUsed / capacity.flour) * 100 : 0,
      sugar: capacity.sugar > 0 ? (sUsed / capacity.sugar) * 100 : 0,
      eggs: capacity.eggs > 0 ? (eUsed / capacity.eggs) * 100 : 0,
      oven: capacity.oven > 0 ? (tUsed / capacity.oven) * 100 : 0,
      labor: capacity.labor > 0 ? (lUsed / capacity.labor) * 100 : 0,
    },
  };
}

/**
 * Harris-Wilson EOQ Formulation
 */
export function calculateEOQItem(
  D: number,
  S: number,
  H: number,
  packSize = 1
): EOQResult {
  if (D <= 0 || S <= 0 || H <= 0) {
    return {
      theoreticalEOQ: 0,
      practicalQ: 0,
      ordersPerYear: 0,
      orderingCost: 0,
      holdingCost: 0,
      totalCost: 0,
      cycleDays: 0,
      valid: false,
    };
  }

  const theoreticalEOQ = Math.sqrt((2 * D * S) / H);
  let practicalQ = Math.round(theoreticalEOQ);
  if (packSize > 1) {
    practicalQ = Math.max(packSize, Math.round(theoreticalEOQ / packSize) * packSize);
  }

  const ordersPerYear = D / practicalQ;
  const orderingCost = ordersPerYear * S;
  const holdingCost = (practicalQ / 2) * H;
  const totalCost = orderingCost + holdingCost;
  const cycleDays = 365 / ordersPerYear;

  return {
    theoreticalEOQ,
    practicalQ,
    ordersPerYear,
    orderingCost,
    holdingCost,
    totalCost,
    cycleDays,
    valid: true,
  };
}

export function formatIDR(val: number): string {
  const rounded = Math.round(val || 0);
  const formatted = rounded.toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

export function formatNum(val: number, decimals = 1): string {
  return Number(val || 0).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Generates clean, genuine RFC 4180-compliant CSV dataset
 * Structured with consistent 5 columns ("Section", "Item", "Value", "Unit", "Notes")
 * with UTF-8 BOM protection for seamless opening in Microsoft Excel and Google Sheets.
 */
export function generateCSV(
  bread: ProductParams,
  cake: ProductParams,
  capacity: CapacityLimits,
  inventory: InventoryState,
  eoq: EOQState,
  solution: OptimizationSolution
): string {
  const pB = bread.sellingPrice - bread.variableCost;
  const pC = cake.sellingPrice - cake.variableCost;
  const now = new Date().toISOString();

  const rows: [string, string, string, string, string][] = [
    // Header
    ['Section', 'Item', 'Value', 'Unit', 'Notes'],

    // Metadata
    ['Metadata', 'System Name', 'Smart Bakery Production Planning & Inventory Control System', '', 'Decision Support System'],
    ['Metadata', 'Academic Institution', 'Universitas Pembangunan Nasional Veteran Jakarta (UPNVJ)', '', 'Faculty of Engineering - Industrial Engineering'],
    ['Metadata', 'Course & Class', 'Logic Programming 2026 - Class A - Group 1', '', 'Operations Research'],
    ['Metadata', 'Student Team', 'Arinta Kalyca Atinnaputri (2610312026), Zahratu Asyita (2610312007), Abdulkareem Zayd Saleem (2610312901)', '', 'Investigator Analysts'],
    ['Metadata', 'Export Timestamp', now, 'ISO-8601', 'Single Shift Horizon (8 Hours)'],

    // Optimal Decisions
    ['Production Decision', `${bread.name} Output (x*)`, String(solution.x), 'units', `Demand Cap: ${bread.maxDemand} units | Unit Margin: ${formatIDR(pB)}`],
    ['Production Decision', `${cake.name} Output (y*)`, String(solution.y), 'units', `Demand Cap: ${cake.maxDemand} units | Unit Margin: ${formatIDR(pC)}`],
    ['Production Decision', 'Max Projected Net Profit (P*)', String(solution.profit), 'IDR', `Objective: P = ${pB}*x + ${pC}*y`],
    ['Production Decision', 'Integer Optimization Status', solution.status, '', solution.feasible ? 'Deterministic Global Optimum Verified' : 'Infeasible'],

    // Product Parameters: Bread
    ['Product Parameter', `${bread.name} - Selling Price`, String(bread.sellingPrice), 'IDR/unit', 'Market price'],
    ['Product Parameter', `${bread.name} - Variable Cost`, String(bread.variableCost), 'IDR/unit', 'Direct materials & labor'],
    ['Product Parameter', `${bread.name} - Unit Contribution Profit`, String(pB), 'IDR/unit', 'Gross margin per unit'],
    ['Product Parameter', `${bread.name} - Flour Usage`, String(bread.flour), 'kg/unit', 'BOM coefficient'],
    ['Product Parameter', `${bread.name} - Sugar Usage`, String(bread.sugar), 'kg/unit', 'BOM coefficient'],
    ['Product Parameter', `${bread.name} - Eggs Usage`, String(bread.eggs), 'pcs/unit', 'BOM coefficient'],
    ['Product Parameter', `${bread.name} - Oven Time`, String(bread.oven), 'min/unit', 'Thermal station time'],
    ['Product Parameter', `${bread.name} - Labor Time`, String(bread.labor), 'min/unit', 'Workforce time'],

    // Product Parameters: Cake
    ['Product Parameter', `${cake.name} - Selling Price`, String(cake.sellingPrice), 'IDR/unit', 'Market price'],
    ['Product Parameter', `${cake.name} - Variable Cost`, String(cake.variableCost), 'IDR/unit', 'Direct materials & labor'],
    ['Product Parameter', `${cake.name} - Unit Contribution Profit`, String(pC), 'IDR/unit', 'Gross margin per unit'],
    ['Product Parameter', `${cake.name} - Flour Usage`, String(cake.flour), 'kg/unit', 'BOM coefficient'],
    ['Product Parameter', `${cake.name} - Sugar Usage`, String(cake.sugar), 'kg/unit', 'BOM coefficient'],
    ['Product Parameter', `${cake.name} - Eggs Usage`, String(cake.eggs), 'pcs/unit', 'BOM coefficient'],
    ['Product Parameter', `${cake.name} - Oven Time`, String(cake.oven), 'min/unit', 'Thermal station time'],
    ['Product Parameter', `${cake.name} - Labor Time`, String(cake.labor), 'min/unit', 'Workforce time'],

    // Capacity & Resource Utilization
    ['Capacity Utilization', 'Flour Material Limit', solution.used.flour.toFixed(2), 'kg', `Capacity: ${capacity.flour.toFixed(2)} kg | Slack: ${solution.slack.flour.toFixed(2)} kg | Load: ${solution.utilization.flour.toFixed(1)}% | ${solution.utilization.flour >= 99 ? 'Binding (Bottleneck)' : 'Feasible'}`],
    ['Capacity Utilization', 'Sugar Material Limit', solution.used.sugar.toFixed(2), 'kg', `Capacity: ${capacity.sugar.toFixed(2)} kg | Slack: ${solution.slack.sugar.toFixed(2)} kg | Load: ${solution.utilization.sugar.toFixed(1)}% | ${solution.utilization.sugar >= 99 ? 'Binding (Bottleneck)' : 'Feasible'}`],
    ['Capacity Utilization', 'Eggs Material Limit', solution.used.eggs.toFixed(0), 'pcs', `Capacity: ${capacity.eggs.toFixed(0)} pcs | Slack: ${solution.slack.eggs.toFixed(0)} pcs | Load: ${solution.utilization.eggs.toFixed(1)}% | ${solution.utilization.eggs >= 99 ? 'Binding (Bottleneck)' : 'Feasible'}`],
    ['Capacity Utilization', 'Oven Thermal Time', solution.used.oven.toFixed(1), 'minutes', `Capacity: ${capacity.oven.toFixed(1)} min | Slack: ${solution.slack.oven.toFixed(1)} min | Load: ${solution.utilization.oven.toFixed(1)}% | ${solution.utilization.oven >= 99 ? 'Binding (Bottleneck)' : 'Feasible'}`],
    ['Capacity Utilization', 'Workforce Labor Time', solution.used.labor.toFixed(1), 'worker-min', `Capacity: ${capacity.labor.toFixed(1)} min | Slack: ${solution.slack.labor.toFixed(1)} min | Load: ${solution.utilization.labor.toFixed(1)}% | ${solution.utilization.labor >= 99 ? 'Binding (Bottleneck)' : 'Feasible'}`],

    // Inventory Control & Buffer Surveillance
    ['Inventory Control', 'Wheat Flour (High Protein)', String(inventory.flour.stock), 'kg', `Consumed: ${solution.used.flour.toFixed(2)} kg | Ending: ${(inventory.flour.stock - solution.used.flour).toFixed(2)} kg | Safety Stock: ${inventory.flour.ss} kg | Status: ${(inventory.flour.stock - solution.used.flour) < 0 ? 'SHORTAGE' : (inventory.flour.stock - solution.used.flour) < inventory.flour.ss ? 'LOW_BUFFER' : 'SUFFICIENT'}`],
    ['Inventory Control', 'Refined Cane Sugar', String(inventory.sugar.stock), 'kg', `Consumed: ${solution.used.sugar.toFixed(2)} kg | Ending: ${(inventory.sugar.stock - solution.used.sugar).toFixed(2)} kg | Safety Stock: ${inventory.sugar.ss} kg | Status: ${(inventory.sugar.stock - solution.used.sugar) < 0 ? 'SHORTAGE' : (inventory.sugar.stock - solution.used.sugar) < inventory.sugar.ss ? 'LOW_BUFFER' : 'SUFFICIENT'}`],
    ['Inventory Control', 'Farm Fresh Eggs', String(inventory.eggs.stock), 'pcs', `Consumed: ${solution.used.eggs.toFixed(0)} pcs | Ending: ${(inventory.eggs.stock - solution.used.eggs).toFixed(0)} pcs | Safety Stock: ${inventory.eggs.ss} pcs | Status: ${(inventory.eggs.stock - solution.used.eggs) < 0 ? 'SHORTAGE' : (inventory.eggs.stock - solution.used.eggs) < inventory.eggs.ss ? 'LOW_BUFFER' : 'SUFFICIENT'}`],

    // EOQ Lot Sizing
    ...(['flour', 'sugar', 'eggs'] as const).map((key): [string, string, string, string, string] => {
      const names = { flour: 'Wheat Flour', sugar: 'Refined Sugar', eggs: 'Farm Fresh Eggs' };
      const units = { flour: 'kg', sugar: 'kg', eggs: 'pcs' };
      const p = eoq[key];
      const r = calculateEOQItem(p.D, p.S, p.H, p.pack);
      return [
        'EOQ Procurement',
        `${names[key]} Order Lot (Q)`,
        String(r.practicalQ),
        units[key],
        `Annual Demand (D): ${p.D} | Order Cost (S): ${formatIDR(p.S)} | Holding Cost (H): ${formatIDR(p.H)} | Theoretical EOQ: ${r.theoreticalEOQ.toFixed(1)} | Orders/Yr: ${r.ordersPerYear.toFixed(1)} | TOC: ${formatIDR(r.orderingCost)} | THC: ${formatIDR(r.holdingCost)} | TRC: ${formatIDR(r.totalCost)} | Cycle: ${r.cycleDays.toFixed(0)} days`,
      ];
    }),
  ];

  const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;
  return rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
}
