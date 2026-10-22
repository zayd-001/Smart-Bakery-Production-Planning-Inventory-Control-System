import React, { useState } from 'react';

export const AboutView: React.FC = () => {
  const [logoError, setLogoError] = useState(false);

  const team = [
    {
      name: 'Arinta Kalyca Atinnaputri',
      nim: '2610312026',
      role: 'Mathematical Modeling & Linear Integer Programming Lead',
      description: 'Formulated the 2-variable constrained integer objective function, technical conversion BOM matrices, and boundary simplex resolution.',
      avatarInitials: 'AK',
    },
    {
      name: 'Zahratu Asyita',
      nim: '2610312007',
      role: 'PPIC Inventory Control & EOQ Formulation Specialist',
      description: 'Engineered raw material stock equations ($I_0 - C$), safety stock risk alerts, and the Harris-Wilson economic lot-sizing cost algorithms.',
      avatarInitials: 'ZA',
    },
    {
      name: 'Abdulkareem Zayd Saleem',
      nim: '2610312901',
      role: 'Systems Architecture, Visualizations & Client Logic Lead',
      description: 'Architected the single-page application framework, deterministic branch-and-bound solver routines, pure SVG chart renderers, and reporting engines.',
      avatarInitials: 'AS',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Academic Identity &amp; Systems Engineering Documentation
        </h2>
        <p className="text-xs text-slate-500">
          Logic Programming Coursework, Universitas Pembangunan Nasional Veteran Jakarta (UPNVJ), Academic Year 2026.
        </p>
      </div>

      {/* Institutional & Team Identity Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institutional Box */}
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-20 h-20 bg-white rounded-lg p-2 shadow-xs border border-slate-300 flex items-center justify-center mb-4">
              {!logoError ? (
                <img
                  src="https://i.ibb.co.com/wNLd1f82/UPNVJ-LOGO.png"
                  alt="UPNVJ Official Logo"
                  className="max-w-full max-h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-extrabold text-sm text-slate-900">UPNVJ</span>
              )}
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Universitas Pembangunan Nasional Veteran Jakarta
            </h3>
            <p className="text-xs font-semibold text-amber-700 mt-1">
              Faculty of Engineering &bull; Department of Industrial Engineering
            </p>

            <div className="w-full border-t border-slate-200 mt-4 pt-4 text-left text-xs space-y-1.5 text-slate-600">
              <div><strong>Course:</strong> Logic Programming</div>
              <div><strong>Academic Year:</strong> 2026</div>
              <div><strong>Class:</strong> Class A</div>
              <div><strong>Project Group:</strong> Group 1</div>
              <div><strong>Subject Field:</strong> Operations Research &amp; Decision Support</div>
            </div>
          </div>

          {/* Student Team Profiles */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Student Project Investigators (Group 1)
            </h4>
            <div className="space-y-3">
              {team.map((member) => (
                <div
                  key={member.nim}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {member.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h5 className="text-sm font-bold text-slate-900">{member.name}</h5>
                      <span className="text-xs font-mono-numbers font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        NIM {member.nim}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{member.role}</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Engineering & Operations Research Context */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs text-slate-700 leading-relaxed">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">1. The SME Bakery Production Planning Challenge</h3>
          <p>
            Small and medium-sized enterprise (SME) bakeries operate in high-perishability manufacturing settings. Baked goods spoil or stale rapidly within 24–48 hours, while crucial ingredients (eggs, milk, yeast) exhibit limited shelf lives. Furthermore, baking ovens represent high capital expenditure bottleneck facilities with fixed batch baking cycles. Without structured quantitative programming, bakeries resort to intuitive scheduling, causing finished goods overproduction, frequent raw material stockouts, and costly oven idling.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">2. Elimination of Lean Manufacturing Wastes (Muda)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border-t-2 border-amber-600 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs">Overproduction Waste</h4>
              <p className="text-[11px] text-slate-600">
                Prevented by strictly capping production variables at daily customer demand limits ($x \le D_b, y \le D_c$). No finished inventory is baked without pre-existing demand.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border-t-2 border-amber-600 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs">Excess Inventory Waste</h4>
              <p className="text-[11px] text-slate-600">
                Mitigated by applying the Harris-Wilson EOQ model to determine optimal procurement lot sizes ($Q$) and tracking safety stock buffers ($SS$) to eliminate surplus holding expenses.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border-t-2 border-amber-600 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs">Waiting &amp; Idling Waste</h4>
              <p className="text-[11px] text-slate-600">
                Mitigated via workstation utilization analysis that balances oven thermal cycles with labor prep minutes, preventing workforce bottleneck starvation.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">3. Mathematical Optimization Methodology</h3>
          <p>
            Standard continuous linear programming (LP) solvers rely on continuous relaxations that frequently yield fractional outputs (e.g. 84.73 loaves or 31.42 cakes). Because food manufacturing requires integer production batches, this application executes an exhaustive integer branch scan over the discrete non-negative integer lattice:
          </p>
          <div className="my-3 p-3.5 bg-slate-50 rounded-lg border-l-3 border-slate-800 font-mono-numbers text-[11.5px] space-y-1">
            <div>Maximize: P(x, y) = P_b &times; x + P_c &times; y</div>
            <div>Subject to: A &times; [x, y]^T &le; B,  0 &le; x &le; D_b,  0 &le; y &le; D_c,  x, y &isin; &integers;<sub>&ge;0</sub></div>
          </div>
          <p>
            This ensures mathematical optimality without rounding distortion, guaranteeing that the recommended batch schedule is 100% operationally feasible on the factory floor.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">4. Harris-Wilson Economic Order Quantity (EOQ)</h3>
          <p>
            Procurement of non-perishable ingredients is decoupled from daily production schedules via the deterministic Wilson lot-sizing equation:
          </p>
          <div className="my-3 p-3.5 bg-slate-50 rounded-lg border-l-3 border-slate-800 font-mono-numbers text-[11.5px] space-y-1">
            <div>EOQ = &radic;((2 &times; D &times; S) / H)</div>
            <div>Total Relevant Cost (TRC) = (D / Q) &times; S + (Q / 2) &times; H</div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Note: This decision support tool provides deterministic quantitative models under static parameter assumptions. Plant managers should apply judgment when encountering major supplier disruptions or price volatility.
          </p>
        </div>
      </div>
    </div>
  );
};
