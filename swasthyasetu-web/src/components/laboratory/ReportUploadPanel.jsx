import React, { useState } from 'react';

/**
 * ReportUploadPanel — Drag-and-drop / file picker zone for uploading completed diagnostic lab reports.
 * Features a Soft Sage pulsing skeleton during simulated upload, followed by a 200ms success fade-in.
 * Auto-updates order status to Completed (Deep Teal #0F6E5C).
 */
export default function ReportUploadPanel({ targetOrder, orders = [], onUploadSuccess, onClose }) {
  const [selectedOrderId, setSelectedOrderId] = useState(targetOrder?.id || (orders.find(o => o.status !== 'Completed')?.id || ''));
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const activeOrder = orders.find(o => o.id === selectedOrderId) || targetOrder;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedOrderId) return;

    setIsUploading(true);
    setUploadComplete(false);

    // Simulate clinical file transfer latency (400ms) with pulsing Soft Sage skeleton
    setTimeout(() => {
      setIsUploading(false);
      setUploadComplete(true);

      if (onUploadSuccess) {
        onUploadSuccess(selectedOrderId, selectedFile.name);
      }
    }, 450);
  };

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
      
      {/* PANEL HEADER */}
      <div className="flex items-center justify-between border-b border-[#1C2B2A]/10 pb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#3B7A9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 013 3h10a3 3 0 013-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Diagnostic Report Upload Terminal
          </h2>
          <p className="text-xs sm:text-sm text-[#1C2B2A]/70 mt-0.5">
            Attach verified PDF lab reports, DICOM images or pathology values to complete diagnostic orders.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-[#F7F6F3] text-[#1C2B2A]/70 hover:bg-[#E7F3EF] text-xs font-mono"
          >
            ✕ Close Panel
          </button>
        )}
      </div>

      <form onSubmit={handleSimulateUpload} className="space-y-4">
        
        {/* TARGET ORDER SELECTION */}
        <div>
          <label htmlFor="upload-target-order" className="block text-xs font-mono font-semibold uppercase text-[#1C2B2A] mb-1.5">
            Select Target Lab Order *
          </label>
          <select
            id="upload-target-order"
            value={selectedOrderId}
            onChange={(e) => {
              setSelectedOrderId(e.target.value);
              setUploadComplete(false);
            }}
            className="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded-xl text-xs sm:text-sm font-mono text-[#1C2B2A] focus:outline-none focus:border-[#3B7A9E] focus:ring-2 focus:ring-[#E7F3EF]"
            required
          >
            <option value="">-- Choose Order from Pending Queue --</option>
            {orders.map((ord) => (
              <option key={ord.id} value={ord.id}>
                {ord.id} — {ord.patientName} ({ord.healthId}) — {ord.testName} [{ord.status}]
              </option>
            ))}
          </select>
        </div>

        {/* DRAG-AND-DROP FILE PICKER ZONE */}
        <div className="relative border-2 border-dashed border-[#3B7A9E]/40 hover:border-[#3B7A9E] bg-[#F7F6F3] hover:bg-[#E7F3EF]/30 p-6 rounded-xl text-center transition-colors cursor-pointer group">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.dcm"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-2 pointer-events-none">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#3B7A9E]/10 text-[#3B7A9E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div>
              <span className="font-display font-semibold text-sm text-[#1C2B2A] block">
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop lab report file'}
              </span>
              <span className="font-mono text-xs text-[#1C2B2A]/60 block mt-0.5">
                Supported formats: PDF, DICOM, High-Res PNG / JPG (Max 25 MB)
              </span>
            </div>

            {selectedFile && (
              <span className="inline-block font-mono text-xs text-[#0F6E5C] bg-[#E7F3EF] px-2.5 py-1 rounded border border-[#0F6E5C]/20 font-bold">
                ✓ File Ready: {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
        </div>

        {/* SOFT SAGE PULSING SKELETON DURING UPLOAD STATE */}
        {isUploading && (
          <div 
            aria-live="polite"
            className="p-4 bg-[#E7F3EF]/60 border border-[#0F6E5C]/30 rounded-xl space-y-2 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-semibold text-[#0F6E5C]">
                Encrypting &amp; Syncing Report with ABDM Gateway...
              </span>
              <span className="font-mono text-xs text-[#0F6E5C]">Uploading...</span>
            </div>
            <div className="h-2 bg-[#E7F3EF] rounded-full overflow-hidden">
              <div className="h-full bg-[#0F6E5C] w-3/4 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* SUCCESS CONFIRMATION STATE (200ms FADE-IN) */}
        {uploadComplete && (
          <div className="p-4 bg-[#E7F3EF] border border-[#0F6E5C]/30 rounded-xl flex items-center justify-between text-xs sm:text-sm text-[#0F6E5C] font-semibold animate-entrance">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0F6E5C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Diagnostic Report Uploaded! Order status updated to <strong>Completed (#0F6E5C)</strong>.</span>
            </div>

            <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-[#0F6E5C]/20">
              ABDM SYNCED
            </span>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isUploading || !selectedFile || !selectedOrderId}
            className="py-3 px-6 bg-[#3B7A9E] hover:bg-[#316583] text-white font-display font-semibold text-sm rounded-xl transition-all duration-150 active:scale-98 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#3B7A9E] flex items-center gap-2"
          >
            {isUploading ? (
              <span>Uploading Diagnostic Report...</span>
            ) : (
              <>
                <span>Complete Order &amp; Upload Report</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
