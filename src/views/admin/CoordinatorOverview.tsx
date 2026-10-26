import { useMemo } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Share2,
  TrendingUp,
  AlertTriangle,
  Handshake,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useAllApplications } from '@/hooks/useAllApplications';
import { useScholarshipManagement } from '@/hooks/useScholarshipManagement';
import { formatDate } from '@/utils/dates';

export function CoordinatorOverview({
  onGoToRequests,
  onGoToPrograms,
}: {
  onGoToRequests: () => void;
  onGoToPrograms: () => void;
}) {
  const { applications, loading: appsLoading } = useAllApplications();
  const { scholarships, loading: schLoading } = useScholarshipManagement();

  const stats = useMemo(() => {
    const pending = applications.filter(
      (a) => a.status === 'Submitted' || a.status === 'In Review',
    ).length;
    const resolved = applications.filter((a) => a.status === 'Approved').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    const referred = applications.filter((a) => (a.referrals?.length ?? 0) > 0).length;
    const unmet = applications.filter((a) => a.status !== 'Approved').length;
    const totalSlots = scholarships.reduce((sum, s) => sum + (s.slots_total || 0), 0);
    const referrals = applications.flatMap((a) => a.referrals ?? []);
    const referralOutcomes = {
      Accepted: referrals.filter((r) => r.status === 'Accepted').length,
      Pending: referrals.filter((r) => r.status === 'Pending').length,
      Contacted: referrals.filter((r) => r.status === 'Contacted').length,
      Declined: referrals.filter((r) => r.status === 'Declined').length,
    };

    const categoryMap = new Map<string, { requested: number; unresolved: number }>();
    applications.forEach((application) => {
      const category = application.scholarship?.category || 'Uncategorized';
      const current = categoryMap.get(category) ?? { requested: 0, unresolved: 0 };
      current.requested += 1;
      if (application.status !== 'Approved') current.unresolved += 1;
      categoryMap.set(category, current);
    });
    const categories = Array.from(categoryMap, ([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => b.requested - a.requested);

    return {
      totalApps: applications.length,
      pending,
      resolved,
      rejected,
      referred,
      unmet,
      programs: scholarships.length,
      totalSlots,
      totalReferrals: referrals.length,
      acceptedReferrals: referralOutcomes.Accepted,
      referralOutcomes,
      categories,
    };
  }, [applications, scholarships]);

  const recent = applications.slice(0, 6);

  const statusBadge = (status: string) => {
    if (status === 'Approved') return 'bg-teal-50 text-teal-700';
    if (status === 'Rejected') return 'bg-gold-50 text-gold-700';
    if (status === 'In Review') return 'bg-brand-50 text-brand';
    return 'bg-base-200 text-brand-600';
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 to-teal-600 p-6 text-white animate-slide-up">
        <h2 className="text-xl font-bold">Coordinator Workspace</h2>
        <p className="mt-1 text-sm text-teal-100">
          Review student requests, match them to assistance programs, and track each referral to a
          resolution.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onGoToRequests}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            Review requests
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onGoToPrograms}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Manage programs
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} value={stats.totalApps} label="Total requests" tone="brand" />
        <StatCard icon={CheckCircle2} value={stats.resolved} label="Resolved" tone="teal" />
        <StatCard icon={Clock} value={stats.pending} label="Pending" tone="brand" />
        <StatCard icon={Share2} value={stats.referred} label="Referred" tone="teal" />
        <StatCard icon={AlertTriangle} value={stats.unmet} label="Unmet needs" tone="gold" />
        <StatCard icon={Handshake} value={stats.acceptedReferrals} label="Referrals accepted" tone="brand" />
      </div>

      {/* Planning insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-brand">Most requested assistance</h3>
              <p className="mt-0.5 text-xs text-brand-400">Demand by program category</p>
            </div>
            <TrendingUp className="h-5 w-5 text-teal-700" />
          </div>
          {stats.categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-400">No request categories yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.categories.slice(0, 6).map((category, index) => {
                const width = stats.totalApps > 0
                  ? Math.round((category.requested / stats.totalApps) * 100)
                  : 0;
                return (
                  <CategoryBar
                    key={category.name}
                    rank={index + 1}
                    label={category.name}
                    value={category.requested}
                    width={width}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-brand">Unresolved needs</h3>
              <p className="mt-0.5 text-xs text-brand-400">Requests without an approved outcome</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-gold-700" />
          </div>
          {stats.categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-400">No unresolved categories.</p>
          ) : (
            <div className="space-y-4">
              {[...stats.categories]
                .sort((a, b) => b.unresolved - a.unresolved)
                .slice(0, 6)
                .map((category, index) => {
                  const width = stats.unmet > 0
                    ? Math.round((category.unresolved / stats.unmet) * 100)
                    : 0;
                  return (
                    <CategoryBar
                      key={category.name}
                      rank={index + 1}
                      label={category.name}
                      value={category.unresolved}
                      width={width}
                      gold
                    />
                  );
                })}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="text-sm font-bold text-brand">Referral outcomes</h3>
          <p className="mt-0.5 text-xs text-brand-400">{stats.totalReferrals} referrals tracked</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['Accepted', 'Contacted', 'Pending', 'Declined'] as const).map((outcome) => (
              <div key={outcome} className="rounded-xl bg-base-50 p-3 text-center">
                <p className="text-xl font-bold text-brand">{stats.referralOutcomes[outcome]}</p>
                <p className="text-[11px] text-brand-400">{outcome}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card border-l-4 border-gold-500 p-5">
          <h3 className="text-sm font-bold text-brand">Support gaps</h3>
          <p className="mt-1 text-xs leading-relaxed text-brand-500">
            {stats.unmet > 0
              ? `${stats.unmet} requests remain unresolved. Prioritize ${stats.categories
                  .filter((category) => category.unresolved > 0)
                  .sort((a, b) => b.unresolved - a.unresolved)[0]?.name ?? 'high-demand categories'} and review declined referrals for alternate support.`
              : 'All requests have an approved outcome. Review capacity and prevent future unmet needs.'}
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent requests — spans 2 */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand">Recent requests</h3>
            <button
              onClick={onGoToRequests}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              View all
            </button>
          </div>

          {appsLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-base-200" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="card p-8 text-center text-sm text-brand-400">
              No requests yet.
            </div>
          ) : (
            <div className="card divide-y divide-brand-50">
              {recent.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3.5 animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                    {a.applicant?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-brand">
                      {a.applicant?.full_name ?? 'Unknown'}
                    </p>
                    <p className="truncate text-xs text-brand-500">
                      {a.scholarship?.name ?? 'Program'}
                    </p>
                  </div>
                  {(a.referrals?.length ?? 0) > 0 && (
                    <span className="hidden items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 sm:inline-flex">
                      <Share2 className="h-3 w-3" />
                      {a.referrals!.length}
                    </span>
                  )}
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(
                      a.status,
                    )}`}
                  >
                    {a.status}
                  </span>
                  <span className="hidden w-20 flex-shrink-0 text-right text-[10px] text-brand-400 md:block">
                    {formatDate(a.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Side column — outcomes + slots */}
        <section className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-bold text-brand">Request outcomes</h3>
            <div className="space-y-2.5">
              <OutcomeRow
                icon={CheckCircle2}
                color="text-teal-700"
                label="Approved"
                value={stats.approved}
                total={stats.totalApps}
              />
              <OutcomeRow
                icon={XCircle}
                color="text-gold-700"
                label="Rejected"
                value={stats.rejected}
                total={stats.totalApps}
              />
              <OutcomeRow
                icon={Clock}
                color="text-brand"
                label="Pending"
                value={stats.pending}
                total={stats.totalApps}
              />
            </div>
          </div>

          {!schLoading && stats.totalSlots > 0 && (
            <div className="card flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand">
                  {stats.totalSlots} total slots
                </p>
                <p className="text-[11px] text-brand-500">
                  across {stats.programs} active programs
                </p>
              </div>
            </div>
          )}

          <div className="card flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand">{stats.programs} programs</p>
              <p className="text-[11px] text-brand-500">Assistance listings available</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  tone: 'brand' | 'teal' | 'gold';
}) {
  return (
    <div className="card flex items-center gap-3 p-4 animate-slide-up">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          tone === 'teal'
            ? 'bg-teal-50 text-teal-700'
            : tone === 'gold'
              ? 'bg-gold-50 text-gold-700'
              : 'bg-brand-50 text-brand'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p
          className={`text-2xl font-bold ${
            tone === 'teal'
              ? 'text-teal-700'
              : tone === 'gold'
                ? 'text-gold-700'
                : 'text-brand'
          }`}
        >
          {value}
        </p>
        <p className="text-xs text-brand-400">{label}</p>
      </div>
    </div>
  );
}

function CategoryBar({
  rank,
  label,
  value,
  width,
  gold = false,
}: {
  rank: number;
  label: string;
  value: number;
  width: number;
  gold?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 text-xs">
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-base-200 text-[10px] font-bold text-brand-600">
          {rank}
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold text-brand-600">{label}</span>
        <span className="font-bold text-brand">{value}</span>
      </div>
      <div className="ml-7 h-2 overflow-hidden rounded-full bg-base-200">
        <div
          className={`h-full rounded-full ${gold ? 'bg-gold-500' : 'bg-teal-600'}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function OutcomeRow({
  icon: Icon,
  color,
  label,
  value,
  total,
}: {
  icon: LucideIcon;
  color: string;
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs font-medium text-brand-600">{label}</span>
        </div>
        <span className="text-xs font-bold text-brand">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-base-200">
        <div
          className={`h-full rounded-full ${color.replace('text', 'bg')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
