import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Bell,
  Calendar,
  ChevronDown,
  GraduationCap,
  Info,
  LogOut,
  MapPin,
  Menu,
  RotateCcw,
  Shield,
  UserCheck,
  Building2,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenRoleModal: () => void;
  onOpenAboutModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenRoleModal,
  onOpenAboutModal,
}) => {
  const { config, currentUser, activityLogs, resetToDemoData } = useData();
  const [showLogDropdown, setShowLogDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + VNR VJIET Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* VNR VJIET Emblem / Crest */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-950 via-red-900 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-950/20 ring-2 ring-amber-500/40">
              <Building2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5 font-serif">
                  VNR VJIET
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">
                  B.Tech Analytics Portal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-md">
                  VNR Vignana Jyothi Institute of Engineering & Technology
                </span>
                <span className="hidden md:inline-flex items-center gap-0.5 text-slate-400">
                  <MapPin className="w-3 h-3 text-red-800" /> Hyderabad
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Academic Term info & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Academic Info Pill */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-red-900" />
              <span>AY: {config.academicYear}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="text-slate-600 font-medium">{config.currentTerm}</div>
            <span className="text-slate-300">|</span>
            <div className="text-slate-500">{currentDate}</div>
          </div>

          {/* Role Indicator & Demo Switcher Button */}
          <button
            onClick={onOpenRoleModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-medium transition-colors"
            title="Switch Demo Role"
          >
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-bold uppercase tracking-wider text-[11px] bg-red-900 text-white px-1.5 py-0.5 rounded shadow-xs">
              {currentUser.role === 'admin' ? 'Principal / Dean' : currentUser.role === 'teacher' ? 'Faculty / HOD' : 'B.Tech Student'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-800" />
          </button>

          {/* Notification / Activity Log Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLogDropdown(!showLogDropdown)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Recent Academic Activity Log"
            >
              <Bell className="w-4 h-4" />
              {activityLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              )}
            </button>

            {showLogDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-red-700" /> VNR VJIET Academic Logs
                  </h4>
                  <span className="text-[11px] text-slate-400">{activityLogs.length} events</span>
                </div>
                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between font-medium text-slate-800">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                      <p className="text-[10px] text-red-900 font-medium mt-1">By: {log.user}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick About / Help Modal */}
          <button
            onClick={onOpenAboutModal}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="VNR VJIET B.Tech Portal Information"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* User Profile avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-red-700/30"
              />
              <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[140px] truncate">
                {currentUser.name}
              </span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="pb-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-200">
                      {currentUser.role}
                    </span>
                    {currentUser.assignedClass && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {currentUser.assignedClass}
                      </span>
                    )}
                    {currentUser.department && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {currentUser.department}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      onOpenRoleModal();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-red-700" /> Switch Demo Role
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all dataset modifications to VNR VJIET B.Tech demonstration benchmark?')) {
                        resetToDemoData();
                        setShowUserDropdown(false);
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Reset Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
