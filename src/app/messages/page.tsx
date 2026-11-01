'use client';
import { useState } from 'react';
import { useAllActivities } from '@/lib/hooks/useAllActivities';
import { useDeals } from '@/lib/hooks/useDeals';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import type { ActivityType } from '@/lib/supabase/types';
import { ACTIVITY_TYPES } from '@/lib/supabase/types';
import {
  MessageSquare, Phone, Users, Mail, StickyNote, RefreshCw,
  Send, Hash, Search, Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';

// ─── config ───────────────────────────────────────────────────────────────────
const typeConfig: Record<ActivityType, { icon: React.ReactNode; bg: string; label: string }> = {
  WhatsApp: { icon: <MessageSquare size={12} />, bg: 'bg-green-500',  label: 'WhatsApp' },
  Call:     { icon: <Phone size={12} />,         bg: 'bg-blue-500',   label: 'Call' },
  Meeting:  { icon: <Users size={12} />,         bg: 'bg-purple-500', label: 'Meeting' },
  Email:    { icon: <Mail size={12} />,          bg: 'bg-sky-500',    label: 'Email' },
  Note:     { icon: <StickyNote size={12} />,    bg: 'bg-amber-500',  label: 'Note' },
  Update:   { icon: <RefreshCw size={12} />,     bg: 'bg-brand-500',  label: 'Update' },
};

function timeAgo(ts: string) {
  return formatDistanceToNow(new Date(ts), { addSuffix: true });
}

// ─── component ────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { activities, loading, create } = useAllActivities(200);
  const { deals } = useDeals();

  const [filterDeal, setFilterDeal] = useState<string>('');
  const [filterType, setFilterType] = useState<ActivityType | ''>('');
  const [search, setSearch] = useState('');

  // Compose state
  const [composeType, setComposeType] = useState<ActivityType>('Note');
  const [composeText, setComposeText] = useState('');
  const [composeDeal, setComposeDeal] = useState('');
  const [sending, setSending] = useState(false);

  // Filter activities
  const filtered = activities.filter((a) => {
    if (filterDeal && a.deal_id !== filterDeal) return false;
    if (filterType && a.type !== filterType) return false;
    if (search && !(a.notes ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by project
  const grouped: { dealId: string | null; dealName: string; items: typeof filtered }[] = [];
  for (const a of filtered) {
    const dealId = a.deal_id ?? null;
    const dealName = (a as { deal?: { id: string; deal_name: string } | null }).deal?.deal_name ?? '— No project —';
    let group = grouped.find((g) => g.dealId === dealId);
    if (!group) {
      group = { dealId, dealName, items: [] };
      grouped.push(group);
    }
    group.items.push(a);
  }

  const handleSend = async () => {
    if (!composeText.trim()) return;
    setSending(true);
    try {
      await create({
        type: composeType,
        notes: composeText.trim(),
        deal_id: composeDeal || null,
        contact_id: null,
      });
      setComposeText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-80px)]">

      {/* ── Feed ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Messages"
          description={`${activities.length} logged interactions across all projects`}
        />

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
            />
          </div>
          <select
            value={filterDeal}
            onChange={(e) => setFilterDeal(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All projects</option>
            {deals.map((d) => <option key={d.id} value={d.id}>{d.deal_name}</option>)}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActivityType | '')}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All types</option>
            {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {(filterDeal || filterType || search) && (
            <button
              onClick={() => { setFilterDeal(''); setFilterType(''); setSearch(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
            >
              <Filter size={11} /> Clear
            </button>
          )}
        </div>

        {/* Activity feed */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <MessageSquare size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Log interactions from the Projects page</p>
            </div>
          ) : (
            grouped.map(({ dealId, dealName, items }) => (
              <div key={dealId ?? 'global'}>
                {/* Channel header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Hash size={13} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {dealName}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                  <span className="text-[10px] text-gray-300 dark:text-gray-600">{items.length}</span>
                </div>

                {/* Messages in channel */}
                <div className="space-y-2 pl-2">
                  {items.map((a) => {
                    const cfg = typeConfig[a.type];
                    return (
                      <div key={a.id} className="flex items-start gap-3 group">
                        <div className={cn('flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white mt-0.5', cfg.bg)}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">SmatCreative</span>
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400')}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-gray-300 dark:text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              {timeAgo(a.created_at)}
                            </span>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl rounded-tl-sm px-3 py-2 max-w-2xl">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {a.notes || <span className="italic text-gray-400">No details</span>}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5 pl-0.5">
                            {new Date(a.created_at).toLocaleString('en-ZW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compose bar */}
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setComposeType(t)}
                className={cn(
                  'text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all',
                  composeType === t
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400',
                )}
              >
                {t}
              </button>
            ))}
            <select
              value={composeDeal}
              onChange={(e) => setComposeDeal(e.target.value)}
              className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Global (no project)</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.deal_name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Log a ${composeType}… (Enter to send)`}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!composeText.trim() || sending}
              className="flex-shrink-0 w-10 self-end rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ height: '40px' }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats sidebar ────────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">By type</p>
          <div className="space-y-2">
            {ACTIVITY_TYPES.map((t) => {
              const count = activities.filter((a) => a.type === t).length;
              const pct = activities.length ? Math.round((count / activities.length) * 100) : 0;
              const cfg = typeConfig[t];
              return (
                <div key={t}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', cfg.bg)} />
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">{t}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{count}</span>
                  </div>
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', cfg.bg)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Most active</p>
          <div className="space-y-2">
            {deals
              .map((d) => ({ deal: d, count: activities.filter((a) => a.deal_id === d.id).length }))
              .filter(({ count }) => count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(({ deal, count }) => (
                <div key={deal.id} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{deal.deal_name}</span>
                  <span className="flex-shrink-0 ml-2 text-[11px] font-bold text-gray-700 dark:text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
