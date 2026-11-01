'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  format, startOfWeek, addDays, addWeeks, subWeeks, isToday,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  subMonths, addMonths,
} from 'date-fns';
import { useTasks } from '@/lib/hooks/useTasks';
import { useDeals } from '@/lib/hooks/useDeals';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup } from '@/components/ui/Input';
import {
  ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, Circle,
  Settings2, CalendarDays, CalendarRange, Rows3,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ─── event types ──────────────────────────────────────────────────────────────
const EVENT_TYPE_KEYS = ['task', 'meeting', 'call', 'design', 'deadline', 'personal'] as const;
type EventTypeKey = typeof EVENT_TYPE_KEYS[number];

const EVENT_DEFAULTS: Record<EventTypeKey, { label: string; color: string }> = {
  task:     { label: 'Task',     color: '#6366f1' },
  meeting:  { label: 'Meeting',  color: '#8b5cf6' },
  call:     { label: 'Call',     color: '#10b981' },
  design:   { label: 'Design',   color: '#f59e0b' },
  deadline: { label: 'Deadline', color: '#ef4444' },
  personal: { label: 'Personal', color: '#0ea5e9' },
};

function loadColors(): Record<EventTypeKey, string> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('cal-colors') : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<EventTypeKey, string>>;
      return Object.fromEntries(
        EVENT_TYPE_KEYS.map(k => [k, parsed[k] ?? EVENT_DEFAULTS[k].color])
      ) as Record<EventTypeKey, string>;
    }
  } catch {}
  return Object.fromEntries(EVENT_TYPE_KEYS.map(k => [k, EVENT_DEFAULTS[k].color])) as Record<EventTypeKey, string>;
}

// ─── title helpers ─────────────────────────────────────────────────────────────
const TYPE_RE = /^\[([a-z]+)\]/i;
const TIME_RE = /^(?:\[[a-z]+\])?(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–]\s*/i;

function parseEventType(title: string): EventTypeKey {
  const key = title.match(TYPE_RE)?.[1]?.toLowerCase() ?? '';
  return (EVENT_TYPE_KEYS as readonly string[]).includes(key) ? (key as EventTypeKey) : 'task';
}

function parseTaskTime(title: string): number | null {
  const m = title.match(TIME_RE);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const p = (m[3] ?? '').toLowerCase();
  if (p === 'pm' && h < 12) h += 12;
  if (p === 'am' && h === 12) h = 0;
  return h * 60 + min;
}

function stripPrefixes(title: string): string {
  return title.replace(TYPE_RE, '').replace(TIME_RE, '').trim();
}

function fmt(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

// ─── grid constants ────────────────────────────────────────────────────────────
const HR_PX = 64;
const DAY_START = 6;
const DAY_END = 22;
const HOURS = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);

function toTop(minutes: number) {
  return ((minutes / 60) - DAY_START) * HR_PX;
}

type CalView = 'today' | 'week' | 'month';

