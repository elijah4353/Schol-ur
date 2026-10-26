import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Search,
  Share2,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useAllApplications } from '@/hooks/useAllApplications';
import {
  type Application,
  type ApplicationStatus,
  type Scholarship,
} from '@/lib/supabase';
import { RequestDetailModal } from '@/views/admin/RequestDetailModal';
import { formatDate } from '@/utils/dates';

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { color: string; icon: LucideIcon; label: string }
> = {
  Submitted: { color: 'bg-base-200 text-brand-600', icon: Clock, label: 'Submitted' },
  'In Review': { color: 'bg-teal-50 text-teal-700', icon: Clock, label: 'In Review' },
  Approved: { color: 'bg-teal-50 text-teal-700', icon: CheckCircle2, label: 'Approved' },
  Rejected: { color: 'bg-gold-50 text-gold-700', icon: XCircle, label: 'Rejected' },
  Withdrawn: { color: 'bg-base-200 text-brand-400', icon: XCircle, label: 'Withdrawn' },
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Submitted',
  'In Review',
  'Approved',
  'Rejected',
  'Withdrawn',
];

type AdminApplication = Application & {
  scholarship: Scholarship;
  applicant: { full_name: string; school: string; birthdate: string };
};

export function AdminApplications() {
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

  const selected = selectedId
    ? (applications.find((a) => a.id === selectedId) as AdminApplication | undefined) ?? null
    : null;

  return (
    <div className="px-4 pb-6 pt-4">
      <h2 className="mb-4 text-lg font-bold text-brand">Requests</h2>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applicant, school, or program…"
          className="input-field pl-9"
        />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 flex-shrink-0 text-brand-400" />
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <FilterChip active={statusFilter === 'All'} onClick={() => setStatusFilter('All')}>
            All
          </FilterChip>
          {STATUS_OPTIONS.map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </FilterChip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-base-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-base-100 p-8 text-center text-sm text-brand-400">
          No requests to review.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => {
            const cfg = STATUS_CONFIG[a.status];
            const referralCount = a.referrals?.length ?? 0;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className="card flex w-full items-center gap-3 p-4 text-left animate-slide-up transition-all hover:shadow-md"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <span className="text-sm font-bold">
                    {a.applicant?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold leading-tight text-brand">
                    {a.applicant?.full_name ?? 'Unknown applicant'}
                  </h3>
                  <p className="truncate text-xs text-brand-500">
                    {a.applicant?.school ?? 'No school listed'}
                  </p>
                  <p className="truncate text-[11px] text-brand-400">
                    {a.scholarship?.name ?? 'Program'}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    {referralCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                        <Share2 className="h-3 w-3" />
                        {referralCount} {referralCount === 1 ? 'referral' : 'referrals'}
                      </span>
                    )}
                    <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                      {formatDate(a.created_at)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-brand-300" />
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <RequestDetailModal
          application={selected}
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
          ? 'bg-teal-700 text-white'
          : 'bg-white text-brand-500 border border-brand-100 hover:border-teal-200'
      }`}
    >
      {children}
    </button>
  );
}
