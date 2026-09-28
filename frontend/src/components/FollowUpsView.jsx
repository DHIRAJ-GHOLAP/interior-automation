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
  MessageSquare
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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Follow-up Automation CRM</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Automated 2-day / 5-day / 10-day cadence that automatically stops when the client responds</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs px-3 py-1.5 rounded-xl border border-emerald-200 font-medium self-start sm:self-auto">
          <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Anti-Spam: Stops upon client reply</span>
        </div>
      </div>

      {/* Urgency Board: Section 18 from Prompt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Due Today Card (Red) */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              🔴 Follow-ups Due Today
            </span>
            <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {todayData.due_today?.length || 0}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {todayData.due_today && todayData.due_today.length > 0 ? (
              todayData.due_today.map((fu) => (
                <div key={fu.id} className="bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{fu.client_name}</div>
                      <div className="text-[10px] text-slate-500">Quote #{fu.quotation_number} • ₹{fu.total_amount?.toLocaleString('en-IN')}</div>
                    </div>
                    <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Step #{fu.step_number}
                    </span>
                  </div>

                  {fu.notes && (
                    <div className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg italic">
                      "{fu.notes}"
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">{fu.client_phone}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCancel(fu.id)}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600 transition touch-manipulation"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleComplete(fu.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg font-bold text-[11px] shadow-xs touch-manipulation"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-rose-700 font-medium">
                🎉 No overdue follow-ups today!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming (Yellow) */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              🟡 Scheduled Ahead (Day 5 & 10)
            </span>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {todayData.upcoming?.length || 0}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {todayData.upcoming && todayData.upcoming.length > 0 ? (
              todayData.upcoming.slice(0, 3).map((fu) => (
                <div key={fu.id} className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs space-y-1.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{fu.client_name}</div>
                      <div className="text-[10px] text-slate-500">Quote #{fu.quotation_number}</div>
                    </div>
                    <span className="bg-amber-50 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Step #{fu.step_number}
                    </span>
                  </div>
                  {fu.notes && (
                    <div className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg italic">
                      "{fu.notes}"
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-amber-800 font-medium">
                No future steps scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Responded & Won (Green) */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              🟢 Responded / Meeting Active
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-700 pt-1">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs space-y-1">
              <div className="font-bold text-slate-900">Amit Shah</div>
              <div className="text-[10px] text-slate-500">Office Fitout • In Negotiation</div>
              <div className="text-emerald-700 text-[11px] font-medium pt-0.5">
                💬 Client replied on WhatsApp. Automation was halted.
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs space-y-1">
              <div className="font-bold text-slate-900">Sneha Patil</div>
              <div className="text-[10px] text-slate-500">3BHK Renovation • Site consultation set</div>
              <div className="text-emerald-700 text-[11px] font-medium pt-0.5">
                📅 Site visit scheduled.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cadence Architecture Explanation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">Cadence Rules & Auto-Cancellation Logic</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-blue-600 mb-0.5 text-xs">Day 0: Proposal Sent</div>
            <p className="text-slate-600 text-[10px] sm:text-[11px]">Official quotation link + PDF delivered via WhatsApp Business.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-0.5 text-xs">+2 Days: Step #1 Check-in</div>
            <p className="text-slate-600 text-[10px] sm:text-[11px]">Soft inquiry: "Did you get a chance to review the layout?"</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-0.5 text-xs">+5 Days: Step #2 Consult</div>
            <p className="text-slate-600 text-[10px] sm:text-[11px]">Material sampling: "Can we drop by with laminate catalogues?"</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="font-bold text-emerald-800 mb-0.5 text-xs">Response Auto-Stop</div>
            <p className="text-emerald-700 text-[10px] sm:text-[11px]">The moment client clicks any portal button or sends a text, all remaining steps cancel immediately.</p>
          </div>
        </div>
      </div>

      {/* Follow-ups Mobile Card List & Desktop Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Follow-up Log & Schedule</h3>
          <span className="text-[11px] text-slate-500">{followups.length} Records</span>
        </div>

        {/* Mobile Cards (iPhone 15 Optimized) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {followups.map((fu) => (
            <div key={fu.id} className="p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900">{fu.client_name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Quote #{fu.quotation_number} • Step #{fu.step_number}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  fu.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : fu.status === 'Cancelled'
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {fu.status}
                </span>
              </div>

              {fu.notes && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                  "{fu.notes}"
                </div>
              )}

              {fu.status === 'Pending' && (
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCancel(fu.id)}
                    className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-rose-600 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleComplete(fu.id)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                  >
                    Mark Done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tablet & Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Step</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes / Trigger</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {followups.map((fu) => (
                <tr key={fu.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{fu.client_name}</div>
                    <div className="text-[11px] text-slate-500">{fu.client_phone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-blue-600">
                    {fu.quotation_number}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    Step #{fu.step_number}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {fu.channel}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fu.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : fu.status === 'Cancelled'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {fu.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {fu.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {fu.status === 'Pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleComplete(fu.id)}
                          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded font-semibold transition"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancel(fu.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
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
