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
  ArrowRight
} from 'lucide-react';

export default function WhatsAppSimulator({ clients, quotations, onRefresh }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [inboundText, setInboundText] = useState('Quotation looks good, but kitchen price thoda reduce kar sakte ho?');
  const [simulationLog, setSimulationLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whatsappLogs, setWhatsappLogs] = useState([]);

  const sampleMessages = [
    {
      label: '💬 Negotiation (Price Discount)',
      text: 'Quotation looks good, but kitchen price thoda reduce kar sakte ho?'
    },
    {
      label: '✏️ Scope & Material Revision',
      text: 'Can you use a different laminate or acrylic in the kitchen and send revision?'
    },
    {
      label: '🎯 Deal Won / Finalize Deal',
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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <span>WhatsApp & AI Intelligence Studio</span>
            <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Simulator
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Simulate incoming WhatsApp replies from clients, watch AI classify intent, and verify auto-stopping of follow-up robots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Interactive Simulation Interface */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Simulate Client WhatsApp Response</span>
            </h3>

            {/* Select Client */}
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const c = clients.find(cl => cl.id === e.target.value);
                setSelectedClient(c);
              }}
              className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          {/* Quick Click Sample Messages */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Tap a realistic client scenario:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleMessages.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setInboundText(s.text)}
                  className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/80 active:bg-blue-100 border border-slate-200 hover:border-blue-300 rounded-xl transition text-xs group touch-manipulation"
                >
                  <div className="font-bold text-slate-800 group-hover:text-blue-700">{s.label}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">"{s.text}"</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Message text sent by {selectedClient?.name || 'Client'}:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                rows="2"
                value={inboundText}
                onChange={(e) => setInboundText(e.target.value)}
                className="flex-1 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-sans"
              ></textarea>
              <button
                onClick={handleSimulateInbound}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-2.5 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm touch-manipulation whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Simulating...' : 'Simulate Send'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simulationLog && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs sm:text-sm">AI Engine Detection & Response</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Processed
                </span>
              </div>

              {/* AI Classification Pills */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded-xl border border-white/10 text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Intent</div>
                  <div className="font-bold text-amber-300 text-[11px] truncate mt-0.5">{simulationLog.ai_analysis?.detected_intent}</div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10 text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Sentiment</div>
                  <div className="font-bold text-emerald-300 text-[11px] truncate mt-0.5">{simulationLog.ai_analysis?.sentiment}</div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10 text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Interest</div>
                  <div className="font-bold text-blue-300 text-[11px] truncate mt-0.5">{simulationLog.ai_analysis?.interest_level}</div>
                </div>
              </div>

              {/* Admin Push Alert */}
              <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-300 text-[11px]">🔔 Push Alert for Admin:</div>
                <div className="text-white text-[11px] sm:text-xs font-medium">{simulationLog.ai_analysis?.summary_for_admin}</div>
              </div>

              {/* Suggested Action */}
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-[11px] space-y-0.5">
                <div className="text-indigo-300 font-semibold">💡 Recommended Strategic Action:</div>
                <div className="text-slate-200">{simulationLog.ai_analysis?.suggested_action}</div>
              </div>

              {/* Auto Cancellation Confirmation */}
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{simulationLog.action_taken}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: WhatsApp History Stream */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>WhatsApp Log Stream</span>
              </h3>
              <span className="text-[11px] text-slate-400">{whatsappLogs.length} Messages</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {whatsappLogs.map((log) => {
                const isInbound = log.message_type === 'Inbound Response';

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      isInbound
                        ? 'bg-slate-100 text-slate-800 ml-4 rounded-tr-none'
                        : 'bg-emerald-50 text-emerald-950 mr-4 rounded-tl-none border border-emerald-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span className="font-bold text-slate-700">{log.client_name || log.recipient_phone}</span>
                      <span>{log.message_type}</span>
                    </div>

                    <p className="whitespace-pre-wrap font-sans text-[11px] sm:text-xs">{log.message_body}</p>

                    <div className="flex justify-end text-[9px] text-slate-400">
                      <span>{log.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400">
              Compatible with WhatsApp Business Cloud API & Webhooks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
