import React from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/common/FilterBar';
import { KpiCard } from '../components/common/KpiCard';
import { Card, Badge } from '../components/common/Card';
import { formatClassYear, formatDepartmentStream } from '../utils/davMapping';
import { getSubjectStats } from '../utils/analytics';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Building2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { PageId } from '../components/layout/Sidebar';

interface DashboardOverviewProps {
  onNavigate: (page: PageId, extraId?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const {
    kpis,
    filteredStudents,
    filteredMarks,
    config,
    currentUser,
    activityLogs,
  } = useData();

  // VNR VJIET brand color palette: Maroon, Navy, Amber, Emerald
  const PASS_FAIL_COLORS = ['#059669', '#dc2626'];

  // 1. Year-wise average marks (B.Tech I - IV Year)
  const classPerformanceData = React.useMemo(() => {
    const classMap: Record<string, { totalMarks: number; maxMarks: number; count: number; studentCount: Set<string> }> = {};
    const studentClassMap: Record<string, string> = {};

    for (const s of filteredStudents) {
      const cls = formatClassYear(s.Year, config.davGradeMappingEnabled);
      studentClassMap[s.StudentID] = cls;
      if (!classMap[cls]) {
        classMap[cls] = { totalMarks: 0, maxMarks: 0, count: 0, studentCount: new Set() };
      }
      classMap[cls].studentCount.add(s.StudentID);
    }

    for (const m of filteredMarks) {
      const cls = studentClassMap[m.StudentID];
      if (cls && classMap[cls]) {
        classMap[cls].totalMarks += m.Marks;
        classMap[cls].maxMarks += m.MaxMarks;
        classMap[cls].count++;
      }
    }

    return Object.keys(classMap)
      .sort()
      .map((cls) => {
        const item = classMap[cls];
        const avg = item.maxMarks > 0 ? (item.totalMarks / item.maxMarks) * 100 : 0;
        return {
          className: cls,
          averageMarks: Number(avg.toFixed(1)),
          students: item.studentCount.size,
        };
      });
  }, [filteredStudents, filteredMarks, config.davGradeMappingEnabled]);

  // 2. Subject stats & low performance courses
  const subjectStats = React.useMemo(() => {
    return getSubjectStats(filteredMarks, config.passMarksCutoff);
  }, [filteredMarks, config.passMarksCutoff]);

  const lowPerformingSubjects = React.useMemo(() => {
    return subjectStats.filter((s) => s.avgScore < 70 || s.passRate < 85);
  }, [subjectStats]);

  // 3. Pass vs Fail distribution
  const passFailData = React.useMemo(() => {
    let passed = 0;
    let failed = 0;
    for (const m of filteredMarks) {
      if (m.Result === 'Pass' || m.Marks >= config.passMarksCutoff) {
        passed++;
      } else {
        failed++;
      }
    }
    return [
      { name: 'Passing Assessments (≥40%)', value: passed },
      { name: 'Needs Remedial / Backlog', value: failed },
    ];
  }, [filteredMarks, config.passMarksCutoff]);

  // 4. Attendance band distribution (Autonomous / JNTUH Condonation brackets)
  const attendanceBandData = React.useMemo(() => {
    const bandCounts: Record<string, number> = {
      'Below 60%': 0,
      '60-75%': 0,
      '75-85%': 0,
      '85-100%': 0,
    };
    for (const s of filteredStudents) {
      if (s.AttendancePct < 60) bandCounts['Below 60%']++;
      else if (s.AttendancePct < 75) bandCounts['60-75%']++;
      else if (s.AttendancePct < 85) bandCounts['75-85%']++;
      else bandCounts['85-100%']++;
    }
    return [
      { band: '< 60% (Detained Risk)', count: bandCounts['Below 60%'], fill: '#ef4444' },
      { band: '60–75% (Condonation)', count: bandCounts['60-75%'], fill: '#f59e0b' },
      { band: '75–85% (Eligible)', count: bandCounts['75-85%'], fill: '#3b82f6' },
      { band: '85–100% (Exemplary)', count: bandCounts['85-100%'], fill: '#10b981' },
    ];
  }, [filteredStudents]);

  return (
    <div className="space-y-6">
      {/* VNR VJIET Welcome Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-amber-200 border border-white/20">
                {currentUser.role === 'admin'
                  ? 'Principal & Dean Academics Console'
                  : currentUser.role === 'teacher'
                  ? `B.Tech Faculty Console – ${currentUser.assignedClass || 'Engineering Department'}`
                  : 'B.Tech Student Academic Portal'}
              </span>
              <span className="text-xs text-amber-100">• VNR VJIET Autonomous Institution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 font-serif">
              VNR VJIET B.Tech Academic Analytics Platform
            </h1>
            <p className="text-sm text-red-100 mt-1 max-w-2xl">
              Centralized performance, attendance, and continuous evaluation monitoring exclusively for Bachelor of Technology (B.Tech) engineering undergraduates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => onNavigate('import')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" /> Import Excel / CSV
              </button>
            )}
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> B.Tech Grade Cards
            </button>
          </div>
        </div>
      </div>

      {/* Global Interactive Filter Bar */}
      <FilterBar />

      {/* KPI Cards Row (Computed dynamically for B.Tech cohort) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="B.Tech Students"
          value={kpis.totalStudents}
          subtitle={`Across 4 academic years`}
          icon={Users}
          colorTheme="navy"
          scopeNote={`${kpis.totalStudents} Roll Numbers`}
          onClick={() => onNavigate('students')}
        />

        <KpiCard
          title="Midterm Average"
          value={`${kpis.averageMarksPct}%`}
          subtitle="Continuous evaluation"
          icon={Award}
          colorTheme="blue"
          trend={{
            value: kpis.averageMarksPct >= 70 ? 'Proficient' : 'Needs Focus',
            isPositive: kpis.averageMarksPct >= 70,
          }}
          scopeNote={`${kpis.totalAssessments} Exam Papers`}
        />

        <KpiCard
          title="Course Pass Rate"
          value={`${kpis.passRatePct}%`}
          subtitle={`Autonomous Cutoff: ≥${config.passMarksCutoff}%`}
          icon={CheckCircle2}
          colorTheme="emerald"
          trend={{
            value: kpis.passRatePct >= 90 ? 'High Clearance' : 'Moderate',
            isPositive: kpis.passRatePct >= 90,
          }}
          scopeNote="Valid Results"
        />

        <KpiCard
          title="Avg. Attendance"
          value={`${kpis.averageAttendancePct}%`}
          subtitle="JNTUH Minimum: 75%"
          icon={Clock}
          colorTheme="amber"
          trend={{
            value: kpis.averageAttendancePct >= 75 ? 'Exam Eligible' : 'Condonation Alert',
            isPositive: kpis.averageAttendancePct >= 75,
          }}
          scopeNote="Biometric & Portal"
          onClick={() => onNavigate('attendance')}
        />

        <KpiCard
          title="Lab & Tutorials"
          value={`${kpis.averageAssignmentPct}%`}
          subtitle="Weekly Submissions"
          icon={FileCheck}
          colorTheme="purple"
          scopeNote="Lab Records"
          onClick={() => onNavigate('assignments')}
        />

        <KpiCard
          title="Counseling Watchlist"
          value={kpis.studentsNeedingReviewCount}
          subtitle="Backlog / Condonation"
          icon={AlertTriangle}
          colorTheme="saffron"
          trend={{
            value: 'Remedial Plan',
            neutral: true,
          }}
          scopeNote="Faculty Mentors"
          onClick={() => onNavigate('support')}
        />
      </div>

      {/* Main Charts Row 1: B.Tech Year Benchmark & Pass Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Year-wise Performance Bar Chart */}
        <div className="lg:col-span-7">
          <Card
            title="B.Tech Year-Wise Academic Benchmark"
            subtitle={`Average percentage marks across B.Tech I to IV Year in active cohort`}
            action={
              <button
                onClick={() => onNavigate('class-analytics')}
                className="text-xs text-red-900 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                Branch Comparisons <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {classPerformanceData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <AlertTriangle className="w-8 h-8 mb-2 text-slate-300" />
                No B.Tech records match the selected filters.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformanceData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="className" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Midterm Aggregate']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar
                      dataKey="averageMarks"
                      name="Midterm Average %"
                      fill="#701a23"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Pass / Fail & Condonation Ratio */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Assessment Clearance Ratio"
            subtitle="Passing papers vs. courses requiring remedial tests"
          >
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PASS_FAIL_COLORS[index % PASS_FAIL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [val, 'Count']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs text-slate-500">
              Evaluated B.Tech Midterm Papers: <strong className="text-slate-800">{kpis.totalAssessments}</strong>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Subject Performance & Remedial Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject-Wise Performance Breakdown */}
        <div className="lg:col-span-8">
          <Card
            title="B.Tech Course Performance & Clearance Rates"
            subtitle="Comparing academic average and pass rates by technical course"
            action={
              <button
                onClick={() => onNavigate('subject-analytics')}
                className="text-xs text-red-900 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                Course Deep Dive <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStats} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="avgScore"
                    name="Average Score %"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="passRate"
                    name="Pass Rate %"
                    fill="#701a23"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Focus Areas: B.Tech Courses Needing Attention */}
        <div className="lg:col-span-4">
          <Card
            title="Courses Requiring Remedial Attention"
            subtitle="B.Tech subjects with elevated backlog potential"
          >
            {lowPerformingSubjects.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All B.Tech subjects meet autonomous clearance targets.
              </div>
            ) : (
              <div className="space-y-3">
                {lowPerformingSubjects.map((s) => (
                  <div
                    key={s.subject}
                    className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs">{s.subject}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Average: <span className="font-bold text-red-900">{s.avgScore}%</span> • Pass Rate: <span className="font-bold text-slate-800">{s.passRate}%</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Lowest score: {s.minScore}/100 • {s.count} student answer scripts
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                      Remedial Focus
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => onNavigate('support')}
                  className="w-full mt-2 py-2 px-3 text-xs font-semibold text-red-900 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-red-200"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-700" /> View B.Tech Mentorship Watchlist
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Row 3: Attendance Condonation & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Distribution */}
        <div className="lg:col-span-6">
          <Card
            title="B.Tech Attendance & Condonation Brackets"
            subtitle="JNTUH / Autonomous 75% exam qualification compliance"
            action={
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs text-red-900 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                Attendance Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceBandData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} B.Tech Students`, 'Count']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Enrolled Students" radius={[6, 6, 0, 0]} barSize={45}>
                    {attendanceBandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Minimum 75% aggregate attendance is mandatory for semester end examination eligibility.
            </p>
          </Card>
        </div>

        {/* Recent Audit & Activity Log */}
        <div className="lg:col-span-6">
          <Card
            title="Recent Academic Activity & Audit Trail"
            subtitle="Verified logging of grade entries, counseling, and uploads at VNR VJIET"
          >
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {activityLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-red-900 font-medium">By {log.user}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
