import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Unified Login Page for SwasthyaSetu
 * Serves both Doctor and Laboratory users with role-specific clinical accents.
 */
export default function UnifiedLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  
  // Active role state: 'doctor' | 'laboratory'
  const [role, setRole] = useState('doctor');
  
  // Form fields state
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberTerminal, setRememberTerminal] = useState(true);
  
  // UI status states
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDoctor = role === 'doctor';

  // Handle Role Change
  const handleRoleChange = (newRole) => {
    if (newRole !== role) {
      setRole(newRole);
      setErrorMessage('');
      setUserId('');
      setPassword('');
    }
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!userId.trim()) {
      setErrorMessage(
        isDoctor
          ? 'Doctor ID or registered email is required.'
          : 'Laboratory NABL ID or facility code is required.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Security password is required for clinical authentication.');
      return;
    }

    setIsSubmitting(true);

    login(userId, password)
      .then((data) => {
        setIsSubmitting(false);
        const userRole = data.role || data.user?.role;

        // Verify that the logged-in user's role matches the selected role on the UI
        if (userRole && userRole !== role) {
          logout(false);
          setErrorMessage(
            isDoctor
              ? 'Access denied. This account is registered as a Laboratory. Please select the Laboratory Workstation path to log in.'
              : 'Access denied. This account is registered as a Doctor. Please select the Doctor Workstation path to log in.'
          );
          return;
        }

        if (userRole === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (userRole === 'laboratory') {
          navigate('/lab/dashboard');
        } else {
          // Unauthorized role for this app, clear session
          logout(false);
          setErrorMessage('This login is for Doctors and Laboratories only.');
        }
      })
      .catch((err) => {
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Connection failed. Please check your network.');
      });
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1C2B2A] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-body selection:bg-[#E7F3EF] selection:text-[#0F6E5C]">
      
      {/* TOP CLINICAL TELEMETRY HEADER */}
      <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1C2B2A]/10 pb-4 mb-6 sm:mb-10 gap-3">
        <div className="flex items-center gap-3">
          {/* Signature Tri-Node Connection Mark (Doctor ↔ Core Bridge ↔ Lab) */}
          <div className="w-10 h-10 rounded bg-[#1C2B2A]/5 border border-[#1C2B2A]/15 flex items-center justify-center p-2 text-[#0F6E5C]">
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Doctor Node (Left) */}
              <circle cx="7" cy="16" r="3.5" className={isDoctor ? 'fill-[#0F6E5C] stroke-[#0F6E5C]' : 'stroke-[#1C2B2A]/50'} />
              {/* Central Bridge Node */}
              <path d="M16 11L20 16L16 21L12 16Z" className="fill-[#1C2B2A]/10 stroke-[#1C2B2A]/70" />
              {/* Lab Node (Right) */}
              <polygon points="25,12.5 28.5,19.5 21.5,19.5" className={!isDoctor ? 'fill-[#3B7A9E] stroke-[#3B7A9E]' : 'stroke-[#1C2B2A]/50'} />
              {/* Connecting Lines */}
              <line x1="10.5" y1="16" x2="12" y2="16" />
              <line x1="20" y1="16" x2="21.5" y2="16" />
            </svg>
          </div>

          <div>
            <span className="font-display font-bold text-xl tracking-tight text-[#1C2B2A] block leading-tight">
              SwasthyaSetu
            </span>
            <span className="font-mono text-[11px] text-[#1C2B2A]/60 uppercase tracking-wider block">
              Clinical Workflow Interface
            </span>
          </div>
        </div>
      </header>

      {/* MAIN WORKSTATION FRAME */}
      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center animate-entrance">
        
        {/* SECTION HEADER & SUBTITLE */}
        <div className="mb-6 sm:mb-8 text-left">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1C2B2A] tracking-tight">
            Select Workstation Access Path
          </h1>
          <p className="text-sm sm:text-base text-[#1C2B2A]/70 mt-1 max-w-2xl">
            Authenticate to access patient health records, e-prescriptions, AI drug safety alerts, or diagnostic laboratory orders.
          </p>
        </div>

        {/* DUAL ROLE SELECTOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* DOCTOR ROLE STATION SELECTOR */}
          <button
            type="button"
            onClick={() => handleRoleChange('doctor')}
            aria-selected={isDoctor}
            className={`group text-left p-5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C] ${
              isDoctor
                ? 'bg-white border-[#0F6E5C] shadow-sm'
                : 'bg-[#F7F6F3] border-[#1C2B2A]/15 hover:border-[#0F6E5C]/40 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full transition-colors duration-200 ${isDoctor ? 'bg-[#0F6E5C]' : 'bg-[#1C2B2A]/20'}`} />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0F6E5C]">
                  Role: Doctor / Physician
                </span>
              </div>
              <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${isDoctor ? 'bg-[#E7F3EF] text-[#0F6E5C] font-medium' : 'bg-[#1C2B2A]/5 text-[#1C2B2A]/60'}`}>
                {isDoctor ? 'ACTIVE PATH' : 'PATH 01'}
              </span>
            </div>

            <h2 className="font-display text-lg font-bold text-[#1C2B2A] mb-1">
              Doctor Workstation
            </h2>
            <p className="text-xs text-[#1C2B2A]/70 leading-relaxed">
              Patient record search, clinical consultation entry, e-prescribing &amp; AI-assisted drug interaction monitoring.
            </p>
          </button>

          {/* LABORATORY ROLE STATION SELECTOR */}
          <button
            type="button"
            onClick={() => handleRoleChange('laboratory')}
            aria-selected={!isDoctor}
            className={`group text-left p-5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B7A9E] ${
              !isDoctor
                ? 'bg-white border-[#3B7A9E] shadow-sm'
                : 'bg-[#F7F6F3] border-[#1C2B2A]/15 hover:border-[#3B7A9E]/40 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full transition-colors duration-200 ${!isDoctor ? 'bg-[#3B7A9E]' : 'bg-[#1C2B2A]/20'}`} />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3B7A9E]">
                  Role: Diagnostic Lab
                </span>
              </div>
              <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${!isDoctor ? 'bg-[#3B7A9E]/10 text-[#3B7A9E] font-medium' : 'bg-[#1C2B2A]/5 text-[#1C2B2A]/60'}`}>
                {!isDoctor ? 'ACTIVE PATH' : 'PATH 02'}
              </span>
            </div>

            <h2 className="font-display text-lg font-bold text-[#1C2B2A] mb-1">
              Laboratory Station
            </h2>
            <p className="text-xs text-[#1C2B2A]/70 leading-relaxed">
              Incoming test orders, diagnostic sample logging, test result validation &amp; lab report upload.
            </p>
          </button>
        </div>

        {/* DYNAMIC ROLE-AWARE LOGIN FORM CONTAINER */}
        <div 
          className={`bg-white border-2 rounded-lg p-6 sm:p-8 transition-colors duration-200 ${
            isDoctor ? 'border-[#0F6E5C]/30' : 'border-[#3B7A9E]/30'
          }`}
        >
          {/* ROLE ACCENT HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C2B2A]/10 pb-4 mb-6 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  isDoctor ? 'bg-[#0F6E5C] text-white' : 'bg-[#3B7A9E] text-white'
                }`}>
                  {isDoctor ? 'Doctor Portal Access' : 'Laboratory Portal Access'}
                </span>
                <span className="font-mono text-xs text-[#1C2B2A]/50">
                  PROTOCOL-v2.6
                </span>
              </div>
              <p className="text-xs text-[#1C2B2A]/70 mt-1">
                {isDoctor 
                  ? 'Enter credentials to authorize patient consultation access.'
                  : 'Enter lab facility credentials to access pending diagnostic queues.'
                }
              </p>
            </div>
          </div>

          {/* ERROR / WARNING ALERT BANNER */}
          {errorMessage && (
            <div 
              role="alert" 
              className="bg-[#C9754A]/10 border-l-4 border-[#C9754A] p-3 text-xs font-medium text-[#1C2B2A] mb-5 flex items-start gap-2.5 rounded-r"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#C9754A] shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AUTHENTICATION FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* USER ID FIELD */}
            <div>
              <label 
                htmlFor="user-id" 
                className="block text-xs font-mono uppercase tracking-wider font-semibold text-[#1C2B2A] mb-1.5"
              >
                {isDoctor ? 'Enter Doctor Email ID' : 'Enter Laboratory NABL Code / Facility ID'}
              </label>
              <div className="relative">
                <input
                  id="user-id"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={isDoctor ? 'e.g. DOC-8841-IN or doctor@hospital.org' : 'e.g. LAB-3021-NABL or lab@diagnostics.org'}
                  className={`w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded text-sm text-[#1C2B2A] font-mono placeholder:text-[#1C2B2A]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E7F3EF] ${
                    isDoctor ? 'focus:border-[#0F6E5C]' : 'focus:border-[#3B7A9E]'
                  }`}
                  aria-required="true"
                />
                <span className="absolute right-3 top-2.5 font-mono text-[10px] text-[#1C2B2A]/40 uppercase">
                  {isDoctor ? 'REG-ID' : 'LAB-ID'}
                </span>
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-mono uppercase tracking-wider font-semibold text-[#1C2B2A]"
                >
                  Password
                </label>
                <a 
                  href="#reset" 
                  onClick={(e) => { e.preventDefault(); alert('Password reset protocol requested. Contact your institution administrator.'); }}
                  className={`text-xs font-mono hover:underline ${isDoctor ? 'text-[#0F6E5C]' : 'text-[#3B7A9E]'}`}
                >
                  Reset Key?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded text-sm text-[#1C2B2A] font-mono placeholder:text-[#1C2B2A]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E7F3EF] ${
                  isDoctor ? 'focus:border-[#0F6E5C]' : 'focus:border-[#3B7A9E]'
                }`}
                aria-required="true"
              />
            </div>

            {/* REMEMBER SESSION & SYSTEM NOTICE */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className={`w-4 h-4 rounded border-[#1C2B2A]/30 transition-colors ${
                    isDoctor ? 'text-[#0F6E5C] focus:ring-[#0F6E5C]' : 'text-[#3B7A9E] focus:ring-[#3B7A9E]'
                  }`}
                />
                <span className="text-[#1C2B2A]/80 font-medium">Keep workstation session active (8h)</span>
              </label>

              <span className="font-mono text-[11px] text-[#1C2B2A]/50 hidden sm:inline">
                HIPAA / ABDM Compliant Node
              </span>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded font-display font-semibold text-white tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2 ${
                isDoctor
                  ? 'bg-[#0F6E5C] hover:bg-[#0c594a] focus:ring-[#0F6E5C]'
                  : 'bg-[#3B7A9E] hover:bg-[#316583] focus:ring-[#3B7A9E]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating Clinical Workstation...</span>
                </>
              ) : (
                <>
                  <span>Authenticate {isDoctor ? 'Doctor Session' : 'Laboratory Session'}</span>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M2 8a.75.75 0 01.75-.75h8.69L8.22 4.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06-1.06l3.22-3.22H2.75A.75.75 0 012 8z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* FOOTER ASSIST INFO */}
          <div className="mt-6 pt-4 border-t border-[#1C2B2A]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[#1C2B2A]/60 gap-2">
            <div>
              <span>Support Desk: <strong className="text-[#1C2B2A]">1800-SETU-HELP</strong></span>
              <span className="mx-2">•</span>
              <span>Institution Code: <strong className="text-[#1C2B2A]">AIIMS-ND-01</strong></span>
            </div>
            <div>
              <span className="hover:underline cursor-pointer">Security Policy</span>
              <span className="mx-1.5">•</span>
              <span className="hover:underline cursor-pointer">Audit Logging</span>
            </div>
          </div>
        </div>

      </main>

      {/* SYSTEM FOOTER */}
      <footer className="w-full max-w-5xl mx-auto pt-8 mt-6 border-t border-[#1C2B2A]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#1C2B2A]/60 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-[#1C2B2A]">SwasthyaSetu</span>
          <span>— Healthcare Interoperability Network</span>
        </div>
        <div className="font-mono text-[11px]">
          System Version 2.6.4-prod | Build 2026.08
        </div>
      </footer>

    </div>
  );
}
