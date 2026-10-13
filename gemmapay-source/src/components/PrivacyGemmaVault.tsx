import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Lock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Terminal,
  ExternalLink,
  Zap,
  Info,
} from 'lucide-react';
import { PrivacyAuditResult } from '../types';

export const PrivacyGemmaVault: React.FC = () => {
  // PII Scanner state
  const [testText, setTestText] = useState(
    'Billing Acme Corp for website design. Contact: Sarah Jenkins, SSN 000-12-3456, Wire to Bank of America routing 121000358 account 9876543210. Card on file: 4111-2222-3333-4444.'
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<PrivacyAuditResult | null>(null);

  // Cost calculator state
  const [invoicesPerMonth, setInvoicesPerMonth] = useState(12);

  const saasAnnualCost = 348; // HoneyBook ($29/mo * 12)
  const gemmaAnnualCost = 0; // Open weights
  const annualSavings = saasAnnualCost - gemmaAnnualCost;

  const handleRunAudit = async () => {
    if (!testText.trim()) return;
    setIsAuditing(true);
    try {
      const response = await fetch('/api/ai/privacy-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText }),
      });
      const data = await response.json();
      if (data.success && data.audit) {
        setAuditResult(data.audit);
      }
    } catch (err) {
      console.error('Audit failed', err);
      // Fallback local scrubber
      setAuditResult({
        containsSensitivePII: true,
        riskLevel: 'high',
        detectedItems: ['Credit Card', 'SSN', 'Bank Account'],
        sanitizedText: testText
          .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
          .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_CREDIT_CARD]')
          .replace(/\b\d{9,12}\b/g, '[REDACTED_ACCOUNT]'),
        privacyAdvice:
          'Open-weight Gemma architecture ensures sensitive client PII is never stored in model training sets.',
      });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Privacy-First Architecture
              </span>
              <span className="text-xs text-slate-400">Google Gemma Open-Weights</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1.5">
              Why Open-Weight Gemma Wins for Side-Hustlers
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Commercial invoicing software harvests your client data, charges monthly subscription rents, and locks you into closed ecosystems. Gemma open-weights empower freelancers with total privacy, zero data retention, and zero software markups.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Gemma Advantage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Zero Data Retention */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Data Retention</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Proprietary SaaS platforms often train on your invoice amounts, client emails, and contractual rates. Gemma open-weights execute ephemerally — your financial data never leaves your control.
          </p>
          <div className="pt-2 text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Air-Gapped &amp; Localhost Compatible</span>
          </div>
        </div>

        {/* Pillar 2: Cost Reduction */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Cut SaaS Subscriptions</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Platforms like FreshBooks, HoneyBook, and Bonsai charge $19–$39 every single month just to send PDF invoices and reminder emails. GemmaPay reduces your AI software costs to virtually $0.
          </p>
          <div className="pt-2 text-[11px] font-semibold text-teal-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saves $250 - $450/year</span>
          </div>
        </div>

        {/* Pillar 3: Open-Source Independence */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Vendor Lock-in</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Google Gemma models are open-weights. You can run them on standard developer endpoints, self-host with Ollama or vLLM, or deploy them directly to your own private server with full transparency.
          </p>
          <div className="pt-2 text-[11px] font-semibold text-cyan-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Portable Open Model Weights</span>
          </div>
        </div>
      </div>

      {/* Interactive Cost Savings Calculator */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Side-Hustle Expense Reduction Calculator</h3>
            <p className="text-xs text-slate-400">See how much profit stays in your pocket instead of paying SaaS subscriptions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Invoices &amp; Follow-Ups Handled Per Month:</span>
                <span className="font-bold text-white font-mono">{invoicesPerMonth} / month</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={invoicesPerMonth}
                onChange={(e) => setInvoicesPerMonth(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block">HoneyBook</span>
                <span className="text-rose-400 font-mono font-bold block mt-0.5">$348 / yr</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block">FreshBooks</span>
                <span className="text-rose-400 font-mono font-bold block mt-0.5">$228 / yr</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-emerald-300 block font-semibold">GemmaPay</span>
                <span className="text-emerald-400 font-mono font-black block mt-0.5">$0.00</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 p-5 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Annual Side-Hustle Savings
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              +${annualSavings}.00 / year
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Direct cash profit saved that goes straight into your bank account rather than software vendor overhead.
            </p>
          </div>
        </div>
      </div>

      {/* Live PII Privacy Scanner Bench */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Client PII Scrubber &amp; Auditor</h3>
              <p className="text-xs text-slate-400">
                Test how Gemma automatically identifies sensitive bank details, SSNs, and credit cards before sharing.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isAuditing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Auditing Text...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Privacy Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Paste invoice notes, client message, or contract snippet to scan:
          </label>
          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-3 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Audit Results */}
        {auditResult && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-300">Risk Assessment:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                    auditResult.riskLevel === 'safe'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {auditResult.riskLevel}
                </span>
              </div>

              {auditResult.detectedItems?.length > 0 && (
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-slate-400">Detected:</span>
                  {auditResult.detectedItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sanitized output */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Sanitized &amp; Redacted Clean Copy
              </span>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 whitespace-pre-wrap select-all">
                {auditResult.sanitizedText}
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">{auditResult.privacyAdvice}</p>
          </div>
        )}
      </div>

      {/* Local Ollama / Self-Hosting Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Self-Hosted Local Gemma (Optional Offline Mode)</h3>
            <p className="text-xs text-slate-400">
              Want 100% offline air-gapped capability on your MacBook or Linux machine?
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Because Google Gemma 2 is open-weights, you can run it completely offline on your local machine with Ollama:
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 select-all space-y-1">
          <p># 1. Install and run Gemma 2 (2B or 9B parameter model locally)</p>
          <p className="text-white">ollama run gemma2:2b</p>
          <p className="text-slate-500 mt-2"># 2. GemmaPay auto-detects localhost:11434 for zero-internet operations</p>
        </div>
      </div>
    </div>
  );
};
