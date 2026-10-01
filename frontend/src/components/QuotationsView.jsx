import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Send, 
  GitFork, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Copy, 
  MessageSquare,
  AlertCircle,
  X,
  Eye,
  Trash2
} from 'lucide-react';

export default function QuotationsView({ 
  quotations, 
  onSelectQuotation, 
  onCreateRevision, 
  onOpenClientPortal,
  onDeleteQuotation,
  onRefresh
}) {
  const [previewQuote, setPreviewQuote] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(null);
  const [whatsappResult, setWhatsappResult] = useState(null);
  const [sendingWa, setSendingWa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSendWhatsApp = async (quote) => {
    setSendingWa(true);
    try {
      const url = `/api/quotations/${quote.id}/send-whatsapp?portal_base_url=${encodeURIComponent(window.location.origin)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setWhatsappResult(data);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      alert('Error sending WhatsApp message');
    } finally {
      setSendingWa(false);
    }
  };

  const handleCreateRevisionClick = async (quote) => {
    if (!confirm(`Create new revision for ${quote.quotation_number}? Original version will be preserved in history.`)) {
      return;
    }
    await onCreateRevision(quote.id);
  };

  const handleCopyPortalLink = (token) => {
    const url = `${window.location.origin}/quote/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Quotations & Revision History</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Generate revisions, manage client proposals, download PDFs, and dispatch via WhatsApp</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-medium self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Margins are completely private from clients</span>
        </div>
      </div>

      {/* Quotation Cards Grid */}
      {quotations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Quotations Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Go to the Projects & BOQ tab, select or create your rooms and items, then tap "Generate Quotation".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {quotations.map((quote) => {
            return (
              <div
                key={quote.id}
                className="bg-white rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-[0_4px_25px_rgba(217,119,6,0.06)] hover:border-amber-500/40 transition flex flex-col justify-between"
              >
              <div>
                {/* Header row: Number, Version & Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-serif font-bold text-slate-900 text-sm sm:text-base tracking-wide">{quote.quotation_number}</span>
                    <span className="bg-amber-500/10 text-amber-800 border border-amber-500/25 text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                      {quote.version}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      quote.status === 'Accepted' || quote.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : quote.status === 'Quotation Sent' || quote.status === 'Viewed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : quote.status === 'Negotiation' || quote.status === 'Revision Requested'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {quote.status}
                    </span>

                    {onDeleteQuotation && (
                      <button
                        onClick={() => onDeleteQuotation(quote.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition active:scale-95 border border-transparent hover:border-rose-200"
                        title="Delete Quotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scope & Financial Breakdown */}
                <div className="py-3.5 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800 font-mono">{formatINR(quote.subtotal)}</span>
                  </div>
                  {quote.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-rose-600">
                      <span>Special Discount:</span>
                      <span className="font-semibold font-mono">- {formatINR(quote.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-600">
                    <span>GST ({quote.tax_percent}%):</span>
                    <span className="font-semibold text-slate-800 font-mono">+ {formatINR(quote.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <span className="font-serif font-bold text-slate-900 text-xs sm:text-sm">Proposal Value:</span>
                    <span className="font-mono font-bold text-slate-900 text-base sm:text-xl">{formatINR(quote.total_amount)}</span>
                  </div>

                  {/* Private Internal Profit Strip */}
                  <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-emerald-800">Internal Cost</div>
                      <div className="font-semibold text-slate-700 text-xs font-mono">{formatINR(quote.total_cost)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-emerald-800">Gross Margin</div>
                      <div className="font-bold text-emerald-700 text-xs sm:text-sm font-mono">
                        {formatINR(quote.gross_margin)} ({quote.margin_percent}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar (Touch Optimized for Mobile) */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Preview PDF */}
                  <button
                    onClick={() => setPreviewQuote(quote)}
                    className="flex items-center gap-1 bg-[#131b2e] hover:bg-[#1a253c] active:scale-95 text-amber-200 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition touch-manipulation border border-amber-500/20 shadow-xs"
                    title="Preview Quotation PDF"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preview</span>
                  </button>

                  {/* Download PDF */}
                  <a
                    href={`${window.__API_BASE__ || ''}/api/quotations/${quote.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-extrabold px-3 py-2 rounded-xl transition touch-manipulation shadow-xs border border-amber-300/40"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-950" />
                    <span>PDF</span>
                  </a>

                  {/* WhatsApp Action */}
                  <button
                    onClick={() => {
                      setShowWhatsAppModal(quote);
                      handleSendWhatsApp(quote);
                    }}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition touch-manipulation shadow-xs"
                    title="Send WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Create Revision */}
                  <button
                    onClick={() => handleCreateRevisionClick(quote)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition touch-manipulation"
                    title="Create Revision"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Revision</span>
                  </button>
                </div>

                {/* Client Portal Link */}
                <button
                  onClick={() => onOpenClientPortal(quote.public_token)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 active:scale-95 py-1 px-1 touch-manipulation"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* WhatsApp Dispatch Modal (iPhone 15 Safe) */}
      {showWhatsAppModal && whatsappResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">WhatsApp Dispatched!</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Automated cadence active</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWhatsAppModal(null);
                  setWhatsappResult(null);
                }}
                className="text-slate-400 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>3 Automated Follow-ups Scheduled:</span>
                </div>
                <ul className="text-emerald-700 text-[11px] list-disc list-inside space-y-0.5">
                  <li>Day 2: Design check-in</li>
                  <li>Day 5: Material consultation</li>
                  <li>Day 10: Final quote check</li>
                </ul>
                <div className="text-[10px] text-slate-500 italic pt-1 border-t border-emerald-200">
                  ⚡ Anti-Spam Guarantee: If client replies, all robots cancel instantly!
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Message Template:</label>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-2xl font-mono text-[11px] whitespace-pre-wrap">
                  {whatsappResult.message}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyPortalLink(showWhatsAppModal.public_token)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-xs touch-manipulation"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>

                <a
                  href={whatsappResult.direct_whatsapp_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 touch-manipulation"
                >
                  <Send className="w-4 h-4" />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation PDF Preview Modal */}
      {previewQuote && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
          <div className="bg-white w-full max-w-5xl h-[95vh] sm:h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5 truncate pr-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base font-serif tracking-wide">{previewQuote.quotation_number}</span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                      {previewQuote.version}
                    </span>
                    <span className="hidden sm:inline-block text-xs text-slate-400">•</span>
                    <span className="hidden sm:inline-block text-xs font-semibold text-emerald-400">
                      {formatINR(previewQuote.total_amount)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    More Construction and Interior — Official Proposal Document
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <a
                  href={`/api/quotations/${previewQuote.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition"
                  title="Open in new browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Tab</span>
                </a>

                <a
                  href={`/api/quotations/${previewQuote.id}/pdf`}
                  download={`${previewQuote.quotation_number}.pdf`}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-xs"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  onClick={() => setPreviewQuote(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
              <iframe
                src={`/api/quotations/${previewQuote.id}/pdf#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                title={`Preview of ${previewQuote.quotation_number}`}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
