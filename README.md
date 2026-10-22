# Smart Bakery Production Planning & Inventory Control System

**Academic Institution:** Universitas Pembangunan Nasional Veteran Jakarta (UPNVJ)  
**Faculty / Department:** Faculty of Engineering / Department of Industrial Engineering  
**Course:** Logic Programming  
**Academic Year:** 2026  
**Class / Group:** Class A / Group 1  
**Project Category:** Operations Research & Systems Engineering Decision Support System  

---

## 1. Student Engineering Developers

| No | Full Student Name | Student ID (NIM) | Academic Project Responsibility |
|:---|:---|:---|:---|
| 1 | **Arinta Kalyca Atinnaputri** | 2610312026 | Mathematical Modeling & Linear Integer Programming Lead |
| 2 | **Zahratu Asyita** | 2610312007 | PPIC Inventory Control & Harris-Wilson EOQ Formulation |
| 3 | **Abdulkareem Zayd Saleem** | 2610312901 | Systems Architecture, Visualization & Client Logic |

---

## 2. Industrial Engineering Problem Formulation

Small and Medium-sized Enterprise (SME) bakeries routinely struggle to balance limited ingredient stocks, oven batch availability, workforce shifts, and volatile customer demand. Inefficient manual scheduling creates significant Lean Manufacturing wastes (*Muda*):

1. **Overproduction (*Muda of Overproduction*):** Baking beyond daily customer demand ties up working capital in highly perishable goods that stale within 24–48 hours.
2. **Excess Inventory (*Muda of Inventory*):** Purchasing arbitrary ingredient quantities generates inventory holding expenses, storage clutter, and spoilage risks.
3. **Waiting & Idling Time (*Muda of Waiting*):** Uncoordinated batch cycles cause expensive commercial ovens to idle while workers wait for dough proofing.

### Mathematical Decision Support Architecture

This decision support system integrates two Operations Research methodologies:

#### A. Integer Linear Programming (ILP) Optimization
- **Decision Variables:**
  - $x \in \mathbb{Z}_{\ge 0}$: Number of Artisan Sourdough Bread units scheduled.
  - $y \in \mathbb{Z}_{\ge 0}$: Number of Signature Chiffon Cake units scheduled.
- **Objective Function:** Maximize total daily contribution profit ($P$):
  $$\max P = P_b \cdot x + P_c \cdot y = (\text{Price}_b - \text{Cost}_b) \cdot x + (\text{Price}_c - \text{Cost}_c) \cdot y$$
- **Subject to Scarce Resource Constraints:**
  - **Flour:** $0.35x + 0.25y \le \text{Available Flour (kg)}$
  - **Sugar:** $0.05x + 0.20y \le \text{Available Sugar (kg)}$
  - **Eggs:** $1x + 4y \le \text{Available Eggs (pcs)}$
  - **Oven Thermal Load:** $4.0x + 7.5y \le \text{Available Oven Time (minutes)}$
  - **Labor Workforce:** $6.0x + 12.0y \le \text{Available Labor Time (worker-minutes)}$
  - **Demand Caps:** $0 \le x \le \text{Demand}_b$, $0 \le y \le \text{Demand}_c$

#### B. Deterministic Economic Order Quantity (EOQ)
Raw materials are procured independently of daily batching using the classic Harris-Wilson EOQ model:
$$EOQ = \sqrt{\frac{2 \cdot D \cdot S}{H}}$$
$$\text{Total Relevant Annual Cost } (TRC) = \left(\frac{D}{Q} \cdot S\right) + \left(\frac{Q}{2} \cdot H\right)$$

Where:
- $D$ = Annual Demand (units/year)
- $S$ = Setup / Procurement Cost per Order (IDR/order)
- $H$ = Unit Holding Cost per Year (IDR/unit/year)
- $Q$ = Procurement Lot Size (rounded to supplier commercial packaging)

---

## 3. Technology Stack & Key Architectural Principles

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons.
- **Visualization:** Pure mathematical SVG charts (Gauges, Output Bar Charts, Inventory Flow Bars, Cost Equilibrium Curves) with zero external CDN dependencies.
- **Client-Side Processing:** Runs 100% locally in the browser with zero backend requirements, zero tracking, and zero external AI dependencies.
- **Print & PDF Support:** Includes an engineered `@media print` layout that formats directly into an academic executive report when using the browser print function (`Ctrl+P` / `Cmd+P`).

---

## 4. Verification & Acceptance Testing Matrix

| Test Case | Description | Expected Output | Status |
|:---|:---|:---|:---:|
| **TC-01** | Load Sample Scenario benchmark | Fills all input fields with consistent demonstration values and runs optimizer | **PASS** |
| **TC-02** | Integer feasibility enforcement | Outputs whole numbers for $x^*$ and $y^*$ without continuous fractions | **PASS** |
| **TC-03** | Boundary constraint satisfaction | $A \cdot X \le B$ confirmed for Flour, Sugar, Eggs, Oven, and Labor | **PASS** |
| **TC-04** | Capacity bottleneck detection | Accurately highlights binding constraints ($S_i \approx 0$) | **PASS** |
| **TC-05** | Inventory shortage warning | Shortage flags and warning banners render if consumption exceeds stock | **PASS** |
| **TC-06** | EOQ minimum cost equilibrium | $TOC \approx THC$ verified at calculated theoretical EOQ point | **PASS** |
| **TC-07** | Official UPNVJ Logo loading | Loads via official URL with proper aspect ratio and graceful fallback | **PASS** |
| **TC-08** | CSV Data Export | Exports standard CSV file including BOM, Capacity, and EOQ datasets | **PASS** |
| **TC-09** | Executive Print Report | Prints structured A4 academic document suppressing sidebar and UI buttons | **PASS** |
