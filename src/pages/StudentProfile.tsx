import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge } from '../components/common/Card';
import { formatClassYear, formatDepartmentStream } from '../utils/davMapping';
import {
  Award,
  CheckCircle,
  Clock,
  FileCheck,
  MessageSquare,
  Plus,
  Printer,
  User,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

interface StudentProfileProps {
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  selectedStudentId,
  onSelectStudent,
}) => {
  const {
    students,
    subjectMarks,
    config,
    currentUser,
    reviewItems,
    updateReviewItem,
    addReviewItem,
  } = useData();

  const effectiveStudentId =
    currentUser.role === 'student'
      ? currentUser.studentId || 'STU1001'
      : selectedStudentId || 'STU1001';

  const student = useMemo(() => {
    return students.find((s) => s.StudentID === effectiveStudentId) || students[0];
  }, [students, effectiveStudentId]);

  const studentMarks = useMemo(() => {
    return subjectMarks.filter((m) => m.StudentID === student.StudentID);
  }, [subjectMarks, student.StudentID]);

  const stats = useMemo(() => {
    let totalMarks = 0;
    let maxMarks = 0;
    let passed = 0;

    for (const m of studentMarks) {
      totalMarks += m.Marks;
      maxMarks += m.MaxMarks;
      if (m.Result === 'Pass' || m.Marks >= config.passMarksCutoff) {
        passed++;
      }
    }

    const avg = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    return {
      totalMarks: Number(totalMarks.toFixed(1)),
      maxMarks,
      averagePct: Number(avg.toFixed(1)),
      passedCount: passed,
      totalCount: studentMarks.length,
      passRate: studentMarks.length > 0 ? Math.round((passed / studentMarks.length) * 100) : 0,
    };
  }, [studentMarks, config.passMarksCutoff]);

  const radarData = useMemo(() => {
    return studentMarks.map((m) => ({
      subject: m.Subject,
      score: m.Marks,
      max: m.MaxMarks,
    }));
  }, [studentMarks]);

  const strengths = useMemo(() => {
    return studentMarks.filter((m) => m.Marks >= 75);
  }, [studentMarks]);

  const reviewSubjects = useMemo(() => {
    return studentMarks.filter((m) => m.Marks < 60);
  }, [studentMarks]);

  const existingReview = useMemo(() => {
    return reviewItems.find((r) => r.studentId === student.StudentID);
  }, [reviewItems, student.StudentID]);

  const [newStaffNote, setNewStaffNote] = useState('');
  const [showNoteBox, setShowNoteBox] = useState(false);

  const handleAddNote = () => {
    if (!newStaffNote.trim()) return;
    if (existingReview) {
      const combined = existingReview.notes
        ? `${existingReview.notes} | ${newStaffNote.trim()}`
        : newStaffNote.trim();
      updateReviewItem(existingReview.id, existingReview.status, combined);
    } else {
      addReviewItem({
        studentId: student.StudentID,
        studentName: student.StudentName,
        classYear: student.Year,
        section: student.Section,
        triggerType: 'Composite',
        metricValue: `${stats.averagePct}% Midterm Avg`,
        ruleDescription: 'Faculty mentor observation recorded',
        suggestedIntervention: 'Continue weekly counseling in departmental mentor hour',
        status: 'Under Review',
        notes: newStaffNote.trim(),
      });
    }
    setNewStaffNote('');
    setShowNoteBox(false);
  };

  const printProgressReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Student Selector (If Admin or Faculty) */}
      {currentUser.role !== 'student' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-900" />
            <span className="text-xs font-semibold text-slate-700">Select B.Tech Student:</span>
            <select
              value={student.StudentID}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-900"
            >
              {students.map((s) => (
                <option key={s.StudentID} value={s.StudentID}>
                  {s.StudentID} – {s.StudentName} ({s.Department}, {formatClassYear(s.Year, config.davGradeMappingEnabled)}, Sec {s.Section})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={printProgressReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" /> Print B.Tech Grade Card
          </button>
        </div>
      )}

      {/* Student Profile Hero Card */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 ring-4 ring-amber-500/40 flex items-center justify-center text-white text-2xl font-bold font-serif shadow-inner">
              {student.StudentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{student.StudentName}</h1>
                <span className="text-xs font-mono font-bold bg-white/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-white/20">
                  Roll: {student.StudentID}
                </span>
              </div>
              <p className="text-xs text-red-100 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-amber-200">{config.schoolName}</span>
                <span>•</span>
                <span className="font-bold text-white bg-black/20 px-2 py-0.5 rounded">
                  {formatClassYear(student.Year, config.davGradeMappingEnabled)} – Sec {student.Section}
                </span>
                <span>•</span>
                <span className="text-amber-100">{formatDepartmentStream(student.Department)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium bg-white/10 px-2 py-0.5 rounded text-amber-100">
                  Gender: {student.Gender}
                </span>
                <span className="text-[11px] font-medium bg-white/10 px-2 py-0.5 rounded text-amber-100">
                  Study Hours: {student.StudyHoursPerWeek} hrs/week
                </span>
                <span className="text-[11px] font-medium bg-white/10 px-2 py-0.5 rounded text-amber-100">
                  Technical Clubs: {student.ExtracurricularHoursPerWeek} hrs/week
                </span>
              </div>
            </div>
          </div>

          {/* Quick Score badge */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="text-left md:text-right">
              <span className="text-[11px] uppercase tracking-wider text-amber-200 font-bold">
                Midterm Aggregate
              </span>
              <div className="text-3xl font-extrabold tracking-tight text-white">{stats.averagePct}%</div>
            </div>
            <div className="mt-1">
              {stats.averagePct >= 75 ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  First Class with Distinction
                </span>
              ) : stats.averagePct >= 50 ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  First Class Standing
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  Remedial Counseling Advised
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview for this B.Tech student */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">B.Tech Attendance</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{student.AttendancePct}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {student.AttendancePct >= 75 ? 'Meets JNTUH threshold (≥75%)' : 'Condonation / Medical list'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Lab & Continuous Eval</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{student.AssignmentCompletionPct}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Observation submissions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Courses Cleared</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {stats.passedCount} / {stats.totalCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{stats.passRate}% clearance rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Counseling & Mentorship</span>
          <div className="mt-1">
            {existingReview ? (
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                {existingReview.status}
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Good Standing
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Faculty mentor status</p>
        </div>
      </div>

      {/* Course Scorecard Table & Radar Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detailed Marksheet */}
        <div className="lg:col-span-7">
          <Card
            title="B.Tech Course Examination Scorecard"
            subtitle={`Academic Term: ${studentMarks[0]?.AcademicTerm || 'Sem 1'} • Exam: ${
              studentMarks[0]?.ExamType || 'Midterm'
            }`}
          >
            <div className="overflow-x-auto -mx-5 -my-5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">B.Tech Course</th>
                    <th className="py-3 px-4 text-right">Marks Obtained</th>
                    <th className="py-3 px-4 text-right">Max Marks</th>
                    <th className="py-3 px-4 text-right">Percentage</th>
                    <th className="py-3 px-4 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {studentMarks.map((m) => {
                    const pct = (m.Marks / m.MaxMarks) * 100;
                    const isPass = m.Result === 'Pass' || m.Marks >= config.passMarksCutoff;
                    return (
                      <tr key={m.Subject} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{m.Subject}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                          {m.Marks}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400">{m.MaxMarks}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-semibold ${
                              pct >= 75
                                ? 'text-emerald-700'
                                : pct < 50
                                ? 'text-rose-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isPass ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Cleared
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Backlog
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                    <td className="py-3 px-4">Semester Aggregate</td>
                    <td className="py-3 px-4 text-right font-mono">{stats.totalMarks}</td>
                    <td className="py-3 px-4 text-right">{stats.maxMarks}</td>
                    <td className="py-3 px-4 text-right text-red-950">{stats.averagePct}%</td>
                    <td className="py-3 px-4 text-center">
                      {stats.passedCount === stats.totalCount ? 'All Cleared' : `${stats.totalCount - stats.passedCount} Backlogs`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Radar / Subject Visual */}
        <div className="lg:col-span-5">
          <Card
            title="Technical Competency Profile"
            subtitle="Relative performance across curriculum subjects"
          >
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Marks Score"
                    dataKey="score"
                    stroke="#701a23"
                    fill="#701a23"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val}/100`, 'Score']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Strengths & Focus Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Demonstrated Technical Strengths" subtitle="Courses with distinction scores (≥75%)">
          {strengths.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              No course scores currently recorded in the distinction bracket.
            </p>
          ) : (
            <div className="space-y-2.5">
              {strengths.map((s) => (
                <div
                  key={s.Subject}
                  className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-950">{s.Subject}</span>
                  </div>
                  <span className="font-bold text-emerald-800">{s.Marks} / {s.MaxMarks}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Courses Benefiting from Remedial Tutorials"
          subtitle="Targeted reinforcement recommended (<60%)"
        >
          {reviewSubjects.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 py-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>All B.Tech courses meet satisfactory performance benchmarks.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reviewSubjects.map((s) => (
                <div
                  key={s.Subject}
                  className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-amber-950">{s.Subject}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Recommended: Attend Saturday remedial coding clinic and practice problem sets
                    </p>
                  </div>
                  <span className="font-bold text-red-900">{s.Marks} / {s.MaxMarks}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Staff Notes & Mentorship Log */}
      {currentUser.role !== 'student' && (
        <Card
          title="Faculty Mentor Observations & Counseling Diary"
          subtitle="Restricted counseling and progress notes for VNR VJIET faculty"
          action={
            <button
              onClick={() => setShowNoteBox(!showNoteBox)}
              className="text-xs text-red-950 hover:text-red-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-red-800" /> Add Mentor Note
            </button>
          }
        >
          <div className="space-y-3">
            {showNoteBox && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="text-xs font-semibold text-slate-700">Add Faculty Observation / Action:</label>
                <textarea
                  rows={2}
                  value={newStaffNote}
                  onChange={(e) => setNewStaffNote(e.target.value)}
                  placeholder="Record student counseling observation, parent contact summary, or assigned coding clinic..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowNoteBox(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-red-950 hover:bg-red-900 rounded-md shadow-xs"
                  >
                    Save Observation
                  </button>
                </div>
              </div>
            )}

            {existingReview ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-red-700" /> Active Mentorship Plan:
                  </span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {existingReview.status}
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Trigger:</strong> {existingReview.metricValue} ({existingReview.ruleDescription})
                </p>
                <p className="text-slate-600">
                  <strong>Suggested Next Step:</strong> {existingReview.suggestedIntervention}
                </p>
                {existingReview.notes && (
                  <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                    "{existingReview.notes}"
                  </p>
                )}
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span>Logged by: {existingReview.updatedBy}</span>
                  <span>{existingReview.updatedAt}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs">
                No active intervention flags for this B.Tech student. Student is performing in Good Standing.
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
