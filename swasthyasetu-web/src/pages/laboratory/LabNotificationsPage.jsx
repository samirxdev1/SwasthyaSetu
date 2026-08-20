import React from 'react';

export default function LabNotificationsPage() {
  const notifications = [
    { id: 1, type: 'order', title: 'STAT Order Received', desc: 'Urgent Trop-I & 12-Lead ECG ordered by Dr. A. Sharma for Amit Patel (AB-7721-8890-3341)', time: '5m ago', unread: true },
    { id: 2, type: 'sample', title: 'Sample Barcode Scanned', desc: 'Blood sample received for Lipid Profile (Order #LAB-ORD-9021)', time: '25m ago', unread: true },
    { id: 3, type: 'system', title: 'NABL Quality Control', desc: 'Daily analyzer calibration verified successfully', time: '2h ago', unread: false },
    { id: 4, type: 'sync', title: 'ABDM Health Records Sync', desc: 'Batch sync of 14 diagnostic reports confirmed with ABDM portal', time: '5h ago', unread: false },
  ];

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-5 animate-entrance">
      <div className="flex items-center justify-between border-b border-[#1C2B2A]/10 pb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#3B7A9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Laboratory Station Notifications
          </h2>
          <p className="text-xs sm:text-sm text-[#1C2B2A]/70 mt-0.5">
            System alerts, STAT priority order notifications, and NABL quality control updates.
          </p>
        </div>

        <span className="font-mono text-xs text-[#3B7A9E] bg-[#3B7A9E]/10 border border-[#3B7A9E]/25 px-3 py-1 rounded-lg font-semibold">
          {notifications.filter(n => n.unread).length} Unread
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-colors ${
              n.unread ? 'bg-[#3B7A9E]/10 border-[#3B7A9E]/30' : 'bg-[#F7F6F3] border-[#1C2B2A]/10'
            }`}
          >
            <div className="flex items-center justify-between font-semibold text-[#1C2B2A] text-sm">
              <span className="flex items-center gap-2">
                {n.unread && <span className="w-2 h-2 rounded-full bg-[#C9754A]" />}
                {n.title}
              </span>
              <span className="font-mono text-xs text-[#1C2B2A]/50">{n.time}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#1C2B2A]/80 mt-1">{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
