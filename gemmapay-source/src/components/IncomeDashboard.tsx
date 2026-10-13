import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  Sparkles,
  Clock,
  Award,
  Users,
  CheckCircle2,
  ArrowUpRight,
  HelpCircle,
  Lightbulb,
  Cpu,
} from 'lucide-react';
import { Invoice, RateStrategy } from '../types';
import { formatCurrency } from '../utils/formatters';

interface IncomeDashboardProps {
  invoices: Invoice[];
  currency: string;
  monthlyGoal: number;
  onUpdateMonthlyGoal: (goal: number) => void;
  onSelectClientForFollowUp: (clientEmail: string) => void;
}

export const IncomeDashboard: React.FC<IncomeDashboardProps> = ({
  invoices,
  currency,
  monthlyGoal,
  onUpdateMonthlyGoal,
  onSelectClientForFollowUp,
}) => {
  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Rate optimizer inputs
  const [availableHours, setAvailableHours] = useState(12);
  const [serviceType, setServiceType] = useState('Web Design & Development');
  const [currentHourly, setCurrentHourly] = useState(65);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [rateStrategy, setRateStrategy] = useState<RateStrategy | null>(null);

  // Financial calculations
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalDue, 0);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalDue, 0);
  const percentOfGoal = Math.min(100, Math.round((totalPaid / (monthlyGoal || 1)) * 100));
  const remainingToGoal = Math.max(0, monthlyGoal - totalPaid);

  // Calculate average effective hourly rate
  const invoicesWithHours = invoices.filter((inv) => (inv.estimatedHoursWorked || 0) > 0);
  const totalHoursWorked = invoicesWithHours.reduce(
    (acc, inv) => acc + (inv.estimatedHoursWorked || 0),
    0
  );
  const totalRevenueForHours = invoicesWithHours.reduce((acc, inv) => acc + inv.totalDue, 0);
  const effectiveHourlyRate =
    totalHoursWorked > 0 ? Math.round(totalRevenueForHours / totalHoursWorked) : currentHourly;

  // Client Lifetime Value (CLV) aggregation
  const clientMap = new Map<
    string,
    { name: string; email: string; totalSpent: number; invoicesCount: number; paidCount: number }
  >();

  invoices.forEach((inv) => {
    const existing = clientMap.get(inv.clientEmail) || {
      name: inv.clientName,
      email: inv.clientEmail,
      totalSpent: 0,
      invoicesCount: 0,
      paidCount: 0,
    };
    existing.totalSpent += inv.totalDue;
    existing.invoicesCount += 1;
    if (inv.status === 'paid') existing.paidCount += 1;
    clientMap.set(inv.clientEmail, existing);
  });

  const clientList = Array.from(clientMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  // Trigger Gemma Rate Optimizer
  const handleOptimizeRates = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/rate-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyGoal,
          hoursAvailablePerWeek: availableHours,
          serviceCategory: serviceType,
          currentRate: currentHourly,
        }),
      });

      const data = await response.json();
      if (data.success && data.strategy) {
        setRateStrategy(data.strategy);
      }
    } catch (err) {
      console.error('Rate optimization failed:', err);
      // Fallback
      setRateStrategy({
        recommendedHourlyRate: Math.round(monthlyGoal / (availableHours * 4 * 0.8)),
        recommendedProjectPackage: {
          title: 'Monthly Continuity Retainer',
          suggestedPrice: Math.round(monthlyGoal / 3),
          deliverables: ['Weekly deliverables', 'Slack priority support', 'Guaranteed turnaround'],
        },
        hoursNeededToHitGoal: Math.round(monthlyGoal / currentHourly),
        breakEvenClientCount: 3,
        pricingTiers: [
          { name: 'Ad-hoc Edits', rate: `$${currentHourly}/hr`, description: 'Single task requests' },
          { name: 'Milestone Delivery', rate: `$${Math.round(currentHourly * 12)}/project`, description: 'Fixed deliverable' },
          { name: 'Monthly Retainer', rate: `$${Math.round(monthlyGoal / 2.5)}/mo`, description: 'Continuous income stream' },
        ],
        actionableAdvice: 'Turn your top client into a recurring retainer to stabilize monthly cash flow.',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      onUpdateMonthlyGoal(val);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Side-Hustle Monetization Engine
              </span>
              <span className="text-xs text-slate-400">Maximize Hourly Yield &amp; Retainer Recurring Cash Flow</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1.5">
              Side-Hustle Income &amp; Growth Studio
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track progress toward your monthly side-hustle target, evaluate client profitability, and use Gemma to optimize pricing packages to boost take-home earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Goal Progress Ring & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Target Goal Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Monthly Income Target</h3>
                <p className="text-xs text-slate-400">Side-hustle revenue target for current month</p>
              </div>
            </div>

            <div>
              {isEditingGoal ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                >
                  Edit Goal: {formatCurrency(monthlyGoal, currency)}
                </button>
              )}
            </div>
          </div>

          {/* Progress Visual */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-white font-mono">
                  {formatCurrency(totalPaid, currency)}
                </span>
                <span className="text-xs text-slate-400 ml-2">collected</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{percentOfGoal}% Attained</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${percentOfGoal}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Goal: {formatCurrency(monthlyGoal, currency)}</span>
              <span>
                {remainingToGoal > 0
                  ? `${formatCurrency(remainingToGoal, currency)} remaining to hit target`
                  : '🎉 Monthly Goal Surpassed!'}
              </span>
            </div>
          </div>

          {/* Sub metrics */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-slate-400 block">Total Pipeline Invoiced</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {formatCurrency(totalInvoiced, currency)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-slate-400 block">Effective Hourly Yield</span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                ${effectiveHourlyRate}/hr
              </span>
            </div>
          </div>
        </div>

        {/* Retainer & Continuity Calculator (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Retainer Freedom Metric</h3>
              <p className="text-xs text-slate-400">Transform sporadic projects to recurring cash flow</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The secret to side-hustle sanity is replacing constant invoice chasing with recurring client retainers.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Target: $2,500/mo at $500/mo retainer:</span>
              <span className="font-bold text-emerald-400 font-mono">5 clients</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Target: $2,500/mo at $850/mo retainer:</span>
              <span className="font-bold text-emerald-400 font-mono">3 clients</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Target: $5,000/mo at $1,250/mo retainer:</span>
              <span className="font-bold text-emerald-400 font-mono">4 clients</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start space-x-2 text-[11px] text-slate-400">
            <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Tip: Use the Follow-Up Studio's <strong>"Side-Hustle Retainer Pitch"</strong> stage on settled invoices to propose ongoing retainers.
            </span>
          </div>
        </div>
      </div>

      {/* AI Rate & Package Recommender Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Gemma AI Pricing Consultant
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Open-Weight Financial Optimization
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Optimize Hourly Rates &amp; High-Margin Packages
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculate the optimal pricing architecture for your side-hustle hours without working 60-hour weeks.
            </p>
          </div>

          <button
            onClick={handleOptimizeRates}
            disabled={isOptimizing}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Optimizing with Gemma...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate Optimal Packages</span>
              </>
            )}
          </button>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Side-Hustle Hours Available / Week
            </label>
            <input
              type="number"
              min="2"
              max="40"
              value={availableHours}
              onChange={(e) => setAvailableHours(parseInt(e.target.value, 10) || 10)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Evening &amp; weekend capacity</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Current Hourly Rate ($/hr)
            </label>
            <input
              type="number"
              min="10"
              value={currentHourly}
              onChange={(e) => setCurrentHourly(parseFloat(e.target.value) || 50)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Baseline pricing</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Primary Service Offering
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Web Development"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Your freelance craft</span>
          </div>
        </div>

        {/* AI Strategy Results */}
        {rateStrategy && (
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recommended Target Hourly
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  ${rateStrategy.recommendedHourlyRate}/hr
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  At this rate, you need {rateStrategy.hoursNeededToHitGoal} hours/month to hit ${monthlyGoal}/mo.
                </p>
              </div>

              {rateStrategy.recommendedProjectPackage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-sm">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Flagship Package Suggestion
                  </span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {rateStrategy.recommendedProjectPackage.title} ($
                    {rateStrategy.recommendedProjectPackage.suggestedPrice}/mo)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {rateStrategy.recommendedProjectPackage.deliverables?.join(' • ')}
                  </p>
                </div>
              )}
            </div>

            {/* Pricing Tiers */}
            {rateStrategy.pricingTiers && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {rateStrategy.pricingTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                  >
                    <span className="text-xs font-bold text-white block">{tier.name}</span>
                    <span className="text-sm font-black text-emerald-400 font-mono block">
                      {tier.rate}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-snug">{tier.description}</p>
                  </div>
                ))}
              </div>
            )}

            {rateStrategy.actionableAdvice && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-2 text-xs text-slate-300">
                <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rateStrategy.actionableAdvice}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client Lifetime Value & Reliability Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Client Portfolio &amp; Reliability</h3>
            <p className="text-xs text-slate-400">
              Ranked by lifetime revenue generated for your freelance practice
            </p>
          </div>
        </div>

        {clientList.length === 0 ? (
          <p className="text-xs text-slate-400">No client records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3 text-center">Invoices</th>
                  <th className="py-2.5 px-3 text-center">Payment Reliability</th>
                  <th className="py-2.5 px-3 text-right">Lifetime Value</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {clientList.map((client) => {
                  const isReliable = client.paidCount === client.invoicesCount;
                  return (
                    <tr key={client.email} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <span className="text-sm font-semibold text-white block">{client.name}</span>
                        <span className="text-xs text-slate-400">{client.email}</span>
                      </td>

                      <td className="py-3 px-3 text-center text-xs text-slate-300 font-mono">
                        {client.paidCount} / {client.invoicesCount} settled
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isReliable ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Prompt Payer</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span>Open Balance</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-white text-sm">
                        {formatCurrency(client.totalSpent, currency)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectClientForFollowUp(client.email)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
                        >
                          Follow Up
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
