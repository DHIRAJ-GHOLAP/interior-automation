import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Bot, 
  User, 
  PhoneCall, 
  CornerDownLeft,
  Flame,
  ArrowRight,
  Crown
} from 'lucide-react';

export default function WhatsAppSimulator({ clients, quotations, onRefresh }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [inboundText, setInboundText] = useState('Quotation looks good, but kitchen price thoda reduce kar sakte ho?');
  const [simulationLog, setSimulationLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whatsappLogs, setWhatsappLogs] = useState([]);

  const sampleMessages = [
    {
      label: '💬 Negotiation (Price Adjustment)',
      text: 'Quotation looks good, but kitchen price thoda reduce kar sakte ho?'
    },
    {
      label: '✏️ Scope & Material Revision',
      text: 'Can you use a different laminate or acrylic in the kitchen and send revision?'
    },
    {
      label: '🎯 Deal Won / Advance Ready',
      text: 'Quotation looks great! We want to finalize and give advance payment tomorrow.'
    },
    {
      label: '📅 Site Visit / Meeting',
      text: 'Can you meet us at the flat on Saturday to check material samples?'
    },
    {
      label: '🔴 Decline / High Budget',
      text: 'Sorry, this is out of our current budget so we will postpone for now.'
    }
  ];

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/whatsapp/logs');
      const data = await res.json();
      setWhatsappLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (clients && clients.length > 0) {
      setSelectedClient(clients[0]);
    }
  }, [clients]);

  const handleSimulateInbound = async () => {
    if (!inboundText.trim() || !selectedClient) return;
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedClient.phone,
          message: inboundText
        })
      });
      const data = await res.json();
      setSimulationLog(data);
      fetchLogs();
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2.5 tracking-tight font-serif">
            <span>WhatsApp & AI Intelligence Studio</span>
            <span className="text-[10px] sm:text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold px-2.5 py-0.5 rounded-full">
              Simulator
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulate incoming WhatsApp homeowner replies, observe AI semantic intent classification, and verify automated follow-up disarming
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Interactive Simulation Interface */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <h3 className="font-bold text-slate-100 text-xs sm:text-sm font-serif flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Simulate Client WhatsApp Inbound</span>
            </h3>

            {/* Select Client */}
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const c = clients.find(cl => cl.id === e.target.value);
                setSelectedClient(c);
              }}
              className="text-xs bg-slate-950 border border-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          {/* Quick Click Sample Messages */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 font-serif">
              Select realistic homeowner scenarios:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sampleMessages.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setInboundText(s.text)}
                  className="p-3 text-left bg-slate-950/80 hover:bg-slate-950 active:bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition text-xs group touch-manipulation shadow-sm"
                >
                  <div className="font-bold text-slate-200 group-hover:text-amber-300 transition">{s.label}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">"{s.text}"</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Message text simulated from {selectedClient?.name || 'Client'}:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <textarea
                rows="2"
                value={inboundText}
                onChange={(e) => setInboundText(e.target.value)}
                className="flex-1 p-3 text-xs bg-slate-950 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-sans"
              ></textarea>
              <button
                onClick={handleSimulateInbound}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white py-2.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/30 touch-manipulation whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Simulating...' : 'Simulate Send'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simulationLog && (
            <div className="bg-slate-950/90 border border-amber-500/30 text-white rounded-3xl p-5 space-y-3.5 shadow-2xl animate-in fade-in duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-serif font-bold text-xs sm:text-sm text-slate-100">AI Intent Detection & Disarm Engine</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                  Processed
                </span>
              </div>

              {/* AI Classification Pills */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Intent</div>
                  <div className="font-bold text-amber-300 text-[11px] truncate mt-0.5">{simulationLog.ai_analysis?.detected_intent}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Sentiment</div>
                  <div className="font-bold text-emerald-300 text-[11px] truncate mt-0.5">{simulationLog.ai_analysis?.sentiment}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Interest</div>
                  <div className="font-bold text-blue-300 text-[11px] truncate mt-0.5">{simulationLog.ai_analysis?.interest_level}</div>
                </div>
              </div>

              {/* Admin Push Alert */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-amber-300 text-[11px] font-serif">🔔 Executive Push Alert:</div>
                <div className="text-slate-200 text-[11px] sm:text-xs font-medium">{simulationLog.ai_analysis?.summary_for_admin}</div>
              </div>

              {/* Suggested Action */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-[11px] space-y-0.5">
                <div className="text-amber-300 font-semibold font-serif">💡 Recommended Strategic Move:</div>
                <div className="text-slate-300">{simulationLog.ai_analysis?.suggested_action}</div>
              </div>

              {/* Auto Cancellation Confirmation */}
              <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{simulationLog.action_taken}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: WhatsApp History Stream */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-amber-500/25 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-bold text-slate-100 text-xs sm:text-sm font-serif flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>WhatsApp Log Stream</span>
              </h3>
              <span className="text-[11px] font-mono text-amber-400/80">{whatsappLogs.length} Messages</span>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {whatsappLogs.map((log) => {
                const isInbound = log.message_type === 'Inbound Response';

                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                      isInbound
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 ml-4 rounded-tr-none'
                        : 'bg-emerald-950/50 text-emerald-200 mr-4 rounded-tl-none border border-emerald-500/30 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span className="font-bold text-slate-300 font-serif">{log.client_name || log.recipient_phone}</span>
                      <span className="font-mono text-amber-400/80">{log.message_type}</span>
                    </div>

                    <p className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">{log.message_body}</p>

                    <div className="flex justify-end text-[9px] text-slate-500 font-mono">
                      <span>{log.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Synchronized with WhatsApp Cloud API Webhooks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
