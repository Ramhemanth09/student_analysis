import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/common/FilterBar';
import { Card, Badge } from '../components/common/Card';
import { getSubjectStats } from '../utils/analytics';
import { formatClassYear } from '../utils/davMapping';
import { BookOpen, Award, CheckCircle, AlertTriangle, ArrowUpDown, Search } from 'lucide-react';
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

interface SubjectWiseAnalysisProps {
  onSelectStudent?: (studentId: string) => void;
}

export const SubjectWiseAnalysis: React.FC<SubjectWiseAnalysisProps> = ({ onSelectStudent }) => {
  const { filteredStudents, filteredMarks, config, availableSubjects } = useData();

  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjects[0] || 'Mathematics');
  const [matrixSearch, setMatrixSearch] = useState('');

  const subjectStats = useMemo(() => {
    return getSubjectStats(filteredMarks, config.passMarksCutoff);
  }, [filteredMarks, config.passMarksCutoff]);

  const distributionData = useMemo(() => {
    const marksForSub = filteredMarks.filter((m) => m.Subject === selectedSubject);
    const brackets = [
      { range: '< 40 (Backlog Risk)', min: 0, max: 39.9, count: 0, fill: '#ef4444' },
      { range: '40–59 (Pass Grade)', min: 40, max: 59.9, count: 0, fill: '#f59e0b' },
      { range: '60–74 (First Class)', min: 60, max: 74.9, count: 0, fill: '#3b82f6' },
      { range: '75–89 (Distinction)', min: 75, max: 89.9, count: 0, fill: '#701a23' },
      { range: '90–100 (Outstanding)', min: 90, max: 100, count: 0, fill: '#10b981' },
    ];

    for (const m of marksForSub) {
      for (const b of brackets) {
        if (m.Marks >= b.min && m.Marks <= b.max) {
          b.count++;
          break;
        }
      }
    }

    return brackets;
  }, [filteredMarks, selectedSubject]);

  const studentMatrix = useMemo(() => {
    const studentMap: Record<string, { id: string; name: string; cls: string; sec: string; dept: string; marks: Record<string, number> }> = {};

    for (const s of filteredStudents) {
      studentMap[s.StudentID] = {
        id: s.StudentID,
        name: s.StudentName,
        cls: formatClassYear(s.Year, config.davGradeMappingEnabled),
        sec: s.Section,
        dept: s.Department,
        marks: {},
      };
    }

    for (const m of filteredMarks) {
      if (studentMap[m.StudentID]) {
        studentMap[m.StudentID].marks[m.Subject] = m.Marks;
      }
    }

    let list = Object.values(studentMap);
    if (matrixSearch.trim() !== '') {
      const q = matrixSearch.toLowerCase();
      list = list.filter((item) => item.id.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.dept.toLowerCase().includes(q));
    }

    return list.slice(0, 50);
  }, [filteredStudents, filteredMarks, config.davGradeMappingEnabled, matrixSearch]);

  const activeSubStat = subjectStats.find((s) => s.subject === selectedSubject) || subjectStats[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
          B.Tech Course-Wise Performance & Curriculum Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluate course clearance percentages, score distribution histograms, and cross-course engineering matrix
        </p>
      </div>

      <FilterBar showSubjectFilter={false} />

      {/* Row 1: High Level Course KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjectStats.map((s) => (
          <div
            key={s.subject}
            onClick={() => setSelectedSubject(s.subject)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedSubject === s.subject
                ? 'border-amber-600 bg-amber-50/40 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{s.subject}</span>
              {s.needsReview ? (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">
                  Remedial
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Cleared
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Course Avg:</span>
                <div className="text-xl font-bold text-red-950">{s.avgScore}%</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Pass Rate:</span>
                <div className="text-sm font-bold text-emerald-700">{s.passRate}%</div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Min: {s.minScore}</span>
              <span>Max: {s.maxScore}</span>
              <span>{s.count} Scripts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Selected Course Distribution & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Distribution Histogram */}
        <div className="lg:col-span-8">
          <Card
            title={`Score Distribution: ${selectedSubject}`}
            subtitle={`Histogram of ${activeSubStat?.count || 0} B.Tech student assessment scores`}
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} B.Tech Students`, 'Count']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="B.Tech Students" radius={[6, 6, 0, 0]} barSize={40}>
                    {distributionData.map((entry, index) => (
                      <Bar key={`cell-${index}`} dataKey="count" fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Selected Course Insights */}
        <div className="lg:col-span-4">
          <Card
            title={`${selectedSubject} Overview`}
            subtitle="Diagnostic B.Tech course evaluation"
          >
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Course Average:</span>
                  <span className="font-bold text-slate-900 text-sm">{activeSubStat?.avgScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Passing Compliance (≥40%):</span>
                  <span className="font-bold text-emerald-700">{activeSubStat?.passRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Recorded Score Range:</span>
                  <span className="font-mono text-slate-800">
                    {activeSubStat?.minScore} – {activeSubStat?.maxScore} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Evaluated Answer Scripts:</span>
                  <span className="font-medium text-slate-800">{activeSubStat?.count}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Award className="w-4 h-4 text-amber-700" /> VNR VJIET Department Guidance:
                </h4>
                <p className="mt-1 leading-relaxed text-[11px] text-amber-900/90">
                  B.Tech students scoring below 40% in {selectedSubject} should be scheduled for mandatory remedial lab sessions and coding problem sets ahead of semester exams.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Student-By-Subject Cross Matrix */}
      <Card
        title="B.Tech Student-By-Course Academic Matrix"
        subtitle="Cross-course marks comparison table with heat indicators"
        action={
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by roll no / branch..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
            />
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Year & Sec</th>
                <th className="py-3 px-4">Branch</th>
                {availableSubjects.map((sub) => (
                  <th key={sub} className="py-3 px-4 text-right">
                    {sub}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentMatrix.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectStudent && onSelectStudent(item.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-red-950">{item.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {item.cls} ({item.sec})
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-red-900 text-[11px] bg-red-50 px-1.5 py-0.5 rounded">
                      {item.dept}
                    </span>
                  </td>
                  {availableSubjects.map((sub) => {
                    const mark = item.marks[sub];
                    if (mark === undefined) {
                      return (
                        <td key={sub} className="py-3 px-4 text-right text-slate-300">
                          —
                        </td>
                      );
                    }
                    const isLow = mark < 50;
                    const isHigh = mark >= 80;
                    return (
                      <td key={sub} className="py-3 px-4 text-right font-mono">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-semibold ${
                            isLow
                              ? 'bg-rose-100 text-rose-800'
                              : isHigh
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'text-slate-800'
                          }`}
                        >
                          {mark}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
