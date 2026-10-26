import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  Search,
  Share2,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useAllApplications } from '@/hooks/useAllApplications';
import {
  type Application,
  type ApplicationStatus,
  type Scholarship,
} from '@/lib/supabase';
import { RequestDetailModal, type AdminApplication } from '@/views/admin/RequestDetailModal';
import { formatDate } from '@/utils/dates';

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { color: string; dot: string; icon: LucideIcon; label: string }
> = {
  Submitted: { color: 'bg-base-200 text-brand-600', dot: 'bg-brand-300', icon: Clock, label: 'Submitted' },
  'In Review': { color: 'bg-brand-50 text-brand', dot: 'bg-brand-400', icon: Clock, label: 'In Review' },
  Approved: { color: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500', icon: CheckCircle2, label: 'Approved' },
  Rejected: { color: 'bg-gold-50 text-gold-700', dot: 'bg-gold-500', icon: XCircle, label: 'Rejected' },
  Withdrawn: { color: 'bg-base-200 text-brand-400', dot: 'bg-brand-200', icon: XCircle, label: 'Withdrawn' },
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Submitted',
  'In Review',
  'Approved',
  'Rejected',
  'Withdrawn',
];

type AdminApp = Application & {
  scholarship: Scholarship;
  applicant: { full_name: string; school: string; birthdate: string };
};

export function CoordinatorRequests() {
  const { applications, loading, setReview } = useAllApplications();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = applications;
    if (statusFilter !== 'All')
      list = list.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.applicant?.full_name?.toLowerCase().includes(q) ||
          a.scholarship?.name?.toLowerCase().includes(q) ||
          a.applicant?.school?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [applications, statusFilter, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: applications.length };
    for (const s of STATUS_OPTIONS) map[s] = 0;
    for (const a of applications) map[a.status] = (map[a.status] ?? 0) + 1;
    return map;
  }, [applications]);

  const selected = selectedId
    ? (applications.find((a) => a.id === selectedId) as AdminApp | undefined) ?? null
    : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant, school, or program…"
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 flex-shrink-0 text-brand-400" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              active={statusFilter === 'All'}
              onClick={() => setStatusFilter('All')}
              count={counts.All}
            >
              All
            </FilterChip>
            {STATUS_OPTIONS.map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                count={counts[s] ?? 0}
              >
                {s}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {/* Master list */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-base-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <Inbox className="h-8 w-8 text-brand-300" />
          <p className="text-sm font-medium text-brand-400">No requests match your filters.</p>
        </div>
      ) : (
        <div className="card divide-y divide-brand-50">
          {filtered.map((a, i) => {
            const cfg = STATUS_CONFIG[a.status];
            const referralCount = a.referrals?.length ?? 0;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-base-50 animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                  {a.applicant?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-brand">
                      {a.applicant?.full_name ?? 'Unknown applicant'}
                    </h3>
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                  </div>
                  <p className="truncate text-xs text-brand-500">
                    {a.scholarship?.name ?? 'Program'}
                  </p>
                  <p className="truncate text-[11px] text-brand-400">
                    {a.applicant?.school ?? 'No school listed'}
                  </p>
                </div>
                <div className="hidden flex-col items-end gap-1 sm:flex">
                  {referralCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                      <Share2 className="h-3 w-3" />
                      {referralCount}
                    </span>
                  )}
                  <span className="text-[10px] text-brand-400">{formatDate(a.created_at)}</span>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile detail modal */}
      {selected && (
        <RequestDetailModal
          application={selected as AdminApplication}
          onClose={() => setSelectedId(null)}
          onReview={setReview}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-teal-700 text-white'
          : 'bg-white text-brand-500 border border-brand-100 hover:border-teal-200'
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 text-[9px] ${
            active ? 'bg-white/20' : 'bg-base-200 text-brand-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
