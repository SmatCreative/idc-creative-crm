'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Kanban, Building2, Users, Briefcase,
  CheckSquare, Zap, Settings, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/accounts', label: 'Accounts', icon: Building2 },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
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
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed left-0 top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">IDC Creative</span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">CRM Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Main Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
              )}
            >
              <Icon size={17} className={active ? 'text-brand-600 dark:text-brand-400' : ''} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  );
}
