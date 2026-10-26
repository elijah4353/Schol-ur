import { useMemo, useState } from 'react';
import {
  Bus,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  GraduationCap,
  Search,
  Sparkles,
  UtensilsCrossed,
  Wallet,
  BookOpen,
  FlaskConical,
  Wifi,
  PencilRuler,
  Printer,
  type LucideIcon,
} from 'lucide-react';
import { SCHOLARSHIP_CATEGORIES, type ScholarshipCategory, type Scholarship } from '@/lib/supabase';
import { useScholarships } from '@/hooks/useScholarships';
import { useApplications } from '@/hooks/useApplications';
import {
  deadlineLabel,
  deadlineStatus,
  daysUntil,
  formatDate,
  fillRate,
  isAvailable,
} from '@/utils/dates';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'General Scholarship': GraduationCap,
  Tuition: GraduationCap,
  'Living Allowance': Wallet,
  Books: BookOpen,
  Research: FlaskConical,
  Transportation: Bus,
  Meals: UtensilsCrossed,
  'Internet Data': Wifi,
  'School Supplies': PencilRuler,
  Printing: Printer,
};

const DEADLINE_STYLES = {
  open: 'bg-base-200 text-brand-600',
  soon: 'bg-teal-50 text-teal-700',
  urgent: 'bg-gold-50 text-gold-700',
  closed: 'bg-gold-50 text-gold-700',
};

export function BrowseView({
  onApply,
}: {
  onApply: (scholarship: Scholarship) => void;
}) {
  const { scholarships, loading } = useScholarships();
  const { applications } = useApplications();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ScholarshipCategory | 'All'>('All');
  const [needMatch, setNeedMatch] = useState<ScholarshipCategory | null>(null);

  const appliedIds = useMemo(
    () => new Set(applications.map((a) => a.scholarship_id)),
    [applications],
  );

  const filtered = useMemo(() => {
    let list = scholarships;
    if (category !== 'All') list = list.filter((s) => s.category === category);
    if (needMatch) list = list.filter((s) => s.category === needMatch);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (isAvailable(a) !== isAvailable(b)) return isAvailable(a) ? -1 : 1;
      return daysUntil(a.deadline) - daysUntil(b.deadline);
    });
  }, [scholarships, category, needMatch, search]);

  return (
    <div className="px-4 pb-6 pt-4">
      {/* Need matcher */}
      <div className="mb-4 rounded-2xl bg-brand p-4 text-white animate-slide-up">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-100">
          <Sparkles className="h-4 w-4" />
          Tell us what you need
        </div>
        <p className="mt-1 text-xs text-brand-200">
          Pick a category and we&apos;ll surface programs open right now.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCHOLARSHIP_CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c];
            const active = needMatch === c;
            return (
              <button
                key={c}
                onClick={() => setNeedMatch(active ? null : c)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gold text-brand-800'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scholarships…"
          className="input-field pl-9"
        />
      </div>

      {/* Category filter */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 flex-shrink-0 text-brand-400" />
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <FilterChip active={category === 'All'} onClick={() => setCategory('All')}>
            All
          </FilterChip>
          {SCHOLARSHIP_CATEGORIES.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-base-100 p-8 text-center text-sm text-brand-400">
          No scholarships match your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <ScholarshipCard
              key={s.id}
              scholarship={s}
              applied={appliedIds.has(s.id)}
              onApply={() => onApply(s)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-brand text-white'
          : 'bg-white text-brand-500 border border-brand-100 hover:border-brand-300'
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-base-200" />
      ))}
    </div>
  );
}

function ScholarshipCard({
  scholarship,
  applied,
  onApply,
  index,
}: {
  scholarship: Scholarship;
  applied: boolean;
  onApply: () => void;
  index: number;
}) {
  const Icon = CATEGORY_ICONS[scholarship.category] ?? GraduationCap;
  const dl = deadlineStatus(scholarship.deadline);
  const available = isAvailable(scholarship);
  const rate = fillRate(scholarship);

  return (
    <div
      className="card card-hover animate-slide-up p-4"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold leading-tight text-brand">{scholarship.name}</h3>
            <span
              className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${DEADLINE_STYLES[dl]}`}
            >
              {deadlineLabel(scholarship.deadline)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-brand-500">{scholarship.provider}</p>
        </div>
      </div>

      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-brand-600">
        {scholarship.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-base-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
          <Icon className="h-3 w-3" />
          {scholarship.category}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
          {scholarship.amount}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-base-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
          <Calendar className="h-3 w-3" />
          Due {formatDate(scholarship.deadline)}
        </span>
      </div>

      {/* Availability bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-200">
          <div
            className={`h-full rounded-full transition-all ${available ? 'bg-teal' : 'bg-gold-500'}`}
            style={{ width: `${rate}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-brand-400">
          {scholarship.slots_available}/{scholarship.slots_total} slots
        </span>
      </div>

      {/* Action */}
      <div className="mt-3 flex items-center justify-between border-t border-brand-50 pt-3">
        {applied ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
            <CheckCircle2 className="h-4 w-4" />
            Applied
          </span>
        ) : !available ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700">
            <Clock className="h-4 w-4" />
            {dl === 'closed' ? 'Deadline passed' : 'No slots left'}
          </span>
        ) : (
          <span className="text-[11px] text-brand-400">Tap to apply</span>
        )}
        <button
          onClick={onApply}
          disabled={!available || applied}
          className="btn-secondary px-4 py-1.5 text-xs disabled:bg-base-200 disabled:text-brand-400"
        >
          {applied ? 'Applied' : 'Apply'}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
