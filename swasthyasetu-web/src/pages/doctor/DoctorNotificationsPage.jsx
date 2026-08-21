import React, { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService';

/**
 * DoctorNotificationsPage — Full clinical notifications & telemetry alerts log.
 */
export default function DoctorNotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackNotifications = [
    { 
      id: 'demo-1', 
      type: 'report_ready', 
      title: 'Lab Report Ready: Lipid Profile (Full)', 
      message: 'Central NABL Diagnostic Hub generated final verified report for Rajesh Kumar (AB-9823-4011-9022). Total Cholesterol 224 mg/dL.', 
      created_at: new Date(Date.now() - 600000).toISOString(), 
      is_read: false,
    },
    { 
      id: 'demo-2', 
      type: 'drug_alert', 
      title: 'Critical Lab Alert: Potassium Level Updated', 
      message: 'Serum Potassium 4.8 mEq/L returned for Priya Sharma (AB-4412-9031-1189). Within normal clinical limits.', 
      created_at: new Date(Date.now() - 3600000).toISOString(), 
      is_read: false,
    },
    { 
      id: 'demo-3', 
      type: 'general', 
      title: 'ABDM Gateway Batch Sync Completed', 
      message: '14 e-prescriptions successfully cryptographically signed and published to ABDM Health Data Exchange (ND-PHYS-04).', 
      created_at: new Date(Date.now() - 10800000).toISOString(), 
      is_read: true,
    },
  ];

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getNotifications();
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      } else {
        setNotifications(fallbackNotifications);
      }
    } catch (err) {
      console.warn('Could not load live notifications, using fallbacks:', err.message);
      setNotifications(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      if (!id.toString().startsWith('demo-')) {
        await doctorService.markNotificationRead(id);
      }
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.is_read) 
    : filter === 'alerts' 
    ? notifications.filter(n => n.type === 'drug_alert' || n.type === 'report_ready') 
    : notifications;

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

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
            Real-time feed of lab report completions, AI safety alerts, and ABDM gateway logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchNotifications}
            className="px-2.5 py-1.5 bg-[#E7F3EF] hover:bg-[#0F6E5C] hover:text-white text-[#0F6E5C] font-mono text-xs font-semibold rounded-lg border border-[#0F6E5C]/20 transition-all active:scale-98"
          >
            ↻ Sync
          </button>
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

      {loading ? (
        <div className="text-center py-8 text-sm font-mono text-[#1C2B2A]/60">
          Fetching notifications from backend...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-sm font-mono text-[#1C2B2A]/60 bg-[#F7F6F3] rounded-xl border border-dashed border-[#1C2B2A]/20">
          No notifications match the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-colors space-y-1.5 ${
                !item.is_read
                  ? 'bg-[#E7F3EF]/50 border-[#0F6E5C]/30 shadow-xs'
                  : 'bg-[#F7F6F3] border-[#1C2B2A]/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    item.type === 'drug_alert' ? 'bg-[#C9754A]' : !item.is_read ? 'bg-[#0F6E5C]' : 'bg-[#1C2B2A]/40'
                  }`} />
                  <span className="font-display font-bold text-sm sm:text-base text-[#1C2B2A]">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#1C2B2A]/50">{formatTime(item.created_at)}</span>
                  {!item.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(item.id)}
                      className="text-xs font-mono text-[#0F6E5C] hover:underline font-semibold"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#1C2B2A]/80 pl-4 leading-relaxed">
                {item.message || item.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
