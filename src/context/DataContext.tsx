import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import initialRawData from '../data/initialData.json';
import {
  Student,
  SubjectMark,
  DataDictionaryItem,
  SchoolConfig,
  UserProfile,
  UserRole,
  FilterState,
  AcademicReviewItem,
  ActivityLog,
  ReviewStatus,
} from '../types';
import { calculateKPIs, filterStudentsAndMarks, CalculatedKPIs } from '../utils/analytics';
import { formatClassYear } from '../utils/davMapping';

interface DataContextType {
  students: Student[];
  subjectMarks: SubjectMark[];
  dataDictionary: DataDictionaryItem[];
  config: SchoolConfig;
  currentUser: UserProfile;
  filters: FilterState;
  reviewItems: AcademicReviewItem[];
  activityLogs: ActivityLog[];
  kpis: CalculatedKPIs;
  filteredStudents: Student[];
  filteredMarks: SubjectMark[];
  availableClasses: string[];
  availableDepartments: string[];
  availableSections: string[];
  availableSubjects: string[];
  availableTerms: string[];
  availableExamTypes: string[];
  availableAttendanceBands: string[];
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole, studentIdOrClass?: string) => void;
  updateFilters: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  updateReviewItem: (id: string, status: ReviewStatus, notes?: string) => void;
  addReviewItem: (item: Omit<AcademicReviewItem, 'id' | 'updatedAt' | 'updatedBy'>) => void;
  updateSchoolConfig: (partial: Partial<SchoolConfig>) => void;
  importDataset: (
    newStudents: Student[],
    newMarks: SubjectMark[],
    replaceExisting: boolean,
    summaryDesc: string
  ) => void;
  resetToDemoData: () => void;
  logActivity: (action: string, details: string) => void;
}

const DEFAULT_CONFIG: SchoolConfig = {
  schoolName: 'VNR Vignana Jyothi Institute of Engineering and Technology (VNR VJIET)',
  schoolBranch: 'Vignana Jyothi Nagar, Pragathi Nagar, Nizampet (S.O), Hyderabad - 500090',
  affiliationNumber: 'UGC Autonomous | NAAC A++ (CGPA 3.73) | NBA Accredited | JNTUH Affiliated',
  academicYear: '2026–2027',
  currentTerm: 'B.Tech Sem-1 (Midterm Assessment)',
  degreeProgram: 'Bachelor of Technology (B.Tech - 4 Year Degree)',
  logoUrl: null,
  passMarksCutoff: 40,
  davGradeMappingEnabled: true, // Formats 1st-4th Year -> B.Tech I - IV Year
  academicReviewThresholds: {
    attendanceBelow: 75, // JNTUH/VNR VJIET 75% attendance condonation threshold
    marksBelow: 50,
    assignmentBelow: 65,
  },
};

const DEFAULT_FILTERS: FilterState = {
  classYear: 'All',
  department: 'All',
  section: 'All',
  subject: 'All',
  examType: 'All',
  academicTerm: 'All',
  attendanceBand: 'All',
  searchQuery: '',
};

