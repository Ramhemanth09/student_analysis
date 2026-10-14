import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge } from '../components/common/Card';
import {
  Settings,
  School,
  Sliders,
  Users,
  Shield,
  RotateCcw,
  CheckCircle,
  Upload,
  GraduationCap,
} from 'lucide-react';

export const SettingsUserManagement: React.FC = () => {
  const { config, updateSchoolConfig, resetToDemoData } = useData();

  // Local form state
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [schoolBranch, setSchoolBranch] = useState(config.schoolBranch);
  const [affiliationNumber, setAffiliationNumber] = useState(config.affiliationNumber);
  const [academicYear, setAcademicYear] = useState(config.academicYear);
  const [currentTerm, setCurrentTerm] = useState(config.currentTerm);
  const [passMarksCutoff, setPassMarksCutoff] = useState(config.passMarksCutoff);
  const [davGradeMappingEnabled, setDavGradeMappingEnabled] = useState(
    config.davGradeMappingEnabled
  );

  const [attBelow, setAttBelow] = useState(config.academicReviewThresholds.attendanceBelow);
  const [marksBelow, setMarksBelow] = useState(config.academicReviewThresholds.marksBelow);
  const [assignBelow, setAssignBelow] = useState(
    config.academicReviewThresholds.assignmentBelow
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolConfig({
      schoolName,
      schoolBranch,
      affiliationNumber,
      academicYear,
      currentTerm,
      passMarksCutoff: Number(passMarksCutoff),
      davGradeMappingEnabled,
      academicReviewThresholds: {
        attendanceBelow: Number(attBelow),
        marksBelow: Number(marksBelow),
        assignmentBelow: Number(assignBelow),
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
          DAV Institutional Settings & Administration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure school identity, grading policies, academic review thresholds, and user access parameters
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>School configuration and academic policies updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: School Identity */}
        <Card
          title="DAV School Identity & Branding"
          subtitle="Displayed on dashboards, progress report cards, and exported documentation"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">DAV School Name:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Campus Branch / Location:</label>
              <input
                type="text"
                value={schoolBranch}
                onChange={(e) => setSchoolBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">CBSE Affiliation / Accreditation No:</label>
              <input
                type="text"
                value={affiliationNumber}
                onChange={(e) => setAffiliationNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Year:</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Term:</label>
                <input
                  type="text"
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Academic Grading & DAV Adaptation Layer */}
        <Card
          title="Curriculum Grading & Data Adaptation Layer"
          subtitle="Control passing cutoffs and collegiate-to-school grade mapping"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Standard Passing Score (%):
                </label>
                <input
                  type="number"
                  min="33"
                  max="50"
                  value={passMarksCutoff}
                  onChange={(e) => setPassMarksCutoff(Number(e.target.value))}
                  className="w-28 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
              <p className="text-slate-500 pt-5">
                Default cutoff is 40% (CBSE secondary standard). Assessments below this threshold are flagged for support.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-start gap-3">
              <input
                type="checkbox"
                id="davAdapt"
                checked={davGradeMappingEnabled}
                onChange={(e) => setDavGradeMappingEnabled(e.target.checked)}
                className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="davAdapt" className="cursor-pointer">
                <strong>Enable DAV Grade Adaptation Layer:</strong> Translates collegiate taxonomy (1st Year, 2nd Year, 3rd Year, 4th Year) to DAV School Grade Structure (Class 9, Class 10, Class 11, Class 12).
              </label>
            </div>
          </div>
        </Card>

        {/* Section 3: Academic Review Triggers */}
        <Card
          title="Academic Support & Mentorship Trigger Rules"
          subtitle="Criteria used to automatically suggest students for early instructional guidance"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Attendance Flag Level:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={attBelow}
                  onChange={(e) => setAttBelow(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                />
                <span className="text-slate-500">% attendance</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Marks Flag Level:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={marksBelow}
                  onChange={(e) => setMarksBelow(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                />
                <span className="text-slate-500">% score</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Assignment Flag Level:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={assignBelow}
                  onChange={(e) => setAssignBelow(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                />
                <span className="text-slate-500">% completed</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all dataset modifications to factory demonstration state?')) {
                resetToDemoData();
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Factory Demo Dataset
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
          >
            Save Institutional Settings
          </button>
        </div>
      </form>
    </div>
  );
};
