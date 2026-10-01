import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Building, 
  MapPin, 
  FileText, 
  Download, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  X, 
  Phone, 
  Layers, 
  Crown 
} from 'lucide-react';

export default function ClientPortalView({ publicToken, onClose, onResponseSuccess }) {
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState({});
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [clientComment, setClientComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchPortalQuote = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/portal/quote/${publicToken}`);
        if (!res.ok) throw new Error('Quotation link expired or not found.');
        const data = await res.json();
        setQuoteData(data);

        // Expand all rooms by default
        const exp = {};
        if (data.items) {
          data.items.forEach(it => {
            exp[it.room_name] = true;
          });
        }
        setExpandedRooms(exp);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (publicToken) {
      fetchPortalQuote();
    }
  }, [publicToken]);

  const toggleRoom = (roomName) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomName]: !prev[roomName]
    }));
  };

  const handleResponseSubmit = async (type) => {
    setSelectedResponse(type);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/quote/${publicToken}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_type: type,
          comments: clientComment
        })
      });
      const data = await res.json();
      setSubmissionResult(data);
      if (onResponseSuccess) onResponseSuccess();
    } catch (e) {
      console.error(e);
      alert('Error submitting response');
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 font-serif tracking-wide">More Construction and Interior</h3>
            <p className="text-xs text-amber-400/80 font-mono">Loading bespoke proposal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold border border-rose-500/30">
            !
          </div>
          <h3 className="font-bold text-slate-100 text-lg font-serif">Proposal Link Inactive</h3>
          <p className="text-xs text-slate-400">{error || 'This link may have expired or is invalid.'}</p>
          {onClose && (
            <button 
              onClick={onClose} 
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs rounded-xl font-bold transition shadow-lg shadow-amber-500/20"
            >
              Return to Studio Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // Group items by room
  const itemsByRoom = {};
  if (quoteData.items) {
    quoteData.items.forEach(it => {
      if (!itemsByRoom[it.room_name]) itemsByRoom[it.room_name] = [];
      itemsByRoom[it.room_name].push(it);
    });
  }

  const pdfDownloadUrl = quoteData.pdf_url || `/api/quotations/${quoteData.id}/pdf`;
  const studioName = quoteData.studio_name || "More Construction and Interior";
  const studioPhone = quoteData.studio_phone || "+91 70389 88038";
  const cleanedDigits = (quoteData.studio_phone || "7038988038").replace(/\D/g, '');
  const studioWaNumber = cleanedDigits.length === 10 ? `91${cleanedDigits}` : cleanedDigits;
  const waChatText = encodeURIComponent(`Hello ${studioName}, I have reviewed quotation #${quoteData.quotation_number} for ${quoteData.project_name} on the portal and would like to discuss.`);

  const containerClasses = onClose
    ? "fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 overflow-y-auto sm:p-4 md:p-6 flex justify-center items-start sm:items-center"
    : "min-h-screen bg-slate-950 py-4 sm:py-8 px-3 sm:px-6 flex justify-center";

  return (
    <div className={containerClasses}>
      <div className="bg-slate-900 text-slate-100 w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden border border-amber-500/25 flex flex-col">
        
        {/* Sticky Luxury Header */}
        <div className="bg-slate-950/95 backdrop-blur-md text-white px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs sticky top-0 z-30 border-b border-amber-500/20 shadow-lg">
          <div className="flex items-center gap-3 truncate pr-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-slate-950 font-serif font-black shadow-md shadow-amber-500/20 shrink-0">
              M
            </div>
            <div className="truncate">
              <span className="font-serif font-bold tracking-wider text-slate-100 text-xs sm:text-sm block truncate">
                {studioName}
              </span>
              <span className="font-mono text-amber-400/80 text-[10px] hidden sm:inline">
                Proposal #{quoteData.quotation_number} • Version {quoteData.version}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick PDF Action */}
            <a
              href={pdfDownloadUrl}
              download={`${quoteData.quotation_number}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-lg shadow-amber-500/20 touch-manipulation"
              title="Download Official Branded PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 flex items-center justify-center transition shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Architectural Hero Banner */}
          <div className="p-5 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900/90 border-b border-amber-500/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    Bespoke Interior & Scope Proposal
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-50 tracking-tight font-serif pt-1">
                  {quoteData.project_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium pt-1">
                  <span className="text-amber-300 font-semibold">{quoteData.property_type}</span>
                  {quoteData.location && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400/70" />
                        {quoteData.location}
                      </span>
                    </>
                  )}
                  {quoteData.client_name && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">Prepared for <strong className="text-slate-200">{quoteData.client_name}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="self-stretch sm:self-auto bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 shadow-xl flex sm:flex-col justify-between sm:text-right items-center sm:items-end min-w-[170px]">
                <div className="text-[10px] text-amber-400/80 uppercase font-bold tracking-wider">Proposal Reference</div>
                <div className="text-sm sm:text-base font-bold text-slate-100 font-mono tracking-tight">#{quoteData.quotation_number}</div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 sm:mt-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Revision {quoteData.version}
                </div>
              </div>
            </div>

            {/* Transparency Trust Guarantee */}
            <div className="mt-5 flex items-center gap-2.5 bg-amber-500/10 text-amber-200/90 text-xs px-4 py-2.5 rounded-2xl border border-amber-500/20 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                Transparent Architectural BOQ: Material specifications, dimensions, rates, and quantities itemized room-by-room.
              </span>
            </div>
          </div>

          {/* Itemized Room-by-Room Scope */}
          <div className="p-4 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-widest font-serif flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Itemized Scope & Specifications</span>
                </h2>
                <p className="text-[11px] text-slate-400">Tap room headers below to review item details</p>
              </div>
              <span className="text-[11px] font-mono text-amber-400/70 hidden sm:inline">
                {Object.keys(itemsByRoom).length} Architectural Zones
              </span>
            </div>

            <div className="space-y-3">
              {Object.keys(itemsByRoom).map((roomName) => {
                const roomItems = itemsByRoom[roomName];
                const roomSubtotal = roomItems.reduce((acc, it) => acc + (it.amount || 0), 0);
                const isExpanded = !!expandedRooms[roomName];

                return (
                  <div key={roomName} className="border border-slate-800 hover:border-amber-500/30 rounded-2xl overflow-hidden transition bg-slate-900/60 shadow-md">
                    {/* Room Accordion Header */}
                    <div
                      onClick={() => toggleRoom(roomName)}
                      className="p-3.5 sm:p-4 bg-slate-950/60 hover:bg-slate-950 cursor-pointer flex items-center justify-between transition touch-manipulation border-b border-slate-800/60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-slate-100 text-sm sm:text-base tracking-wide">
                          {roomName}
                        </span>
                        <span className="text-[10px] sm:text-[11px] bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold border border-slate-700">
                          {roomItems.length} {roomItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-300 text-xs sm:text-sm font-mono">{formatINR(roomSubtotal)}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Room Items Table */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-800/80 bg-slate-900/40">
                        {roomItems.map((item, idx) => (
                          <div key={idx} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs hover:bg-slate-800/20 transition">
                            <div className="space-y-1 flex-1 pr-2">
                              <div className="font-bold text-slate-100 text-xs sm:text-sm">{item.item_title}</div>
                              {item.material_spec && (
                                <div className="text-amber-200/70 text-[11px] leading-relaxed font-sans">
                                  {item.material_spec}
                                </div>
                              )}
                              <div className="text-slate-400 text-[11px] font-mono pt-0.5 flex items-center gap-2">
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                                  {item.quantity?.toFixed(1)} {item.unit}
                                </span>
                                <span>×</span>
                                <span>₹{item.rate?.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <div className="font-extrabold text-amber-300 text-xs sm:text-sm font-mono self-end sm:self-auto bg-slate-950/80 sm:bg-slate-950/50 border border-slate-800 px-3 py-1 rounded-xl">
                              {formatINR(item.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Financial Summary Box */}
            <div className="bg-slate-950/90 rounded-3xl p-5 sm:p-6 border border-amber-500/25 shadow-xl space-y-2.5 text-xs mt-6">
              <div className="flex justify-between text-slate-400">
                <span>Scope Subtotal:</span>
                <span className="font-semibold text-slate-200 font-mono">{formatINR(quoteData.subtotal)}</span>
              </div>
              {quoteData.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Special Studio Courtesy Discount:</span>
                  <span className="font-semibold font-mono">- {formatINR(quoteData.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Applicable GST ({quoteData.tax_percent}%):</span>
                <span className="font-semibold text-slate-200 font-mono">+ {formatINR(quoteData.tax_amount)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <div>
                  <span className="text-sm sm:text-base font-bold text-slate-100 font-serif block">Total Proposal Value:</span>
                  <span className="text-[10px] text-slate-400">All materials, labor, fabrication & taxes inclusive</span>
                </div>
                <span className="text-xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                  {formatINR(quoteData.total_amount)}
                </span>
              </div>
            </div>

            {/* High-Contrast Official PDF Download Strip */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl mt-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-serif font-bold text-sm text-slate-100">Download Stamped Architectural PDF</span>
                </div>
                <p className="text-xs text-slate-400">
                  Print or retain the official document containing terms, payment stages, and specifications.
                </p>
              </div>
              <a
                href={pdfDownloadUrl}
                download={`${quoteData.quotation_number}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 touch-manipulation shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Document</span>
              </a>
            </div>

            {/* Interactive Response Suite */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 pb-6">
              {submissionResult ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm sm:text-base font-serif">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Response Transmitted to {studioName}!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {submissionResult.message || 'Thank you! Our design studio has received your input and will connect with you promptly.'}
                  </p>

                  {/* AI Intelligence Feedback */}
                  {submissionResult.ai_analysis && (
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30 text-xs space-y-2 mt-3">
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <Sparkles className="w-4 h-4" />
                          <span>Status Classification:</span>
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          {submissionResult.ai_analysis.sentiment}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong className="text-slate-400">Intent:</strong> {submissionResult.ai_analysis.detected_intent}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong className="text-slate-400">Design Team Summary:</strong> {submissionResult.ai_analysis.summary_for_admin}
                      </div>
                      <div className="text-[10px] text-emerald-300 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
                        ✓ Automated reminders stopped. A senior design consultant will follow up personally.
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${studioWaNumber}?text=${waChatText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition touch-manipulation"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat with Designer on WhatsApp ({studioPhone})</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base font-serif flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>How would you like to proceed?</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Select your response below to inform our design studio directly from your phone.
                    </p>
                  </div>

                  {/* 4 Touch Cards for Mobile Homeowners */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Interested')}
                      className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-emerald-950/30 hover:bg-emerald-950/60 active:scale-95 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl transition group text-center touch-manipulation min-h-[84px] shadow-lg shadow-emerald-950/20"
                    >
                      <span className="text-xl mb-1 group-hover:scale-110 transition">🟢</span>
                      <span className="text-xs font-bold text-emerald-200">Approve Proposal</span>
                      <span className="text-[10px] text-emerald-400/80">Looks great, let's start!</span>
                    </button>

                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Need Changes')}
                      className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-amber-950/30 hover:bg-amber-950/60 active:scale-95 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl transition group text-center touch-manipulation min-h-[84px] shadow-lg shadow-amber-950/20"
                    >
                      <span className="text-xl mb-1 group-hover:scale-110 transition">🟡</span>
                      <span className="text-xs font-bold text-amber-200">Request Revision</span>
                      <span className="text-[10px] text-amber-400/80">Adjust items or price</span>
                    </button>

                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Need More Time')}
                      className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-blue-950/30 hover:bg-blue-950/60 active:scale-95 border-2 border-blue-500/40 hover:border-blue-400 rounded-2xl transition group text-center touch-manipulation min-h-[84px] shadow-lg shadow-blue-950/20"
                    >
                      <span className="text-xl mb-1 group-hover:scale-110 transition">🔵</span>
                      <span className="text-xs font-bold text-blue-200">Need More Time</span>
                      <span className="text-[10px] text-blue-400/80">Reviewing with family</span>
                    </button>

                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Not Interested')}
                      className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-rose-950/30 hover:bg-rose-950/60 active:scale-95 border-2 border-rose-500/40 hover:border-rose-400 rounded-2xl transition group text-center touch-manipulation min-h-[84px] shadow-lg shadow-rose-950/20"
                    >
                      <span className="text-xl mb-1 group-hover:scale-110 transition">🔴</span>
                      <span className="text-xs font-bold text-rose-200">Decline Proposal</span>
                      <span className="text-[10px] text-rose-400/80">Not proceeding</span>
                    </button>
                  </div>

                  {/* Feedback Text Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Specific remarks, custom requests, or material adjustments (Optional):
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Can we review laminate catalogs for the master wardrobe, or explore acrylic finishes?"
                      value={clientComment}
                      onChange={(e) => setClientComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Studio Contact Footer */}
            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 space-y-1">
              <div className="font-serif text-slate-400 font-semibold">{studioName}</div>
              <div>Direct Inquiries: <a href={`tel:${studioPhone}`} className="text-amber-400 hover:underline">{studioPhone}</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
