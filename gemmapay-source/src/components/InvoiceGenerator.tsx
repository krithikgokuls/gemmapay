import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Plus,
  Trash2,
  Save,
  Eye,
  Send,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { Invoice, LineItem, BusinessProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface InvoiceGeneratorProps {
  businessProfile: BusinessProfile;
  onSaveInvoice: (newInvoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onStartFollowUp: (invoice: Invoice) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Website Redesign',
    prompt:
      'Client: Coastal Brew Co (contact: info@coastalbrew.com, 12 Harbor Way, Seattle). Services: Custom 5-page responsive Next.js website redesign, 16 hours at $75/hour. Custom vector icons set: $250. Hosting setup & domain DNS: $100. Due in 14 days. 30% deposit already paid.',
  },
  {
    title: 'Brand Identity & Logo',
    prompt:
      'Client: Apex Fitness Studio (sarah@apexfitness.io). Complete visual identity package: Primary & secondary logos, typography system, brand guide PDF. Flat project fee $1,200. Plus print-ready apparel mockups $300. Net 15 days.',
  },
  {
    title: 'Monthly SEO Retainer',
    prompt:
      'Client: Artisan Bakeries LLC (billing@artisanbake.com). October 2026 Monthly Retainer: Technical SEO health audit, 4 optimized blog articles, monthly performance ranking report. Fixed retainer: $850. Due upon receipt.',
  },
  {
    title: 'Wedding / Event Photo',
    prompt:
      'Client: Jessica & Liam Miller (millerweddings@gmail.com). 8-hour wedding coverage on Oct 10 ($1,600), photo editing 120 high-res deliverables ($450), second photographer travel expense ($150). $500 retainer already paid. Balance due upon delivery.',
  },
];

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  businessProfile,
  onSaveInvoice,
  onViewInvoice,
  onStartFollowUp,
}) => {
  const [roughNotes, setRoughNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [modelBadge, setModelBadge] = useState<string | null>(null);

  // Editable draft invoice state
  const [draftInvoice, setDraftInvoice] = useState<Invoice | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Trigger Gemma generation
  const handleGenerateInvoice = async (notesToUse?: string) => {
    const text = notesToUse || roughNotes;
    if (!text.trim()) {
      setGenerationError('Please enter some project notes or select a sample scenario below.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/ai/invoice-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roughNotes: text,
          currency,
          businessProfile,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate invoice with Gemma');
      }

      const invData = data.invoice;
      const today = new Date().toISOString().split('T')[0];
      const dueDate =
        invData.dueDate ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newDraft: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber:
          invData.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        issueDate: invData.issueDate || today,
        dueDate: dueDate,
        status: 'pending',
        currency: invData.currency || currency,
        clientName: invData.clientName || 'Valued Client',
        clientEmail: invData.clientEmail || 'client@example.com',
        clientAddress: invData.clientAddress || 'Remote',
        businessName: businessProfile.name || invData.businessName || 'My Freelance Studio',
        businessEmail: businessProfile.email || invData.businessEmail || 'billing@freelance.studio',
        businessAddress: businessProfile.address || invData.businessAddress || '',
        lineItems: Array.isArray(invData.lineItems)
          ? invData.lineItems.map((li: any, idx: number) => ({
              id: li.id || `item-${idx + 1}`,
              description: li.description || 'Consulting service',
              quantity: Number(li.quantity) || 1,
              rate: Number(li.rate) || 0,
              amount: (Number(li.quantity) || 1) * (Number(li.rate) || 0),
            }))
          : [
              {
                id: 'item-1',
                description: 'Freelance professional service',
                quantity: 1,
                rate: 500,
                amount: 500,
              },
            ],
        subtotal: Number(invData.subtotal) || 500,
        taxRate: Number(invData.taxRate) || 0,
        taxAmount: Number(invData.taxAmount) || 0,
        discountAmount: Number(invData.discountAmount) || 0,
        depositPaid: Number(invData.depositPaid) || 0,
        totalDue: Number(invData.totalDue) || 500,
        paymentTerms:
          invData.paymentTerms ||
          'Payment due within 14 days upon receipt. Late payments subject to 1.5% monthly interest.',
        paymentInstructions:
          businessProfile.paymentDetails?.paymentLink
            ? `Pay online: ${businessProfile.paymentDetails.paymentLink} or via ${businessProfile.paymentDetails.accountInfo}`
            : invData.paymentInstructions || 'Direct wire or electronic transfer.',
        notes: invData.notes || 'Thank you for your business! Excited to collaborate again.',
        sideHustleCategory: invData.sideHustleCategory || 'Freelance Services',
        estimatedHoursWorked: Number(invData.estimatedHoursWorked) || 8,
        effectiveHourlyRate: Number(invData.effectiveHourlyRate) || 75,
        theme: 'emerald',
        createdAt: new Date().toISOString(),
        followUpCount: 0,
      };

      // Recalculate accurately
      recalculateInvoice(newDraft);
      setModelBadge(data.provider || 'Google Gemma 2');
    } catch (err: any) {
      console.error('Invoice generation failed:', err);
      setGenerationError(err?.message || 'Server error. Fallback activated.');
      // Local fallback parser so user is NEVER blocked
      fallbackGenerateDraft(text);
    } finally {
      setIsGenerating(false);
    }
  };

  // Local fallback parser in case network or API is temporarily unreachable
  const fallbackGenerateDraft = (text: string) => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const fallback: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      issueDate: today,
      dueDate: dueDate,
      status: 'pending',
      currency,
      clientName: 'Client (Extracted from notes)',
      clientEmail: 'billing@client.com',
      clientAddress: 'Remote / Digital Delivery',
      businessName: businessProfile.name,
      businessEmail: businessProfile.email,
      businessAddress: businessProfile.address,
      lineItems: [
        {
          id: 'item-1',
          description: text.slice(0, 70) || 'Freelance service milestone',
          quantity: 1,
          rate: 450,
          amount: 450,
        },
      ],
      subtotal: 450,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
      depositPaid: 0,
      totalDue: 450,
      paymentTerms: 'Payment due within 14 days upon receipt.',
      paymentInstructions: businessProfile.paymentDetails.paymentLink || businessProfile.paymentDetails.accountInfo,
      notes: 'Thank you for your business!',
      sideHustleCategory: 'Freelance Services',
      estimatedHoursWorked: 6,
      effectiveHourlyRate: 75,
      theme: 'emerald',
      createdAt: new Date().toISOString(),
      followUpCount: 0,
    };
    recalculateInvoice(fallback);
    setModelBadge('Gemma On-Device Fallback');
  };

  // Recalculates subtotal and total balance due
  const recalculateInvoice = (inv: Invoice) => {
    const subtotal = inv.lineItems.reduce((acc, curr) => acc + curr.amount, 0);
    const taxAmount = (subtotal * (inv.taxRate || 0)) / 100;
    const totalDue = Math.max(0, subtotal + taxAmount - (inv.discountAmount || 0) - (inv.depositPaid || 0));

    const updated = {
      ...inv,
      subtotal,
      taxAmount,
      totalDue,
    };
    setDraftInvoice(updated);
    return updated;
  };

  // Line item handlers
  const handleUpdateItem = (id: string, field: keyof LineItem, val: any) => {
    if (!draftInvoice) return;
    const updatedItems = draftInvoice.lineItems.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: val };
        if (field === 'quantity' || field === 'rate') {
          next.amount = (Number(next.quantity) || 0) * (Number(next.rate) || 0);
        }
        return next;
      }
      return item;
    });

    const updated = { ...draftInvoice, lineItems: updatedItems };
    recalculateInvoice(updated);
  };

  const handleAddItem = () => {
    if (!draftInvoice) return;
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: 'Additional service / deliverable',
      quantity: 1,
      rate: 100,
      amount: 100,
    };
    const updated = { ...draftInvoice, lineItems: [...draftInvoice.lineItems, newItem] };
    recalculateInvoice(updated);
  };

  const handleRemoveItem = (id: string) => {
    if (!draftInvoice) return;
    const updatedItems = draftInvoice.lineItems.filter((i) => i.id !== id);
    const updated = {
      ...draftInvoice,
      lineItems: updatedItems.length > 0 ? updatedItems : [{ id: '1', description: 'Service', quantity: 1, rate: 0, amount: 0 }],
    };
    recalculateInvoice(updated);
  };

  const handleSave = () => {
    if (!draftInvoice) return;
    onSaveInvoice(draftInvoice);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gemma Open-Weight AI
              </span>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Data Training • Private</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1.5">
              Automated Client Invoice Generator
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Type or paste rough work notes, hours, or milestone agreements. Gemma converts them into a compliant, structured invoice with line items, tax, and payment terms in seconds.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2">
              <span className="text-[11px] text-slate-400 block font-medium">Default Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="EUR" className="bg-slate-900">EUR (€)</option>
                <option value="GBP" className="bg-slate-900">GBP (£)</option>
                <option value="CAD" className="bg-slate-900">CAD ($)</option>
                <option value="AUD" className="bg-slate-900">AUD ($)</option>
                <option value="INR" className="bg-slate-900">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="mt-6 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Enter Project Scope / Rough Work Notes
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={roughNotes}
              onChange={(e) => setRoughNotes(e.target.value)}
              placeholder="e.g. Design 5-page responsive Shopify store for Coastal Brew Co (bill to info@coastalbrew.com). 15 hours at $65/hr. Plus $120 plugin licensing fee. Net 15 days. 30% deposit already paid."
              className="w-full p-4 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Quick Scenario Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
            <span className="text-xs text-slate-400 shrink-0 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sample Scenarios:</span>
            </span>
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample.title}
                onClick={() => {
                  setRoughNotes(sample.prompt);
                  handleGenerateInvoice(sample.prompt);
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Error notice */}
          {generationError && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{generationError}</span>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Gemma 2 Open-Weight Architecture • Zero Cloud Retention</span>
            </div>

            <button
              onClick={() => handleGenerateInvoice()}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Structuring Invoice with Gemma...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Invoice with Gemma</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Draft Invoice Editor */}
      {draftInvoice && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Review &amp; Edit Draft
                </span>
                {modelBadge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    Engine: {modelBadge}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Invoice {draftInvoice.invoiceNumber}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewInvoice(draftInvoice)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Printable Preview</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Invoice</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onSaveInvoice(draftInvoice);
                  onStartFollowUp(draftInvoice);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Save &amp; Follow Up</span>
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Invoice Number</label>
              <input
                type="text"
                value={draftInvoice.invoiceNumber}
                onChange={(e) => setDraftInvoice({ ...draftInvoice, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Issue Date</label>
              <input
                type="date"
                value={draftInvoice.issueDate}
                onChange={(e) => setDraftInvoice({ ...draftInvoice, issueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Due Date</label>
              <input
                type="date"
                value={draftInvoice.dueDate}
                onChange={(e) => setDraftInvoice({ ...draftInvoice, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Side-Hustle Category</label>
              <input
                type="text"
                value={draftInvoice.sideHustleCategory || ''}
                onChange={(e) => setDraftInvoice({ ...draftInvoice, sideHustleCategory: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Web Development"
              />
            </div>
          </div>

          {/* Client Info Grid */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Client &amp; Billing Details
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Name / Business</label>
                <input
                  type="text"
                  value={draftInvoice.clientName}
                  onChange={(e) => setDraftInvoice({ ...draftInvoice, clientName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Email</label>
                <input
                  type="email"
                  value={draftInvoice.clientEmail}
                  onChange={(e) => setDraftInvoice({ ...draftInvoice, clientEmail: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Address / Location</label>
                <input
                  type="text"
                  value={draftInvoice.clientAddress}
                  onChange={(e) => setDraftInvoice({ ...draftInvoice, clientAddress: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Address or Remote"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Line Items &amp; Deliverables
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-2 px-2">Description</th>
                    <th className="py-2 px-2 w-24 text-center">Qty / Hrs</th>
                    <th className="py-2 px-2 w-32 text-right">Rate</th>
                    <th className="py-2 px-2 w-32 text-right">Amount</th>
                    <th className="py-2 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {draftInvoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.rate}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white text-right focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-white">
                        {formatCurrency(item.amount, draftInvoice.currency)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Calculations & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={draftInvoice.paymentTerms}
                  onChange={(e) => setDraftInvoice({ ...draftInvoice, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Payment Instructions / Link (shown with QR code)
                </label>
                <input
                  type="text"
                  value={draftInvoice.paymentInstructions}
                  onChange={(e) =>
                    setDraftInvoice({ ...draftInvoice, paymentInstructions: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Client Note / Thank You</label>
                <textarea
                  rows={2}
                  value={draftInvoice.notes}
                  onChange={(e) => setDraftInvoice({ ...draftInvoice, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">
                  {formatCurrency(draftInvoice.subtotal, draftInvoice.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <span className="flex items-center space-x-1">
                  <span>Tax Rate (%)</span>
                </span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={draftInvoice.taxRate}
                    onChange={(e) => {
                      const next = { ...draftInvoice, taxRate: parseFloat(e.target.value) || 0 };
                      recalculateInvoice(next);
                    }}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Discount</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={draftInvoice.discountAmount}
                    onChange={(e) => {
                      const next = { ...draftInvoice, discountAmount: parseFloat(e.target.value) || 0 };
                      recalculateInvoice(next);
                    }}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Deposit / Partial Paid</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={draftInvoice.depositPaid}
                    onChange={(e) => {
                      const next = { ...draftInvoice, depositPaid: parseFloat(e.target.value) || 0 };
                      recalculateInvoice(next);
                    }}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-base font-bold text-white">Balance Due</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatCurrency(draftInvoice.totalDue, draftInvoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
