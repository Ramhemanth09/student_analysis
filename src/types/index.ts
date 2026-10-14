export interface Student {
  StudentID: string;
  StudentName: string;
  Department: string; // Engineering Branch: CSE, IT, ECE, EEE, AIML
  Year: string;       // 1st Year, 2nd Year, 3rd Year, 4th Year (B.Tech I - IV Year)
  Section: string;    // A, B, C
  Gender: string;     // Male, Female, Prefer not to say
  StudyHoursPerWeek: number;
  AttendancePct: number;
  AssignmentCompletionPct: number;
  ExtracurricularHoursPerWeek: number;
  AttendanceBand: string; // 'Below 60%', '60-75%', '75-85%', '85-100%'
}

export interface SubjectMark {
  StudentID: string;
  Subject: string;      // Programming, Data Structures, DBMS, Mathematics, Statistics
  Marks: number;        // Marks out of MaxMarks (Midterm 1/2)
  MaxMarks: number;     // e.g. 100
  ExamType: string;     // Midterm, Semester End Examination
  AcademicTerm: string; // 2026-27 Sem 1, etc.
  Result: 'Pass' | 'Fail';
}

export interface DataDictionaryItem {
  Field: string;
  Meaning: string;
}

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  assignedClass?: string;    // e.g. 'B.Tech II Year' or 'All'
  assignedSubject?: string;  // e.g. 'Data Structures' or 'All'
  studentId?: string;        // for student role, e.g. 'STU1001'
  department?: string;       // e.g. 'CSE' or 'AIML'
}

export interface SchoolConfig {
  schoolName: string;
  schoolBranch: string;
  affiliationNumber: string;
  academicYear: string;
  currentTerm: string;
  degreeProgram: string;
  logoUrl: string | null;
  passMarksCutoff: number; // default 40% (Autonomous / JNTUH B.Tech Cutoff)
  davGradeMappingEnabled: boolean; // Formats to B.Tech I - IV Year
  academicReviewThresholds: {
    attendanceBelow: number;      // default 75% (Condonation cutoff)
    marksBelow: number;           // default 50%
    assignmentBelow: number;      // default 65%
  };
}

export interface FilterState {
  classYear: string;     // 'All' or B.Tech Year
  department: string;    // 'All' or Engineering Branch
  section: string;       // 'All' | 'A' | 'B' | 'C'
  subject: string;       // 'All' or specific course
  examType: string;      // 'All' or specific
  academicTerm: string;  // 'All' or specific
  attendanceBand: string;// 'All' or band
  searchQuery: string;
}

export type ReviewStatus = 'Under Review' | 'Support Planned' | 'Reviewed';

export interface AcademicReviewItem {
  id: string;
  studentId: string;
  studentName: string;
  classYear: string;
  section: string;
  triggerType: 'Attendance' | 'Marks' | 'Assignment' | 'Composite';
  metricValue: string;
  ruleDescription: string;
  suggestedIntervention: string;
  status: ReviewStatus;
  updatedAt: string;
  updatedBy: string;
  notes: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ImportColumnMapping {
  studentId: string;
  studentName: string;
  department: string;
  year: string;
  section: string;
  gender: string;
  studyHours: string;
  attendancePct: string;
  assignmentCompletionPct: string;
  extracurricularHours: string;
  attendanceBand: string;
  markStudentId: string;
  subject: string;
  marks: string;
  maxMarks: string;
  examType: string;
  academicTerm: string;
  result: string;
}

export interface ValidationError {
  sheet: 'Students' | 'SubjectMarks';
  row: number;
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportPreviewSummary {
  totalStudentRows: number;
  validStudentRows: number;
  totalMarkRows: number;
  validMarkRows: number;
  duplicateIds: string[];
  unmatchedMarkStudentIds: string[];
  errors: ValidationError[];
}
