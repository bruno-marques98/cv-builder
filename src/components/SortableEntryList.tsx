"use client";

import { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DragHandleWrapper({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <button
        {...attributes}
        {...listeners}
        className="absolute -left-5 top-3 text-[#C9C4BA] hover:text-[#6B7280] cursor-grab touch-none text-sm opacity-0 group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      {children}
    </div>
  );
}

export function SortableEntryList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (fromId: string, toId: string) => void;
  renderItem: (item: T) => ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 pl-1">
          {items.map((item) => (
            <DragHandleWrapper key={item.id} id={item.id}>
              {renderItem(item)}
            </DragHandleWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
