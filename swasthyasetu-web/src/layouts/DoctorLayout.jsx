import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * DoctorLayout — Persistent layout shell for Doctor Workstation.
 * Matches SwasthyaSetu design system: Deep Teal #0F6E5C accent, Warm Fog #F7F6F3 background, Ink Slate #1C2B2A text.
 * Uses React Router Outlet for sub-route rendering and NavLink for active tab navigation.
 */
export default function DoctorLayout({ children }) {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, type: 'lab', title: 'Lab Report Ready', desc: 'Lipid Profile ready for Rajesh Kumar (AB-9823-4011-9022)', time: '10m ago', unread: true },
    { id: 2, type: 'alert', title: 'Critical Alert Resolved', desc: 'Potassium level updated for Priya Sharma', time: '1h ago', unread: true },
    { id: 3, type: 'system', title: 'ABDM Sync Complete', desc: '14 e-prescriptions synced with Gateway-North', time: '3h ago', unread: false },
  ];

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/doctor/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'patients', 
      label: 'Patient Search', 
      path: '/doctor/patients',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      id: 'consultations', 
      label: 'Consultations', 
      path: '/doctor/consultations',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'lab-orders', 
      label: 'Lab Orders', 
      path: '/doctor/lab-orders',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.605 15.13a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ), 
      badge: '8 Ready' 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      path: '/doctor/notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ), 
      badge: '2 New' 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      path: '/doctor/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1C2B2A] font-body flex flex-col md:flex-row">
      
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-white border-b border-[#1C2B2A]/10 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-[#1C2B2A]/5 border border-[#1C2B2A]/15 flex items-center justify-center p-1.5 text-[#0F6E5C]">
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current" strokeWidth="2.2">
              <circle cx="7" cy="16" r="3.5" className="fill-[#0F6E5C] stroke-[#0F6E5C]" />
              <path d="M16 11L20 16L16 21L12 16Z" className="fill-[#1C2B2A]/10 stroke-[#1C2B2A]/70" />
              <polygon points="25,12.5 28.5,19.5 21.5,19.5" className="stroke-[#1C2B2A]/50" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-[#1C2B2A]">SwasthyaSetu</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-[#E7F3EF] text-[#1C2B2A] focus:outline-none focus:ring-2 focus:ring-[#0F6E5C]"
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
            <div className="w-10 h-10 rounded bg-[#1C2B2A]/5 border border-[#1C2B2A]/15 flex items-center justify-center p-2 text-[#0F6E5C] shrink-0">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="16" r="3.5" className="fill-[#0F6E5C] stroke-[#0F6E5C]" />
                <path d="M16 11L20 16L16 21L12 16Z" className="fill-[#1C2B2A]/10 stroke-[#1C2B2A]/70" />
                <polygon points="25,12.5 28.5,19.5 21.5,19.5" className="stroke-[#1C2B2A]/50" />
                <line x1="10.5" y1="16" x2="12" y2="16" />
                <line x1="20" y1="16" x2="21.5" y2="16" />
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-[#1C2B2A] block leading-none">
                SwasthyaSetu
              </span>
              <span className="font-mono text-xs text-[#0F6E5C] font-semibold uppercase tracking-wider block mt-1">
                Doctor Workstation
              </span>
            </div>
          </div>

          {/* DOCTOR ROLE TAG */}
          <div className="bg-[#E7F3EF] border border-[#0F6E5C]/20 p-3 rounded-lg mb-5 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E5C] animate-pulse shrink-0"></span>
            <div className="overflow-hidden">
              <span className="font-display font-semibold text-sm text-[#1C2B2A] block truncate animate-fade-in">
                {profile?.full_name || 'Dr. Ananya Sharma'}
              </span>
              <span className="font-mono text-xs text-[#1C2B2A]/70 block truncate">
                {profile?.specialization || 'Cardiology'} • REG: {profile?.registration_number || 'DOC-8841-IN'}
              </span>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C] ${
                    isActive
                      ? 'bg-[#0F6E5C] text-white font-semibold shadow-sm'
                      : 'text-[#1C2B2A]/80 hover:bg-[#E7F3EF] hover:text-[#0F6E5C]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-white' : 'text-[#1C2B2A]/60'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.id === 'lab-orders'
                            ? 'bg-[#3B7A9E]/15 text-[#3B7A9E]'
                            : 'bg-[#C9754A]/15 text-[#C9754A]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* SIDEBAR FOOTER TELEMETRY & END SESSION */}
        <div className="p-4 border-t border-[#1C2B2A]/10 bg-[#F7F6F3]/50 space-y-3">
          <div className="font-mono text-xs text-[#1C2B2A]/60 space-y-1">
            <div className="flex justify-between">
              <span>ABDM GATEWAY:</span>
              <span className="text-[#0F6E5C] font-semibold">CONNECTED</span>
            </div>
            <div className="flex justify-between">
              <span>TERMINAL ID:</span>
              <span>ND-PHYS-04</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 px-3 bg-white border border-[#1C2B2A]/20 hover:bg-[#E7F3EF] hover:border-[#0F6E5C] text-[#1C2B2A] text-sm font-mono font-medium rounded-lg transition-all duration-150 active:scale-98 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C]"
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
        <header className="bg-white border-b border-[#1C2B2A]/10 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#1C2B2A] tracking-tight">
              Physician Workstation
            </h1>
            <span className="hidden sm:inline-block font-mono text-xs sm:text-sm px-3 py-1 bg-[#E7F3EF] text-[#0F6E5C] rounded font-semibold border border-[#0F6E5C]/20">
              CLINICAL V2.6
            </span>
          </div>

          {/* RIGHT ACTIONS: NOTIFICATIONS BELL + QUICK DOCTOR BADGE */}
          <div className="flex items-center gap-4">
            
            {/* NOTIFICATION BELL WITH DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-lg text-[#1C2B2A]/70 hover:bg-[#E7F3EF] hover:text-[#0F6E5C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F6E5C]"
                aria-label="View notifications"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#C9754A] ring-2 ring-white"></span>
              </button>

              {/* NOTIFICATIONS POPOVER CARD */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#1C2B2A]/15 rounded-xl shadow-lg p-4 z-40 animate-entrance">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1C2B2A]/10">
                    <span className="font-display font-bold text-sm text-[#1C2B2A] uppercase tracking-wider">
                      Clinical Alerts &amp; Notifications
                    </span>
                    <span className="font-mono text-xs text-[#0F6E5C] bg-[#E7F3EF] px-2 py-0.5 rounded font-semibold">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          n.unread ? 'bg-[#E7F3EF]/40 border-[#0F6E5C]/30' : 'bg-[#F7F6F3] border-[#1C2B2A]/10'
                        }`}
                      >
                        <div className="flex justify-between font-semibold text-[#1C2B2A]">
                          <span>{n.title}</span>
                          <span className="font-mono text-xs text-[#1C2B2A]/50">{n.time}</span>
                        </div>
                        <p className="text-xs text-[#1C2B2A]/75 mt-1 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DOCTOR QUICK BADGE */}
            <div className="hidden sm:flex items-center gap-2.5 border-l border-[#1C2B2A]/10 pl-4">
              <div className="w-8 h-8 rounded-full bg-[#0F6E5C] text-white flex items-center justify-center font-display text-sm font-bold">
                AS
              </div>
              <div className="text-left leading-none">
                <span className="text-sm font-semibold text-[#1C2B2A] block">Dr. A. Sharma</span>
                <span className="font-mono text-xs text-[#1C2B2A]/60 block mt-0.5">Cardiology OPD</span>
              </div>
            </div>

          </div>
        </header>

        {/* MAIN BODY AREA (With ~200ms entrance animation and Outlet sub-route rendering) */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-entrance space-y-6">
          {children || <Outlet />}
        </main>
      </div>

    </div>
  );
}
