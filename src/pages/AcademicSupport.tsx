import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/common/FilterBar';
import { Card, Badge } from '../components/common/Card';
import { formatClassYear } from '../utils/davMapping';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldAlert,
  Sliders,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ReviewStatus, AcademicReviewItem } from '../types';

interface AcademicSupportProps {
  onSelectStudent?: (id: string) => void;
}

export const AcademicSupport: React.FC<AcademicSupportProps> = ({ onSelectStudent }) => {
  const {
    reviewItems,
    updateReviewItem,
    config,
    currentUser,
    updateSchoolConfig,
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'under_review' | 'support_planned' | 'reviewed'>('all');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<AcademicReviewItem | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);

  const [tempAtt, setTempAtt] = useState(config.academicReviewThresholds.attendanceBelow);
  const [tempMarks, setTempMarks] = useState(config.academicReviewThresholds.marksBelow);
  const [tempAssign, setTempAssign] = useState(config.academicReviewThresholds.assignmentBelow);

  const filteredItems = useMemo(() => {
    return reviewItems.filter((item) => {
      if (activeTab === 'under_review' && item.status !== 'Under Review') return false;
      if (activeTab === 'support_planned' && item.status !== 'Support Planned') return false;
      if (activeTab === 'reviewed' && item.status !== 'Reviewed') return false;

      if (filterTrigger !== 'all' && item.triggerType !== filterTrigger) return false;
      return true;
    });
  }, [reviewItems, activeTab, filterTrigger]);

  const handleStatusChange = (id: string, newStatus: ReviewStatus) => {
    updateReviewItem(id, newStatus);
  };

  const handleSaveNotes = () => {
    if (!editingItem) return;
    updateReviewItem(editingItem.id, editingItem.status, editNotes);
    setEditingItem(null);
  };

  const handleSaveThresholds = () => {
    updateSchoolConfig({
      academicReviewThresholds: {
        attendanceBelow: Number(tempAtt),
        marksBelow: Number(tempMarks),
        assignmentBelow: Number(tempAssign),
      },
    });
    setShowThresholdConfig(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-red-700" />
            VNR VJIET B.Tech Academic Counseling & Remedial Cell
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify backlog risks and condonation alerts early, coordinate faculty mentorship, and manage remedial actions
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-red-900" /> Configure Regulation Thresholds
          </button>
        )}
      </div>

      {/* Threshold Config Drawer / Panel */}
      {showThresholdConfig && (
        <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-red-950 text-xs flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-900" /> VNR VJIET B.Tech Examination & Mentorship Thresholds
            </h4>
            <span className="text-[11px] text-red-700 font-medium">Autonomous Regulation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Attendance Condonation Cutoff:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempAtt}
                  onChange={(e) => setTempAtt(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
                <span className="text-slate-500">% attendance</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Remedial Marks Flag Level:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempMarks}
                  onChange={(e) => setTempMarks(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
                <span className="text-slate-500">% score</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Lab / Tutorial Deficit Cutoff:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempAssign}
                  onChange={(e) => setTempAssign(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
                <span className="text-slate-500">% completed</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-red-200/60">
            <button
              onClick={() => setShowThresholdConfig(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveThresholds}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-950 hover:bg-red-900 rounded-lg shadow-xs"
            >
              Update Institutional Policies
            </button>
          </div>
        </div>
      )}

      {/* Advisory Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950">
        <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Faculty Mentorship Mandate:</span> Statistical flags are designed to trigger constructive peer-study groups, tutorial sessions, and faculty advisor check-ins. Students are supported through remedial sessions and lab clinics to ensure successful B.Tech graduation.
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-red-950 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Action Items ({reviewItems.length})
          </button>
          <button
            onClick={() => setActiveTab('under_review')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'under_review'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Under Review ({reviewItems.filter((r) => r.status === 'Under Review').length})
          </button>
          <button
            onClick={() => setActiveTab('support_planned')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'support_planned'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Remedial Planned ({reviewItems.filter((r) => r.status === 'Support Planned').length})
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'reviewed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Resolved & Monitored ({reviewItems.filter((r) => r.status === 'Reviewed').length})
          </button>
        </div>

        {/* Trigger type filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Trigger Flag:</span>
          <select
            value={filterTrigger}
            onChange={(e) => setFilterTrigger(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 font-medium"
          >
            <option value="all">All Trigger Categories</option>
            <option value="Attendance">Attendance Condonation</option>
            <option value="Marks">Midterm Marks Deficit</option>
            <option value="Assignment">Lab / Tutorial Incomplete</option>
          </select>
        </div>
      </div>

      {/* Review Items Table */}
      <Card>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Roll No & Student Name</th>
                <th className="py-3.5 px-4">Year & Sec</th>
                <th className="py-3.5 px-4">Trigger Category</th>
                <th className="py-3.5 px-4">Observed Metric</th>
                <th className="py-3.5 px-4">Intervention Next Step</th>
                <th className="py-3.5 px-4">Mentorship Status</th>
                <th className="py-3.5 px-4 text-center">Faculty Diary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No B.Tech students currently in this review state.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => onSelectStudent && onSelectStudent(item.studentId)}
                        className="font-mono font-bold text-red-950 hover:underline cursor-pointer flex items-center gap-1.5"
                      >
                        {item.studentId} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="font-medium text-slate-900 mt-0.5">{item.studentName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {formatClassYear(item.classYear, config.davGradeMappingEnabled)} ({item.section})
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.triggerType === 'Attendance'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.triggerType === 'Marks'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.triggerType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{item.metricValue}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.ruleDescription}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-700 leading-snug">{item.suggestedIntervention}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as ReviewStatus)}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          item.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : item.status === 'Support Planned'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Support Planned">Support Planned</option>
                        <option value="Reviewed">Reviewed</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">{item.updatedAt}</p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setEditNotes(item.notes || '');
                        }}
                        className="px-2.5 py-1 text-xs text-red-950 bg-red-50 hover:bg-red-100 rounded-lg font-semibold inline-flex items-center gap-1 border border-red-200"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-red-800" />
                        {item.notes ? 'View/Edit' : 'Add Note'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Notes Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Faculty Counseling Diary: {editingItem.studentName} ({editingItem.studentId})
                </h3>
                <p className="text-xs text-slate-500">Record counselor meeting notes, remedial actions, or parent communication</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Faculty Observation & Mentorship Diary:
              </label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Enter counseling details, assigned laboratory remedial tasks, or parent discussions..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-950 hover:bg-red-900 rounded-lg shadow-xs"
              >
                Save Observation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
