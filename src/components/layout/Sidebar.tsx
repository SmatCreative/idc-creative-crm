'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Zap, LayoutDashboard, Kanban, Briefcase, Building2,
  Users, CheckSquare, Truck, MessageSquare, Sun, Moon, Calendar,
  Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const nav = [
  { href: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/pipeline',   label: 'Pipeline',   icon: Kanban },
  { href: '/deals',      label: 'Projects',   icon: Briefcase },
  { href: '/accounts',   label: 'Clients',    icon: Building2 },
  { href: '/contacts',   label: 'Contacts',   icon: Users },
  { href: '/tasks',      label: 'Tasks',      icon: CheckSquare },
  { href: '/calendar',   label: 'Calendar',   icon: Calendar },
  { href: '/messages',   label: 'Messages',   icon: MessageSquare },
  { href: '/suppliers',  label: 'Suppliers',  icon: Truck },
];

const LogoIcon = () => (
  <svg viewBox="0 0 100 100" className="w-9 h-9 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="lp">
        <polygon points="18,4 92,4 82,96 8,96"/>
      </clipPath>
    </defs>
    {/* parallelogram background */}
    <polygon points="18,4 92,4 82,96 8,96" fill="#000"/>
    {/* striped S — layers from thick to thin */}
    <text x="50" y="76" fontSize="88" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif"
      textAnchor="middle" clipPath="url(#lp)"
      stroke="white" strokeWidth="22" strokeLinejoin="round" fill="black" paintOrder="stroke fill">S</text>
    <text x="50" y="76" fontSize="88" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif"
      textAnchor="middle" clipPath="url(#lp)"
      stroke="black" strokeWidth="16" strokeLinejoin="round" fill="black" paintOrder="stroke fill">S</text>
    <text x="50" y="76" fontSize="88" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif"
      textAnchor="middle" clipPath="url(#lp)"
      stroke="white" strokeWidth="10" strokeLinejoin="round" fill="black" paintOrder="stroke fill">S</text>
    <text x="50" y="76" fontSize="88" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif"
      textAnchor="middle" clipPath="url(#lp)"
      stroke="black" strokeWidth="5" strokeLinejoin="round" fill="black" paintOrder="stroke fill">S</text>
    <text x="50" y="76" fontSize="88" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif"
      textAnchor="middle" clipPath="url(#lp)" fill="black">S</text>
  </svg>
);

export function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const navLinks = (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              active
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-900/50'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-gray-950 border-b border-white/5 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <LogoIcon />
          <div>
            <p className="text-sm font-bold text-white leading-tight">SmatCreative CRM</p>
          </div>
        </div>
      </div>

      {/* ── Mobile overlay ─────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gray-950 border-r border-white/5 transition-transform duration-200',
          // Desktop: always visible
          'md:translate-x-0',
          // Mobile: slide in/out
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <div>
              <p className="text-sm font-bold text-white leading-tight">SmatCreative CRM</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {navLinks}

        {/* Theme toggle */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>
    </>
  );
}
