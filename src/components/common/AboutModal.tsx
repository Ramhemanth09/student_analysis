import React from 'react';
import { useData } from '../../context/DataContext';
import { Building2, ShieldCheck, Database, Award, BookCheck, X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { config, students, subjectMarks } = useData();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-red-900 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 ring-1 ring-white/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">About VNR VJIET B.Tech Analytics Platform</h3>
              <p className="text-xs text-amber-200">
                Vallurupalli Nageswara Rao Vignana Jyothi Institute of Engineering & Technology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-200/80">
            <h4 className="font-bold text-red-950 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" /> VNR VJIET Institutional Profile & Ethos
            </h4>
            <p className="mt-1.5 text-red-950">
              Established in 1995 by Vignana Jyothi, VNR VJIET is an autonomous engineering institution accredited with <strong>NAAC 'A++' Grade (CGPA 3.73/4.0)</strong> and recognized for quality engineering education under JNTUH.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1.5">
              <Database className="w-4 h-4 text-red-900" /> Dedicated Exclusively to B.Tech Students
            </h4>
            <p>
              This platform is tailored exclusively for <strong>B.Tech Undergraduate Engineering Students</strong> across all four years:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Academic Progression:</strong> B.Tech I Year, B.Tech II Year, B.Tech III Year, and B.Tech IV Year.</li>
              <li><strong>Engineering Branches:</strong> CSE (Computer Science), IT (Information Technology), ECE (Electronics & Communication), EEE (Electrical & Electronics), and AIML (Artificial Intelligence & Machine Learning).</li>
              <li><strong>Core Dataset:</strong> {students.length} B.Tech students and {subjectMarks.length} midterm assessments across major technical courses.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1.5">
              <BookCheck className="w-4 h-4 text-emerald-700" /> Academic Regulations & Condonation Rules
            </h4>
            <p>
              The platform incorporates standard autonomous B.Tech examination guidelines:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Minimum Attendance:</strong> 75% aggregate attendance is mandatory for semester end examination eligibility (condonation between 65%–75% for genuine medical cases).</li>
              <li><strong>Passing Cutoff:</strong> 40% minimum score in internal midterm and semester assessments.</li>
              <li><strong>Proactive Counseling:</strong> Early faculty mentorship alerts for students requiring remedial assistance in theory or lab components.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" /> Confidentiality & Ethical Student Guidance
            </h4>
            <p>
              Student performance flags are designed for supportive instructional interventions. Individual grade cards and academic histories remain strictly confidential.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{config.affiliationNumber}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-red-950 hover:bg-red-900 rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
