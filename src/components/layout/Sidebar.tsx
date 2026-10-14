import React from 'react';
import { useData } from '../../context/DataContext';
import {
  BarChart3,
  BookOpen,
  Clock,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  Lock,
  Settings,
  UserCheck,
  Users,
  X,
  GraduationCap,
  Building2,
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'students'
  | 'profile'
  | 'class-analytics'
  | 'subject-analytics'
  | 'attendance'
  | 'assignments'
  | 'support'
  | 'reports'
  | 'import'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  roles: ('admin' | 'teacher' | 'student')[];
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
}) => {
  const { currentUser, reviewItems, config } = useData();

  const activeReviewCount = reviewItems.filter((r) => r.status !== 'Reviewed').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'students',
      label: 'B.Tech Student Directory',
      icon: Users,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'profile',
      label: currentUser.role === 'student' ? 'My B.Tech Profile' : 'Student Academic Profile',
      icon: UserCheck,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'class-analytics',
      label: 'Branch & Year Benchmarks',
      icon: BarChart3,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'subject-analytics',
      label: 'Course & Subject Analysis',
      icon: BookOpen,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'attendance',
      label: 'Attendance & Condonation',
      icon: Clock,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'assignments',
      label: 'Lab Work & Study Habits',
      icon: FileCheck2,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'support',
      label: 'Academic Counseling & Remedial',
      icon: HeartHandshake,
      roles: ['admin', 'teacher'],
      badge: activeReviewCount > 0 ? `${activeReviewCount}` : undefined,
    },
    {
      id: 'reports',
      label: 'Reports & Grade Cards',
      icon: FileText,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'import',
      label: 'Data Import & Validation',
      icon: FileSpreadsheet,
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'Institutional Settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 h-screen lg:h-[calc(100vh-61px)] w-64 bg-slate-950 text-slate-300 flex flex-col z-50 lg:z-20 transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
          <span className="font-bold text-white text-base">VNR VJIET Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution Sub-banner */}
        <div className="p-4 mx-3 my-2 rounded-xl bg-slate-900/90 border border-slate-800 hidden lg:block">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              VNR VJIET • B.Tech Portal
            </p>
          </div>
          <p className="text-xs text-white font-semibold mt-1 truncate">VNR Vignana Jyothi</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Autonomous • B.Tech I to IV Year
          </p>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Engineering Portals
          </p>

          {navItems.map((item) => {
            const hasAccess = item.roles.includes(currentUser.role);
            const isActive = currentPage === item.id;
            const Icon = item.icon;

            if (!hasAccess) {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                  title={`Restricted to ${item.roles.join(', ')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-700" />
                    <span>{item.label}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-slate-700" />
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-900 to-amber-700 text-white shadow-md shadow-red-950/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-amber-200' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-red-900'
                        : 'bg-red-900/60 text-amber-200 border border-red-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800 bg-black/40">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-red-950 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-red-950 px-1 rounded">
                  {currentUser.role}
                </span>
                {currentUser.studentId && (
                  <span className="text-[10px] text-slate-400 truncate">
                    {currentUser.studentId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
