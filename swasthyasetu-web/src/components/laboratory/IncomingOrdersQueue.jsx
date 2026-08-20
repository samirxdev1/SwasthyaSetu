import React, { useState } from 'react';

/**
 * IncomingOrdersQueue — Primary to-do queue table for Laboratory Workstation.
 * Features search & filter tabs, 30ms staggered row entrance animation,
 * and 250ms smooth color morphing status chips (Pending → In Progress #3B7A9E → Completed #0F6E5C).
 * Unassigned pending orders are visually distinguishable with an "Accept" action.
 */
export default function IncomingOrdersQueue({
  orders = [],
  onSelectOrder,
  onStatusChange,
  onUploadReport
}) {
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((ord) => {
    // Filter tab condition
    if (filterTab === 'Pending' && ord.status !== 'Pending') return false;
    if (filterTab === 'In Progress' && ord.status !== 'In Progress') return false;
    if (filterTab === 'Completed' && ord.status !== 'Completed') return false;
    if (filterTab === 'STAT' && ord.priority !== 'STAT' && !ord.isOverdue) return false;

    // Search query condition
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (ord.id && ord.id.toLowerCase().includes(q)) ||
      (ord.patientName && ord.patientName.toLowerCase().includes(q)) ||
      (ord.healthId && ord.healthId.toLowerCase().includes(q)) ||
      (ord.testName && ord.testName.toLowerCase().includes(q)) ||
      (ord.doctorName && ord.doctorName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
      
      {/* HEADER & QUEUE STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2B2A]/10 pb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3B7A9E] animate-pulse" />
            Incoming Test Orders Queue
          </h2>
          <p className="text-xs sm:text-sm text-[#1C2B2A]/70 mt-0.5">
            Real-time feed of diagnostic orders dispatched by OPD physicians &amp; hospital wards.
          </p>
        </div>

        <span className="font-mono text-xs text-[#3B7A9E] bg-[#3B7A9E]/10 border border-[#3B7A9E]/25 px-3 py-1 rounded-lg font-semibold self-start sm:self-auto">
          FEED LIVE • {orders.length} TOTAL ORDERS
        </span>
      </div>

      {/* FILTER TABS & SEARCH INPUT BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* FILTER TABS */}
        <div className="flex items-center bg-[#F7F6F3] p-1 rounded-xl border border-[#1C2B2A]/15 text-xs font-mono overflow-x-auto">
          {['All', 'Pending', 'In Progress', 'Completed', 'STAT'].map((tab) => {
            const count = tab === 'All' 
              ? orders.length 
              : tab === 'STAT' 
              ? orders.filter(o => o.priority === 'STAT' || o.isOverdue).length 
              : orders.filter(o => o.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-semibold shrink-0 active:scale-98 ${
                  filterTab === tab
                    ? 'bg-[#3B7A9E] text-white shadow-xs'
                    : 'text-[#1C2B2A]/70 hover:text-[#1C2B2A] hover:bg-white/60'
                }`}
              >
                <span>{tab}</span>
                <span className="ml-1 opacity-80 font-normal">({count})</span>
              </button>
            );
          })}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3B7A9E]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, patient, Health ID or test..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded-xl text-xs sm:text-sm font-mono text-[#1C2B2A] placeholder:text-[#1C2B2A]/40 transition-colors focus:bg-white focus:outline-none focus:border-[#3B7A9E] focus:ring-2 focus:ring-[#E7F3EF]"
          />
        </div>

      </div>

      {/* ORDERS TABLE CONTAINER */}
      <div className="overflow-x-auto border border-[#1C2B2A]/10 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F6F3] border-b border-[#1C2B2A]/10 text-xs font-mono text-[#1C2B2A]/70 uppercase tracking-wider">
              <th className="p-3.5 font-bold">Order ID</th>
              <th className="p-3.5 font-bold">Patient Demographics</th>
              <th className="p-3.5 font-bold">Investigation / Test</th>
              <th className="p-3.5 font-bold">Ordering Physician</th>
              <th className="p-3.5 font-bold">Priority</th>
              <th className="p-3.5 font-bold">Time</th>
              <th className="p-3.5 font-bold">Status &amp; Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2B2A]/10 text-xs sm:text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((ord, idx) => {
                // Determine status chip style with 250ms smooth transition
                let chipStyle = 'bg-[#F7F6F3] text-[#1C2B2A] border-[#1C2B2A]/20';
                if (ord.status === 'In Progress') {
                  chipStyle = 'bg-[#3B7A9E] text-white border-[#3B7A9E] font-bold shadow-xs';
                } else if (ord.status === 'Completed' || ord.status === 'Report Ready') {
                  chipStyle = 'bg-[#0F6E5C] text-white border-[#0F6E5C] font-bold shadow-xs';
                }

                return (
                  <tr
                    key={ord.id}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    className={`hover:bg-[#E7F3EF]/30 transition-colors animate-entrance ${
                      ord.isOverdue || ord.priority === 'STAT' ? 'bg-[#C9754A]/5' : ''
                    }`}
                  >
                    {/* ORDER ID */}
                    <td className="p-3.5 font-mono font-bold text-[#3B7A9E] whitespace-nowrap">
                      {ord.id.length > 12 ? `${ord.id.slice(0, 8)}...` : ord.id}
                    </td>

                    {/* PATIENT NAME & HEALTH ID */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#1C2B2A]">{ord.patientName}</div>
                      <div className="font-mono text-xs text-[#0F6E5C] bg-[#E7F3EF]/70 px-1.5 py-0.5 rounded border border-[#0F6E5C]/20 inline-block mt-0.5">
                        {ord.healthId}
                      </div>
                    </td>

                    {/* TEST NAME */}
                    <td className="p-3.5 font-medium text-[#1C2B2A]">
                      {ord.testName}
                      {ord.specimen && (
                        <div className="font-mono text-xs text-[#1C2B2A]/60 font-normal">
                          Specimen: {ord.specimen}
                        </div>
                      )}
                    </td>

                    {/* ORDERING DOCTOR */}
                    <td className="p-3.5 text-[#1C2B2A]/80 font-mono text-xs">
                      <div>{ord.doctorName}</div>
                      <div className="text-[#1C2B2A]/50 text-[11px] uppercase">{ord.facility || 'OPD-Cardiology'}</div>
                    </td>

                    {/* PRIORITY TAG */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${
                          ord.priority === 'STAT' || ord.isOverdue
                            ? 'bg-[#C9754A] text-white border-[#C9754A]'
                            : ord.priority === 'Urgent'
                            ? 'bg-[#3B7A9E]/15 text-[#3B7A9E] border-[#3B7A9E]/30'
                            : 'bg-[#1C2B2A]/5 text-[#1C2B2A]/70 border-[#1C2B2A]/15'
                        }`}
                      >
                        {ord.priority || (ord.isOverdue ? 'STAT' : 'Routine')}
                      </span>
                    </td>

                    {/* TIME */}
                    <td className="p-3.5 font-mono text-xs text-[#1C2B2A]/70 whitespace-nowrap">
                      {ord.orderedAt}
                    </td>

                    {/* STATUS CHIP & ACTIONS */}
                    <td className="p-3.5 whitespace-nowrap space-x-2">
                      {/* STATUS CHIP */}
                      <span
                        className={`px-3 py-1 rounded-lg font-mono text-xs border transition-colors duration-250 ease-out inline-block ${chipStyle}`}
                      >
                        {ord.isUnassigned && ord.status === 'Pending' ? 'Available' : ord.status}
                      </span>

                      {/* ACCEPT ORDER BUTTON (for unassigned pending orders) */}
                      {(ord.isUnassigned || ord.status === 'Pending') && (
                        <button
                          type="button"
                          onClick={() => onStatusChange && onStatusChange(ord.id, 'In Progress')}
                          className="px-2.5 py-1 bg-[#3B7A9E] hover:bg-[#316583] text-white font-mono text-xs font-semibold rounded-lg transition-colors active:scale-98 cursor-pointer shadow-xs"
                        >
                          Accept
                        </button>
                      )}

                      {/* VIEW DETAILS ACTION */}
                      <button
                        type="button"
                        onClick={() => onSelectOrder && onSelectOrder(ord)}
                        className="px-2.5 py-1 bg-white border border-[#1C2B2A]/20 hover:bg-[#E7F3EF] hover:border-[#3B7A9E] text-[#1C2B2A] font-mono text-xs rounded-lg transition-colors active:scale-98"
                      >
                        Details
                      </button>

                      {/* UPLOAD REPORT ACTION BUTTON (for accepted in-progress orders) */}
                      {ord.status === 'In Progress' && (
                        <button
                          type="button"
                          onClick={() => onUploadReport && onUploadReport(ord)}
                          className="px-2.5 py-1 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-mono text-xs font-semibold rounded-lg transition-colors active:scale-98"
                        >
                          + Upload Report
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#1C2B2A]/50 italic text-sm">
                  No lab orders found matching current filter/query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
