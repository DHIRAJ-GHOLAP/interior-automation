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
  X
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
        data.items.forEach(it => {
          exp[it.room_name] = true;
        });
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
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center space-y-4 shadow-2xl">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-700">Loading your interior proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="font-bold text-slate-900 text-base">Proposal Link Expired</h3>
          <p className="text-xs text-slate-500">{error || 'This link may have expired or is invalid.'}</p>
          {onClose && (
            <button 
              onClick={onClose} 
              className="w-full py-2.5 bg-slate-900 text-white text-xs rounded-xl font-bold touch-manipulation"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // Group items by room
  const itemsByRoom = {};
  quoteData.items.forEach(it => {
    if (!itemsByRoom[it.room_name]) itemsByRoom[it.room_name] = [];
    itemsByRoom[it.room_name].push(it);
  });

  const pdfDownloadUrl = quoteData.pdf_url || `/api/quotations/${quoteData.id}/pdf`;
  const studioName = quoteData.studio_name || "More Construction and Interior";

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 overflow-y-auto sm:p-4 md:p-6 flex justify-center items-start sm:items-center">
      <div className="bg-white w-full max-w-3xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 text-slate-800 flex flex-col">
        
        {/* Sticky Mobile-Friendly Header with Direct PDF Action */}
        <div className="bg-slate-950 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
            <div className="truncate">
              <span className="font-bold tracking-tight text-slate-100 text-xs sm:text-sm block truncate">
                {studioName}
              </span>
              <span className="font-mono text-slate-400 text-[10px] hidden sm:inline">
                Proposal #{quoteData.quotation_number} ({quoteData.version})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick PDF Download Button */}
            <a
              href={pdfDownloadUrl}
              download={`${quoteData.quotation_number}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs touch-manipulation"
              title="Download Branded PDF Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 flex items-center justify-center transition shrink-0 touch-manipulation"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Branded Luxury Header */}
          <div className="p-4 sm:p-7 bg-gradient-to-b from-amber-50/40 via-blue-50/20 to-white border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-amber-700">
                  {studioName}
                </span>
                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight font-serif">
                  Interior Design & Scope Proposal
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                  <span className="font-bold text-slate-800">{quoteData.project_name}</span>
                  <span>•</span>
                  <span>{quoteData.property_type}</span>
                  {quoteData.location && (
                    <>
                      <span>•</span>
                      <span>{quoteData.location}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="self-stretch sm:self-auto bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex sm:flex-col justify-between sm:text-right items-center sm:items-end">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Proposal No.</div>
                <div className="text-sm font-bold text-slate-900 font-mono">#{quoteData.quotation_number}</div>
                <div className="text-[10px] text-emerald-600 font-semibold sm:mt-0.5">Revision {quoteData.version}</div>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="mt-3.5 flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-xl border border-emerald-100 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                100% Transparent BOQ: All materials, dimensions, quantities, and rates clearly listed.
              </span>
            </div>
          </div>

          {/* Room-by-Room Transparent Breakdown */}
          <div className="p-4 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Itemized Scope & BOQ
              </h2>
              <span className="text-[11px] text-slate-400">Tap room to expand/collapse</span>
            </div>

            <div className="space-y-3">
              {Object.keys(itemsByRoom).map((roomName) => {
                const roomItems = itemsByRoom[roomName];
                const roomSubtotal = roomItems.reduce((acc, it) => acc + it.amount, 0);
                const isExpanded = !!expandedRooms[roomName];

                return (
                  <div key={roomName} className="border border-slate-200/90 rounded-2xl overflow-hidden transition shadow-xs">
                    {/* Room Accordion Header */}
                    <div
                      onClick={() => toggleRoom(roomName)}
                      className="p-3.5 sm:p-4 bg-slate-50 hover:bg-slate-100/90 active:bg-slate-100 cursor-pointer flex items-center justify-between transition touch-manipulation"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{roomName}</span>
                        <span className="text-[10px] sm:text-[11px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                          {roomItems.length} {roomItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono">{formatINR(roomSubtotal)}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Room Items List */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {roomItems.map((item, idx) => (
                          <div key={idx} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs">
                            <div className="space-y-0.5 flex-1 pr-2">
                              <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.item_title}</div>
                              {item.material_spec && (
                                <div className="text-slate-500 text-[11px] leading-relaxed">{item.material_spec}</div>
                              )}
                              <div className="text-slate-600 text-[11px] font-mono pt-0.5">
                                {item.quantity?.toFixed(1)} {item.unit} × ₹{item.rate?.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono self-end sm:self-auto bg-slate-50 sm:bg-transparent px-2.5 sm:px-0 py-1 sm:py-0 rounded">
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

            {/* Pricing Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2 text-xs mt-5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800 font-mono">{formatINR(quoteData.subtotal)}</span>
              </div>
              {quoteData.discount_amount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Special Discount:</span>
                  <span className="font-semibold font-mono">- {formatINR(quoteData.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST ({quoteData.tax_percent}%):</span>
                <span className="font-semibold text-slate-800 font-mono">+ {formatINR(quoteData.tax_amount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
                <span className="text-sm sm:text-base font-bold text-slate-900 font-serif">Total Payable:</span>
                <span className="text-xl sm:text-2xl font-extrabold text-blue-600 font-mono">{formatINR(quoteData.total_amount)}</span>
              </div>
            </div>

            {/* Download Stamped PDF Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-800 mt-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-sm">Download Official Stamped PDF</span>
                </div>
                <p className="text-xs text-slate-300">
                  Save or print the complete luxury proposal with payment terms and signature blocks.
                </p>
              </div>
              <a
                href={pdfDownloadUrl}
                download={`${quoteData.quotation_number}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition touch-manipulation"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            </div>

            {/* Interactive Response Section */}
            <div className="mt-6 pt-5 border-t border-slate-200 pb-8">
              {submissionResult ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Response Transmitted to More Construction and Interior!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    {submissionResult.message || 'Thank you! Our design team has received your feedback and will get in touch shortly.'}
                  </p>

                  {/* AI Intelligence Feedback */}
                  {submissionResult.ai_analysis && (
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs space-y-2 mt-2">
                      <div className="flex items-center justify-between text-slate-700 font-semibold">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                          <Sparkles className="w-4 h-4" />
                          <span>Status:</span>
                        </span>
                        <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-bold text-[10px]">
                          {submissionResult.ai_analysis.sentiment}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Intent:</strong> {submissionResult.ai_analysis.detected_intent}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Summary:</strong> {submissionResult.ai_analysis.summary_for_admin}
                      </div>
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                        ⚡ Automated reminders paused. Our design consultant will follow up personally.
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href="https://wa.me/919999999999"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition touch-manipulation"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat with Designer on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                      How would you like to proceed?
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tap your response below to inform our team directly from your phone.
                    </p>
                  </div>

                  {/* 4 Large Touch Buttons (Mobile-First) */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Interested')}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 active:scale-95 border-2 border-emerald-400 rounded-2xl transition group text-center touch-manipulation min-h-[76px]"
                    >
                      <span className="text-xl mb-0.5">🟢</span>
                      <span className="text-xs font-bold text-emerald-950">Approve Proposal</span>
                      <span className="text-[10px] text-emerald-700">Looks great, let's start!</span>
                    </button>

                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Need Changes')}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 active:scale-95 border-2 border-amber-400 rounded-2xl transition group text-center touch-manipulation min-h-[76px]"
                    >
                      <span className="text-xl mb-0.5">🟡</span>
                      <span className="text-xs font-bold text-amber-950">Request Revision</span>
                      <span className="text-[10px] text-amber-700">Adjust items or price</span>
                    </button>

                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Need More Time')}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 active:scale-95 border-2 border-blue-400 rounded-2xl transition group text-center touch-manipulation min-h-[76px]"
                    >
                      <span className="text-xl mb-0.5">🔵</span>
                      <span className="text-xs font-bold text-blue-950">Need More Time</span>
                      <span className="text-[10px] text-blue-700">Reviewing proposal</span>
                    </button>

                    <button
                      disabled={submitting}
                      onClick={() => handleResponseSubmit('Not Interested')}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 active:scale-95 border-2 border-rose-400 rounded-2xl transition group text-center touch-manipulation min-h-[76px]"
                    >
                      <span className="text-xl mb-0.5">🔴</span>
                      <span className="text-xs font-bold text-rose-950">Decline Proposal</span>
                      <span className="text-[10px] text-rose-700">Not proceeding</span>
                    </button>
                  </div>

                  {/* Feedback Text Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Have specific notes, questions, or material requests? (Optional)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Looks good, can we reduce the kitchen laminate cost slightly or check veneer samples?"
                      value={clientComment}
                      onChange={(e) => setClientComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
