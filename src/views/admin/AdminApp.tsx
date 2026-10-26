import { useState } from 'react';
import { Award, ClipboardList, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminOverview } from '@/views/admin/AdminOverview';
import { AdminApplications } from '@/views/admin/AdminApplications';
import { AdminScholarships } from '@/views/admin/AdminScholarships';
import { AdminApplicants } from '@/views/admin/AdminApplicants';

type AdminTab = 'overview' | 'applications' | 'scholarships' | 'applicants';

const TABS = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'applications' as const, label: 'Requests', icon: ClipboardList },
  { id: 'scholarships' as const, label: 'Programs', icon: Award },
  { id: 'applicants' as const, label: 'Applicants', icon: Users },
];

export function AdminApp() {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <header className="sticky top-0 z-40 border-b border-teal-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">S</div>
            <div>
              <p className="text-sm font-bold text-brand">Scholour</p>
              <p className="text-[10px] font-semibold uppercase text-teal-700">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-brand">{profile?.full_name}</p>
              <p className="text-[10px] text-brand-400">{profile?.school}</p>
            </div>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-base-200 text-brand-500 hover:bg-base-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-base-200 bg-white px-3 py-5 lg:block">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  tab === id ? 'bg-teal-800 text-white' : 'text-brand-500 hover:bg-base-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 pb-20 lg:px-6 lg:pb-8">
          {tab === 'overview' && (
            <AdminOverview
              onGoToApplications={() => setTab('applications')}
              onGoToScholarships={() => setTab('scholarships')}
            />
          )}
          {tab === 'applications' && <AdminApplications />}
          {tab === 'scholarships' && <AdminScholarships />}
          {tab === 'applicants' && <AdminApplicants />}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-base-200 bg-white px-2 py-2 lg:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              tab === id ? 'text-teal-800' : 'text-brand-400'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
