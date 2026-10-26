import { useState } from 'react';
import { Award, ClipboardList, HeartHandshake, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CoordinatorOverview } from '@/views/admin/CoordinatorOverview';
import { CoordinatorRequests } from '@/views/admin/CoordinatorRequests';
import { CoordinatorPrograms } from '@/views/admin/CoordinatorPrograms';

type DonorTab = 'overview' | 'requests' | 'programs';

export function DonorApp() {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<DonorTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Impact', icon: LayoutDashboard },
    { id: 'requests' as const, label: 'Requests', icon: ClipboardList },
    { id: 'programs' as const, label: 'Support', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-gold-100 bg-brand-900 text-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <HeartHandshake className="h-5 w-5 text-gold-200" />
          </div>
          <div>
            <p className="font-bold">Scholour</p>
            <p className="text-xs text-gold-200">Assistance Partner</p>
          </div>
        </div>
        <nav className="space-y-2 px-4 py-5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left text-sm font-semibold transition-colors ${
                tab === id
                  ? 'border-gold-300 bg-white/10 text-gold-100'
                  : 'border-transparent text-brand-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 p-5">
          <p className="truncate text-sm font-semibold">{profile?.full_name}</p>
          <p className="truncate text-xs text-brand-300">{profile?.school}</p>
          <button onClick={signOut} className="mt-4 flex items-center gap-2 text-xs text-brand-200 hover:text-white">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gold-100 bg-[#f8f5ef]/95 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-base font-bold text-brand">Donor workspace</p>
            <p className="text-xs text-brand-400">{tabs.find((item) => item.id === tab)?.label}</p>
          </div>
          <button onClick={signOut} aria-label="Sign out" className="rounded-full border border-gold-200 p-2 text-brand-500 lg:hidden">
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:px-8">
          {tab === 'overview' && (
            <CoordinatorOverview
              onGoToRequests={() => setTab('requests')}
              onGoToPrograms={() => setTab('programs')}
            />
          )}
          {tab === 'requests' && <CoordinatorRequests />}
          {tab === 'programs' && <CoordinatorPrograms />}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-3 border-t border-gold-100 bg-white px-3 py-2 lg:hidden">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 py-1 text-[10px] font-semibold ${tab === id ? 'text-gold-700' : 'text-brand-400'}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
