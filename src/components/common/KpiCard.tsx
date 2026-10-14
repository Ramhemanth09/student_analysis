import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  colorTheme?: 'navy' | 'saffron' | 'emerald' | 'amber' | 'blue' | 'purple';
  scopeNote?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = 'navy',
  scopeNote,
  onClick,
}) => {
  const colorMap = {
    navy: {
      bg: 'bg-blue-50 text-blue-900 border-blue-100',
      iconBg: 'bg-blue-900 text-white',
      accent: 'border-l-4 border-l-blue-900',
    },
    saffron: {
      bg: 'bg-orange-50 text-orange-950 border-orange-100',
      iconBg: 'bg-orange-600 text-white',
      accent: 'border-l-4 border-l-orange-600',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      accent: 'border-l-4 border-l-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-950 border-amber-100',
      iconBg: 'bg-amber-600 text-white',
      accent: 'border-l-4 border-l-amber-500',
    },
    blue: {
      bg: 'bg-sky-50 text-sky-950 border-sky-100',
      iconBg: 'bg-sky-600 text-white',
      accent: 'border-l-4 border-l-sky-600',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-950 border-purple-100',
      iconBg: 'bg-purple-700 text-white',
      accent: 'border-l-4 border-l-purple-700',
    },
  };

  const theme = colorMap[colorTheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 transition-all duration-200 hover:shadow-md ${
        theme.accent
      } ${onClick ? 'cursor-pointer hover:border-slate-300' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
            {trend && (
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  trend.neutral
                    ? 'bg-slate-100 text-slate-600'
                    : trend.isPositive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg shadow-sm ${theme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {scopeNote && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Scope: {scopeNote}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
      )}
    </div>
  );
};
