import { useMemo } from 'react';
import { Link, TrendingUp, Users, Award, Clock, Share2 } from 'lucide-react';
import { useAllApplications } from '@/hooks/useAllApplications';
import { useScholarshipManagement } from '@/hooks/useScholarshipManagement';
import { formatDate } from '@/utils/dates';

export function AdminOverview({
  onGoToApplications,
  onGoToScholarships,
}: {
  onGoToApplications: () => void;
  onGoToScholarships: () => void;
}) {
  const { applications, loading: appsLoading } = useAllApplications();
  const { scholarships, loading: schLoading } = useScholarshipManagement();

  const stats = useMemo(() => {
    const pending = applications.filter(
      (a) => a.status === 'Submitted' || a.status === 'In Review',
    ).length;
    const approved = applications.filter((a) => a.status === 'Approved').length;
    const totalSlots = scholarships.reduce((sum, s) => sum + (s.slots_total || 0), 0);
    const totalReferrals = applications.reduce(
      (sum, a) => sum + (a.referrals?.length ?? 0),
      0,
    );
    return {
      totalApps: applications.length,
      pending,
      approved,
      programs: scholarships.length,
      totalSlots,
      totalReferrals,
    };
  }, [applications, scholarships]);

  const recent = applications.slice(0, 5);

  return (
    <div className="px-4 pb-6 pt-4">
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-600 p-5 text-white animate-slide-up">
        <h2 className="text-lg font-bold">Coordinator Dashboard</h2>
        <p className="mt-0.5 text-xs text-teal-100">
          Review requests, refer students, and track outcomes
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 animate-slide-up">
        <StatCard
          icon={Users}
          value={stats.totalApps}
          label="Requests"
          tone="brand"
        />
        <StatCard
          icon={Clock}
          value={stats.pending}
          label="Pending Review"
          tone="teal"
        />
        <StatCard
          icon={Award}
          value={stats.approved}
          label="Approved"
          tone="teal"
        />
        <StatCard
          icon={Share2}
          value={stats.totalReferrals}
          label="Referrals"
          tone="brand"
        />
      </div>

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          onClick={onGoToApplications}
          className="card flex items-center gap-3 p-4 text-left transition-all hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand">Review</p>
            <p className="text-[11px] text-brand-400">Requests</p>
          </div>
        </button>
        <button
          onClick={onGoToScholarships}
          className="card flex items-center gap-3 p-4 text-left transition-all hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand">Manage</p>
            <p className="text-[11px] text-brand-400">Programs</p>
          </div>
        </button>
      </div>

      {/* Recent applications */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-brand">Recent Requests</h3>
        <button
          onClick={onGoToApplications}
          className="text-xs font-semibold text-teal-700 hover:underline"
        >
          View all
        </button>
      </div>

      {appsLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-base-200" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="rounded-2xl bg-base-100 p-6 text-center text-sm text-brand-400">
          No requests yet.
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((a, i) => (
            <div
              key={a.id}
              className="card flex items-center gap-3 p-3 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-brand">
                  {a.applicant?.full_name ?? 'Unknown'}
                </p>
                <p className="truncate text-[11px] text-brand-500">
                  {a.scholarship?.name ?? 'Program'}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    a.status === 'Approved'
                      ? 'bg-teal-50 text-teal-700'
                      : a.status === 'Rejected'
                        ? 'bg-gold-50 text-gold-700'
                        : 'bg-base-200 text-brand-600'
                  }`}
                >
                  {a.status}
                </span>
                <p className="mt-0.5 text-[10px] text-brand-400">
                  {formatDate(a.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slot summary */}
      {!schLoading && stats.totalSlots > 0 && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
          <TrendingUp className="h-5 w-5 text-brand" />
          <div>
            <p className="text-sm font-bold text-brand">
              {stats.totalSlots} total slots across {stats.programs} programs
            </p>
            <p className="text-[11px] text-brand-500">
              Available to Bicol Region students
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Users;
  value: number;
  label: string;
  tone: 'brand' | 'teal';
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          tone === 'teal' ? 'bg-teal-50 text-teal-700' : 'bg-brand-50 text-brand'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p
          className={`text-xl font-bold ${
            tone === 'teal' ? 'text-teal-700' : 'text-brand'
          }`}
        >
          {value}
        </p>
        <p className="text-[11px] text-brand-400">{label}</p>
      </div>
    </div>
  );
}
