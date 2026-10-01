import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  Crown
} from 'lucide-react';

export default function StudioSettingsModal({ tenant, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    company_phone: '',
    company_email: '',
    gst_number: '',
    address: '',
    city: 'Mumbai',
    bank_name: '',
    bank_account_no: '',
    bank_ifsc: '',
    upi_id: ''
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name || '',
        company_phone: tenant.company_phone || '',
        company_email: tenant.company_email || '',
        gst_number: tenant.gst_number || '',
        address: tenant.address || '',
        city: tenant.city || 'Mumbai',
        bank_name: tenant.bank_name || '',
        bank_account_no: tenant.bank_account_no || '',
        bank_ifsc: tenant.bank_ifsc || '',
        upi_id: tenant.upi_id || ''
      });
    }
  }, [tenant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg font-serif">Studio Profile & SaaS Branding</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> LUXURY TIER
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Configure your interior studio identity, GSTIN, and bank info for PDF quotations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          
          {/* Section: Studio Identity */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-400/90 flex items-center gap-1.5 text-xs tracking-wider uppercase font-serif">
              <span>Studio Identity</span>
            </h4>
            
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company / Studio Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. More Construction and Interior"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm font-medium transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Phone</label>
                <input
                  type="tel"
                  value={form.company_phone}
                  onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                  placeholder="7038988038"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-mono transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={form.company_email}
                  onChange={(e) => setForm({ ...form, company_email: e.target.value })}
                  placeholder="contact@moreinterior.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={form.gst_number}
                  onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
                  placeholder="27AABCA1234F1Z5"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs uppercase font-mono transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Operating City / Region</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Mumbai • Thane • Pune"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Office / Studio Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Level 4, Trade Centre, BKC, Mumbai"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs transition"
              />
            </div>
          </div>

          {/* Section: Payment & Bank Details for Quotations */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="font-bold text-amber-400/90 flex items-center gap-1.5 text-xs tracking-wider uppercase font-serif">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Quotation Payment Instructions (PDF & Portal)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  placeholder="HDFC Bank"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={form.bank_account_no}
                  onChange={(e) => setForm({ ...form, bank_account_no: e.target.value })}
                  placeholder="50200012345678"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-mono transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={form.bank_ifsc}
                  onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })}
                  placeholder="HDFC0000123"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs uppercase font-mono transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">UPI ID for Direct Advance</label>
                <input
                  type="text"
                  value={form.upi_id}
                  onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                  placeholder="moreinteriors@hdfcbank"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-mono transition"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Updates apply instantly to new PDFs and client portals.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
              >
                {success ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Saved!</span>
                  </>
                ) : saving ? (
                  <span>Saving...</span>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
