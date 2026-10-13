import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Trash2,
  Printer,
  DollarSign,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency, formatDate, calculateDaysOverdue, calculateDaysRemaining } from '../utils/formatters';

interface InvoiceListProps {
  invoices: Invoice[];
  currency: string;
  onViewInvoice: (invoice: Invoice) => void;
  onStartFollowUp: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onCreateNew: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  currency,
  onViewInvoice,
  onStartFollowUp,
  onUpdateStatus,
  onDeleteInvoice,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');

  // Stats calculation
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.subtotal + inv.taxAmount - inv.discountAmount), 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalDue, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.totalDue, 0);
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === 'overdue' || (inv.status === 'pending' && calculateDaysOverdue(inv.dueDate) > 0)
  );
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.totalDue, 0);

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.sideHustleCategory || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isOverdue = inv.status === 'overdue' || (inv.status === 'pending' && calculateDaysOverdue(inv.dueDate) > 0);

    let matchesFilter = true;
    if (statusFilter === 'all') matchesFilter = true;
    else if (statusFilter === 'overdue') matchesFilter = isOverdue && inv.status !== 'paid';
    else matchesFilter = inv.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Top Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Invoiced
            </span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white font-mono">
            {formatCurrency(totalInvoiced, currency)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across {invoices.length} total client projects</p>
        </div>

        {/* Collected Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Collected Cash
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalPaid, currency)}
          </div>
          <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">Banked &amp; Settled</p>
        </div>

        {/* Pending Due */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Balance
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-400 font-mono">
            {formatCurrency(totalPending, currency)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Awaiting client payment</p>
        </div>

        {/* Overdue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Needs Follow-Up
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-400 font-mono">
            {formatCurrency(totalOverdue, currency)}
          </div>
          <p className="mt-1 text-[11px] text-rose-400/80 font-medium">
            {overdueInvoices.length} invoices past due date
          </p>
        </div>
      </div>

      {/* Main List Table Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Client Invoices</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage client billing records, track overdue balances, and trigger automated follow-ups.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Invoice with Gemma</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, invoice #, or service tag..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'pending', 'overdue', 'paid'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  statusFilter === s
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        {filteredInvoices.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No invoices matched your filter</h4>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or create a new invoice.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Invoice</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Due Date / Status</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Follow-ups</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredInvoices.map((inv) => {
                  const daysOverdue = calculateDaysOverdue(inv.dueDate);
                  const daysLeft = calculateDaysRemaining(inv.dueDate);
                  const isLate = inv.status === 'overdue' || (inv.status === 'pending' && daysOverdue > 0);

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => onViewInvoice(inv)}
                    >
                      {/* Invoice # & Date */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-bold text-white group-hover:text-emerald-400 transition">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[11px] text-slate-400">{formatDate(inv.issueDate)}</span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-200">{inv.clientName}</span>
                          <span className="text-[11px] text-slate-400">{inv.clientEmail}</span>
                          {inv.sideHustleCategory && (
                            <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500">
                              {inv.sideHustleCategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Due Date & Status */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-300 font-medium">
                            {formatDate(inv.dueDate)}
                          </span>

                          <div className="mt-1">
                            {inv.status === 'paid' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Paid</span>
                              </span>
                            ) : isLate ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <AlertCircle className="w-3 h-3" />
                                <span>{daysOverdue}d Overdue</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                <span>{daysLeft}d Left</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount Due */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-mono text-sm font-bold text-white">
                          {formatCurrency(inv.totalDue, inv.currency)}
                        </span>
                        {inv.depositPaid > 0 && (
                          <div className="text-[10px] text-slate-500">
                            (Dep: {formatCurrency(inv.depositPaid, inv.currency)})
                          </div>
                        )}
                      </td>

                      {/* Follow-ups */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                            (inv.followUpCount || 0) > 0
                              ? 'bg-slate-800 text-teal-400 border border-teal-500/30'
                              : 'bg-slate-950/60 text-slate-500'
                          }`}
                        >
                          {inv.followUpCount || 0} sent
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Follow-up button */}
                          <button
                            onClick={() => onStartFollowUp(inv)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                            title="Generate personalized follow-up with Gemma"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* View button */}
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="View / Print Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Paid */}
                          {inv.status !== 'paid' ? (
                            <button
                              onClick={() => onUpdateStatus(inv.id, 'paid')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 transition cursor-pointer"
                              title="Mark as Paid"
                            >
                              Paid
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateStatus(inv.id, 'pending')}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700 transition cursor-pointer"
                              title="Reopen"
                            >
                              Reopen
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
