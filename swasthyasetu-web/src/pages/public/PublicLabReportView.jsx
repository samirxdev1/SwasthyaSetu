import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import labService from '../../services/labService';
import Loader from '../../components/common/Loader';
import { 
  FileText, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Clock,
  Printer
} from 'lucide-react';

export default function PublicLabReportView() {
  const { shareToken } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPublicReport() {
      try {
        setLoading(true);
        setError(null);
        const res = await labService.getPublicLabReport(shareToken);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load public lab report.');
      } finally {
        setLoading(false);
      }
    }
    if (shareToken) {
      fetchPublicReport();
    }
  }, [shareToken]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <Loader message="Fetching verified lab report package..." />
      </div>
    );
  }

  if (error || !data || !data.report) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Lab Report Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            {error || 'The requested public lab report link is invalid or has expired.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-semibold hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"
          >
            Go to SwasthyaSetu Portal
          </a>
        </div>
      </div>
    );
  }

  const { report, order } = data;
  const fileUrl = report.report_file_url;
  const isPdf = fileUrl && (fileUrl.toLowerCase().includes('.pdf') || fileUrl.includes('application/pdf'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-slate-950">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Brand Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-teal-200 to-cyan-400 bg-clip-text text-transparent">
                SwasthyaSetu
              </h1>
              <p className="text-xs text-slate-400">Verified Public Diagnostic Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? 'Link Copied!' : 'Copy Share Link'}
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Print
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Banner Section */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Report
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(report.uploaded_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">
                {order?.test_names || 'Diagnostic Laboratory Test Report'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Order ID: <span className="font-mono text-slate-300">{report.lab_order_id}</span>
              </p>
            </div>

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg shadow-teal-500/25 shrink-0"
              >
                <Download className="w-5 h-5" />
                Download Original Report
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Report Details & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Summary Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Report Summary
              </h3>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-300 leading-relaxed min-h-[100px]">
                {report.report_summary || 'No summary provided by the laboratory.'}
              </div>
            </div>

            {/* Test Info Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Test Metadata
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Order Status</span>
                  <span className="text-emerald-400 font-semibold capitalize flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Upload Date</span>
                  <span className="text-slate-200">
                    {new Date(report.uploaded_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Access Mode</span>
                  <span className="text-teal-400 font-mono">Public Shareable Link</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: File Previewer */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col h-[700px]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  Document Preview
                </h3>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                  >
                    Open in Full Window <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex-1 rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden relative flex items-center justify-center">
                {fileUrl ? (
                  isPdf ? (
                    <iframe
                      src={`${fileUrl}#toolbar=0`}
                      className="w-full h-full border-none"
                      title="Lab Report Document"
                    />
                  ) : (
                    <div className="w-full h-full overflow-auto p-4 flex items-center justify-center bg-slate-950">
                      <img
                        src={fileUrl}
                        alt="Lab Report Attachment"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                      />
                    </div>
                  )
                ) : (
                  <div className="text-center p-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p>No document attachment available for preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
