import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/common/FilterBar';
import { Card, Badge } from '../components/common/Card';
import { computeStudentPerformanceMap } from '../utils/analytics';
import { formatClassYear } from '../utils/davMapping';
import { Clock, AlertTriangle, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface AttendanceAnalyticsProps {
  onSelectStudent?: (id: string) => void;
}

export const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({ onSelectStudent }) => {
  const { filteredStudents, subjectMarks, config } = useData();

  const marksMap = useMemo(() => {
    return computeStudentPerformanceMap(subjectMarks);
  }, [subjectMarks]);

  const attendanceScatterData = useMemo(() => {
    return filteredStudents.map((s) => {
      const stats = marksMap[s.StudentID];
      const avgMarks = stats && stats.maxMarks > 0 ? (stats.totalMarks / stats.maxMarks) * 100 : 0;
      return {
        id: s.StudentID,
        name: s.StudentName,
        attendance: s.AttendancePct,
        marks: Number(avgMarks.toFixed(1)),
        studyHours: s.StudyHoursPerWeek,
        cls: formatClassYear(s.Year, config.davGradeMappingEnabled),
        dept: s.Department,
      };
    });
  }, [filteredStudents, marksMap, config.davGradeMappingEnabled]);

  const bandCounts = useMemo(() => {
    let below60 = 0;
    let b60to75 = 0;
    let b75to85 = 0;
    let b85to100 = 0;

    for (const s of filteredStudents) {
      if (s.AttendancePct < 60) below60++;
      else if (s.AttendancePct < 75) b60to75++;
      else if (s.AttendancePct < 85) b75to85++;
      else b85to100++;
    }

    return [
      { name: '< 60% (Detention Risk)', count: below60, fill: '#ef4444' },
      { name: '60–75% (Condonation Range)', count: b60to75, fill: '#f59e0b' },
      { name: '75–85% (Eligible for Exams)', count: b75to85, fill: '#3b82f6' },
      { name: '85–100% (High Attendance)', count: b85to100, fill: '#10b981' },
    ];
  }, [filteredStudents]);

  const lowAttendanceList = useMemo(() => {
    return attendanceScatterData.filter((s) => s.attendance < 75).sort((a, b) => a.attendance - b.attendance);
  }, [attendanceScatterData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
          B.Tech Attendance & Condonation Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          JNTUH / Autonomous 75% attendance threshold monitoring, condonation brackets (65%–75%), and exam eligibility tracking
        </p>
      </div>

      <FilterBar showSubjectFilter={false} />

      {/* Condonation & Regulation Guidance */}
      <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 flex items-start gap-3 text-xs text-red-950">
        <Info className="w-5 h-5 text-red-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">B.Tech Academic Regulations (VNR VJIET Autonomous):</span> Students must maintain a minimum of <strong>75% aggregate attendance</strong> to be eligible for Semester End Examinations (SEE). Condonation between 65% and 75% is granted on genuine medical grounds subject to the Academic Committee's approval. Students below 65% are at severe risk of detention.
        </div>
      </div>

      {/* Attendance Band Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card
            title="B.Tech Attendance Compliance Brackets"
            subtitle="Categorization based on Autonomous examination eligibility criteria"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bandCounts} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} B.Tech Students`, 'Count']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Enrolled Students" radius={[6, 6, 0, 0]} barSize={40}>
                    {bandCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Scatter Plot: Attendance % vs Marks % */}
        <div className="lg:col-span-6">
          <Card
            title="Attendance vs. Midterm Marks Scatter Plot"
            subtitle="Exploratory plot comparing class engagement with academic scores"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 15, left: -10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="attendance"
                    name="Attendance"
                    unit="%"
                    domain={[40, 100]}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Attendance %', position: 'bottom', offset: -5, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="marks"
                    name="Marks"
                    unit="%"
                    domain={[30, 100]}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Midterm Marks %', angle: -90, position: 'left', offset: 15, fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: any) => [`${value}%`, name]}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-md text-xs space-y-1">
                          <p className="font-bold text-slate-900">{data.name} ({data.id})</p>
                          <p className="text-slate-600">Branch: <strong className="text-red-900">{data.dept}</strong> ({data.cls})</p>
                          <p className="text-slate-600">Attendance: <strong className="text-blue-900">{data.attendance}%</strong></p>
                          <p className="text-slate-600">Midterm Marks: <strong className="text-amber-700">{data.marks}%</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="B.Tech Students" data={attendanceScatterData} fill="#701a23" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Critical Attendance Table (< 75%) */}
      <Card
        title="B.Tech Students Requiring Attendance Condonation Notice (< 75%)"
        subtitle="Priority roster for faculty advisor counseling, parent notices, and condonation filing"
      >
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">B.Tech Year</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4 text-right">Attendance %</th>
                <th className="py-3 px-4 text-right">Midterm Average</th>
                <th className="py-3 px-4 text-right">Study Hours / Wk</th>
                <th className="py-3 px-4">Advisory Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lowAttendanceList.slice(0, 20).map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectStudent && onSelectStudent(s.id)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-red-950">{s.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 text-slate-500">{s.cls}</td>
                  <td className="py-3 px-4 font-bold text-red-900">{s.dept}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600">
                    {s.attendance}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">{s.marks}%</td>
                  <td className="py-3 px-4 text-right">{s.studyHours} hrs</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-medium">
                      Faculty Advisor Notice & Condonation Review
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
