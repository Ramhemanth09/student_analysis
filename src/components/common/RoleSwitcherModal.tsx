import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Shield, GraduationCap, UserCheck, Check, X, Sparkles, Building2 } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole, students, config } = useData();
  const [selectedStudentId, setSelectedStudentId] = useState(currentUser.studentId || 'STU1001');

  if (!isOpen) return null;

  const handleSelectRole = (role: UserRole, extra?: string) => {
    switchRole(role, extra);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-red-900 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 ring-1 ring-white/20">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Select Active User Role & Account</h3>
              <p className="text-xs text-amber-200">
                VNR VJIET – B.Tech Student Performance & Academic Analytics Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>VNR VJIET B.Tech Prototype:</strong> Scoped exclusively for Bachelor of Technology (B.Tech) degree students across CSE, IT, ECE, EEE, and AIML branches.
          </span>
        </div>

        {/* Roles List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Role 1: Administrator / Principal & Dean */}
          <div
            onClick={() => handleSelectRole('admin')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
              currentUser.role === 'admin'
                ? 'border-red-900 bg-red-50/40 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-950 text-white mt-0.5">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">Principal & Dean Academics</h4>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">
                    Institute Wide
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Dr. C. D. Naidu</strong> – Principal, VNR VJIET
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institute-wide B.Tech performance monitoring across all 4 years and 5 engineering branches, JNTUH compliance, Excel import/validation, and institutional policies.
                </p>
              </div>
            </div>
            {currentUser.role === 'admin' && (
              <span className="p-1 rounded-full bg-red-900 text-white shrink-0">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Role 2: Teacher - B.Tech Faculty Coordinator */}
          <div
            onClick={() => handleSelectRole('teacher', 'B.Tech II Year')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
              currentUser.role === 'teacher' && currentUser.assignedClass === 'B.Tech II Year'
                ? 'border-amber-600 bg-amber-50/40 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white mt-0.5">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">B.Tech Course Faculty & Class Coordinator</h4>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Faculty Scope
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Dr. Rajesh Verma</strong> – Associate Professor, Dept. of CSE (Assigned: B.Tech II Year, Data Structures)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track individual B.Tech student midterms, lab assignment completion, condonation attendance alerts, and log faculty mentor observations.
                </p>
              </div>
            </div>
            {currentUser.role === 'teacher' && (
              <span className="p-1 rounded-full bg-amber-600 text-white shrink-0">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Role 3: Student */}
          <div
            className={`p-4 rounded-xl border-2 transition-all ${
              currentUser.role === 'student'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-700 text-white mt-0.5">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">B.Tech Student Academic Portal</h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Personal Confidential
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    B.Tech students can securely inspect their midterm marks, JNTUH condonation attendance percentage, lab submission status, and download their official grade card.
                  </p>
                </div>
              </div>
              {currentUser.role === 'student' && (
                <span className="p-1 rounded-full bg-emerald-700 text-white shrink-0">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </div>

            {/* Student ID selection */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-700">Select B.Tech Student Roll No:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
              >
                {students.slice(0, 15).map((s) => (
                  <option key={s.StudentID} value={s.StudentID}>
                    {s.StudentID} – {s.StudentName} ({s.Department}, {s.Year}, Sec {s.Section})
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleSelectRole('student', selectedStudentId)}
                className="ml-auto px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
              >
                Log In As B.Tech Student
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Current Session: <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.role})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
