import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LabLayout — Persistent layout shell for Diagnostic Laboratory Workstation.
 * Matches SwasthyaSetu design system with Signal Blue #3B7A9E as dominant lab accent,
 * Soft Sage #E7F3EF, Ink Slate #1C2B2A, and Warm Fog #F7F6F3 background.
 * Legible text sizes (text-xs / text-sm) for workstation scannability.
 */
export default function LabLayout({ children, activeTab = 'dashboard', setActiveTab }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, type: 'order', title: 'STAT Order Received', desc: 'Urgent Trop-I & 12-Lead ECG ordered by Dr. A. Sharma for Amit Patel (AB-7721-8890-3341)', time: '5m ago', unread: true },
    { id: 2, type: 'sample', title: 'Sample Barcode Scanned', desc: 'Blood sample received for Lipid Profile (Order #LAB-ORD-9021)', time: '25m ago', unread: true },
    { id: 3, type: 'system', title: 'NABL Quality Control', desc: 'Daily analyzer calibration verified successfully', time: '2h ago', unread: false },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'incoming-orders', label: 'Incoming Orders', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ), badge: '5 Pending' },
    { id: 'report-upload', label: 'Report Upload', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    )},
    { id: 'report-history', label: 'Report History', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.605 15.13a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )},
    { id: 'notifications', label: 'Notifications', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ), badge: '2 New' },
    { id: 'profile', label: 'Lab Profile', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1C2B2A] font-body flex flex-col md:flex-row">
      
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-white border-b border-[#1C2B2A]/10 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#3B7A9E]/10 border border-[#3B7A9E]/30 flex items-center justify-center p-1.5 text-[#3B7A9E]">
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current" strokeWidth="2.2">
              <circle cx="7" cy="16" r="3.5" className="stroke-[#1C2B2A]/50" />
              <path d="M16 11L20 16L16 21L12 16Z" className="fill-[#1C2B2A]/10 stroke-[#1C2B2A]/70" />
              <polygon points="25,12.5 28.5,19.5 21.5,19.5" className="fill-[#3B7A9E] stroke-[#3B7A9E]" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-[#1C2B2A]">SwasthyaSetu</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded hover:bg-[#E7F3EF] text-[#1C2B2A] focus:outline-none focus:ring-2 focus:ring-[#3B7A9E]"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* PERSISTENT LEFT SIDEBAR */}
      <aside 
        className={`w-full md:w-64 bg-white border-r border-[#1C2B2A]/10 flex flex-col justify-between shrink-0 transition-all duration-200 z-20 ${
          mobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-4 sm:p-5">
          {/* SIDEBAR HEADER / BRANDING */}
          <div className="flex items-center gap-3 pb-5 mb-4 border-b border-[#1C2B2A]/10">
            <div className="w-10 h-10 rounded bg-[#3B7A9E]/10 border border-[#3B7A9E]/30 flex items-center justify-center p-2 text-[#3B7A9E] shrink-0">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="16" r="3.5" className="stroke-[#1C2B2A]/50" />
                <path d="M16 11L20 16L16 21L12 16Z" className="fill-[#1C2B2A]/10 stroke-[#1C2B2A]/70" />
                <polygon points="25,12.5 28.5,19.5 21.5,19.5" className="fill-[#3B7A9E] stroke-[#3B7A9E]" />
                <line x1="10.5" y1="16" x2="12" y2="16" />
                <line x1="20" y1="16" x2="21.5" y2="16" />
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-[#1C2B2A] block leading-none">
                SwasthyaSetu
              </span>
              <span className="font-mono text-xs text-[#3B7A9E] font-semibold uppercase tracking-wider block mt-1">
                Laboratory Workstation
              </span>
            </div>
          </div>

          {/* LABORATORY FACILITY ROLE TAG */}
          <div className="bg-[#3B7A9E]/10 border border-[#3B7A9E]/25 p-3 rounded-xl mb-5 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B7A9E] animate-pulse shrink-0"></span>
            <div className="overflow-hidden">
              <span className="font-display font-semibold text-xs text-[#1C2B2A] block truncate">
                Central Diagnostic Hub
              </span>
              <span className="font-mono text-xs text-[#3B7A9E] font-medium block truncate">
                NABL CODE: LAB-3021-SYS
              </span>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveTab) setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#3B7A9E] ${
                    isActive
                      ? 'bg-[#3B7A9E] text-white font-semibold shadow-sm'
                      : 'text-[#1C2B2A]/80 hover:bg-[#E7F3EF] hover:text-[#3B7A9E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-[#1C2B2A]/60'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.id === 'incoming-orders'
                          ? 'bg-[#3B7A9E]/15 text-[#3B7A9E]'
                          : 'bg-[#C9754A]/15 text-[#C9754A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER TELEMETRY & END SESSION */}
        <div className="p-4 border-t border-[#1C2B2A]/10 bg-[#F7F6F3]/50 space-y-3">
          <div className="font-mono text-xs text-[#1C2B2A]/70 space-y-1">
            <div className="flex justify-between">
              <span>NABL ACCREDITED:</span>
              <span className="text-[#3B7A9E] font-semibold">VERIFIED</span>
            </div>
            <div className="flex justify-between">
              <span>LAB TERMINAL:</span>
              <span>LAB-NORTH-02</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-3 bg-white border border-[#1C2B2A]/20 hover:bg-[#E7F3EF] hover:border-[#3B7A9E] text-[#1C2B2A] text-xs font-mono rounded-lg transition-all duration-150 active:scale-98 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B7A9E]"
          >
            <svg className="w-4 h-4 text-[#1C2B2A]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>End Workstation Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR / NAVIGATION TELEMETRY */}
        <header className="bg-white border-b border-[#1C2B2A]/10 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A] tracking-tight">
              Diagnostic Laboratory Terminal
            </h1>
            <span className="hidden sm:inline-block font-mono text-xs px-2.5 py-1 bg-[#3B7A9E]/10 text-[#3B7A9E] rounded-md font-semibold border border-[#3B7A9E]/20">
              NABL v2.6
            </span>
          </div>

          {/* RIGHT ACTIONS: NOTIFICATIONS BELL + QUICK LAB BADGE */}
          <div className="flex items-center gap-3">
            
            {/* NOTIFICATION BELL WITH DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-[#1C2B2A]/70 hover:bg-[#E7F3EF] hover:text-[#3B7A9E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B7A9E]"
                aria-label="View notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#C9754A] ring-2 ring-white"></span>
              </button>

              {/* NOTIFICATIONS POPOVER CARD */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#1C2B2A]/15 rounded-xl shadow-lg p-4 z-40 animate-entrance">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1C2B2A]/10">
                    <span className="font-display font-bold text-xs sm:text-sm text-[#1C2B2A] uppercase tracking-wider">
                      Laboratory Queue Alerts
                    </span>
                    <span className="font-mono text-xs text-[#3B7A9E] bg-[#3B7A9E]/10 px-2 py-0.5 rounded font-semibold">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-lg border text-xs sm:text-sm transition-colors ${
                          n.unread ? 'bg-[#3B7A9E]/10 border-[#3B7A9E]/30' : 'bg-[#F7F6F3] border-[#1C2B2A]/10'
                        }`}
                      >
                        <div className="flex justify-between font-semibold text-[#1C2B2A]">
                          <span>{n.title}</span>
                          <span className="font-mono text-xs text-[#1C2B2A]/50">{n.time}</span>
                        </div>
                        <p className="text-xs text-[#1C2B2A]/70 mt-1 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LAB FACILITY QUICK BADGE */}
            <div className="hidden sm:flex items-center gap-2.5 border-l border-[#1C2B2A]/10 pl-3">
              <div className="w-8 h-8 rounded-full bg-[#3B7A9E] text-white flex items-center justify-center font-display text-xs font-bold">
                LB
              </div>
              <div className="text-left leading-none">
                <span className="text-xs sm:text-sm font-semibold text-[#1C2B2A] block">Central Lab Hub</span>
                <span className="font-mono text-xs text-[#3B7A9E] block">NABL #3021</span>
              </div>
            </div>

          </div>
        </header>

        {/* MAIN BODY AREA (With ~200ms entrance animation) */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-entrance space-y-6">
          {children}
        </main>
      </div>

    </div>
  );
}
