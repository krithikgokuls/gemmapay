import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { InvoiceViewer } from './components/InvoiceViewer';
import { FollowUpStudio } from './components/FollowUpStudio';
import { IncomeDashboard } from './components/IncomeDashboard';
import { PrivacyGemmaVault } from './components/PrivacyGemmaVault';
import { BusinessProfileModal } from './components/BusinessProfileModal';
import {
  Invoice,
  InvoiceStatus,
  BusinessProfile,
  ModelEngineStatus,
} from './types';
import {
  loadInvoices,
  saveInvoices,
  loadBusinessProfile,
  saveBusinessProfile,
  loadMonthlyGoal,
  saveMonthlyGoal,
} from './utils/storage';
import { calculateDaysOverdue } from './utils/formatters';

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(loadBusinessProfile);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(loadMonthlyGoal);
  const [activeTab, setActiveTab] = useState<'invoices' | 'create' | 'followups' | 'income' | 'privacy'>('invoices');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [followUpInvoice, setFollowUpInvoice] = useState<Invoice | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState<ModelEngineStatus | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loaded = loadInvoices();
    setInvoices(loaded);

    // Fetch Gemma engine status
    fetch('/api/gemma/status')
      .then((res) => res.json())
      .then((data) => setEngineStatus(data))
      .catch((err) => console.warn('Could not fetch Gemma engine status:', err));
  }, []);

  // Save changes to localStorage
  const updateInvoices = (updatedList: Invoice[]) => {
    setInvoices(updatedList);
    saveInvoices(updatedList);
  };

  const handleSaveNewInvoice = (newInv: Invoice) => {
    const updated = [newInv, ...invoices];
    updateInvoices(updated);
    setViewingInvoice(newInv);
  };

  const handleUpdateInvoice = (updatedInv: Invoice) => {
    const updated = invoices.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv));
    updateInvoices(updated);
    if (viewingInvoice?.id === updatedInv.id) {
      setViewingInvoice(updatedInv);
    }
  };

  const handleUpdateStatus = (invoiceId: string, status: InvoiceStatus) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return { ...inv, status };
      }
      return inv;
    });
    updateInvoices(updated);
    if (viewingInvoice?.id === invoiceId) {
      setViewingInvoice({ ...viewingInvoice, status });
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      const updated = invoices.filter((inv) => inv.id !== invoiceId);
      updateInvoices(updated);
      if (viewingInvoice?.id === invoiceId) {
        setViewingInvoice(null);
      }
    }
  };

  const handleSaveProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    saveBusinessProfile(profile);
  };

  const handleUpdateGoal = (newGoal: number) => {
    setMonthlyGoal(newGoal);
    saveMonthlyGoal(newGoal);
  };

  // Navigations
  const handleStartFollowUp = (invoice: Invoice) => {
    setFollowUpInvoice(invoice);
    setViewingInvoice(null);
    setActiveTab('followups');
  };

  const handleSelectClientForFollowUp = (clientEmail: string) => {
    const clientInvoice = invoices.find((inv) => inv.clientEmail === clientEmail);
    if (clientInvoice) {
      handleStartFollowUp(clientInvoice);
    } else {
      setActiveTab('followups');
    }
  };

  // Stats for navbar
  const overdueCount = invoices.filter(
    (inv) => inv.status === 'overdue' || (inv.status === 'pending' && calculateDaysOverdue(inv.dueDate) > 0)
  ).length;

  const totalPendingDue = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.totalDue, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setViewingInvoice(null);
          setActiveTab(tab);
        }}
        engineStatus={engineStatus}
        overdueCount={overdueCount}
        totalPendingDue={totalPendingDue}
        currency={invoices[0]?.currency || 'USD'}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* If viewing a single invoice */}
        {viewingInvoice ? (
          <InvoiceViewer
            invoice={viewingInvoice}
            onBack={() => setViewingInvoice(null)}
            onUpdateStatus={handleUpdateStatus}
            onStartFollowUp={handleStartFollowUp}
          />
        ) : (
          <>
            {activeTab === 'invoices' && (
              <InvoiceList
                invoices={invoices}
                currency={invoices[0]?.currency || 'USD'}
                onViewInvoice={(inv) => setViewingInvoice(inv)}
                onStartFollowUp={handleStartFollowUp}
                onUpdateStatus={handleUpdateStatus}
                onDeleteInvoice={handleDeleteInvoice}
                onCreateNew={() => setActiveTab('create')}
              />
            )}

            {activeTab === 'create' && (
              <InvoiceGenerator
                businessProfile={businessProfile}
                onSaveInvoice={handleSaveNewInvoice}
                onViewInvoice={(inv) => setViewingInvoice(inv)}
                onStartFollowUp={handleStartFollowUp}
              />
            )}

            {activeTab === 'followups' && (
              <FollowUpStudio
                invoices={invoices}
                initialInvoice={followUpInvoice}
                onUpdateInvoice={handleUpdateInvoice}
              />
            )}

            {activeTab === 'income' && (
              <IncomeDashboard
                invoices={invoices}
                currency={invoices[0]?.currency || 'USD'}
                monthlyGoal={monthlyGoal}
                onUpdateMonthlyGoal={handleUpdateGoal}
                onSelectClientForFollowUp={handleSelectClientForFollowUp}
              />
            )}

            {activeTab === 'privacy' && <PrivacyGemmaVault />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            GemmaPay • Privacy-First Side-Hustle Automation • Powered by Google Open-Weight Gemma 2
          </p>
          <p className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Zero Data Cloud Retention • 100% Local Storage Privacy</span>
          </p>
        </div>
      </footer>

      {/* Business Profile Modal */}
      <BusinessProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={businessProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
