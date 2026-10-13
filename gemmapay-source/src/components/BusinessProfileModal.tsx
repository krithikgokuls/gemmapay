import React, { useState } from 'react';
import { X, Building2, CreditCard, Check, Sparkles } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  onSave: (updated: BusinessProfile) => void;
}

export const BusinessProfileModal: React.FC<BusinessProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Freelance Business Profile</h3>
              <p className="text-xs text-slate-400">Used as default sender info on all invoices &amp; payment QR codes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Business / Freelancer Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Studio Nova | Web & Design"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Billing Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="billing@yourstudio.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Studio Address / Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 742 Evergreen Suite 4B, Austin, TX"
            />
          </div>

          {/* Payment Details Section */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center space-x-2 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Default Payment Method</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {(['stripe', 'paypal', 'venmo', 'bank'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      paymentDetails: { ...formData.paymentDetails, method },
                    })
                  }
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition cursor-pointer ${
                    formData.paymentDetails.method === method
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payment Link or Handle (Stripe URL, PayPal.me, or @handle)
                </label>
                <input
                  type="text"
                  value={formData.paymentDetails.paymentLink || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDetails: { ...formData.paymentDetails, paymentLink: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://buy.stripe.com/... or https://paypal.me/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payment Instructions / Bank Wire Info
                </label>
                <textarea
                  rows={2}
                  value={formData.paymentDetails.accountInfo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDetails: { ...formData.paymentDetails, accountInfo: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Direct wire: First Bank / Routing: 12345 / Account: 67890"
                />
              </div>
            </div>
          </div>

          {/* Privacy pledge */}
          <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-start space-x-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your business financial data is saved strictly to your local browser storage. Gemma open-weights guarantee no proprietary rate or client retention.
            </span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
