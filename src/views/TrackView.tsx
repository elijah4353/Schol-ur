import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Inbox,
  Loader2,
  Trash2,
  XCircle,
} from 'lucide-react';
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '@/lib/supabase';
import { useApplications } from '@/hooks/useApplications';
import { formatDate, daysUntil } from '@/utils/dates';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Submitted: 'bg-base-200 text-brand-600 border-brand-200',
  'In Review': 'bg-teal-50 text-teal-700 border-teal-200',
  Approved: 'bg-teal-50 text-teal-700 border-teal-200',
  Rejected: 'bg-gold-50 text-gold-700 border-gold-200',
  Withdrawn: 'bg-gold-50 text-gold-700 border-gold-200',
};

export function TrackView() {
  const { applications, loading, updateStatus, removeApplication } = useApplications();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Approved' | 'Closed'>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return applications;
    if (filter === 'Active')
      return applications.filter((a) => a.status === 'Submitted' || a.status === 'In Review');
    if (filter === 'Approved') return applications.filter((a) => a.status === 'Approved');
    return applications.filter((a) => a.status === 'Rejected' || a.status === 'Withdrawn');
  }, [applications, filter]);

  const counts = useMemo(
    () => ({
      total: applications.length,
      active: applications.filter((a) => a.status === 'Submitted' || a.status === 'In Review')
        .length,
      approved: applications.filter((a) => a.status === 'Approved').length,
    }),
    [applications],
  );

  return (
    <div className="px-4 pb-6 pt-4">
      {/* Summary tiles */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <SummaryTile label="Total" value={counts.total} icon={ClipboardList} tone="brand" />
        <SummaryTile label="Active" value={counts.active} icon={Clock} tone="gold" />
        <SummaryTile label="Approved" value={counts.approved} icon={CheckCircle2} tone="teal" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(['All', 'Active', 'Approved', 'Closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === f ? 'bg-brand text-white' : 'bg-white text-brand-500 border border-brand-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-brand-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-base-100 p-8 text-center">
          <Inbox className="mx-auto h-10 w-10 text-brand-300" />
          <p className="mt-3 text-sm font-medium text-brand-500">
            {applications.length === 0
              ? 'No applications yet. Apply to a scholarship to start tracking.'
              : 'No applications in this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <ApplicationCard
              key={a.id}
              application={a}
              index={i}
              onStatusChange={(s) => updateStatus(a.id, s)}
              onDelete={() => removeApplication(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
  tone: 'brand' | 'gold' | 'teal';
}) {
  const toneClass = {
    brand: 'bg-brand-50 text-brand',
    gold: 'bg-gold-50 text-gold-700',
    teal: 'bg-teal-50 text-teal-700',
  }[tone];
  return (
    <div className="card flex flex-col items-center gap-1 p-3 text-center">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xl font-bold text-brand">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-brand-400">{label}</span>
    </div>
  );
}

function ApplicationCard({
  application,
  index,
  onStatusChange,
  onDelete,
}: {
  application: Application;
  index: number;
  onStatusChange: (s: ApplicationStatus) => void;
  onDelete: () => void;
}) {
  const s = application.scholarship;
  const deadlineDays = s ? daysUntil(s.deadline) : 0;
  const isOverdue = deadlineDays < 0;

  return (
    <div
      className="card animate-slide-up p-4"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-brand">{s?.name ?? 'Unknown program'}</h3>
          <p className="text-xs text-brand-500">{s?.provider}</p>
        </div>
        <button
          onClick={onDelete}
          className="flex-shrink-0 rounded-lg p-1.5 text-brand-300 transition-colors hover:bg-gold-50 hover:text-gold-700"
          aria-label="Remove application"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-base-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-brand-400">Submitted</p>
          <p className="mt-0.5 font-semibold text-brand">
            {application.submitted_date ? formatDate(application.submitted_date) : 'Not set'}
          </p>
        </div>
        <div className="rounded-lg bg-base-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-brand-400">Deadline</p>
          <p className={`mt-0.5 font-semibold ${isOverdue ? 'text-gold-700' : 'text-brand'}`}>
            {s ? formatDate(s.deadline) : '—'}
          </p>
        </div>
      </div>

      {s && deadlineDays >= 0 && deadlineDays <= 14 && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700">
          <Clock className="h-3.5 w-3.5" />
          {deadlineDays === 0
            ? 'Deadline is today'
            : `Deadline in ${deadlineDays} day${deadlineDays === 1 ? '' : 's'}`}
        </div>
      )}
      {isOverdue && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700">
          <XCircle className="h-3.5 w-3.5" />
          Deadline passed
        </div>
      )}

      {application.notes && (
        <p className="mt-2 rounded-lg bg-base-100 px-3 py-2 text-xs text-brand-600">
          {application.notes}
        </p>
      )}

      <div className="mt-3 border-t border-brand-50 pt-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-400">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {APPLICATION_STATUSES.map((st) => {
            const active = application.status === st;
            return (
              <button
                key={st}
                onClick={() => onStatusChange(st)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  active
                    ? STATUS_STYLES[st] + ' ring-1 ring-offset-1 ring-offset-white'
                    : 'border-base-200 bg-white text-brand-400 hover:border-brand-200'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
