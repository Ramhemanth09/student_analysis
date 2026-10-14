import React from 'react';
import { useData } from '../../context/DataContext';
import { Filter, RotateCcw, Search, SlidersHorizontal, Layers } from 'lucide-react';

interface FilterBarProps {
  showSubjectFilter?: boolean;
  showAttendanceFilter?: boolean;
  showSectionFilter?: boolean;
  showClassFilter?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  showSubjectFilter = true,
  showAttendanceFilter = true,
  showSectionFilter = true,
  showClassFilter = true,
  className = '',
}) => {
  const {
    filters,
    updateFilters,
    resetFilters,
    availableClasses,
    availableDepartments,
    availableSections,
    availableSubjects,
    availableTerms,
    availableAttendanceBands,
    filteredStudents,
    filteredMarks,
    students,
    subjectMarks,
    currentUser,
  } = useData();

  const isFiltered =
    filters.classYear !== 'All' ||
    filters.department !== 'All' ||
    filters.section !== 'All' ||
    filters.subject !== 'All' ||
    filters.academicTerm !== 'All' ||
    filters.attendanceBand !== 'All' ||
    (filters.searchQuery !== '' && currentUser.role !== 'student');

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 ${className}`}>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search B.Tech student by roll no / name (e.g. STU1001)..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester / Academic Term */}
          <div className="relative">
            <select
              value={filters.academicTerm}
              onChange={(e) => updateFilters({ academicTerm: e.target.value })}
              className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-red-900 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="All">All Semesters</option>
              {availableTerms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* B.Tech Year */}
          {showClassFilter && currentUser.role !== 'student' && (
            <div className="relative">
              <select
                value={filters.classYear}
                onChange={(e) => updateFilters({ classYear: e.target.value })}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-red-900 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="All">All B.Tech Years</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Engineering Branch / Dept */}
          {currentUser.role !== 'student' && (
            <div className="relative">
              <select
                value={filters.department}
                onChange={(e) => updateFilters({ department: e.target.value })}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-red-900 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="All">All Engineering Branches</option>
                {availableDepartments.map((d) => (
                  <option key={d} value={d}>
                    Branch: {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section */}
          {showSectionFilter && (
            <div className="relative">
              <select
                value={filters.section}
                onChange={(e) => updateFilters({ section: e.target.value })}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-red-900 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="All">All Sections</option>
                {availableSections.map((s) => (
                  <option key={s} value={s}>
                    Sec {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Course / Subject */}
          {showSubjectFilter && (
            <div className="relative">
              <select
                value={filters.subject}
                onChange={(e) => updateFilters({ subject: e.target.value })}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-red-900 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="All">All B.Tech Courses</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attendance Band */}
          {showAttendanceFilter && currentUser.role !== 'student' && (
            <div className="relative">
              <select
                value={filters.attendanceBand}
                onChange={(e) => updateFilters({ attendanceBand: e.target.value })}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-red-900 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="All">All Attendance Bands</option>
                {availableAttendanceBands.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              title="Clear all active filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Dataset Scope Indicator Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-900" />
            Active B.Tech Cohort:
          </span>
          <span>
            {filteredStudents.length} of {students.length} B.Tech students
          </span>
          <span className="text-slate-300">•</span>
          <span>
            {filteredMarks.length} of {subjectMarks.length} course assessments
          </span>
        </div>

        {isFiltered && (
          <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 text-[11px] font-semibold">
            <SlidersHorizontal className="w-3 h-3 text-amber-700" />
            Filtered Cohort Scope
          </div>
        )}
      </div>
    </div>
  );
};
