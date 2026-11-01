'use client';
import { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday } from 'date-fns';
import { useTasks } from '@/lib/hooks/useTasks';
import { useDeals } from '@/lib/hooks/useDeals';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup } from '@/components/ui/Input';
import type { Task } from '@/lib/supabase/types';
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ─── constants ────────────────────────────────────────────────────────────────
const HOUR_PX = 72;   // px per hour
const DAY_START = 6;  // 6 AM
const DAY_END = 22;   // 10 PM
const HOURS = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Parse "HH:MM - " or "H:MM - " prefix from a task title */
function parseTaskTime(title: string): number | null {
  const m = title.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–]\s*/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const period = (m[3] ?? '').toLowerCase();
  if (period === 'pm' && h < 12) h += 12;
  if (period === 'am' && h === 12) h = 0;
  return h * 60 + min;
}

function stripTimePrefix(title: string): string {
  return title.replace(/^(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–]\s*/i, '').trim();
}

function fmtMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function minutesToTop(minutes: number): number {
  return ((minutes / 60) - DAY_START) * HOUR_PX;
}

// ─── component ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { tasks, create: createTask, toggle: toggleTask } = useTasks();
  const { deals } = useDeals();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [now, setNow] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ title: '', date: '', dealId: '' });
  const gridRef = useRef<HTMLDivElement>(null);

  // Refresh tracker every 30 s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Scroll to current time on load
  useEffect(() => {
    if (!gridRef.current) return;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const scrollTo = minutesToTop(nowMin) - 120;
    gridRef.current.scrollTop = Math.max(0, scrollTo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Tracker
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const trackerTop = minutesToTop(nowMin);
  const trackerVisible = now.getHours() >= DAY_START && now.getHours() < DAY_END;

  // Today context
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentTask = tasks.find((t) => {
    if (t.completed || t.due_date !== todayStr) return false;
    const tm = parseTaskTime(t.title);
    return tm !== null && tm <= nowMin && tm + 60 > nowMin;
  });
  const upcomingToday = tasks
    .filter((t) => !t.completed && t.due_date === todayStr)
    .map((t) => ({ task: t, time: parseTaskTime(t.title) }))
    .filter(({ time }) => time !== null && time > nowMin)
    .sort((a, b) => (a.time ?? 0) - (b.time ?? 0))
    .slice(0, 3);

  const getTasksForDay = (date: Date) => {
    const ds = format(date, 'yyyy-MM-dd');
    return tasks.filter((t) => t.due_date === ds);
  };

  const openCreate = (date: Date, hour: number) => {
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    setDraft({ title: `${timeStr} - `, date: format(date, 'yyyy-MM-dd'), dealId: '' });
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    await createTask({
      title: draft.title.trim(),
      description: null,
      deal_id: draft.dealId || null,
      contact_id: null,
      due_date: draft.date || null,
      completed: false,
      completed_at: null,
    });
    setShowCreate(false);
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-80px)]">

      {/* ── Main calendar ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Calendar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <Button
              size="sm"
              onClick={() => {
                setDraft({ title: `${String(now.getHours()).padStart(2, '0')}:00 - `, date: todayStr, dealId: '' });
                setShowCreate(true);
              }}
            >
              <Plus size={14} /> Task
            </Button>
          </div>
        </div>

        {/* Day header row */}
        <div className="flex flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
          <div className="w-14 flex-shrink-0" />
          {weekDays.map((day) => {
            const count = getTasksForDay(day).filter((t) => parseTaskTime(t.title) !== null).length;
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex-1 text-center py-2',
                  isToday(day) ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400',
                )}
              >
                <div className="text-[10px] uppercase tracking-wider font-medium">{format(day, 'EEE')}</div>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold',
                  isToday(day) ? 'bg-brand-600 text-white' : '',
                )}>
                  {format(day, 'd')}
                </div>
                {count > 0 && (
                  <div className="flex justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scrollable time grid */}
        <div ref={gridRef} className="flex-1 overflow-y-auto relative">
          <div className="relative flex" style={{ height: `${HOURS.length * HOUR_PX}px` }}>

            {/* Time axis */}
            <div className="w-14 flex-shrink-0 relative select-none">
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ top: `${(h - DAY_START) * HOUR_PX - 8}px` }}
                  className="absolute right-2 text-[10px] text-gray-400 dark:text-gray-600 font-medium"
                >
                  {h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, di) => {
              const dayTasks = getTasksForDay(day);
              const timedTasks = dayTasks.filter((t) => parseTaskTime(t.title) !== null);
              const allDayTasks = dayTasks.filter((t) => parseTaskTime(t.title) === null);

              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 relative border-l border-gray-100 dark:border-gray-800"
                >
                  {/* Hour slots — clickable */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ top: `${(h - DAY_START) * HOUR_PX}px`, height: `${HOUR_PX}px` }}
                      className="absolute inset-x-0 border-b border-gray-50 dark:border-gray-800/50 hover:bg-brand-50/30 dark:hover:bg-brand-950/10 cursor-pointer transition-colors group"
                      onClick={() => openCreate(day, h)}
                    >
                      <span className="absolute right-1.5 top-1 text-[9px] text-gray-200 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        + task
                      </span>
                    </div>
                  ))}

                  {/* Timed task blocks */}
                  {timedTasks.map((task) => {
                    const tm = parseTaskTime(task.title)!;
                    const top = minutesToTop(tm);
                    if (top < 0 || top > HOURS.length * HOUR_PX) return null;
                    const isPast = isToday(day) && tm < nowMin;
                    return (
                      <button
                        key={task.id}
                        style={{ top: `${top + 2}px`, height: `${HOUR_PX - 5}px` }}
                        className={cn(
                          'absolute left-0.5 right-0.5 rounded-lg px-2 py-1 text-left z-10 transition-all hover:opacity-80 focus:outline-none',
                          task.completed
                            ? 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            : isPast
                            ? 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                            : 'bg-brand-600 shadow-sm shadow-brand-900/20',
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleTask(task.id, !task.completed); }}
                      >
                        <p className={cn(
                          'text-[11px] font-semibold truncate leading-tight',
                          task.completed ? 'text-gray-400 line-through' : isPast ? 'text-gray-500 dark:text-gray-300' : 'text-white',
                        )}>
                          {stripTimePrefix(task.title)}
                        </p>
                        <p className={cn(
                          'text-[9px] mt-0.5',
                          task.completed ? 'text-gray-400' : isPast ? 'text-gray-400' : 'text-white/70',
                        )}>
                          {fmtMinutes(tm)}
                          {task.deal && ` · ${task.deal.deal_name}`}
                        </p>
                      </button>
                    );
                  })}

                  {/* Tracker line — today column only */}
                  {isToday(day) && trackerVisible && (
                    <div
                      style={{ top: `${trackerTop}px` }}
                      className="absolute inset-x-0 z-30 pointer-events-none flex items-center"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 -ml-1 shadow-sm" />
                      <div className="flex-1 h-px bg-brand-600" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Full-width tracker shadow line */}
            {trackerVisible && (
              <div
                style={{ top: `${trackerTop}px` }}
                className="absolute left-14 right-0 h-px bg-brand-600/20 z-20 pointer-events-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────── */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">

        {/* Live clock */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Live</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
            {format(now, 'HH:mm')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{format(now, 'EEEE, d MMM')}</p>
        </div>

        {/* Doing now */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Doing now</p>
          {currentTask ? (
            <div className="rounded-xl bg-brand-600 p-3">
              <p className="text-sm font-bold text-white leading-tight">{stripTimePrefix(currentTask.title)}</p>
              {currentTask.deal && (
                <p className="text-xs text-white/70 mt-1">{currentTask.deal.deal_name}</p>
              )}
              <p className="text-[10px] text-white/50 mt-2">
                {fmtMinutes(parseTaskTime(currentTask.title)!)} – {fmtMinutes((parseTaskTime(currentTask.title) ?? 0) + 60)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">Nothing scheduled right now</p>
          )}
        </div>

        {/* Up next */}
        {upcomingToday.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Up next today</p>
            <div className="space-y-2">
              {upcomingToday.map(({ task, time }) => (
                <div key={task.id} className="flex items-start gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex-shrink-0 mt-0.5 text-brand-500">
                    <Clock size={11} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{stripTimePrefix(task.title)}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{fmtMinutes(time!)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's full task list */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex-1">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Today's tasks</p>
          {(() => {
            const todayTasks = tasks
              .filter((t) => t.due_date === todayStr)
              .sort((a, b) => (parseTaskTime(a.title) ?? 9999) - (parseTaskTime(b.title) ?? 9999));
            if (todayTasks.length === 0) {
              return (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">No tasks today</p>
              );
            }
            return (
              <div className="space-y-1.5">
                {todayTasks.map((t) => {
                  const tm = parseTaskTime(t.title);
                  const isPast = tm !== null && tm < nowMin;
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, !t.completed)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                    >
                      <div className={cn(
                        'flex-shrink-0 transition-colors',
                        t.completed ? 'text-emerald-500' : isPast ? 'text-gray-300 dark:text-gray-600' : 'text-gray-300 dark:text-gray-600 group-hover:text-brand-500',
                      )}>
                        {t.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-xs font-medium truncate',
                          t.completed ? 'line-through text-gray-400' : isPast ? 'text-gray-400' : 'text-gray-800 dark:text-gray-200',
                        )}>
                          {stripTimePrefix(t.title)}
                        </p>
                        {tm !== null && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{fmtMinutes(tm)}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Create task modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Calendar Task" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormGroup>
            <Label>Task *</Label>
            <Input
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="09:00 - Meet with client"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">Start with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">HH:MM -</code> to position on the calendar</p>
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </FormGroup>
            <FormGroup>
              <Label>Project</Label>
              <select
                value={draft.dealId}
                onChange={(e) => setDraft((d) => ({ ...d, dealId: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">No project</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>{d.deal_name}</option>
                ))}
              </select>
            </FormGroup>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Add to Calendar</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
