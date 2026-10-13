import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Clock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  Invoice,
  FollowUpStage,
  FollowUpTone,
  GeneratedFollowUp,
} from '../types';
import { formatCurrency, formatDate, calculateDaysOverdue, calculateDaysRemaining } from '../utils/formatters';

interface FollowUpStudioProps {
  invoices: Invoice[];
  initialInvoice?: Invoice | null;
  onUpdateInvoice: (invoice: Invoice) => void;
}

const STAGES: { id: FollowUpStage; label: string; badge: string; desc: string }[] = [
  {
    id: 'gentle_heads_up',
    label: 'Gentle Heads-Up',
    badge: '3 Days Before Due',
    desc: 'Friendly notice before invoice due date to ensure smooth processing.',
  },
  {
    id: 'due_today',
    label: 'Due Today Notice',
    badge: 'Due Date',
    desc: 'Polite reminder that payment is due today with quick payment links.',
  },
  {
    id: 'polite_reminder',
    label: 'Polite Overdue Nudge',
    badge: '3-7 Days Overdue',
    desc: 'Courteous check-in to confirm receipt and inquire about processing status.',
  },
  {
    id: 'urgent_escalation',
    label: 'Urgent Escalation',
    badge: '14+ Days Overdue',
    desc: 'Firm, professional notice citing contract terms, late fees, and pausing work.',
  },
  {
    id: 'milestone_checkin',
    label: 'Milestone Delivery',
    badge: 'Deliverable Handover',
    desc: 'Work delivered; requesting client review, approval, and balance release.',
  },
  {
    id: 'post_project_review',
    label: 'Gratitude & Testimonial',
    badge: 'Paid & Completed',
    desc: 'Thanking client after payment, requesting Google/LinkedIn review or quote.',
  },
  {
    id: 'upsell_retainer',
    label: 'Side-Hustle Retainer Pitch',
    badge: 'Income Multiplier',
    desc: 'Propose monthly maintenance or Phase 2 package to lock in recurring income.',
  },
];

const TONES: { id: FollowUpTone; label: string }[] = [
  { id: 'professional_warm', label: 'Warm & Professional' },
  { id: 'crisp_direct', label: 'Crisp & Direct' },
  { id: 'casual_friendly', label: 'Casual & Friendly' },
  { id: 'firm_formal', label: 'Firm & Formal' },
];

