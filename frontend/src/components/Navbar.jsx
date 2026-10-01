import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  Layers, 
  FileText, 
  CalendarClock, 
  MessageSquareCode,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  Building,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  dueFollowupsCount, 
  openPortalModal,
  tenant,
  user,
  onOpenStudioSettings
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects & BOQ', icon: Home },
    { id: 'materials', label: 'Materials', icon: Layers },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { 
      id: 'followups', 
      label: 'Follow-ups', 
      icon: CalendarClock,
      badge: dueFollowupsCount > 0 ? dueFollowupsCount : null
    },
    { id: 'whatsapp_ai', label: 'WhatsApp & AI', icon: MessageSquareCode, isSpecial: true },
  ];

  // Mobile bottom tab bar items (Top 5 essential tabs for iPhone 15)
  const mobileBottomTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Home },
    { id: 'quotations', label: 'Quotes', icon: FileText },
    { 
      id: 'followups', 
      label: 'CRM', 
      icon: CalendarClock,
      badge: dueFollowupsCount > 0 ? dueFollowupsCount : null
    },
    { id: 'whatsapp_ai', label: 'AI Hub', icon: MessageSquareCode, isSpecial: true },
  ];

  const studioName = tenant?.name || 'More Construction and Interior';
  const studioInitials = studioName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'MC';

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-[#090d16]/95 backdrop-blur-2xl text-white sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.6)] border-b border-amber-500/20 safe-pt">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div 
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer touch-manipulation group" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-slate-950 shadow-[0_0_20px_rgba(217,119,6,0.35)] ring-1 ring-amber-300/60 text-xs sm:text-sm shrink-0 tracking-wider font-display">
                {studioInitials}
              </div>
              <div>
                <div className="font-serif font-bold text-base sm:text-lg tracking-wide text-amber-50 flex items-center gap-2">
                  <span className="truncate max-w-[140px] sm:max-w-[220px]">{studioName}</span>
                  <span className="text-[10px] sm:text-xs bg-amber-400/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-semibold tracking-wider shrink-0">
                    {tenant?.plan || 'PRO'}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-amber-200/60 hidden xs:block truncate tracking-wider uppercase font-medium">
                  Bespoke Architectural & Interior ERP
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(217,119,6,0.15)]'
                        : 'text-slate-300 hover:text-amber-200 hover:bg-[#131b2e]/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Actions on Top Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Studio Settings Button */}
              <button
                onClick={onOpenStudioSettings}
                className="flex items-center gap-1.5 bg-[#131b2e] hover:bg-[#1a253c] active:scale-95 text-amber-200/90 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl border border-amber-500/30 transition shadow-sm touch-manipulation"
                title="Studio Profile, GSTIN & Bank Info"
              >
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Studio Profile</span>
              </button>

              {/* Quick Client Portal Button */}
              <button
                onClick={openPortalModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-extrabold px-2.5 sm:px-3.5 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.25)] border border-amber-300/50 touch-manipulation"
                title="Open Client Portal View"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                <span className="text-[11px] sm:text-xs">Client Portal</span>
              </button>

              {/* Hamburger Button for Mobile / Tablet */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-amber-200 hover:text-white hover:bg-[#131b2e] rounded-xl transition active:scale-90 touch-manipulation border border-amber-500/20"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Full Slide-down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#090d16] border-b border-amber-500/20 px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-left transition ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-xs'
                        : 'bg-[#131b2e]/60 text-slate-300 hover:bg-[#131b2e] hover:text-amber-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Studio Profile Button */}
            <div className="pt-2 border-t border-amber-500/20">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenStudioSettings();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#131b2e] text-amber-200 text-xs font-bold border border-amber-500/20"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Studio Profile & Bank Details</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">Edit</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* iPhone 15 Native-style Bottom Navigation Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-t border-amber-500/20 px-2 py-1 safe-pb shadow-[0_-4px_25px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-around">
          {mobileBottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative touch-manipulation min-w-[56px] ${
                  isActive
                    ? 'text-amber-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-amber-200 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1 rounded-full animate-pulse shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  {item.isSpecial && !item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
