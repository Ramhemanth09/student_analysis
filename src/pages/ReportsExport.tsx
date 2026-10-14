import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge } from '../components/common/Card';
import { formatClassYear, formatDepartmentStream } from '../utils/davMapping';
import { computeStudentPerformanceMap, getSubjectStats } from '../utils/analytics';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  Award,
  Users,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReportsExport: React.FC = () => {
  const {
    students,
    subjectMarks,
    config,
    currentUser,
    reviewItems,
    filteredStudents,
    filteredMarks,
  } = useData();

  const [reportType, setReportType] = useState<
    'student_report' | 'class_summary' | 'subject_report' | 'attendance_report' | 'support_list'
  >(currentUser.role === 'student' ? 'student_report' : 'class_summary');

  // Selected student for student report card
  const [selectedStudentId, setSelectedStudentId] = useState(
    currentUser.studentId || students[0]?.StudentID || 'STU1001'
  );

  const activeStudent = useMemo(() => {
    return students.find((s) => s.StudentID === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const activeStudentMarks = useMemo(() => {
    return subjectMarks.filter((m) => m.StudentID === activeStudent?.StudentID);
  }, [subjectMarks, activeStudent]);

  const performanceMap = useMemo(() => {
    return computeStudentPerformanceMap(subjectMarks);
  }, [subjectMarks]);

  const subjectStats = useMemo(() => {
    return getSubjectStats(subjectMarks, config.passMarksCutoff);
  }, [subjectMarks, config.passMarksCutoff]);

  const handlePrint = () => {
    window.print();
  };

  // Excel Exporters
  const exportClassSummaryExcel = () => {
    const data = filteredStudents.map((s) => {
      const stats = performanceMap[s.StudentID];
      const avgMarks = stats && stats.maxMarks > 0 ? (stats.totalMarks / stats.maxMarks) * 100 : 0;
      return {
        'Student ID': s.StudentID,
        'Student Name': s.StudentName,
        'Class/Grade': formatClassYear(s.Year, config.davGradeMappingEnabled),
        'Section': s.Section,
        'Stream': formatDepartmentStream(s.Department),
        'Attendance %': s.AttendancePct,
        'Average Marks %': Number(avgMarks.toFixed(1)),
        'Assignment %': s.AssignmentCompletionPct,
        'Study Hours/Wk': s.StudyHoursPerWeek,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DAV_Class_Summary');
    XLSX.writeFile(wb, `DAV_Class_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportSubjectReportExcel = () => {
    const data = subjectStats.map((sub) => ({
      'Subject Name': sub.subject,
      'Average Score %': sub.avgScore,
      'Pass Rate %': sub.passRate,
      'Minimum Score': sub.minScore,
      'Maximum Score': sub.maxScore,
      'Total Submissions': sub.count,
      'Focus Required': sub.needsReview ? 'Yes' : 'No',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DAV_Subject_Analytics');
    XLSX.writeFile(wb, `DAV_Subject_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportSupportReviewExcel = () => {
    const data = reviewItems.map((r) => ({
      'Student ID': r.studentId,
      'Student Name': r.studentName,
      'Class': formatClassYear(r.classYear, config.davGradeMappingEnabled),
      'Section': r.section,
      'Trigger': r.triggerType,
      'Observed Metric': r.metricValue,
      'Rule Description': r.ruleDescription,
      'Status': r.status,
      'Suggested Intervention': r.suggestedIntervention,
      'Mentor Notes': r.notes,
      'Last Updated': r.updatedAt,
      'Updated By': r.updatedBy,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DAV_Support_Interventions');
    XLSX.writeFile(wb, `DAV_Academic_Support_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
            Academic Reports & Progress Documentation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate formal DAV progress report cards, class summaries, and exportable data dossiers
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-700 mr-1">Select Report Type:</span>
        {currentUser.role !== 'student' && (
          <>
            <button
              onClick={() => setReportType('class_summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                reportType === 'class_summary'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Class-Wise Summary
            </button>
            <button
              onClick={() => setReportType('subject_report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                reportType === 'subject_report'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Subject Performance Report
            </button>
            <button
              onClick={() => setReportType('support_list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                reportType === 'support_list'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Academic Support Review Dossier
            </button>
          </>
        )}

        <button
          onClick={() => setReportType('student_report')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            reportType === 'student_report'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {currentUser.role === 'student' ? 'My Progress Report Card' : 'Individual Student Report Card'}
        </button>
      </div>

      {/* REPORT CONTENT 1: INDIVIDUAL STUDENT PROGRESS REPORT (PRINT OPTIMIZED) */}
      {reportType === 'student_report' && (
        <div className="space-y-4">
          {currentUser.role !== 'student' && (
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Select Student for Report Card:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 font-medium"
              >
                {students.map((s) => (
                  <option key={s.StudentID} value={s.StudentID}>
                    {s.StudentID} – {s.StudentName} ({formatClassYear(s.Year, config.davGradeMappingEnabled)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Printable Report Card Container */}
          <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6 max-w-4xl mx-auto">
            {/* School Header */}
            <div className="text-center pb-6 border-b-2 border-orange-600/60 relative">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  DAV
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-blue-950 font-serif tracking-tight">
                    {config.schoolName}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">{config.schoolBranch} • {config.affiliationNumber}</p>
                </div>
              </div>
              <div className="mt-3 inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-950 font-bold text-xs uppercase tracking-widest border border-orange-300">
                Official Student Progress Report Card
              </div>
            </div>

            {/* Student Metadata Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-bold text-slate-900 text-sm">{activeStudent.StudentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student ID / Roll No</span>
                <span className="font-mono font-bold text-blue-900 text-sm">{activeStudent.StudentID}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                <span className="font-bold text-slate-800">
                  {formatClassYear(activeStudent.Year, config.davGradeMappingEnabled)} – Sec {activeStudent.Section}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Term</span>
                <span className="font-bold text-slate-800">{config.currentTerm} ({config.academicYear})</span>
              </div>
            </div>

            {/* Attendance & Habit Summary */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Attendance Rate</span>
                <span className="text-lg font-bold text-blue-900 mt-0.5 block">{activeStudent.AttendancePct}%</span>
                <span className="text-[10px] text-slate-400">CBSE Minimum: 75%</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Assignment Completion</span>
                <span className="text-lg font-bold text-purple-900 mt-0.5 block">
                  {activeStudent.AssignmentCompletionPct}%
                </span>
                <span className="text-[10px] text-slate-400">Submission Compliance</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Self-Study Commitment</span>
                <span className="text-lg font-bold text-orange-800 mt-0.5 block">
                  {activeStudent.StudyHoursPerWeek} hrs/wk
                </span>
                <span className="text-[10px] text-slate-400">Weekly Commitment</span>
              </div>
            </div>

            {/* Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-blue-950 text-white font-semibold">
                    <th className="py-2.5 px-3 border border-slate-300">Subject</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Maximum Marks</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Marks Obtained</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Percentage</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Grading Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeStudentMarks.map((m) => {
                    const pct = (m.Marks / m.MaxMarks) * 100;
                    return (
                      <tr key={m.Subject}>
                        <td className="py-2.5 px-3 border border-slate-200 font-semibold">{m.Subject}</td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right text-slate-500">{m.MaxMarks}</td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-mono font-bold text-slate-900">
                          {m.Marks}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-medium">
                          {pct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-center font-bold">
                          {m.Marks >= config.passMarksCutoff ? (
                            <span className="text-emerald-700">Qualified</span>
                          ) : (
                            <span className="text-rose-600">Needs Support</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures & Accreditation Footer */}
            <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs text-slate-600 border-t border-slate-200 mt-8">
              <div>
                <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
                <span className="font-semibold">Class Teacher</span>
              </div>
              <div>
                <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
                <span className="font-semibold">Academic Coordinator</span>
              </div>
              <div>
                <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
                <span className="font-semibold">Principal</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2">
              Generated by DAV EduVision Student Performance Analytics Platform on {currentDate}.
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 2: CLASS SUMMARY DOSSIER */}
      {reportType === 'class_summary' && (
        <Card
          title="Class-Wise Academic Summary Dossier"
          subtitle={`Aggregated records for ${filteredStudents.length} students in active scope`}
          action={
            <button
              onClick={exportClassSummaryExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export Class Summary (.xlsx)
            </button>
          }
        >
          <div className="overflow-x-auto -mx-5 -my-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                  <th className="py-3 px-4 text-right">Average Marks</th>
                  <th className="py-3 px-4 text-right">Assignment %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.slice(0, 30).map((s) => {
                  const stats = performanceMap[s.StudentID];
                  const avg = stats && stats.maxMarks > 0 ? (stats.totalMarks / stats.maxMarks) * 100 : 0;
                  return (
                    <tr key={s.StudentID}>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-950">{s.StudentID}</td>
                      <td className="py-2.5 px-4 font-medium">{s.StudentName}</td>
                      <td className="py-2.5 px-4">{formatClassYear(s.Year, config.davGradeMappingEnabled)}</td>
                      <td className="py-2.5 px-4">{s.Section}</td>
                      <td className="py-2.5 px-4 text-right font-medium">{s.AttendancePct}%</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold">{avg.toFixed(1)}%</td>
                      <td className="py-2.5 px-4 text-right">{s.AssignmentCompletionPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPORT CONTENT 3: SUBJECT PERFORMANCE REPORT */}
      {reportType === 'subject_report' && (
        <Card
          title="Curriculum Subject Performance Report"
          subtitle="Evaluation across all evaluated subject subjects"
          action={
            <button
              onClick={exportSubjectReportExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export Subject Report (.xlsx)
            </button>
          }
        >
          <div className="overflow-x-auto -mx-5 -my-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Average Marks</th>
                  <th className="py-3 px-4 text-right">Pass Rate</th>
                  <th className="py-3 px-4 text-right">Lowest Score</th>
                  <th className="py-3 px-4 text-right">Highest Score</th>
                  <th className="py-3 px-4 text-center">Focus Area Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {subjectStats.map((sub) => (
                  <tr key={sub.subject}>
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.subject}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-900">
                      {sub.avgScore}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">{sub.passRate}%</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{sub.minScore}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{sub.maxScore}</td>
                    <td className="py-3 px-4 text-center">
                      {sub.needsReview ? (
                        <Badge variant="dav" size="sm">
                          Review Needed
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          Standard
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPORT CONTENT 4: SUPPORT LIST */}
      {reportType === 'support_list' && (
        <Card
          title="DAV Academic Support & Remediation List"
          subtitle="Priority students identified for supplementary academic guidance"
          action={
            <button
              onClick={exportSupportReviewExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export Review List (.xlsx)
            </button>
          }
        >
          <div className="overflow-x-auto -mx-5 -my-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-3 px-4">Student ID & Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Trigger</th>
                  <th className="py-3 px-4">Observed Metric</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reviewItems.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-medium">
                      <span className="font-mono font-bold text-blue-900">{r.studentId}</span> – {r.studentName}
                    </td>
                    <td className="py-3 px-4">{formatClassYear(r.classYear, config.davGradeMappingEnabled)} ({r.section})</td>
                    <td className="py-3 px-4 font-semibold">{r.triggerType}</td>
                    <td className="py-3 px-4">{r.metricValue}</td>
                    <td className="py-3 px-4">
                      <Badge variant="dav" size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