export const FollowUpStudio: React.FC<FollowUpStudioProps> = ({
  invoices,
  initialInvoice,
  onUpdateInvoice,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    initialInvoice ? initialInvoice.id : invoices[0]?.id || ''
  );
  const [stage, setStage] = useState<FollowUpStage>('polite_reminder');
  const [tone, setTone] = useState<FollowUpTone>('professional_warm');
  const [customContext, setCustomContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedFollowUp | null>(null);
  const [engineProvider, setEngineProvider] = useState<string | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);
  const [loggedSent, setLoggedSent] = useState(false);

  // Sync when initialInvoice prop changes
  useEffect(() => {
    if (initialInvoice) {
      setSelectedInvoiceId(initialInvoice.id);
      // Auto-pick intelligent stage based on status and due date
      const daysOverdue = calculateDaysOverdue(initialInvoice.dueDate);
      if (initialInvoice.status === 'paid') {
        setStage('post_project_review');
      } else if (daysOverdue > 10) {
        setStage('urgent_escalation');
      } else if (daysOverdue > 0) {
        setStage('polite_reminder');
      } else {
        const daysLeft = calculateDaysRemaining(initialInvoice.dueDate);
        if (daysLeft === 0) setStage('due_today');
        else setStage('gentle_heads_up');
      }
    }
  }, [initialInvoice]);

  const activeInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];
  const daysOverdue = activeInvoice ? calculateDaysOverdue(activeInvoice.dueDate) : 0;
  const daysLeft = activeInvoice ? calculateDaysRemaining(activeInvoice.dueDate) : 0;

  const handleGenerateFollowUp = async () => {
    if (!activeInvoice) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setLoggedSent(false);

    try {
      const response = await fetch('/api/ai/follow-up-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: activeInvoice.clientName,
          invoiceNumber: activeInvoice.invoiceNumber,
          totalDue: activeInvoice.totalDue,
          currency: activeInvoice.currency,
          dueDate: activeInvoice.dueDate,
          daysOverdue,
          stage,
          tone,
          customContext,
          serviceDescription: activeInvoice.sideHustleCategory || 'freelance services',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate follow-up message');
      }

      setGeneratedResult(data.followUp);
      setEngineProvider(data.provider || 'Google Gemma 2');
    } catch (err: any) {
      console.error('Follow-up generation error:', err);
      setErrorMsg(err?.message || 'Using local Gemma template engine.');
      // Local fallback generator
      fallbackGenerateFollowUp();
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackGenerateFollowUp = () => {
    if (!activeInvoice) return;
    const isLate = daysOverdue > 0;
    const fallback: GeneratedFollowUp = {
      subject: isLate
        ? `Reminder: Invoice ${activeInvoice.invoiceNumber} for ${activeInvoice.clientName}`
        : `Update regarding Invoice ${activeInvoice.invoiceNumber} (${activeInvoice.currency} ${activeInvoice.totalDue})`,
      emailBody: `Hi ${activeInvoice.clientName.split(' ')[0]},\n\nI hope you're having a great week!\n\nI'm following up regarding Invoice ${activeInvoice.invoiceNumber} for ${formatCurrency(activeInvoice.totalDue, activeInvoice.currency)}, which was due on ${formatDate(activeInvoice.dueDate)}.\n\nCould you please let me know when we might expect payment, or if you need me to resend the payment link?\n\nPayment link: ${activeInvoice.paymentInstructions || 'See invoice'}\n\nThanks so much,\n${activeInvoice.businessName}`,
      smsWhatsappBody: `Hi ${activeInvoice.clientName.split(' ')[0]}, just checking in on invoice ${activeInvoice.invoiceNumber} (${formatCurrency(activeInvoice.totalDue, activeInvoice.currency)}). Let me know if you need anything!`,
      recommendedAction: 'Send today and set reminder for 3 business days.',
      sideHustleUpsellTip:
        'Offer a 5% prepayment discount if they enroll in a 3-month recurring retainer.',
    };
    setGeneratedResult(fallback);
    setEngineProvider('Gemma Deterministic Engine');
  };

  const handleCopyEmail = () => {
    if (!generatedResult) return;
    const fullText = `Subject: ${generatedResult.subject}\n\n${generatedResult.emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopySms = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.smsWhatsappBody);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
  };

  const handleOpenMailto = () => {
    if (!generatedResult || !activeInvoice) return;
    const subject = encodeURIComponent(generatedResult.subject);
    const body = encodeURIComponent(generatedResult.emailBody);
    window.location.href = `mailto:${activeInvoice.clientEmail}?subject=${subject}&body=${body}`;
  };

  const handleLogFollowUpSent = () => {
    if (!activeInvoice) return;
    const updated: Invoice = {
      ...activeInvoice,
      followUpCount: (activeInvoice.followUpCount || 0) + 1,
      lastFollowUpAt: new Date().toISOString(),
    };
    onUpdateInvoice(updated);
    setLoggedSent(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Personalized Service Follow-Up Hub
              </span>
              <span className="text-xs text-slate-400">Powered by Google Gemma Open-Weights</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1.5">
              Automated Client Follow-Up &amp; Retainer Engine
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Eliminate awkward payment chasing and grow your side-hustle. Gemma crafts respectful, high-converting follow-ups tailored to your client relationship and recommends upsells.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemma 2 Architecture</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Select Invoice */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Select Target Invoice
            </label>

            {invoices.length === 0 ? (
              <p className="text-xs text-slate-400">No invoices found. Create one first!</p>
            ) : (
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.clientName} ({formatCurrency(inv.totalDue, inv.currency)})
                    {inv.status === 'overdue' ? ' [OVERDUE]' : inv.status === 'paid' ? ' [PAID]' : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Invoice summary card */}
            {activeInvoice && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{activeInvoice.clientName}</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {formatCurrency(activeInvoice.totalDue, activeInvoice.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{activeInvoice.clientEmail}</span>
                  </span>
                  <span>Due: {formatDate(activeInvoice.dueDate)}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">
                    Status:
                    <span
                      className={`ml-1 font-semibold uppercase ${
                        activeInvoice.status === 'overdue' || daysOverdue > 0
                          ? 'text-rose-400'
                          : activeInvoice.status === 'paid'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {activeInvoice.status === 'paid'
                        ? 'Paid'
                        : daysOverdue > 0
                        ? `${daysOverdue}d Overdue`
                        : `${daysLeft}d Remaining`}
                    </span>
                  </span>

                  <span className="text-slate-400">
                    Follow-ups sent:{' '}
                    <span className="font-bold text-white">{activeInvoice.followUpCount || 0}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Choose Strategy Stage */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Select Follow-Up Intent &amp; Stage
            </label>

            <div className="space-y-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage(s.id)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                    stage === s.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        stage === s.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tone & Extra Context */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                3. Communication Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      tone === t.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Optional Relationship Notes
              </label>
              <textarea
                rows={2}
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g. Chatting on Slack; client loved the demo; offer 10% off next month's retainer if paid by Friday."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerateFollowUp}
              disabled={isGenerating || !activeInvoice}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Drafting Personalized Message...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Follow-Up with Gemma</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generated Follow-Up Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {generatedResult ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Email Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Personalized Email Draft
                    </span>
                    {engineProvider && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Model: {engineProvider}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                    </button>

                    <button
                      onClick={handleOpenMailto}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer"
                      title="Open in your default email client with recipient and subject pre-filled"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Send in Mail</span>
                    </button>
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subject Line
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm font-medium text-white select-all">
                    {generatedResult.subject}
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Message
                  </span>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all font-sans">
                    {generatedResult.emailBody}
                  </div>
                </div>

                {/* Action log button */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-xs text-slate-400">
                    Recommended action: <span className="text-slate-200 font-medium">{generatedResult.recommendedAction}</span>
                  </span>

                  <button
                    onClick={handleLogFollowUpSent}
                    disabled={loggedSent}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {loggedSent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Logged as Sent!</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Log Follow-up Sent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SMS / WhatsApp Quick Snippet Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      SMS / WhatsApp / Slack Quick Text
                    </span>
                  </div>

                  <button
                    onClick={handleCopySms}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                  >
                    {copiedSms ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSms ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed select-all">
                  "{generatedResult.smsWhatsappBody}"
                </div>
              </div>

              {/* Gemma Side-Hustle Upsell & Revenue Tip Card */}
              {generatedResult.sideHustleUpsellTip && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Gemma Side-Hustle Growth Tip
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {generatedResult.sideHustleUpsellTip}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white">No Message Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Select an invoice and communication stage on the left, then click{' '}
                <span className="text-emerald-400 font-medium">Generate Follow-Up with Gemma</span> to produce high-impact emails, text snippets, and retainer pitches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
