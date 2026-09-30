"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCVStore } from "@/lib/store";
import { CVSection } from "@/lib/types";

function SectionRow({ section }: { section: CVSection }) {
  const toggleSection = useCVStore((s) => s.toggleSection);
  const setSectionColor = useCVStore((s) => s.setSectionColor);
  const cvAccent = useCVStore((s) => s.cv.accentColor);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border border-[#E4E0D8] bg-white px-3 py-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-[#9CA3AF] hover:text-[#6B7280] touch-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <span className="flex-1 text-sm text-[#1B2430]">{section.title}</span>
      <input
        type="color"
        value={section.color ?? cvAccent}
        onChange={(e) => setSectionColor(section.id, e.target.value)}
        title="Override this section's accent color"
        className="h-6 w-6 rounded border border-[#E4E0D8] cursor-pointer"
      />
      {section.color && (
        <button
          onClick={() => setSectionColor(section.id, undefined)}
          className="text-[10px] text-[#9CA3AF] hover:text-[#B45247]"
          title="Reset to the CV's default accent color"
        >
          Reset
        </button>
      )}
      <button
        onClick={() => toggleSection(section.id)}
        className={`text-xs px-2 py-1 rounded ${
          section.visible
            ? "bg-[#3F7368] text-white"
            : "bg-[#F1EFEA] text-[#9CA3AF]"
        }`}
      >
        {section.visible ? "Shown" : "Hidden"}
      </button>
    </div>
  );
}

export function SectionList() {
  const sections = useCVStore((s) => s.cv.sections);
  const reorderSections = useCVStore((s) => s.reorderSections);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    reorderSections(arrayMove(sections, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {sections.map((section) => (
            <SectionRow key={section.id} section={section} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
