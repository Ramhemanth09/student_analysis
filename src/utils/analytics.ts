import { Student, SubjectMark, FilterState, SchoolConfig, AcademicReviewItem } from '../types';
import { formatClassYear } from './davMapping';

export interface CalculatedKPIs {
  totalStudents: number;
  averageMarksPct: number;
  passRatePct: number;
  averageAttendancePct: number;
  averageAssignmentPct: number;
  studentsNeedingReviewCount: number;
  totalAssessments: number;
}

export function filterStudentsAndMarks(
  students: Student[],
  marks: SubjectMark[],
  filters: FilterState,
  config: SchoolConfig
) {
  // 1. Filter students
  let filteredStudents = students.filter((s) => {
    // Class/Year filter
    if (filters.classYear !== 'All') {
      const displayYear = formatClassYear(s.Year, config.davGradeMappingEnabled);
      if (s.Year !== filters.classYear && displayYear !== filters.classYear) {
        return false;
      }
    }
    // Department filter
    if (filters.department !== 'All' && s.Department !== filters.department) {
      return false;
    }
    // Section filter
    if (filters.section !== 'All' && s.Section !== filters.section) {
      return false;
    }
    // Attendance Band filter
    if (filters.attendanceBand !== 'All' && s.AttendanceBand !== filters.attendanceBand) {
      return false;
    }
    // Search Query (Student ID or Name)
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchId = s.StudentID.toLowerCase().includes(q);
      const matchName = s.StudentName.toLowerCase().includes(q);
      if (!matchId && !matchName) {
        return false;
      }
    }
    return true;
  });

  const studentIdSet = new Set(filteredStudents.map((s) => s.StudentID));

  // 2. Filter marks belonging to those students, plus subject, examType, academicTerm filters
  let filteredMarks = marks.filter((m) => {
    if (!studentIdSet.has(m.StudentID)) return false;
    if (filters.subject !== 'All' && m.Subject !== filters.subject) return false;
    if (filters.examType !== 'All' && m.ExamType !== filters.examType) return false;
    if (filters.academicTerm !== 'All' && m.AcademicTerm !== filters.academicTerm) return false;
    return true;
  });

  // If a specific subject is filtered, we may also narrow the student list to only those who have marks in that subject
  if (filters.subject !== 'All') {
    const studentsWithSubject = new Set(filteredMarks.map((m) => m.StudentID));
    filteredStudents = filteredStudents.filter((s) => studentsWithSubject.has(s.StudentID));
  }

  return { filteredStudents, filteredMarks };
}

export function calculateKPIs(
  students: Student[],
  marks: SubjectMark[],
  reviewItems: AcademicReviewItem[],
  passThreshold: number
): CalculatedKPIs {
  const totalStudents = students.length;
  const totalAssessments = marks.length;

  // Average Marks Percentage: sum(Marks) / sum(MaxMarks) * 100
  let totalObtained = 0;
  let totalMax = 0;
  let passedCount = 0;

  for (const m of marks) {
    if (typeof m.Marks === 'number' && typeof m.MaxMarks === 'number' && m.MaxMarks > 0) {
      totalObtained += m.Marks;
      totalMax += m.MaxMarks;
      // Use explicit result field or configured pass threshold
      const isPass = m.Result === 'Pass' || m.Marks >= passThreshold;
      if (isPass) {
        passedCount++;
      }
    }
  }

  const averageMarksPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const passRatePct = totalAssessments > 0 ? (passedCount / totalAssessments) * 100 : 0;

  // Average Attendance %: arithmetic mean across unique students
  const validAttendance = students.filter((s) => typeof s.AttendancePct === 'number');
  const averageAttendancePct =
    validAttendance.length > 0
      ? validAttendance.reduce((acc, s) => acc + s.AttendancePct, 0) / validAttendance.length
      : 0;

  // Average Assignment Completion %: arithmetic mean across unique students
  const validAssignment = students.filter((s) => typeof s.AssignmentCompletionPct === 'number');
  const averageAssignmentPct =
    validAssignment.length > 0
      ? validAssignment.reduce((acc, s) => acc + s.AssignmentCompletionPct, 0) / validAssignment.length
      : 0;

  // Students requiring review in current filtered population
  const studentIds = new Set(students.map((s) => s.StudentID));
  const activeReviewIds = new Set(
    reviewItems
      .filter((r) => studentIds.has(r.studentId) && r.status !== 'Reviewed')
      .map((r) => r.studentId)
  );

  return {
    totalStudents,
    averageMarksPct: Number(averageMarksPct.toFixed(1)),
    passRatePct: Number(passRatePct.toFixed(1)),
    averageAttendancePct: Number(averageAttendancePct.toFixed(1)),
    averageAssignmentPct: Number(averageAssignmentPct.toFixed(1)),
    studentsNeedingReviewCount: activeReviewIds.size,
    totalAssessments,
  };
}

export function computeStudentPerformanceMap(marks: SubjectMark[]) {
  const map: Record<string, { totalMarks: number; maxMarks: number; count: number; passedCount: number; marksList: SubjectMark[] }> = {};
  for (const m of marks) {
    if (!map[m.StudentID]) {
      map[m.StudentID] = { totalMarks: 0, maxMarks: 0, count: 0, passedCount: 0, marksList: [] };
    }
    map[m.StudentID].totalMarks += m.Marks;
    map[m.StudentID].maxMarks += m.MaxMarks;
    map[m.StudentID].count++;
    if (m.Result === 'Pass' || m.Marks >= 40) {
      map[m.StudentID].passedCount++;
    }
    map[m.StudentID].marksList.push(m);
  }
  return map;
}

export function getSubjectStats(marks: SubjectMark[], passThreshold: number) {
  const subjectMap: Record<
    string,
    {
      subject: string;
      totalMarks: number;
      maxMarks: number;
      count: number;
      passed: number;
      min: number;
      max: number;
      marksArray: number[];
    }
  > = {};

  for (const m of marks) {
    if (!subjectMap[m.Subject]) {
      subjectMap[m.Subject] = {
        subject: m.Subject,
        totalMarks: 0,
        maxMarks: 0,
        count: 0,
        passed: 0,
        min: m.Marks,
        max: m.Marks,
        marksArray: [],
      };
    }
    const s = subjectMap[m.Subject];
    s.totalMarks += m.Marks;
    s.maxMarks += m.MaxMarks;
    s.count++;
    if (m.Marks < s.min) s.min = m.Marks;
    if (m.Marks > s.max) s.max = m.Marks;
    s.marksArray.push(m.Marks);

    if (m.Result === 'Pass' || m.Marks >= passThreshold) {
      s.passed++;
    }
  }

  return Object.values(subjectMap).map((item) => ({
    subject: item.subject,
    avgScore: Number((item.count > 0 ? (item.totalMarks / item.maxMarks) * 100 : 0).toFixed(1)),
    passRate: Number((item.count > 0 ? (item.passed / item.count) * 100 : 0).toFixed(1)),
    minScore: Number(item.min.toFixed(1)),
    maxScore: Number(item.max.toFixed(1)),
    count: item.count,
    needsReview: (item.totalMarks / item.maxMarks) * 100 < 60 || (item.passed / item.count) * 100 < 80,
  }));
}
