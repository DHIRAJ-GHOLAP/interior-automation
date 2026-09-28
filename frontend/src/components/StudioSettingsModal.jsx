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
  QrCode
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Studio Profile & SaaS Branding</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> PRO Plan
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Configure your interior studio details, GSTIN, and bank info for PDF quotations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          
          {/* Section: Studio Identity */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs tracking-wide uppercase text-slate-500">
              <span>Studio Identity</span>
            </h4>
            
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Studio Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. More Construction and Interior"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
                <input
                  type="tel"
                  value={form.company_phone}
                  onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={form.company_email}
                  onChange={(e) => setForm({ ...form, company_email: e.target.value })}
                  placeholder="quotes@yourstudio.com"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={form.gst_number}
                  onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
                  placeholder="27AABCA1234F1Z5"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating City / Region</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Mumbai • Thane • Pune"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office / Studio Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Level 4, Trade Centre, BKC, Mumbai"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Section: Payment & Bank Details for Quotations */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs tracking-wide uppercase text-slate-500">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Quotation Payment Instructions (PDF & Portal)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  placeholder="HDFC Bank"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={form.bank_account_no}
                  onChange={(e) => setForm({ ...form, bank_account_no: e.target.value })}
                  placeholder="50200012345678"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={form.bank_ifsc}
                  onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })}
                  placeholder="HDFC0000123"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPI ID for Quick Advance</label>
                <input
                  type="text"
                  value={form.upi_id}
                  onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                  placeholder="yourstudio@hdfcbank"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Changes reflect instantly in PDF letterheads & portal.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow transition active:scale-95 disabled:opacity-50"
              >
                {success ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
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
