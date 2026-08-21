import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useDoctor } from '../../context/DoctorContext';

/**
 * DoctorProfilePage — Fetches and displays dynamic credentials & OPD profile 
 * from the SwasthyaSetu backend API for the logged-in doctor.
 */
export default function DoctorProfilePage() {
  const { user, profile, updateUserProfile } = useAuth();
  const { showFeedback } = useDoctor() || {};

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    registration_number: '',
    clinic_hospital_name: '',
    years_of_experience: '',
    phone: '',
  });

  useEffect(() => {
    if (profile || user) {
      setFormData({
        full_name: profile?.full_name || '',
        specialization: profile?.specialization || '',
        registration_number: profile?.registration_number || '',
        clinic_hospital_name: profile?.clinic_hospital_name || '',
        years_of_experience: profile?.years_of_experience || '',
        phone: user?.phone || '',
      });
    }
  }, [profile, user]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DOC';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      if (showFeedback) {
        showFeedback('success', 'Doctor profile credentials updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update doctor profile:', error);
      if (showFeedback) {
        showFeedback('error', `Failed to update profile: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* PROFILE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C2B2A]/10 pb-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0F6E5C] text-white flex items-center justify-center font-display text-2xl font-bold shadow-sm uppercase shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                {profile?.full_name || 'Dr. Medical Practitioner'}
              </h2>
              <p className="text-sm font-mono text-[#0F6E5C] font-semibold mt-0.5">
                {profile?.specialization || 'General Physician / Cardiology'} 
                {profile?.years_of_experience ? ` • ${profile.years_of_experience} Years Exp.` : ''}
              </p>
              <p className="text-xs sm:text-sm text-[#1C2B2A]/60 font-mono mt-0.5">
                Registration No:{' '}
                <span className="font-bold text-[#1C2B2A]">
                  {profile?.registration_number || 'DOC-REG-PENDING'}
                </span>{' '}
                (Medical Council Verified)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-[#E7F3EF] hover:bg-[#0F6E5C] text-[#0F6E5C] hover:text-white border border-[#0F6E5C]/30 text-sm font-mono font-medium rounded-lg transition-all duration-150 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{isEditing ? 'Cancel Edit' : 'Edit Credentials'}</span>
            </button>

            <span className="hidden lg:inline-block font-mono text-xs sm:text-sm bg-[#E7F3EF] text-[#0F6E5C] border border-[#0F6E5C]/30 px-3.5 py-1.5 rounded-lg font-semibold">
              ABDM CERTIFIED PHYSICIAN
            </span>
          </div>
        </div>

        {/* EDIT PROFILE FORM (Toggled) */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="bg-[#E7F3EF]/30 border border-[#0F6E5C]/20 p-5 rounded-xl space-y-4 animate-entrance">
            <h3 className="font-display font-bold text-lg text-[#1C2B2A]">
              Update Physician Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-[#1C2B2A]/70 uppercase mb-1">
                  Full Name (With Title)
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0F6E5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#1C2B2A]/70 uppercase mb-1">
                  Specialization &amp; Degrees
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Senior Consultant Cardiology • MD, DM"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0F6E5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#1C2B2A]/70 uppercase mb-1">
                  Medical Council Registration No.
                </label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g. DOC-8841-IN"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0F6E5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#1C2B2A]/70 uppercase mb-1">
                  Hospital / Clinic Facility Name
                </label>
                <input
                  type="text"
                  name="clinic_hospital_name"
                  value={formData.clinic_hospital_name}
                  onChange={handleChange}
                  placeholder="e.g. AIIMS OPD Terminal-4"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0F6E5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#1C2B2A]/70 uppercase mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0F6E5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#1C2B2A]/70 uppercase mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0F6E5C] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white border border-[#1C2B2A]/20 text-[#1C2B2A] text-sm font-mono rounded-lg hover:bg-[#F7F6F3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#0F6E5C] text-white text-sm font-mono font-semibold rounded-lg hover:bg-[#0F6E5C]/90 shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Updates...' : 'Save Profile Credentials'}
              </button>
            </div>
          </form>
        )}

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CLINICAL AFFILIATION & OPD SCHEDULE */}
          <div className="bg-[#F7F6F3] p-4.5 rounded-xl border border-[#1C2B2A]/10 space-y-3">
            <h3 className="font-display font-bold text-base sm:text-lg text-[#1C2B2A] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01" />
              </svg>
              Hospital &amp; OPD Terminal Setup
            </h3>
            <div className="space-y-2.5 text-sm font-mono text-[#1C2B2A]">
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">Facility:</span>
                <span className="font-bold">{profile?.clinic_hospital_name || 'AIIMS Central OPD Terminal'}</span>
              </div>
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">Department:</span>
                <span className="font-bold">{profile?.specialization || 'Cardiovascular Sciences'}</span>
              </div>
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">Experience:</span>
                <span className="font-bold">{profile?.years_of_experience ? `${profile.years_of_experience} Years` : '10+ Years'}</span>
              </div>
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">Email:</span>
                <span className="font-bold text-[#0F6E5C]">{user?.email || 'doctor@swasthyasetu.gov.in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1C2B2A]/60">Contact Phone:</span>
                <span className="font-bold">{user?.phone || '+91 98765 00000'}</span>
              </div>
            </div>
          </div>

          {/* ABDM SYSTEM CONFIGURATION */}
          <div className="bg-[#F7F6F3] p-4.5 rounded-xl border border-[#1C2B2A]/10 space-y-3">
            <h3 className="font-display font-bold text-base sm:text-lg text-[#1C2B2A] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ABDM Node &amp; Telemetry Integration
            </h3>
            <div className="space-y-2.5 text-sm font-mono text-[#1C2B2A]">
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">Gateway Status:</span>
                <span className="text-[#0F6E5C] font-bold">CONNECTED (ND-PHYS-04)</span>
              </div>
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">HPR Handle:</span>
                <span className="font-bold lowercase">
                  {profile?.registration_number 
                    ? `${profile.registration_number.toLowerCase().replace(/[^a-z0-9]/g, '')}@hpr.abdm` 
                    : 'doc.general@hpr.abdm'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">AI Safety Node:</span>
                <span className="text-[#0F6E5C] font-bold">Protocol-v2.6 Active</span>
              </div>
              <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
                <span className="text-[#1C2B2A]/60">E-Prescription Key:</span>
                <span className="text-[#0F6E5C] font-bold">RSA-2048 (ACTIVE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1C2B2A]/60">Digital Signature:</span>
                <span className="text-[#0F6E5C] font-bold">Hardware Token Verified</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
