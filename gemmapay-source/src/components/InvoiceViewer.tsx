import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Copy,
  Check,
  Send,
  Calendar,
  AlertCircle,
  Building2,
  Mail,
  ArrowLeft,
  DollarSign,
  Palette,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency, formatDate, calculateDaysOverdue } from '../utils/formatters';

interface InvoiceViewerProps {
  invoice: Invoice;
  onBack: () => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onStartFollowUp: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  invoice,
  onBack,
  onUpdateStatus,
  onStartFollowUp,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<'emerald' | 'mono' | 'navy' | 'amber'>(
    invoice.theme || 'emerald'
  );
  const invoiceRef = useRef<HTMLDivElement>(null);

  const daysOverdue = calculateDaysOverdue(invoice.dueDate);
  const isOverdue = invoice.status === 'overdue' || (invoice.status === 'pending' && daysOverdue > 0);

  // Generate QR code for payment
  useEffect(() => {
    const paymentTarget =
      invoice.paymentInstructions ||
      `Invoice ${invoice.invoiceNumber}: Pay ${invoice.currency} ${invoice.totalDue} to ${invoice.businessEmail}`;

    QRCode.toDataURL(paymentTarget, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation failed', err));
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `Invoice ${invoice.invoiceNumber} from ${invoice.businessName}
Client: ${invoice.clientName}
Due Date: ${invoice.dueDate}
Total Balance Due: ${formatCurrency(invoice.totalDue, invoice.currency)}
Payment Details: ${invoice.paymentInstructions || 'See invoice attachment'}

Notes: ${invoice.notes || 'Thank you for your business!'}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color theme classes for the invoice document
  const themeStyles = {
    emerald: {
      accentBg: 'bg-emerald-600',
      accentText: 'text-emerald-700',
      accentBorder: 'border-emerald-500',
      headerBg: 'bg-emerald-50/60',
      tableHead: 'bg-emerald-900/10 text-emerald-900',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    navy: {
      accentBg: 'bg-blue-700',
      accentText: 'text-blue-800',
      accentBorder: 'border-blue-600',
      headerBg: 'bg-blue-50/70',
      tableHead: 'bg-blue-900/10 text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    amber: {
      accentBg: 'bg-amber-600',
      accentText: 'text-amber-800',
      accentBorder: 'border-amber-500',
      headerBg: 'bg-amber-50/70',
      tableHead: 'bg-amber-900/10 text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    mono: {
      accentBg: 'bg-slate-900',
      accentText: 'text-slate-900',
      accentBorder: 'border-slate-800',
      headerBg: 'bg-slate-100',
      tableHead: 'bg-slate-200 text-slate-800',
      badgeBg: 'bg-slate-200 text-slate-800 border-slate-400',
    },
  }[currentTheme];

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Invoices</span>
          </button>

          <span className="text-sm font-semibold text-white">
            {invoice.invoiceNumber}
          </span>

          {invoice.status === 'paid' && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid in Full</span>
            </span>
          )}

          {isOverdue && invoice.status !== 'paid' && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{daysOverdue} Days Overdue</span>
            </span>
          )}

          {invoice.status === 'pending' && !isOverdue && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Theme selector */}
          <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400">
            <Palette className="w-3.5 h-3.5 mr-1" />
            <button
              onClick={() => setCurrentTheme('emerald')}
              className={`w-4 h-4 rounded-full bg-emerald-500 transition ${
                currentTheme === 'emerald' ? 'ring-2 ring-white scale-110' : 'opacity-70'
              }`}
              title="Modern Emerald Theme"
            />
            <button
              onClick={() => setCurrentTheme('navy')}
              className={`w-4 h-4 rounded-full bg-blue-600 transition ${
                currentTheme === 'navy' ? 'ring-2 ring-white scale-110' : 'opacity-70'
              }`}
              title="Executive Navy Theme"
            />
            <button
              onClick={() => setCurrentTheme('amber')}
              className={`w-4 h-4 rounded-full bg-amber-500 transition ${
                currentTheme === 'amber' ? 'ring-2 ring-white scale-110' : 'opacity-70'
              }`}
              title="Studio Amber Theme"
            />
            <button
              onClick={() => setCurrentTheme('mono')}
              className={`w-4 h-4 rounded-full bg-slate-400 transition ${
                currentTheme === 'mono' ? 'ring-2 ring-white scale-110' : 'opacity-70'
              }`}
              title="Minimalist Mono Theme"
            />
          </div>

          {/* Follow-up button */}
          <button
            onClick={() => onStartFollowUp(invoice)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Follow-Up</span>
          </button>

          {/* Status Toggle */}
          {invoice.status !== 'paid' ? (
            <button
              onClick={() => onUpdateStatus(invoice.id, 'paid')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark as Paid</span>
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(invoice.id, 'pending')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <span>Reopen as Pending</span>
            </button>
          )}

          {/* Copy summary */}
          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Copy invoice summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div
        ref={invoiceRef}
        className="invoice-printable mx-auto max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
      >
        {/* Top Accent Strip */}
        <div className={`absolute top-0 left-0 right-0 h-2.5 ${themeStyles.accentBg}`} />

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-xl ${themeStyles.accentBg} text-white flex items-center justify-center font-bold text-lg shadow-sm`}
              >
                {invoice.businessName ? invoice.businessName.charAt(0) : 'S'}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {invoice.businessName}
              </h1>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5">
              <p className="flex items-center space-x-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{invoice.businessEmail}</span>
              </p>
              {invoice.businessAddress && <p>{invoice.businessAddress}</p>}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-black uppercase tracking-wider text-slate-900">
              INVOICE
            </h2>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <p>
                <span className="font-semibold text-slate-500">Invoice #: </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {invoice.invoiceNumber}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Issue Date: </span>
                <span className="text-slate-800">{formatDate(invoice.issueDate)}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Payment Due: </span>
                <span
                  className={`font-semibold ${
                    isOverdue && invoice.status !== 'paid' ? 'text-rose-600 font-bold' : 'text-slate-900'
                  }`}
                >
                  {formatDate(invoice.dueDate)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Client & Billing Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Billed To
            </span>
            <div className="mt-1.5">
              <h3 className="text-base font-bold text-slate-900">{invoice.clientName}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{invoice.clientEmail}</p>
              {invoice.clientAddress && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {invoice.clientAddress}
                </p>
              )}
            </div>
          </div>

          <div className="sm:text-right flex flex-col sm:items-end justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Balance Due
              </span>
              <div className={`text-3xl font-extrabold ${themeStyles.accentText} mt-1`}>
                {formatCurrency(invoice.totalDue, invoice.currency)}
              </div>
            </div>

            {invoice.sideHustleCategory && (
              <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                <span>Category:</span>
                <span className="font-semibold">{invoice.sideHustleCategory}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b border-slate-200 ${themeStyles.tableHead}`}>
                <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider">
                  Description / Service
                </th>
                <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider text-center w-20">
                  Qty / Hrs
                </th>
                <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider text-right w-28">
                  Rate
                </th>
                <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider text-right w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.lineItems.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-3 text-sm text-slate-800 font-medium">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-3 text-sm text-slate-600 text-center font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-3 text-sm text-slate-600 text-right font-mono">
                    {formatCurrency(item.rate, invoice.currency)}
                  </td>
                  <td className="py-3.5 px-3 text-sm text-slate-900 font-semibold text-right font-mono">
                    {formatCurrency(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown Calculation */}
        <div className="pt-4 pb-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-8">
          <div className="max-w-md space-y-4">
            {invoice.paymentTerms && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payment Terms
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {invoice.paymentTerms}
                </p>
              </div>
            )}

            {invoice.notes && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notes
                </h4>
                <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                  "{invoice.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between py-1 text-emerald-700">
                <span>Discount</span>
                <span className="font-mono font-medium">
                  -{formatCurrency(invoice.discountAmount, invoice.currency)}
                </span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="font-mono font-medium">
                  +{formatCurrency(invoice.taxAmount, invoice.currency)}
                </span>
              </div>
            )}

            {invoice.depositPaid > 0 && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Deposit / Partial Paid</span>
                <span className="font-mono font-medium">
                  -{formatCurrency(invoice.depositPaid, invoice.currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-3 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
              <span className="text-base">Balance Due</span>
              <span className={`text-base font-mono ${themeStyles.accentText}`}>
                {formatCurrency(invoice.totalDue, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods & Dynamic QR Code */}
        <div className="mt-6 pt-6 border-t border-slate-200 bg-slate-50/80 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment Instructions
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Instant Pay
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {invoice.paymentInstructions || 'Direct bank deposit, Stripe, or PayPal checkout.'}
            </p>
            <p className="text-[11px] text-slate-400">
              Scan the QR code on your mobile device to open payment instructions or pay directly.
            </p>
          </div>

          {qrDataUrl && (
            <div className="flex flex-col items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200 shrink-0">
              <img
                src={qrDataUrl}
                alt="Payment QR Code"
                className="w-24 h-24 object-contain"
              />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
                Scan to Pay
              </span>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Generated with GemmaPay • Privacy-First Freelance Architecture • Google Gemma Open-Weights
        </div>
      </div>
    </div>
  );
};
