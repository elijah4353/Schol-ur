import { useMemo, useState } from 'react';
import { Search, Share2, Users } from 'lucide-react';
import { useAllApplications } from '@/hooks/useAllApplications';
import { formatDate } from '@/utils/dates';

type ApplicantGroup = {
  userId: string;
  fullName: string;
  school: string;
  birthdate: string;
  apps: ReturnType<typeof useAllApplications>['applications'];
};

export function CoordinatorApplicants() {
  const { applications, loading } = useAllApplications();
  const [search, setSearch] = useState('');

  const applicants = useMemo<ApplicantGroup[]>(() => {
    const map = new Map<string, ApplicantGroup>();
    for (const a of applications) {
      const key = a.user_id;
      if (!map.has(key)) {
        map.set(key, {
          userId: key,
          fullName: a.applicant?.full_name ?? 'Unknown',
          school: a.applicant?.school ?? 'No school listed',
          birthdate: a.applicant?.birthdate ?? '',
          apps: [],
        });
      }
      map.get(key)!.apps.push(a);
    }
    let list = Array.from(map.values());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) || p.school.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => b.apps.length - a.apps.length);
  }, [applications, search]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand">Applicant Directory</h2>
        <p className="text-xs text-brand-400">Students who have submitted requests</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or school…"
          className="input-field pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-base-200" />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="card p-12 text-center text-sm text-brand-400">
          No applicants found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {applicants.map((p, i) => {
            const approved = p.apps.filter((a) => a.status === 'Approved').length;
            const pending = p.apps.filter(
              (a) => a.status === 'Submitted' || a.status === 'In Review',
            ).length;
            const referrals = p.apps.reduce(
              (sum, a) => sum + (a.referrals?.length ?? 0),
              0,
            );
            return (
              <div
                key={p.userId}
                className="card animate-slide-up p-4"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-tight text-brand">
                      {p.fullName}
                    </h3>
                    <p className="truncate text-xs text-brand-500">{p.school}</p>
                    {p.birthdate && (
                      <p className="mt-0.5 text-[10px] text-brand-400">
                        Born {formatDate(p.birthdate)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-brand-50 pt-3">
                  <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                    {p.apps.length} {p.apps.length === 1 ? 'request' : 'requests'}
                  </span>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                    {approved} approved
                  </span>
                  <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                    {pending} pending
                  </span>
                  {referrals > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                      <Share2 className="h-3 w-3" />
                      {referrals} referrals
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {p.apps.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg bg-base-100 px-2.5 py-1.5"
                    >
                      <span className="truncate text-[11px] text-brand-600">
                        {a.scholarship?.name ?? 'Program'}
                      </span>
                      <span
                        className={`ml-2 flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          a.status === 'Approved'
                            ? 'bg-teal-50 text-teal-700'
                            : a.status === 'Rejected'
                              ? 'bg-gold-50 text-gold-700'
                              : 'bg-base-200 text-brand-500'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
