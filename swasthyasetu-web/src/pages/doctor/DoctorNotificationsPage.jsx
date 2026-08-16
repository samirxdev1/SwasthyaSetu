import React, { useState } from 'react';

/**
 * DoctorNotificationsPage — Full clinical notifications & telemetry alerts log.
 */
export default function DoctorNotificationsPage() {
  const [filter, setFilter] = useState('all');

  const notifications = [
    { 
      id: 1, 
      type: 'lab', 
      title: 'Lab Report Ready: Lipid Profile (Full)', 
      desc: 'Central NABL Diagnostic Hub generated final verified report for Rajesh Kumar (AB-9823-4011-9022). Total Cholesterol 224 mg/dL.', 
      time: '10m ago', 
      unread: true,
      severity: 'normal'
    },
    { 
      id: 2, 
      type: 'alert', 
      title: 'Critical Lab Alert: Potassium Level Updated', 
      desc: 'Serum Potassium 4.8 mEq/L returned for Priya Sharma (AB-4412-9031-1189). Within normal clinical limits.', 
      time: '1h ago', 
      unread: true,
      severity: 'high'
    },
    { 
      id: 3, 
      type: 'system', 
      title: 'ABDM Gateway Batch Sync Completed', 
      desc: '14 e-prescriptions successfully cryptographically signed and published to ABDM Health Data Exchange (ND-PHYS-04).', 
      time: '3h ago', 
      unread: false,
      severity: 'info'
    },
    { 
      id: 4, 
      type: 'lab', 
      title: 'Lab Dispatch Received', 
      desc: 'HbA1c & Fasting Glucose sample received at AIIMS OPD Lab Terminal-2 for Amit Patel.', 
      time: '5h ago', 
      unread: false,
      severity: 'normal'
    },
  ];

  const filtered = filter === 'unread' 
    ? notifications.filter(n => n.unread) 
    : filter === 'alerts' 
    ? notifications.filter(n => n.type === 'alert' || n.severity === 'high') 
    : notifications;

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C2B2A]/10 pb-4 gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Clinical Notifications &amp; ABDM Telemetry
          </h2>
          <p className="text-sm text-[#1C2B2A]/70 mt-1">
            Real-time feed of lab status changes, AI safety alerts, and ABDM gateway logs.
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'unread', 'alerts'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 font-mono text-xs sm:text-sm rounded-lg capitalize border font-medium transition-all ${
                filter === f
                  ? 'bg-[#0F6E5C] text-white border-[#0F6E5C] font-semibold'
                  : 'bg-[#F7F6F3] text-[#1C2B2A]/80 border-[#1C2B2A]/20 hover:bg-[#E7F3EF]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-colors space-y-1.5 ${
              item.unread
                ? 'bg-[#E7F3EF]/50 border-[#0F6E5C]/30'
                : 'bg-[#F7F6F3] border-[#1C2B2A]/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  item.severity === 'high' ? 'bg-[#C9754A]' : item.unread ? 'bg-[#0F6E5C]' : 'bg-[#1C2B2A]/40'
                }`} />
                <span className="font-display font-bold text-sm sm:text-base text-[#1C2B2A]">
                  {item.title}
                </span>
              </div>
              <span className="font-mono text-xs text-[#1C2B2A]/50">{item.time}</span>
            </div>

            <p className="text-sm text-[#1C2B2A]/80 pl-4 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
