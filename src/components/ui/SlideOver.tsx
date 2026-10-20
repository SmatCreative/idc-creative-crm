'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const widths = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

export function SlideOver({ open, onClose, title, subtitle, children, width = 'lg' }: SlideOverProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div className={cn('fixed inset-0 z-50 overflow-hidden', !open && 'pointer-events-none')}>
      <div className={cn('absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex">
        <div className={cn(
          'relative w-screen transition-transform duration-300 ease-in-out',
          widths[width],
          open ? 'translate-x-0' : 'translate-x-full',
        )}>
          <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="ml-4 mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
