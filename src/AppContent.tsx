import React, { useState } from 'react';
import { useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';
import { AboutModal } from './components/common/AboutModal';

// Pages
import { DashboardOverview } from './pages/DashboardOverview';
import { StudentDirectory } from './pages/StudentDirectory';
import { StudentProfile } from './pages/StudentProfile';
import { ClassSectionAnalytics } from './pages/ClassSectionAnalytics';
import { SubjectWiseAnalysis } from './pages/SubjectWiseAnalysis';
import { AttendanceAnalytics } from './pages/AttendanceAnalytics';
import { AssignmentHabitsAnalytics } from './pages/AssignmentHabitsAnalytics';
import { AcademicSupport } from './pages/AcademicSupport';
import { ReportsExport } from './pages/ReportsExport';
import { DataImport } from './pages/DataImport';
import { SettingsUserManagement } from './pages/SettingsUserManagement';

import { ChevronRight, Home, Shield, Sparkles } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { currentUser, config, students } = useData();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('STU1001');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Navigate helper
  const handleNavigate = (page: PageId, extraId?: string) => {
    if (extraId) {
      setSelectedStudentId(extraId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setCurrentPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Breadcrumbs title helper
  const getPageTitle = (page: PageId): string => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'students':
        return 'Student Directory';
      case 'profile':
        return currentUser.role === 'student' ? 'My Academic Profile' : `Student Profile (${selectedStudentId || 'STU1001'})`;
      case 'class-analytics':
        return 'Class & Section Benchmarks';
      case 'subject-analytics':
        return 'Subject-Wise Analysis';
      case 'attendance':
        return 'Attendance Analytics';
      case 'assignments':
        return 'Assignment & Study Habits';
      case 'support':
        return 'Academic Support Review';
      case 'reports':
        return 'Reports & Progress Documentation';
      case 'import':
        return 'Data Import & Validation';
      case 'settings':
        return 'Institutional Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 no-print" aria-label="Breadcrumb">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="hover:text-blue-900 transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>DAV EduVision</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{getPageTitle(currentPage)}</span>
          </nav>

          {/* Active Page View */}
          {currentPage === 'dashboard' && <DashboardOverview onNavigate={handleNavigate} />}
          {currentPage === 'students' && <StudentDirectory onSelectStudent={handleSelectStudent} />}
          {currentPage === 'profile' && (
            <StudentProfile
              selectedStudentId={selectedStudentId}
              onSelectStudent={handleSelectStudent}
            />
          )}
          {currentPage === 'class-analytics' && <ClassSectionAnalytics />}
          {currentPage === 'subject-analytics' && (
            <SubjectWiseAnalysis onSelectStudent={handleSelectStudent} />
          )}
          {currentPage === 'attendance' && (
            <AttendanceAnalytics onSelectStudent={handleSelectStudent} />
          )}
          {currentPage === 'assignments' && (
            <AssignmentHabitsAnalytics onSelectStudent={handleSelectStudent} />
          )}
          {currentPage === 'support' && <AcademicSupport onSelectStudent={handleSelectStudent} />}
          {currentPage === 'reports' && <ReportsExport />}
          {currentPage === 'import' && <DataImport />}
          {currentPage === 'settings' && <SettingsUserManagement />}
        </main>
      </div>

      {/* Persistent Floating Demo Account Switcher Badge */}
      <div className="fixed bottom-4 right-4 z-40 no-print">
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xl border border-slate-700 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
          <span>Demo Role: <strong className="uppercase text-orange-400">{currentUser.role}</strong></span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Switch</span>
        </button>
      </div>

      {/* Modals */}
      <RoleSwitcherModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </div>
  );
};