// ─── component ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { tasks, create: createTask, toggle: toggleTask } = useTasks();
  const { deals } = useDeals();

  const [view, setView] = useState<CalView>('week');
  const [anchor, setAnchor] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [colors, setColors] = useState<Record<EventTypeKey, string>>(() =>
    Object.fromEntries(EVENT_TYPE_KEYS.map(k => [k, EVENT_DEFAULTS[k].color])) as Record<EventTypeKey, string>
  );
  const [draftColors, setDraftColors] = useState(colors);
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState({ title: '', date: '', time: '', type: 'task' as EventTypeKey, dealId: '' });
  const gridRef = useRef<HTMLDivElement>(null);

  // hydrate colours from localStorage
  useEffect(() => { setColors(loadColors()); }, []);

  // live clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // scroll to now
  useEffect(() => {
    if (!gridRef.current || view === 'month') return;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    gridRef.current.scrollTop = Math.max(0, toTop(nowMin) - 120);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const todayStr = format(now, 'yyyy-MM-dd');

  // days shown in time-grid views
  const daysToShow = useMemo(() => {
    if (view === 'today') return [anchor];
    if (view === 'week') {
      const ws = startOfWeek(anchor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    }
    return [];
  }, [view, anchor]);

  const navigate = (dir: 1 | -1) => {
    if (view === 'today') setAnchor(a => addDays(a, dir));
    else if (view === 'week') setAnchor(a => dir === 1 ? addWeeks(a, 1) : subWeeks(a, 1));
    else setAnchor(a => dir === 1 ? addMonths(a, 1) : subMonths(a, 1));
  };

  const headerLabel = useMemo(() => {
    if (view === 'today') return format(anchor, 'EEEE, d MMMM yyyy');
    if (view === 'week') {
      const ws = startOfWeek(anchor, { weekStartsOn: 1 });
      return `${format(ws, 'MMM d')} – ${format(addDays(ws, 6), 'MMM d, yyyy')}`;
    }
    return format(anchor, 'MMMM yyyy');
  }, [view, anchor]);

  const getTasksForDay = useCallback((d: Date) =>
    tasks.filter(t => t.due_date === format(d, 'yyyy-MM-dd')), [tasks]);

  const openCreate = (date: Date, hour?: number) => {
    setDraft({
      title: '',
      date: format(date, 'yyyy-MM-dd'),
      time: hour !== undefined ? `${String(hour).padStart(2, '0')}:00` : '',
      type: 'task',
      dealId: '',
    });
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    const typeTag = draft.type !== 'task' ? `[${draft.type}]` : '';
    const timeTag = draft.time ? `${draft.time} - ` : '';
    await createTask({
      title: `${typeTag}${timeTag}${draft.title}`.trim(),
      description: null,
      deal_id: draft.dealId || null,
      contact_id: null,
      due_date: draft.date || null,
      completed: false,
      completed_at: null,
    });
    setShowCreate(false);
  };

  const saveColors = () => {
    setColors(draftColors);
    localStorage.setItem('cal-colors', JSON.stringify(draftColors));
    setShowSettings(false);
  };

  // today right-panel data
  const currentTask = tasks.find(t => {
    if (t.completed || t.due_date !== todayStr) return false;
    const tm = parseTaskTime(t.title);
    return tm !== null && tm <= nowMin && tm + 60 > nowMin;
  });
  const upcomingToday = tasks
    .filter(t => !t.completed && t.due_date === todayStr)
    .map(t => ({ task: t, tm: parseTaskTime(t.title) }))
    .filter(({ tm }) => tm !== null && tm > nowMin)
    .sort((a, b) => (a.tm ?? 0) - (b.tm ?? 0))
    .slice(0, 3);

  // ─── sub-views ──────────────────────────────────────────────────────────────
  const trackerTop = toTop(nowMin);
  const trackerVisible = now.getHours() >= DAY_START && now.getHours() < DAY_END;

  function TimeGrid() {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* day header */}
        <div className="flex flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 flex-shrink-0" />
          {daysToShow.map(day => (
            <div
              key={day.toISOString()}
              onClick={() => openCreate(day)}
              className={cn(
                'flex-1 text-center py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                isToday(day) ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400',
              )}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider">{format(day, 'EEE')}</div>
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold',
                isToday(day) ? 'bg-brand-600 text-white' : '',
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* scrollable time grid */}
        <div ref={gridRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="relative flex" style={{ height: `${HOURS.length * HR_PX}px` }}>
            {/* hour axis */}
            <div className="w-12 flex-shrink-0 relative select-none">
              {HOURS.map(h => (
                <div key={h} style={{ top: `${(h - DAY_START) * HR_PX - 8}px` }}
                  className="absolute right-2 text-[10px] text-gray-400 dark:text-gray-600 font-medium">
                  {h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`}
                </div>
              ))}
            </div>

            {/* day columns */}
            {daysToShow.map(day => {
              const timedTasks = getTasksForDay(day).filter(t => parseTaskTime(t.title) !== null);
              return (
                <div key={day.toISOString()} className="flex-1 relative border-l border-gray-100 dark:border-gray-800">
                  {/* hour slots */}
                  {HOURS.map(h => (
                    <div key={h}
                      style={{ top: `${(h - DAY_START) * HR_PX}px`, height: `${HR_PX}px` }}
                      className="absolute inset-x-0 border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors group"
                      onClick={() => openCreate(day, h)}
                    >
                      <span className="absolute right-1 top-0.5 text-[9px] text-gray-200 dark:text-gray-700 opacity-0 group-hover:opacity-100">+</span>
                    </div>
                  ))}

                  {/* event blocks */}
                  {timedTasks.map(task => {
                    const tm = parseTaskTime(task.title)!;
                    const top = toTop(tm);
                    if (top < 0 || top > HOURS.length * HR_PX) return null;
                    const type = parseEventType(task.title);
                    const color = colors[type];
                    const isPast = isToday(day) && tm < nowMin;
                    const faded = task.completed || isPast;

                    return (
                      <button
                        key={task.id}
                        style={{
                          top: `${top + 2}px`,
                          height: `${HR_PX - 5}px`,
                          backgroundColor: faded ? undefined : color,
                          borderLeftColor: color,
                        }}
                        onClick={e => { e.stopPropagation(); toggleTask(task.id, !task.completed); }}
                        className={cn(
                          'absolute left-0.5 right-0.5 rounded-lg px-2 py-1 text-left z-10 hover:opacity-80 focus:outline-none border-l-2 border border-transparent',
                          faded ? 'bg-gray-100 dark:bg-gray-800 border-l-2' : '',
                          task.completed ? 'opacity-50' : '',
                        )}
                      >
                        <p className={cn(
                          'text-[11px] font-semibold truncate leading-tight',
                          faded ? 'text-gray-500 dark:text-gray-400' : 'text-white',
                          task.completed && 'line-through',
                        )}>{stripPrefixes(task.title)}</p>
                        <p className={cn('text-[9px] mt-0.5', faded ? 'text-gray-400' : 'text-white/70')}>
                          {fmt(tm)}{task.deal ? ` · ${task.deal.deal_name}` : ''}
                        </p>
                      </button>
                    );
                  })}

                  {/* tracker line — today column */}
                  {isToday(day) && trackerVisible && (
                    <div style={{ top: `${trackerTop}px` }}
                      className="absolute inset-x-0 z-30 pointer-events-none flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-600 -ml-1 flex-shrink-0 shadow-sm" />
                      <div className="flex-1 h-px bg-brand-600" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* full-width tracker shadow */}
            {trackerVisible && daysToShow.some(d => isToday(d)) && (
              <div style={{ top: `${trackerTop}px` }}
                className="absolute left-12 right-0 h-px bg-brand-600/20 z-20 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    );
  }

  function MonthView() {
    const ms = startOfMonth(anchor);
    const me = endOfMonth(anchor);
    const gs = startOfWeek(ms, { weekStartsOn: 1 });
    const ge = addDays(startOfWeek(addDays(me, 6), { weekStartsOn: 1 }), 6);
    const days = eachDayOfInterval({ start: gs, end: ge });
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 z-10">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            {week.map(day => {
              const dayTasks = getTasksForDay(day);
              const shown = dayTasks.slice(0, 3);
              const extra = dayTasks.length - 3;
              return (
                <div key={day.toISOString()}
                  className={cn(
                    'border-r border-gray-100 dark:border-gray-800 last:border-r-0 p-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors min-h-[80px] md:min-h-[96px]',
                    !isSameMonth(day, anchor) && 'opacity-30',
                  )}
                  onClick={() => { setAnchor(day); setView('today'); }}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1',
                    isToday(day) ? 'bg-brand-600 text-white' : 'text-gray-700 dark:text-gray-300',
                  )}>{format(day, 'd')}</div>
                  <div className="space-y-0.5">
                    {shown.map(task => {
                      const color = colors[parseEventType(task.title)];
                      return (
                        <div key={task.id}
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white truncate"
                          style={{ backgroundColor: color }}>
                          {stripPrefixes(task.title)}
                        </div>
                      );
                    })}
                    {extra > 0 && <div className="text-[10px] text-gray-400 pl-1">+{extra}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ─── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100dvh-14rem)] md:h-[calc(100dvh-8rem)] -mt-5 md:-mt-7 -mx-4 md:-mx-8 px-4 md:px-8 pt-3 md:pt-5">

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0 flex-wrap">
        {/* view switcher */}
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
          {([
            { key: 'today', icon: CalendarDays,  label: 'Today' },
            { key: 'week',  icon: Rows3,         label: 'Week'  },
            { key: 'month', icon: CalendarRange, label: 'Month' },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all',
                view === key
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              <Icon size={13} /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* nav */}
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setAnchor(new Date())}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Today
        </button>
        <button onClick={() => navigate(1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight size={16} />
        </button>

        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1 min-w-0 truncate">{headerLabel}</span>

        {/* actions */}
        <button
          onClick={() => { setDraftColors({ ...colors }); setShowSettings(true); }}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="Color settings"
        >
          <Settings2 size={16} />
        </button>
        <button
          onClick={() => openCreate(anchor)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={14} /> Event
        </button>
      </div>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0 flex-wrap">
        {EVENT_TYPE_KEYS.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[k] }} />
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 capitalize">{EVENT_DEFAULTS[k].label}</span>
          </div>
        ))}
      </div>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex-1 flex gap-4 md:gap-5 min-h-0">

        {/* calendar panel */}
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          {view === 'month' ? <MonthView /> : <TimeGrid />}
        </div>

        {/* ── Right sidebar — hidden on small mobile ─────────── */}
        <div className="hidden md:flex w-52 flex-shrink-0 flex-col gap-3 overflow-y-auto">

          {/* clock */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">{format(now, 'HH:mm')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{format(now, 'EEE, d MMM')}</p>
          </div>

          {/* doing now */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex-shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Doing now</p>
            {currentTask ? (
              <div className="rounded-xl p-3" style={{ backgroundColor: colors[parseEventType(currentTask.title)] }}>
                <p className="text-sm font-bold text-white leading-tight">{stripPrefixes(currentTask.title)}</p>
                {currentTask.deal && <p className="text-xs text-white/70 mt-1">{currentTask.deal.deal_name}</p>}
                <p className="text-[10px] text-white/50 mt-1.5">{fmt(parseTaskTime(currentTask.title)!)} – {fmt((parseTaskTime(currentTask.title) ?? 0) + 60)}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Nothing scheduled now</p>
            )}
          </div>

          {/* up next */}
          {upcomingToday.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex-shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Up next</p>
              <div className="space-y-1.5">
                {upcomingToday.map(({ task, tm }) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[parseEventType(task.title)] }} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{stripPrefixes(task.title)}</p>
                      <p className="text-[10px] text-gray-400">{fmt(tm!)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* today tasks */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Today</p>
            {(() => {
              const list = tasks
                .filter(t => t.due_date === todayStr)
                .sort((a, b) => (parseTaskTime(a.title) ?? 9999) - (parseTaskTime(b.title) ?? 9999));
              return list.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No tasks today</p>
              ) : (
                <div className="space-y-1">
                  {list.map(t => {
                    const tm = parseTaskTime(t.title);
                    const color = colors[parseEventType(t.title)];
                    return (
                      <button key={t.id} onClick={() => toggleTask(t.id, !t.completed)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.completed ? '#d1d5db' : color }} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-medium truncate', t.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200')}>
                            {stripPrefixes(t.title)}
                          </p>
                          {tm !== null && <p className="text-[10px] text-gray-400">{fmt(tm)}</p>}
                        </div>
                        {t.completed
                          ? <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          : <Circle size={13} className="text-gray-300 flex-shrink-0" />
                        }
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Create event modal ───────────────────────────────────── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Event" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* type pills */}
          <div>
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {EVENT_TYPE_KEYS.map(k => (
                <button
                  key={k} type="button"
                  onClick={() => setDraft(d => ({ ...d, type: k }))}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                    draft.type === k ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-500',
                  )}
                  style={draft.type === k ? { backgroundColor: colors[k] } : {}}
                >
                  {EVENT_DEFAULTS[k].label}
                </button>
              ))}
            </div>
          </div>

          <FormGroup>
            <Label>Title *</Label>
            <Input
              autoFocus
              value={draft.title}
              onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              placeholder="e.g. Client review meeting"
              required
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-3">
            <FormGroup>
              <Label>Date</Label>
              <Input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <Label>Time</Label>
              <Input type="time" value={draft.time} onChange={e => setDraft(d => ({ ...d, time: e.target.value }))} />
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Project (optional)</Label>
            <select
              value={draft.dealId}
              onChange={e => setDraft(d => ({ ...d, dealId: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">No project</option>
              {deals.map(d => <option key={d.id} value={d.id}>{d.deal_name}</option>)}
            </select>
          </FormGroup>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1">Add Event</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* ── Color settings modal ─────────────────────────────────── */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Event Color Settings" size="sm">
        <div className="space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Choose a color for each event type.</p>
          {EVENT_TYPE_KEYS.map(k => (
            <div key={k} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-sm"
                style={{ backgroundColor: draftColors[k] }} />
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{EVENT_DEFAULTS[k].label}</span>
              <input
                type="color"
                value={draftColors[k]}
                onChange={e => setDraftColors(c => ({ ...c, [k]: e.target.value }))}
                className="w-10 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={saveColors}>Save Colors</Button>
            <Button variant="secondary" onClick={() => {
              const reset = Object.fromEntries(EVENT_TYPE_KEYS.map(k => [k, EVENT_DEFAULTS[k].color])) as Record<EventTypeKey, string>;
              setDraftColors(reset);
            }}>Reset</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
