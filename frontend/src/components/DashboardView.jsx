import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  Clock, 
  IndianRupee, 
  ArrowUpRight, 
  MessageCircle,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';

export default function DashboardView({ analytics, followupsDue, onSelectQuotation, onSwitchTab }) {
  const kpis = analytics?.kpis || {
    quotes_created: 0,
    quotes_sent: 0,
    client_responses: 0,
    interested: 0,
    negotiations: 0,
    projects_won: 0,
    total_quotation_value: 0,
    won_projects_value: 0,
    internal_cost: 0,
    gross_margin: 0,
    average_margin_percent: 0,
    pending_followups: 0
  };

  const pipeline = analytics?.pipeline || {
    new: 0,
    measurement: 0,
    draft: 0,
    sent: 0,
    negotiation: 0,
    won: 0
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner: Urgency & Action */}
      {followupsDue && followupsDue.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-400/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-[0_4px_25px_rgba(217,119,6,0.12)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold rounded-2xl shadow-[0_0_15px_rgba(217,119,6,0.35)] shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
                Attention Required: {followupsDue.length} Client Follow-ups Due Today
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                Luxury interior prospects convert 68% faster when engaged within 48 hours of proposal delivery.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSwitchTab('followups')}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap touch-manipulation"
          >
            Review Cadence &rarr;
          </button>
        </div>
      )}

      {/* Main KPI Row: 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Quotations Value */}
        <div className="bg-gradient-to-br from-white via-amber-50/15 to-white p-4 sm:p-5 rounded-3xl border border-amber-500/25 shadow-[0_4px_20px_rgba(217,119,6,0.06)] hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(217,119,6,0.12)] transition duration-200">
          <div className="flex items-center justify-between text-amber-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-display">
            <span>Portfolio Value</span>
            <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-serif font-extrabold text-slate-900 truncate tracking-tight">{formatINR(kpis.total_quotation_value)}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
            <strong className="text-amber-600 font-semibold">{kpis.quotes_created}</strong> Proposals Issued
          </div>
        </div>

        {/* Projects Won */}
        <div className="bg-gradient-to-br from-white via-emerald-50/15 to-white p-4 sm:p-5 rounded-3xl border border-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] transition duration-200">
          <div className="flex items-center justify-between text-emerald-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-display">
            <span>Contracts Locked</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-serif font-extrabold text-emerald-600 truncate tracking-tight">{formatINR(kpis.won_projects_value)}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
            <strong className="text-emerald-700 font-semibold">{kpis.projects_won}</strong> Turnkey Wins 🎯
          </div>
        </div>

        {/* Gross Margin */}
        <div className="bg-gradient-to-br from-white via-indigo-50/15 to-white p-4 sm:p-5 rounded-3xl border border-indigo-500/25 shadow-[0_4px_20px_rgba(99,102,241,0.06)] hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] transition duration-200">
          <div className="flex items-center justify-between text-indigo-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-display">
            <span>Gross Margin</span>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-serif font-extrabold text-indigo-700 truncate tracking-tight">{formatINR(kpis.gross_margin)}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
            Avg Yield: <strong className="text-indigo-800 font-bold">{kpis.average_margin_percent}%</strong>
          </div>
        </div>

        {/* AI & Client Engagement */}
        <div className="bg-gradient-to-br from-white via-purple-50/15 to-white p-4 sm:p-5 rounded-3xl border border-purple-500/25 shadow-[0_4px_20px_rgba(168,85,247,0.06)] hover:border-purple-500/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)] transition duration-200">
          <div className="flex items-center justify-between text-purple-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-display">
            <span>Engagement</span>
            <div className="p-1.5 bg-purple-500/10 text-purple-600 rounded-xl border border-purple-500/20">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-serif font-extrabold text-purple-700">{kpis.client_responses}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
            <strong className="text-emerald-600 font-semibold">{kpis.interested}</strong> Ready • <strong className="text-amber-600 font-semibold">{kpis.negotiations}</strong> Revise
          </div>
        </div>
      </div>

      {/* Pipeline Funnel & Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Visual Pipeline Funnel */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-3xl border border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">Quotation & EPC Sales Pipeline</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Real-time progression from site survey to locked execution</p>
            </div>
            <span className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-500/20 font-mono">
              {currentMonthYear}
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>1. Leads & Measurements</span>
                <span>{pipeline.new + pipeline.measurement} Projects</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 sm:h-3 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>2. Quotes Sent</span>
                <span>{kpis.quotes_sent} Sent</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 sm:h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((kpis.quotes_sent / Math.max(kpis.quotes_created, 1)) * 100))}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>3. Client Responses</span>
                <span>{kpis.client_responses} Engaged</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 sm:h-3 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((kpis.client_responses / Math.max(kpis.quotes_sent, 1)) * 100))}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>4. In Active Negotiation</span>
                <span>{kpis.negotiations} Negotiation</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 sm:h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((kpis.negotiations / Math.max(kpis.quotes_sent, 1)) * 100))}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-emerald-800 mb-1">
                <span>5. Projects Won</span>
                <span className="font-bold">{kpis.projects_won} Locked 🎯</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((kpis.projects_won / Math.max(kpis.quotes_created, 1)) * 100))}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Quotes</div>
              <div className="text-xs sm:text-base font-bold text-slate-800 truncate">{formatINR(kpis.total_quotation_value)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Won Revenue</div>
              <div className="text-xs sm:text-base font-bold text-emerald-600 truncate">{formatINR(kpis.won_projects_value)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Margin</div>
              <div className="text-xs sm:text-base font-bold text-indigo-600">{kpis.average_margin_percent}%</div>
            </div>
          </div>
        </div>

        {/* Recent Client Activity & AI Intent Feed */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-amber-500/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">AI Response Intelligence</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5">
              {analytics?.recent_responses && analytics.recent_responses.length > 0 ? (
                analytics.recent_responses.map((resp, i) => (
                  <div key={i} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs space-y-1 hover:border-amber-500/30 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{resp.client_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        resp.response_type === 'Interested' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : resp.response_type === 'Need Changes'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {resp.response_type}
                      </span>
                    </div>
                    {resp.comments && (
                      <p className="text-slate-600 italic text-[11px]">"{resp.comments}"</p>
                    )}
                    <div className="text-[10px] text-indigo-700 font-semibold pt-0.5 flex items-center gap-1">
                      <span>🤖 Intent:</span>
                      <span className="font-mono text-indigo-800">{resp.intent}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No responses logged yet. Test in Client Portal!
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <button
              onClick={() => onSwitchTab('whatsapp_ai')}
              className="w-full text-xs font-bold text-center text-amber-700 hover:text-amber-800 py-1.5 rounded-xl hover:bg-amber-50/50 transition touch-manipulation flex items-center justify-center gap-1.5"
            >
              <span>Explore WhatsApp AI Engine</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
