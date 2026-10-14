import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/common/FilterBar';
import { Card, Badge } from '../components/common/Card';
import { formatClassYear, formatDepartmentStream } from '../utils/davMapping';
import { computeStudentPerformanceMap } from '../utils/analytics';
import {
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentDirectoryProps {
  onSelectStudent: (studentId: string) => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ onSelectStudent }) => {
  const {
    filteredStudents,
    subjectMarks,
    config,
    reviewItems,
  } = useData();

  const [sortField, setSortField] = useState<'id' | 'name' | 'attendance' | 'marks' | 'assignment'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [statusFilter, setStatusFilter] = useState<'All' | 'Reviewed' | 'NeedSupport' | 'Regular'>('All');

  // Compute student performance map for all students based on their subject marks
  const studentPerformanceMap = useMemo(() => {
    return computeStudentPerformanceMap(subjectMarks);
  }, [subjectMarks]);

  // Review status lookup
  const reviewStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of reviewItems) {
      if (r.status !== 'Reviewed') {
        map[r.studentId] = r.status;
      }
    }
    return map;
  }, [reviewItems]);

  // Combined data for filtered students
  const enrichedStudents = useMemo(() => {
    return filteredStudents.map((s) => {
      const stats = studentPerformanceMap[s.StudentID];
      const avgMarks = stats && stats.maxMarks > 0 ? (stats.totalMarks / stats.maxMarks) * 100 : 0;
      const reviewStatus = reviewStatusMap[s.StudentID] || (s.AttendancePct < 75 || avgMarks < 50 ? 'Condonation / Remedial' : 'Good Standing');

      return {
        ...s,
        avgMarks: Number(avgMarks.toFixed(1)),
        displayClass: formatClassYear(s.Year, config.davGradeMappingEnabled),
        displayStream: formatDepartmentStream(s.Department),
        supportStatus: reviewStatus,
      };
    });
  }, [filteredStudents, studentPerformanceMap, reviewStatusMap, config.davGradeMappingEnabled]);

  // Status Filter
  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'All') return enrichedStudents;
    if (statusFilter === 'NeedSupport') {
      return enrichedStudents.filter(
        (s) => s.supportStatus === 'Under Review' || s.supportStatus === 'Support Planned' || s.supportStatus === 'Condonation / Remedial'
      );
    }
    if (statusFilter === 'Regular') {
      return enrichedStudents.filter((s) => s.supportStatus === 'Good Standing');
    }
    return enrichedStudents;
  }, [enrichedStudents, statusFilter]);

  // Sorting
  const sortedStudents = useMemo(() => {
    return [...filteredByStatus].sort((a, b) => {
      let valA: any = a.StudentID;
      let valB: any = b.StudentID;

      if (sortField === 'name') {
        valA = a.StudentName;
        valB = b.StudentName;
      } else if (sortField === 'attendance') {
        valA = a.AttendancePct;
        valB = b.AttendancePct;
      } else if (sortField === 'marks') {
        valA = a.avgMarks;
        valB = b.avgMarks;
      } else if (sortField === 'assignment') {
        valA = a.AssignmentCompletionPct;
        valB = b.AssignmentCompletionPct;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredByStatus, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, page, pageSize]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const exportToExcel = () => {
    const exportData = sortedStudents.map((s) => ({
      'Roll Number': s.StudentID,
      'Student Name': s.StudentName,
      'B.Tech Year': s.displayClass,
      'Branch': s.Department,
      'Section': s.Section,
      'Full Degree Program': s.displayStream,
      'Gender': s.Gender,
      'Attendance %': s.AttendancePct,
      'Midterm Average %': s.avgMarks,
      'Lab/Tutorial Completion %': s.AssignmentCompletionPct,
      'Weekly Study Hours': s.StudyHoursPerWeek,
      'Academic Status': s.supportStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VNR_BTech_Students');
    XLSX.writeFile(wb, `VNR_VJIET_BTech_Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
            VNR VJIET B.Tech Student Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Undergraduate B.Tech student profiles, branches (CSE, IT, ECE, EEE, AIML), and academic performance metrics
          </p>
        </div>

        <button
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export B.Tech Directory (Excel)
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Sub-Filter: Status pills & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-600 mr-1">Status Filter:</span>
          {(['All', 'NeedSupport', 'Regular'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-red-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'All'
                ? 'All B.Tech Students'
                : st === 'NeedSupport'
                ? 'Condonation & Backlog Watchlist'
                : 'Good Standing'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Displaying <strong>{sortedStudents.length}</strong> B.Tech students
        </span>
      </div>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Roll No <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Student Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">B.Tech Year & Sec</th>
                <th className="py-3.5 px-4">Branch</th>
                <th
                  onClick={() => handleSort('attendance')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    Attendance <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marks')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    Midterm Avg <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assignment')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    Lab / Tutorials <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Academic Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No B.Tech students match your active filters or search terms.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => {
                  const isSupport =
                    s.supportStatus === 'Under Review' ||
                    s.supportStatus === 'Support Planned' ||
                    s.supportStatus === 'Condonation / Remedial';

                  return (
                    <tr
                      key={s.StudentID}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(s.StudentID)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-red-950">
                        {s.StudentID}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                            {s.StudentName.charAt(s.StudentName.length - 1)}
                          </span>
                          <span>{s.StudentName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{s.displayClass}</span>
                        <span className="ml-1 text-slate-400">({s.Section})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-200">
                          {s.Department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-semibold ${
                            s.AttendancePct < 75 ? 'text-rose-600 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {s.AttendancePct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-semibold ${
                            s.avgMarks < 50
                              ? 'text-rose-600 font-bold'
                              : s.avgMarks >= 75
                              ? 'text-emerald-700 font-bold'
                              : 'text-slate-800'
                          }`}
                        >
                          {s.avgMarks}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700">
                        {s.AssignmentCompletionPct}%
                      </td>
                      <td className="py-3.5 px-4">
                        {isSupport ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                            Condonation / Remedial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            Good Standing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(s.StudentID);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-red-950 bg-red-50 hover:bg-red-100 rounded-md transition-colors inline-flex items-center gap-1 border border-red-200"
                        >
                          <Eye className="w-3.5 h-3.5 text-red-700" /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({sortedStudents.length} B.Tech students)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
