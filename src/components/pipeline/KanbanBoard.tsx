'use client';
import { useState, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type { Deal, DealStage } from '@/lib/supabase/types';
import { DEAL_STAGES } from '@/lib/supabase/types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCardOverlay } from './KanbanCard';

interface KanbanBoardProps {
  deals: Deal[];
  onMoveStage: (id: string, stage: DealStage) => Promise<void>;
  onCardClick?: (deal: Deal) => void;
  onAddDeal?: (stage: DealStage) => void;
}

export function KanbanBoard({ deals, onMoveStage, onCardClick, onAddDeal }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeDeal = deals.find((d) => d.id === activeId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over) return;
      const deal = deals.find((d) => d.id === active.id);
      if (!deal) return;

      const targetStage = DEAL_STAGES.find((s) => s.key === over.id)?.key
        ?? deals.find((d) => d.id === over.id)?.stage;

      if (targetStage && targetStage !== deal.stage) {
        await onMoveStage(deal.id, targetStage);
      }
    },
    [deals, onMoveStage],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {DEAL_STAGES.map(({ key, label, description }) => (
          <KanbanColumn
            key={key}
            stage={key}
            label={label}
            description={description}
            deals={deals.filter((d) => d.stage === key)}
            onCardClick={onCardClick}
            onAddDeal={onAddDeal}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDeal && <KanbanCardOverlay deal={activeDeal} />}
      </DragOverlay>
    </DndContext>
  );
}
