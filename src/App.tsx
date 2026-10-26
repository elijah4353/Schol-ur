import { useState } from 'react';
import {
  GraduationCap,
  Home,
  LogOut,
  Compass,
  ClipboardList,
  type LucideIcon,
  Loader2,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthScreen } from '@/views/AuthScreen';
import { HomeView } from '@/views/HomeView';
import { BrowseView } from '@/views/BrowseView';
import { TrackView } from '@/views/TrackView';
import { ApplyModal } from '@/views/ApplyModal';
import { DonorApp } from '@/views/admin/DonorApp';
import { AdminApp } from '@/views/admin/AdminApp';
import type { Scholarship } from '@/lib/supabase';

type StudentTab = 'home' | 'browse' | 'track';

const STUDENT_TABS: { id: StudentTab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'browse', label: 'Browse', icon: Compass },
  { id: 'track', label: 'My Apps', icon: ClipboardList },
];

function AppShell() {
  const { user, profile, loading, signOut } = useAuth();
  const [studentTab, setStudentTab] = useState<StudentTab>('home');
  const [applyingTo, setApplyingTo] = useState<Scholarship | null>(null);

  const role = String(profile?.role ?? user?.user_metadata?.role ?? '').toLowerCase();
  const isDonor = role === 'donor';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const openApply = (s: Scholarship) => setApplyingTo(s);

  if (isDonor) {
    return <DonorApp />;
  }

  if (isAdmin) {
    return <AdminApp />;
  }

  if (isStudent) {
    return (
      <div className="flex min-h-screen flex-col bg-base">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-brand">Scholóur</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-400 transition-colors hover:bg-base-100 hover:text-brand"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto w-full max-w-md flex-1 pb-20">
          {studentTab === 'home' && (
            <HomeView onBrowse={() => setStudentTab('browse')} onApply={openApply} />
          )}
          {studentTab === 'browse' && <BrowseView onApply={openApply} />}
          {studentTab === 'track' && <TrackView />}
        </main>

        {/* Bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
            {STUDENT_TABS.map((t) => {
              const Icon = t.icon;
              const active = studentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setStudentTab(t.id)}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
                    active ? 'text-brand' : 'text-brand-300 hover:text-brand-500'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'stroke-[2.4]' : ''}`} />
                  <span
                    className={`text-[10px] font-semibold ${active ? 'text-brand' : ''}`}
                  >
                    {t.label}
                  </span>
                  {active && <span className="h-1 w-6 rounded-full bg-teal" />}
                </button>
              );
            })}
          </div>
        </nav>

        {applyingTo && (
          <ApplyModal scholarship={applyingTo} onClose={() => setApplyingTo(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base px-6 text-center">
      <p className="text-sm text-brand-500">
        We couldn’t determine your account role. Sign out and try again, or contact support.
      </p>
      <button onClick={signOut} className="btn-primary px-5 py-2 text-sm">
        Sign out
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
