import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Phone, 
  Clock, 
  AlertCircle, 
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';

export default function FollowUpsView({ onSwitchTab }) {
  const [followups, setFollowups] = useState([]);
  const [todayData, setTodayData] = useState({ due_today: [], upcoming: [] });
  const [loading, setLoading] = useState(false);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const [resAll, resToday] = await Promise.all([
        fetch('/api/followups'),
        fetch('/api/followups/today')
      ]);
      const dataAll = await resAll.json();
      const dataToday = await resToday.json();
      setFollowups(dataAll);
      setTodayData(dataToday);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleComplete = async (id) => {
    try {
      await fetch(`/api/followups/${id}/complete`, { method: 'POST' });
      fetchFollowups();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async (id) => {
    try {
      await fetch(`/api/followups/${id}/cancel`, { method: 'POST' });
      fetchFollowups();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight font-serif flex items-center gap-2">
            <span>Automated Client Follow-up CRM</span>
            <span className="text-[10px] sm:text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              Autonomous
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent 2-day / 5-day / 10-day touchpoints that automatically cease the moment the client responds
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-300 text-xs px-3.5 py-2 rounded-2xl border border-emerald-500/30 font-medium self-start sm:self-auto shadow-lg shadow-emerald-950/20">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Anti-Spam Protocol: Disarms instantly on reply</span>
        </div>
      </div>

      {/* Urgency Board: Red / Yellow / Green Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Due Today Card (Red Jewel) */}
        <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-5 shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Follow-ups Due Today
            </span>
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              {todayData.due_today?.length || 0}
            </span>
          </div>

          <div className="space-y-3 pt-1 relative z-10">
            {todayData.due_today && todayData.due_today.length > 0 ? (
              todayData.due_today.map((fu) => (
                <div key={fu.id} className="bg-slate-950/80 p-3.5 rounded-2xl border border-rose-500/30 shadow-md space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-100 text-xs sm:text-sm font-serif">{fu.client_name}</div>
                      <div className="text-[10px] text-amber-400/80 font-mono">
                        Quote #{fu.quotation_number} • ₹{fu.total_amount?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[9px] font-bold px-2 py-0.5 rounded">
                      Step #{fu.step_number}
                    </span>
                  </div>

                  {fu.notes && (
                    <div className="text-slate-300 text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 italic">
                      "{fu.notes}"
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">{fu.client_phone}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancel(fu.id)}
                        className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleComplete(fu.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white rounded-xl font-bold text-[11px] shadow-md shadow-rose-900/30 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-7 text-xs text-rose-300/80 font-medium">
                ✓ No overdue follow-ups pending today
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Ahead (Amber Jewel) */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Scheduled Ahead (Day 5 & 10)
            </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              {todayData.upcoming?.length || 0}
            </span>
          </div>

          <div className="space-y-3 pt-1 relative z-10">
            {todayData.upcoming && todayData.upcoming.length > 0 ? (
              todayData.upcoming.slice(0, 3).map((fu) => (
                <div key={fu.id} className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 shadow-md space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-100 text-xs sm:text-sm font-serif">{fu.client_name}</div>
                      <div className="text-[10px] text-amber-400/80 font-mono">Quote #{fu.quotation_number}</div>
                    </div>
                    <span className="bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded">
                      Step #{fu.step_number}
                    </span>
                  </div>

                  {fu.notes && (
                    <div className="text-slate-300 text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 italic">
                      "{fu.notes}"
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-7 text-xs text-amber-300/80 font-medium">
                No future steps currently queued
              </div>
            )}
          </div>
        </div>

        {/* Client Engaged & Active (Emerald Jewel) */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-5 shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Client Replied & Active
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              Live
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 pt-1 relative z-10">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 shadow-md space-y-1.5">
              <div className="font-bold text-slate-100 font-serif">Krutika Gholap</div>
              <div className="text-[10px] text-amber-400/80 font-mono">Kitchen Renovation • In Negotiation</div>
              <div className="text-emerald-300 text-[11px] font-medium pt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Client replied on portal. Auto-reminders disarmed.</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 shadow-md space-y-1.5">
              <div className="font-bold text-slate-100 font-serif">Sneha Patil</div>
              <div className="text-[10px] text-amber-400/80 font-mono">3BHK Turnkey Interior • Site visit planned</div>
              <div className="text-emerald-300 text-[11px] font-medium pt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Site consultation confirmed.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cadence Architecture Explanation Card */}
      <div className="bg-slate-900/80 rounded-3xl border border-amber-500/20 p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-widest font-serif flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Cadence Architecture & Auto-Cancellation Protocol</span>
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400 font-serif text-xs">Day 0: Proposal Transmitted</div>
            <p className="text-slate-400 text-[11px]">Interactive portal link & official stamped PDF delivered to client via WhatsApp.</p>
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200 font-serif text-xs">+2 Days: Soft Check-in</div>
            <p className="text-slate-400 text-[11px]">Polite reminder to ensure estimate receipt and clarify preliminary scope questions.</p>
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200 font-serif text-xs">+5 Days: Material Consult</div>
            <p className="text-slate-400 text-[11px]">Offer to dispatch physical laminate catalogs and schedule on-site consultation.</p>
          </div>
          <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 space-y-1">
            <div className="font-bold text-emerald-400 font-serif text-xs">Zero-Spam Intercept</div>
            <p className="text-emerald-300/80 text-[11px]">The instant homeowner selects any response or sends a WhatsApp text, all queued reminders cancel automatically.</p>
          </div>
        </div>
      </div>

      {/* Complete Follow-up Schedule Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-amber-500/25 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-xs sm:text-sm font-serif">Follow-up Pipeline Log</h3>
          <span className="text-[11px] font-mono text-amber-400/80">{followups.length} Registered Touchpoints</span>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-800">
          {followups.map((fu) => (
            <div key={fu.id} className="p-4 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-100 font-serif">{fu.client_name}</div>
                  <div className="text-[10px] text-amber-400/80 font-mono">Quote #{fu.quotation_number} • Step #{fu.step_number}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                  fu.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : fu.status === 'Cancelled'
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {fu.status}
                </span>
              </div>

              {fu.notes && (
                <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 italic">
                  "{fu.notes}"
                </div>
              )}

              {fu.status === 'Pending' && (
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCancel(fu.id)}
                    className="px-3 py-1 text-[11px] text-slate-400 hover:text-rose-400 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleComplete(fu.id)}
                    className="px-3.5 py-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition"
                  >
                    Mark Done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-amber-400/80 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Client</th>
                <th className="py-3 px-5">Quote Reference</th>
                <th className="py-3 px-5">Step</th>
                <th className="py-3 px-5">Channel</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Schedule Notes</th>
                <th className="py-3 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {followups.map((fu) => (
                <tr key={fu.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-5">
                    <div className="font-bold text-slate-100 font-serif">{fu.client_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{fu.client_phone}</div>
                  </td>
                  <td className="py-3 px-5 font-mono text-amber-400 font-medium">
                    {fu.quotation_number}
                  </td>
                  <td className="py-3 px-5 font-semibold text-slate-200">
                    Step #{fu.step_number}
                  </td>
                  <td className="py-3 px-5 text-slate-300 font-medium">
                    {fu.channel}
                  </td>
                  <td className="py-3 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      fu.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : fu.status === 'Cancelled'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {fu.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-400 text-[11px] max-w-xs truncate">
                    {fu.notes || '—'}
                  </td>
                  <td className="py-3 px-5 text-center">
                    {fu.status === 'Pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleComplete(fu.id)}
                          className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-xl font-semibold transition"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancel(fu.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
