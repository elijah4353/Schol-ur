import { useMemo, useState } from 'react';
import {
  Bus,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FlaskConical,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  X,
  Wifi,
  PencilRuler,
  Printer,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useScholarships } from '@/hooks/useScholarships';
import { useApplications } from '@/hooks/useApplications';
import {
  daysUntil,
  deadlineLabel,
  deadlineStatus,
  formatDate,
  isAvailable,
} from '@/utils/dates';
import type { Scholarship } from '@/lib/supabase';

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

const DEADLINE_DOT: Record<string, string> = {
  open: 'bg-base-300',
  soon: 'bg-teal',
  urgent: 'bg-gold',
  closed: 'bg-gold-500',
};

export function HomeView({
  onBrowse,
  onApply,
}: {
  onBrowse: () => void;
  onApply: (s: Scholarship) => void;
}) {
  const { profile } = useAuth();
  const { scholarships } = useScholarships();
  const { applications } = useApplications();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  const upcomingDeadlines = useMemo(
    () =>
      scholarships
        .filter((s) => isAvailable(s))
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
        .slice(0, 3),
    [scholarships],
  );

  const activeApps = useMemo(
    () => applications.filter((a) => a.status === 'Submitted' || a.status === 'In Review'),
    [applications],
  );

  return (
    <div className="px-4 pb-6 pt-4">
      <HomeHero
        firstName={firstName}
        scholarships={scholarships}
        applications={applications}
        onBrowse={onBrowse}
        onApply={onApply}
      />

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          onClick={onBrowse}
          className="card card-hover flex flex-col items-start gap-2 p-4 text-left animate-slide-up"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand">Find aid</p>
            <p className="text-[11px] text-brand-400">Browse open programs</p>
          </div>
        </button>
        <button
          onClick={onBrowse}
          className="card card-hover flex flex-col items-start gap-2 p-4 text-left animate-slide-up"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand">
              {applications.length} applied
            </p>
            <p className="text-[11px] text-brand-400">Track your applications</p>
          </div>
        </button>
      </div>

      {/* Active applications */}
      {activeApps.length > 0 && (
        <div className="mb-5 animate-slide-up">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand">Active applications</h3>
            <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
              {activeApps.length}
            </span>
          </div>
          <div className="space-y-2">
            {activeApps.slice(0, 2).map((a) => (
              <div key={a.id} className="card flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-brand">{a.scholarship?.name}</p>
                  <p className="text-[11px] text-brand-400">Status: {a.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming deadlines */}
      <div className="mb-5 animate-slide-up">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-brand">
            <Calendar className="h-4 w-4 text-brand-400" />
            Upcoming deadlines
          </h3>
          <button onClick={onBrowse} className="text-[11px] font-semibold text-teal-700">
            See all
          </button>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <p className="rounded-2xl bg-base-100 p-4 text-center text-xs text-brand-400">
            No open programs right now.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingDeadlines.map((s) => {
              const Icon = CATEGORY_ICONS[s.category] ?? GraduationCap;
              return (
                <button
                  key={s.id}
                  onClick={() => onApply(s)}
                  className="card card-hover flex w-full items-center gap-3 p-3 text-left"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-brand">{s.name}</p>
                    <p className="text-[11px] text-brand-400">
                      {formatDate(s.deadline)} · {s.amount}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        deadlineStatus(s.deadline) === 'urgent'
                          ? 'bg-gold-50 text-gold-700'
                          : deadlineStatus(s.deadline) === 'soon'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-base-200 text-brand-600'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${DEADLINE_DOT[deadlineStatus(s.deadline)]}`} />
                      {deadlineLabel(s.deadline)}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-brand-300" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up">
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-brand">{scholarships.length}</p>
            <p className="text-[11px] text-brand-400">Programs available</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-brand">
              {applications.filter((a) => a.status === 'Approved').length}
            </p>
            <p className="text-[11px] text-brand-400">Approved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeHero({
  firstName,
  scholarships,
  applications,
  onBrowse,
  onApply,
}: {
  firstName: string;
  scholarships: Scholarship[];
  applications: { id: string; status: string; scholarship?: Scholarship }[];
  onBrowse: () => void;
  onApply: (scholarship: Scholarship) => void;
}) {
  const [search, setSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return scholarships
      .filter(
        (scholarship) =>
          scholarship.name.toLowerCase().includes(query) ||
          scholarship.provider.toLowerCase().includes(query) ||
          scholarship.category.toLowerCase().includes(query),
      )
      .slice(0, 4);
  }, [search, scholarships]);

  const notifications = useMemo(() => {
    const deadlineItems = scholarships
      .filter((scholarship) => {
        const remaining = daysUntil(scholarship.deadline);
        return isAvailable(scholarship) && remaining >= 0 && remaining <= 14;
      })
      .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
      .slice(0, 2)
      .map((scholarship) => ({
        id: `deadline-${scholarship.id}`,
        title: `${scholarship.name} closes soon`,
        detail: `${deadlineLabel(scholarship.deadline)} · deadline ${formatDate(scholarship.deadline)}`,
        tone: 'gold' as const,
      }));

    const applicationItems = applications.slice(0, 2).map((application) => ({
      id: `application-${application.id}`,
      title: `${application.scholarship?.name ?? 'Your application'} updated`,
      detail: `Status: ${application.status}`,
      tone: 'teal' as const,
    }));

    return [...deadlineItems, ...applicationItems].slice(0, 4);
  }, [applications, scholarships]);

  return (
    <section className="relative z-20 mb-5 min-h-[234px] overflow-visible rounded-[30px] bg-brand px-5 pb-4 pt-6 text-white shadow-lg animate-slide-up">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-brand-400/45 blur-[1px]" />
        <div className="absolute -bottom-28 -left-10 h-56 w-80 rotate-[18deg] rounded-[45%] bg-brand-700/85" />
        <div className="absolute -right-20 top-24 h-44 w-80 -rotate-[12deg] rounded-[50%] bg-brand-800/75" />
        <div className="absolute -right-10 bottom-0 h-36 w-64 rounded-[50%] bg-brand-700/80 blur-sm" />
      </div>

      <div className="relative flex items-center justify-between">
        <p className="text-sm font-medium text-white/90">Hi, {firstName}</p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative rounded-full p-1.5 text-white transition-colors hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-40 w-72 rounded-2xl bg-white p-3 text-brand shadow-2xl ring-1 ring-brand-100 animate-scale-in">
                <div className="flex items-center justify-between px-1 pb-2">
                  <p className="text-sm font-bold">Notifications</p>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="rounded-md p-1 text-brand-300 hover:bg-base-100 hover:text-brand"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div className="rounded-xl bg-base-100 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-5 w-5 text-teal" />
                    <p className="mt-1 text-xs font-medium text-brand-500">You&apos;re all caught up.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex gap-2 rounded-xl bg-base-100 p-2.5">
                        <span
                          className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                            notification.tone === 'gold' ? 'bg-gold' : 'bg-teal'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-semibold text-brand">{notification.title}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-brand-500">{notification.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/70 bg-gold text-sm font-bold text-brand-800 shadow-sm">
            {firstName.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="relative mt-7">
        <h2 className="max-w-[250px] text-[22px] font-bold leading-[1.18] tracking-[-0.02em] text-white">
          Find your Scholarship here!
        </h2>
      </div>

      <div className="relative mt-5 flex gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search scholarships"
            aria-label="Search scholarships"
            className="h-11 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-sm text-brand-800 shadow-sm outline-none placeholder:text-brand-400 focus:ring-2 focus:ring-gold"
          />
          {search.trim() && (
            <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-2xl bg-white p-2 text-brand shadow-2xl ring-1 ring-brand-100 animate-scale-in">
              {searchResults.length === 0 ? (
                <p className="p-3 text-center text-xs text-brand-400">No matching scholarships found.</p>
              ) : (
                searchResults.map((scholarship) => {
                  const Icon = CATEGORY_ICONS[scholarship.category] ?? GraduationCap;
                  return (
                    <button
                      key={scholarship.id}
                      type="button"
                      onClick={() => onApply(scholarship)}
                      className="flex w-full items-center gap-2 rounded-xl p-2 text-left transition-colors hover:bg-base-100"
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-brand">{scholarship.name}</span>
                        <span className="block text-[10px] text-brand-400">{scholarship.category} · {deadlineLabel(scholarship.deadline)}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-brand-300" />
                    </button>
                  );
                })
              )}
              <button
                type="button"
                onClick={onBrowse}
                className="mt-1 w-full rounded-xl border-t border-brand-50 px-2 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
              >
                View all scholarships
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onBrowse}
          aria-label="Open scholarship filters"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
