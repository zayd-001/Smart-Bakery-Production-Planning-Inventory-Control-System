export interface ProductParams {
  name: string;
  sellingPrice: number;
  variableCost: number;
  maxDemand: number;
  flour: number;   // kg per unit
  sugar: number;   // kg per unit
  eggs: number;    // pcs per unit
  oven: number;    // minutes per unit
  labor: number;   // minutes per unit
}

export interface CapacityLimits {
  flour: number;   // kg
  sugar: number;   // kg
  eggs: number;    // pcs
  oven: number;    // minutes
  labor: number;   // worker-minutes
}

export interface InventoryItem {
  stock: number;
  ss: number;       // Safety stock
  unitCost: number; // IDR per unit
}

export interface InventoryState {
  flour: InventoryItem;
  sugar: InventoryItem;
  eggs: InventoryItem;
}

export interface EOQItem {
  D: number;        // Annual Demand
  S: number;        // Order cost (IDR/order)
  H: number;        // Holding cost per unit per year (IDR)
  pack: number;     // Supplier packaging increment (e.g. 25kg sack)
}

export interface EOQState {
  flour: EOQItem;
  sugar: EOQItem;
  eggs: EOQItem;
}

export interface OptimizationSolution {
  x: number;       // Optimal Bread
  y: number;       // Optimal Cake
  profit: number;  // Total Net Contribution
  feasible: boolean;
  status: string;
  used: {
    flour: number;
    sugar: number;
    eggs: number;
    oven: number;
    labor: number;
  };
  slack: {
    flour: number;
    sugar: number;
    eggs: number;
    oven: number;
    labor: number;
  };
  utilization: {
    flour: number;
    sugar: number;
    eggs: number;
    oven: number;
    labor: number;
  };
}

export interface EOQResult {
  theoreticalEOQ: number;
  practicalQ: number;
  ordersPerYear: number;
  orderingCost: number;
  holdingCost: number;
  totalCost: number;
  cycleDays: number;
  valid: boolean;
}

export type TabId = 
  | 'tab-dashboard'
  | 'tab-optimization'
  | 'tab-plan'
  | 'tab-inventory'
  | 'tab-eoq'
  | 'tab-reports'
  | 'tab-about';
