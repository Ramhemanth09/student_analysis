import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/common/FilterBar';
import { Card, Badge } from '../components/common/Card';
import { formatClassYear, formatDepartmentStream } from '../utils/davMapping';
import { BarChart3, Layers, TrendingUp, Users, Award, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ClassSectionAnalytics: React.FC = () => {
  const { filteredStudents, filteredMarks, config } = useData();

  // Branch, Year and Section aggregation
  const { sectionStats, classStats, streamStats } = useMemo(() => {
    const studentInfoMap: Record<string, { cls: string; sec: string; dept: string; att: number }> = {};
    for (const s of filteredStudents) {
      studentInfoMap[s.StudentID] = {
        cls: formatClassYear(s.Year, config.davGradeMappingEnabled),
        sec: s.Section,
        dept: s.Department,
        att: s.AttendancePct,
      };
    }

    const secMap: Record<string, { totalMarks: number; maxMarks: number; passed: number; count: number; studentIds: Set<string>; totalAtt: number }> = {};
    const clsMap: Record<string, { totalMarks: number; maxMarks: number; passed: number; count: number; studentIds: Set<string>; totalAtt: number }> = {};
    const stmMap: Record<string, { totalMarks: number; maxMarks: number; passed: number; count: number; studentIds: Set<string> }> = {};

    for (const s of filteredStudents) {
      const info = studentInfoMap[s.StudentID];
      if (!secMap[info.sec]) {
        secMap[info.sec] = { totalMarks: 0, maxMarks: 0, passed: 0, count: 0, studentIds: new Set(), totalAtt: 0 };
      }
      secMap[info.sec].studentIds.add(s.StudentID);
      secMap[info.sec].totalAtt += s.AttendancePct;

      if (!clsMap[info.cls]) {
        clsMap[info.cls] = { totalMarks: 0, maxMarks: 0, passed: 0, count: 0, studentIds: new Set(), totalAtt: 0 };
      }
      clsMap[info.cls].studentIds.add(s.StudentID);
      clsMap[info.cls].totalAtt += s.AttendancePct;

      if (!stmMap[info.dept]) {
        stmMap[info.dept] = { totalMarks: 0, maxMarks: 0, passed: 0, count: 0, studentIds: new Set() };
      }
      stmMap[info.dept].studentIds.add(s.StudentID);
    }

    for (const m of filteredMarks) {
      const info = studentInfoMap[m.StudentID];
      if (!info) continue;

      if (secMap[info.sec]) {
        secMap[info.sec].totalMarks += m.Marks;
        secMap[info.sec].maxMarks += m.MaxMarks;
        secMap[info.sec].count++;
        if (m.Result === 'Pass' || m.Marks >= config.passMarksCutoff) {
          secMap[info.sec].passed++;
        }
      }

      if (clsMap[info.cls]) {
        clsMap[info.cls].totalMarks += m.Marks;
        clsMap[info.cls].maxMarks += m.MaxMarks;
        clsMap[info.cls].count++;
        if (m.Result === 'Pass' || m.Marks >= config.passMarksCutoff) {
          clsMap[info.cls].passed++;
        }
      }

      if (stmMap[info.dept]) {
        stmMap[info.dept].totalMarks += m.Marks;
        stmMap[info.dept].maxMarks += m.MaxMarks;
        stmMap[info.dept].count++;
        if (m.Result === 'Pass' || m.Marks >= config.passMarksCutoff) {
          stmMap[info.dept].passed++;
        }
      }
    }

    const sectionStats = Object.keys(secMap)
      .sort()
      .map((sec) => {
        const item = secMap[sec];
        const stuCount = item.studentIds.size;
        return {
          section: `Section ${sec}`,
          averageMarks: Number((item.maxMarks > 0 ? (item.totalMarks / item.maxMarks) * 100 : 0).toFixed(1)),
          passRate: Number((item.count > 0 ? (item.passed / item.count) * 100 : 0).toFixed(1)),
          avgAttendance: Number((stuCount > 0 ? item.totalAtt / stuCount : 0).toFixed(1)),
          enrolled: stuCount,
        };
      });

    const classStats = Object.keys(clsMap)
      .sort()
      .map((cls) => {
        const item = clsMap[cls];
        const stuCount = item.studentIds.size;
        return {
          className: cls,
          averageMarks: Number((item.maxMarks > 0 ? (item.totalMarks / item.maxMarks) * 100 : 0).toFixed(1)),
          passRate: Number((item.count > 0 ? (item.passed / item.count) * 100 : 0).toFixed(1)),
          avgAttendance: Number((stuCount > 0 ? item.totalAtt / stuCount : 0).toFixed(1)),
          enrolled: stuCount,
        };
      });

    const streamStats = Object.keys(stmMap)
      .sort()
      .map((dept) => {
        const item = stmMap[dept];
        return {
          stream: dept,
          streamLabel: formatDepartmentStream(dept),
          averageMarks: Number((item.maxMarks > 0 ? (item.totalMarks / item.maxMarks) * 100 : 0).toFixed(1)),
          passRate: Number((item.count > 0 ? (item.passed / item.count) * 100 : 0).toFixed(1)),
          enrolled: item.studentIds.size,
        };
      });

    return { sectionStats, classStats, streamStats };
  }, [filteredStudents, filteredMarks, config]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
          B.Tech Branch & Year Academic Benchmarks
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comparative academic analysis across B.Tech engineering branches (CSE, IT, ECE, EEE, AIML), years, and sections
        </p>
      </div>

      <FilterBar showSubjectFilter={true} />

      {/* Row 1: Section Comparisons & Engineering Branch Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section A vs B vs C */}
        <div className="lg:col-span-7">
          <Card
            title="B.Tech Section Comparison (Section A vs B vs C)"
            subtitle="Comparing academic average and attendance rates across class sections"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionStats} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="section" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="averageMarks"
                    name="Midterm Avg %"
                    fill="#701a23"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                  <Bar
                    dataKey="avgAttendance"
                    name="Avg Attendance %"
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                  <Bar
                    dataKey="passRate"
                    name="Pass Rate %"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Engineering Branch Benchmarks */}
        <div className="lg:col-span-5">
          <Card
            title="Engineering Branch Benchmarks"
            subtitle="Comparison across B.Tech Departments"
          >
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {streamStats.map((st) => (
                <div
                  key={st.stream}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{st.stream}</span>
                      <span className="ml-2 font-medium text-[11px] text-slate-600">
                        {st.streamLabel}
                      </span>
                    </div>
                    <span className="text-slate-500 font-bold">{st.enrolled} B.Techs</span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400">Midterm Avg</span>
                      <div className="font-bold text-red-950 text-sm mt-0.5">{st.averageMarks}%</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400">Pass Rate</span>
                      <div className="font-bold text-emerald-700 text-sm mt-0.5">{st.passRate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Comprehensive Year Summary Table */}
      <Card title="B.Tech Year-Wise Academic Summary Table" subtitle="Aggregated performance metrics across B.Tech I, II, III, and IV Year">
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">B.Tech Year</th>
                <th className="py-3 px-4 text-center">Enrolled Students</th>
                <th className="py-3 px-4 text-right">Average Midterm Marks</th>
                <th className="py-3 px-4 text-right">Average Attendance</th>
                <th className="py-3 px-4 text-right">Overall Pass Rate</th>
                <th className="py-3 px-4 text-center">Cohort Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {classStats.map((cls) => {
                const isTop = cls.averageMarks >= 72;
                return (
                  <tr key={cls.className} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-red-950 text-sm">{cls.className}</td>
                    <td className="py-3.5 px-4 text-center font-medium">{cls.enrolled}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {cls.averageMarks}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      {cls.avgAttendance}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {cls.passRate}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isTop ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Leading Benchmark
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Standard Range
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
