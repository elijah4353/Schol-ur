import { useState } from 'react';
import {
  Award,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CoordinatorOverview } from '@/views/admin/CoordinatorOverview';
import { CoordinatorRequests } from '@/views/admin/CoordinatorRequests';
import { CoordinatorPrograms } from '@/views/admin/CoordinatorPrograms';
import { CoordinatorApplicants } from '@/views/admin/CoordinatorApplicants';

type CoordinatorTab = 'overview' | 'requests' | 'programs' | 'applicants';

const NAV: { id: CoordinatorTab; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, description: 'Snapshot of activity' },
  { id: 'requests', label: 'Requests', icon: ClipboardList, description: 'Review and refer' },
  { id: 'programs', label: 'Programs', icon: Award, description: 'Assistance listings' },
  { id: 'applicants', label: 'Applicants', icon: Users, description: 'Student directory' },
];

export function CoordinatorApp({ role = 'Coordinator' }: { role?: 'Coordinator' | 'Donor' }) {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<CoordinatorTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = NAV.find((n) => n.id === tab)!;

  function selectTab(id: CoordinatorTab) {
    setTab(id);
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-base">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-brand-100 bg-white lg:flex lg:flex-col">
        <SidebarContent tab={tab} onSelect={selectTab} profile={profile} onSignOut={signOut} role={role} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-2xl animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-brand-400 hover:bg-base-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent tab={tab} onSelect={selectTab} profile={profile} onSignOut={signOut} role={role} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-brand-100 bg-white/90 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-brand-500 hover:bg-base-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-tight text-brand">{active.label}</p>
                <p className="text-[10px] text-brand-400">{active.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-brand">{profile?.full_name}</p>
              <p className="text-[10px] text-brand-400">{profile?.school}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">
            {tab === 'overview' && (
              <CoordinatorOverview
                onGoToRequests={() => setTab('requests')}
                onGoToPrograms={() => setTab('programs')}
              />
            )}
            {tab === 'requests' && <CoordinatorRequests />}
            {tab === 'programs' && <CoordinatorPrograms />}
            {tab === 'applicants' && <CoordinatorApplicants />}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  tab,
  onSelect,
  profile,
  onSignOut,
  role,
}: {
  tab: CoordinatorTab;
  onSelect: (id: CoordinatorTab) => void;
  profile: { full_name: string; school: string } | null;
  onSignOut: () => void;
  role: 'Coordinator' | 'Donor';
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-brand-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-brand">Scholóur</p>
          <p className="text-[10px] font-medium text-teal-700">{role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((n) => {
          const Icon = n.icon;
          const activeTab = tab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onSelect(n.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                activeTab
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-brand-500 hover:bg-base-100 hover:text-brand'
              }`}
            >
              <Icon className={`h-5 w-5 ${activeTab ? 'stroke-[2.4]' : ''}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{n.label}</p>
                <p className={`truncate text-[10px] ${activeTab ? 'text-teal-600' : 'text-brand-300'}`}>
                  {n.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-brand-100 px-3 py-4">
        <div className="mb-2 rounded-xl bg-base-100 px-3 py-2">
          <p className="truncate text-xs font-semibold text-brand">{profile?.full_name}</p>
          <p className="truncate text-[10px] text-brand-400">{profile?.school}</p>
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand-500 transition-colors hover:bg-gold-50 hover:text-gold-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}
