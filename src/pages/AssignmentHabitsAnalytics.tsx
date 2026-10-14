import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/common/FilterBar';
import { Card } from '../components/common/Card';
import { computeStudentPerformanceMap } from '../utils/analytics';
import { formatClassYear } from '../utils/davMapping';
import { FileCheck, Clock, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface AssignmentHabitsAnalyticsProps {
  onSelectStudent?: (id: string) => void;
}

export const AssignmentHabitsAnalytics: React.FC<AssignmentHabitsAnalyticsProps> = ({
  onSelectStudent,
}) => {
  const { filteredStudents, subjectMarks, config } = useData();

  const marksMap = useMemo(() => {
    return computeStudentPerformanceMap(subjectMarks);
  }, [subjectMarks]);

  const scatterData = useMemo(() => {
    return filteredStudents.map((s) => {
      const stats = marksMap[s.StudentID];
      const avgMarks = stats && stats.maxMarks > 0 ? (stats.totalMarks / stats.maxMarks) * 100 : 0;
      return {
        id: s.StudentID,
        name: s.StudentName,
        marks: Number(avgMarks.toFixed(1)),
        studyHours: s.StudyHoursPerWeek,
        assignmentPct: s.AssignmentCompletionPct,
        extraHours: s.ExtracurricularHoursPerWeek,
        cls: formatClassYear(s.Year, config.davGradeMappingEnabled),
        dept: s.Department,
      };
    });
  }, [filteredStudents, marksMap, config.davGradeMappingEnabled]);

  const studyHoursBands = useMemo(() => {
    let under5 = 0;
    let h5to10 = 0;
    let h10to15 = 0;
    let over15 = 0;

    for (const s of filteredStudents) {
      if (s.StudyHoursPerWeek < 5) under5++;
      else if (s.StudyHoursPerWeek < 10) h5to10++;
      else if (s.StudyHoursPerWeek < 15) h10to15++;
      else over15++;
    }

    return [
      { band: '< 5 hrs/wk', count: under5, fill: '#f59e0b' },
      { band: '5–10 hrs/wk', count: h5to10, fill: '#3b82f6' },
      { band: '10–15 hrs/wk', count: h10to15, fill: '#701a23' },
      { band: '> 15 hrs/wk', count: over15, fill: '#10b981' },
    ];
  }, [filteredStudents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
          B.Tech Lab Continuous Evaluation & Study Habits
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Laboratory observations, continuous internal evaluation (CIE), tutorial submissions, and self-study commitments
        </p>
      </div>

      <FilterBar showSubjectFilter={false} />

      {/* Advisory Reminder */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Engineering Pedagogy:</span> Regular laboratory observation write-ups, code submissions, and practice problem sheets directly reinforce engineering fundamentals. Use these indicators to supportively counsel students falling behind on weekly lab tasks.
        </div>
      </div>

      {/* Row 1: Dual Scatter Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter 1: Lab/Assignment Completion vs Marks */}
        <div className="lg:col-span-6">
          <Card
            title="Lab & Tutorial Completion vs. Midterm Marks"
            subtitle="Comparing lab coursework completion with exam scores"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 15, left: -10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="assignmentPct"
                    name="Lab Assignments"
                    unit="%"
                    domain={[30, 100]}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Lab / Tutorial Completion %', position: 'bottom', offset: -5, fontSize: 11 }}
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
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-md text-xs space-y-1">
                          <p className="font-bold text-slate-900">{data.name} ({data.id})</p>
                          <p className="text-slate-600">Branch: <strong className="text-red-900">{data.dept}</strong></p>
                          <p className="text-slate-600">Lab Work: <strong className="text-purple-700">{data.assignmentPct}%</strong></p>
                          <p className="text-slate-600">Midterm Marks: <strong className="text-amber-700">{data.marks}%</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="B.Tech Students" data={scatterData} fill="#7c3aed" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Scatter 2: Study Hours vs Marks */}
        <div className="lg:col-span-6">
          <Card
            title="Weekly Study Commitment vs. Midterm Marks"
            subtitle="Comparing self-study hours per week with academic score"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 15, left: -10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="studyHours"
                    name="Study Hours"
                    unit="h"
                    domain={[0, 25]}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Study Hours Per Week', position: 'bottom', offset: -5, fontSize: 11 }}
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
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-md text-xs space-y-1">
                          <p className="font-bold text-slate-900">{data.name} ({data.id})</p>
                          <p className="text-slate-600">Branch: <strong className="text-red-900">{data.dept}</strong></p>
                          <p className="text-slate-600">Study Hours: <strong className="text-blue-900">{data.studyHours} hrs/wk</strong></p>
                          <p className="text-slate-600">Midterm Marks: <strong className="text-amber-700">{data.marks}%</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="B.Tech Students" data={scatterData} fill="#701a23" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Study Hours Bracket Distribution */}
      <Card
        title="B.Tech Self-Study Commitment Brackets"
        subtitle="Distribution of B.Tech students across weekly study hour intervals"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studyHoursBands} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [`${val} B.Tech Students`, 'Count']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" name="Enrolled Students" radius={[6, 6, 0, 0]} barSize={45}>
                {studyHoursBands.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
