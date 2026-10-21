'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Kanban, Building2, Users, Briefcase,
  CheckSquare, Zap, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline',  label: 'Pipeline',  icon: Kanban },
  { href: '/deals',     label: 'Deals',     icon: Briefcase },
  { href: '/accounts',  label: 'Accounts',  icon: Building2 },
  { href: '/contacts',  label: 'Contacts',  icon: Users },
  { href: '/tasks',     label: 'Tasks',     icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-gray-950 fixed left-0 top-0 border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
            <Zap size={17} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight">IDC Creative</span>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">CRM Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Main Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-900/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  );
}