const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-vnr-admin',
  name: 'Dr. C. D. Naidu',
  role: 'admin',
  email: 'principal@vnrvjiet.in',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('vnr_btech_students');
    return saved ? JSON.parse(saved) : (initialRawData.students as Student[]);
  });

  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>(() => {
    const saved = localStorage.getItem('vnr_btech_marks');
    return saved ? JSON.parse(saved) : (initialRawData.subjectMarks as SubjectMark[]);
  });

  const [dataDictionary] = useState<DataDictionaryItem[]>(
    initialRawData.dataDictionary as DataDictionaryItem[]
  );

  const [config, setConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('vnr_btech_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_ADMIN_USER);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'Dr. C. D. Naidu (Principal, VNR VJIET)',
      action: 'B.Tech Analytics Engine Online',
      details: 'Loaded 500 B.Tech student profiles across CSE, IT, ECE, EEE, and AIML branches',
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'Dean Academics (VNR VJIET)',
      action: 'Curriculum Regulation Benchmark Active',
      details: 'Configured JNTUH / VNR Autonomous B.Tech academic evaluation cutoffs (Midterm & Attendance)',
    },
  ]);

  // Generate initial Review Items from data based on thresholds
  const [reviewItems, setReviewItems] = useState<AcademicReviewItem[]>(() => {
    const saved = localStorage.getItem('vnr_btech_reviews');
    if (saved) return JSON.parse(saved);

    const initialList: AcademicReviewItem[] = [];
    const studentList = initialRawData.students as Student[];
    const marksList = initialRawData.subjectMarks as SubjectMark[];

    // Calculate marks by student
    const studentMarksMap: Record<string, { total: number; max: number; count: number; fails: number }> = {};
    for (const m of marksList) {
      if (!studentMarksMap[m.StudentID]) {
        studentMarksMap[m.StudentID] = { total: 0, max: 0, count: 0, fails: 0 };
      }
      studentMarksMap[m.StudentID].total += m.Marks;
      studentMarksMap[m.StudentID].max += m.MaxMarks;
      studentMarksMap[m.StudentID].count++;
      if (m.Marks < 40 || m.Result === 'Fail') {
        studentMarksMap[m.StudentID].fails++;
      }
    }

    let reviewId = 1;
    for (const s of studentList) {
      const stats = studentMarksMap[s.StudentID];
      const avgMarks = stats && stats.max > 0 ? (stats.total / stats.max) * 100 : 100;

      // Condition 1: Attendance below 75%
      if (s.AttendancePct < 75) {
        initialList.push({
          id: `rev-${reviewId++}`,
          studentId: s.StudentID,
          studentName: s.StudentName,
          classYear: s.Year,
          section: s.Section,
          triggerType: 'Attendance',
          metricValue: `${s.AttendancePct}% Attendance`,
          ruleDescription: 'Attendance below JNTUH/VNR VJIET mandatory threshold (< 75%)',
          suggestedIntervention: 'Issue B.Tech faculty counselor notice and review condonation / medical records',
          status: 'Under Review',
          updatedAt: '2026-10-14 09:30',
          updatedBy: 'HOD Academic Monitoring Committee',
          notes: 'Notice dispatched to student and parent email. Mentor scheduled counseling session.',
        });
      }

      // Condition 2: Average Marks below 50% or multiple subject backlogs
      if (avgMarks < 50 || (stats && stats.fails >= 2)) {
        initialList.push({
          id: `rev-${reviewId++}`,
          studentId: s.StudentID,
          studentName: s.StudentName,
          classYear: s.Year,
          section: s.Section,
          triggerType: 'Marks',
          metricValue: `${avgMarks.toFixed(1)}% Midterm Avg (${stats ? stats.fails : 0} backlog subjects)`,
          ruleDescription: 'Midterm aggregate below 50% or 2+ subjects below 40% cutoff',
          suggestedIntervention: 'Enroll into B.Tech Department Remedial Classes & peer-assisted coding clinic',
          status: 'Support Planned',
          updatedAt: '2026-10-14 09:45',
          updatedBy: 'Department Academic Coordinator',
          notes: 'Remedial timetable allocated for Saturday lab tutorials.',
        });
      }

      // Condition 3: Assignment completion below 60%
      if (s.AssignmentCompletionPct < 60 && s.AttendancePct >= 75) {
        initialList.push({
          id: `rev-${reviewId++}`,
          studentId: s.StudentID,
          studentName: s.StudentName,
          classYear: s.Year,
          section: s.Section,
          triggerType: 'Assignment',
          metricValue: `${s.AssignmentCompletionPct}% Lab/Tutorial Submissions`,
          ruleDescription: 'Lab continuous evaluation & tutorial submission rate below 60%',
          suggestedIntervention: 'Provide guided lab assistance during departmental tutorial hours',
          status: 'Under Review',
          updatedAt: '2026-10-14 10:00',
          updatedBy: 'Course Faculty Mentor',
          notes: 'Student agreed to clear pending lab observation assignments by Friday.',
        });
      }

      if (initialList.length >= 25) break;
    }

    return initialList;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('vnr_btech_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('vnr_btech_marks', JSON.stringify(subjectMarks));
  }, [subjectMarks]);

  useEffect(() => {
    localStorage.setItem('vnr_btech_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('vnr_btech_reviews', JSON.stringify(reviewItems));
  }, [reviewItems]);

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: currentUser.name,
      action,
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 30)]);
  };

  const switchRole = (role: UserRole, studentIdOrClass?: string) => {
    if (role === 'admin') {
      setCurrentUser(DEFAULT_ADMIN_USER);
      setFilters(DEFAULT_FILTERS);
      logActivity('Role Switched', 'Switched to Principal & Dean Academics role (VNR VJIET)');
    } else if (role === 'teacher') {
      const assignedClass = studentIdOrClass || 'B.Tech II Year';
      const assignedSubject = 'Data Structures';
      setCurrentUser({
        id: 'usr-vnr-faculty',
        name: 'Dr. Rajesh Verma',
        role: 'teacher',
        email: 'r.verma@vnrvjiet.in',
        assignedClass,
        assignedSubject,
        department: 'CSE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      });
      setFilters({
        ...DEFAULT_FILTERS,
        classYear: assignedClass,
        subject: assignedSubject,
      });
      logActivity('Role Switched', `Switched to B.Tech Faculty role (${assignedClass}, ${assignedSubject})`);
    } else if (role === 'student') {
      const targetStudentId = studentIdOrClass || 'STU1001';
      const studentObj = students.find((s) => s.StudentID === targetStudentId) || students[0];
      setCurrentUser({
        id: `usr-${studentObj.StudentID}`,
        name: studentObj.StudentName,
        role: 'student',
        email: `${studentObj.StudentID.toLowerCase()}@vnrvjiet.in`,
        studentId: studentObj.StudentID,
        assignedClass: formatClassYear(studentObj.Year, config.davGradeMappingEnabled),
        department: studentObj.Department,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      });
      setFilters({
        ...DEFAULT_FILTERS,
        searchQuery: studentObj.StudentID,
      });
      logActivity('Role Switched', `Switched to B.Tech Student portal (${studentObj.StudentName} - ${studentObj.StudentID})`);
    }
  };

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const resetFilters = () => {
    if (currentUser.role === 'student' && currentUser.studentId) {
      setFilters({ ...DEFAULT_FILTERS, searchQuery: currentUser.studentId });
    } else if (currentUser.role === 'teacher' && currentUser.assignedClass) {
      setFilters({
        ...DEFAULT_FILTERS,
        classYear: currentUser.assignedClass,
        subject: currentUser.assignedSubject || 'All',
      });
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  };

  const updateReviewItem = (id: string, status: ReviewStatus, notes?: string) => {
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            status,
            notes: notes !== undefined ? notes : item.notes,
            updatedAt: new Date().toLocaleString(),
            updatedBy: currentUser.name,
          };
          logActivity('Support Status Updated', `Student ${item.studentName} (${item.studentId}) set to "${status}"`);
          return updated;
        }
        return item;
      })
    );
  };

  const addReviewItem = (item: Omit<AcademicReviewItem, 'id' | 'updatedAt' | 'updatedBy'>) => {
    const newItem: AcademicReviewItem = {
      ...item,
      id: `rev-${Date.now()}`,
      updatedAt: new Date().toLocaleString(),
      updatedBy: currentUser.name,
    };
    setReviewItems((prev) => [newItem, ...prev]);
    logActivity('Support Review Created', `Added B.Tech counseling entry for ${item.studentName} (${item.studentId})`);
  };

  const updateSchoolConfig = (partial: Partial<SchoolConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      logActivity('Configuration Updated', 'VNR VJIET institutional settings modified');
      return next;
    });
  };

  const importDataset = (
    newStudents: Student[],
    newMarks: SubjectMark[],
    replaceExisting: boolean,
    summaryDesc: string
  ) => {
    if (replaceExisting) {
      setStudents(newStudents);
      setSubjectMarks(newMarks);
    } else {
      const studentMap = new Map(students.map((s) => [s.StudentID, s]));
      for (const s of newStudents) {
        studentMap.set(s.StudentID, s);
      }
      setStudents(Array.from(studentMap.values()));

      const markKey = (m: SubjectMark) => `${m.StudentID}|${m.Subject}|${m.ExamType}|${m.AcademicTerm}`;
      const markMap = new Map(subjectMarks.map((m) => [markKey(m), m]));
      for (const m of newMarks) {
        markMap.set(markKey(m), m);
      }
      setSubjectMarks(Array.from(markMap.values()));
    }

    logActivity('Dataset Imported', summaryDesc);
  };

  const resetToDemoData = () => {
    localStorage.removeItem('vnr_btech_students');
    localStorage.removeItem('vnr_btech_marks');
    localStorage.removeItem('vnr_btech_config');
    localStorage.removeItem('vnr_btech_reviews');
    setStudents(initialRawData.students as Student[]);
    setSubjectMarks(initialRawData.subjectMarks as SubjectMark[]);
    setConfig(DEFAULT_CONFIG);
    setCurrentUser(DEFAULT_ADMIN_USER);
    setFilters(DEFAULT_FILTERS);
    logActivity('Benchmark Reset', 'Reset dataset and configuration to VNR VJIET B.Tech benchmark');
  };

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      set.add(formatClassYear(s.Year, config.davGradeMappingEnabled));
    }
    return Array.from(set).sort();
  }, [students, config.davGradeMappingEnabled]);

  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      set.add(s.Department);
    }
    return Array.from(set).sort();
  }, [students]);

  const availableSections = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      set.add(s.Section);
    }
    return Array.from(set).sort();
  }, [students]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const m of subjectMarks) {
      set.add(m.Subject);
    }
    return Array.from(set).sort();
  }, [subjectMarks]);

  const availableTerms = useMemo(() => {
    const set = new Set<string>();
    for (const m of subjectMarks) {
      set.add(m.AcademicTerm);
    }
    return Array.from(set).sort();
  }, [subjectMarks]);

  const availableExamTypes = useMemo(() => {
    const set = new Set<string>();
    for (const m of subjectMarks) {
      set.add(m.ExamType);
    }
    return Array.from(set).sort();
  }, [subjectMarks]);

  const availableAttendanceBands = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      set.add(s.AttendanceBand);
    }
    return Array.from(set).sort();
  }, [students]);

  const { filteredStudents, filteredMarks } = useMemo(() => {
    const activeFilters = { ...filters };
    if (currentUser.role === 'student' && currentUser.studentId) {
      activeFilters.searchQuery = currentUser.studentId;
    }
    if (currentUser.role === 'teacher' && currentUser.assignedClass && activeFilters.classYear === 'All') {
      activeFilters.classYear = currentUser.assignedClass;
    }

    return filterStudentsAndMarks(students, subjectMarks, activeFilters, config);
  }, [students, subjectMarks, filters, config, currentUser]);

  const kpis = useMemo(() => {
    return calculateKPIs(filteredStudents, filteredMarks, reviewItems, config.passMarksCutoff);
  }, [filteredStudents, filteredMarks, reviewItems, config.passMarksCutoff]);

  return (
    <DataContext.Provider
      value={{
        students,
        subjectMarks,
        dataDictionary,
        config,
        currentUser,
        filters,
        reviewItems,
        activityLogs,
        kpis,
        filteredStudents,
        filteredMarks,
        availableClasses,
        availableDepartments,
        availableSections,
        availableSubjects,
        availableTerms,
        availableExamTypes,
        availableAttendanceBands,
        setCurrentUser,
        switchRole,
        updateFilters,
        resetFilters,
        updateReviewItem,
        addReviewItem,
        updateSchoolConfig,
        importDataset,
        resetToDemoData,
        logActivity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
