"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";
import styles from "./SortableList.module.css";

type UseSortableReturn = ReturnType<typeof useSortable>;

export type SortableDragHandleProps = {
  attributes: UseSortableReturn["attributes"];
  listeners: UseSortableReturn["listeners"];
  setActivatorRef: UseSortableReturn["setActivatorNodeRef"];
  isDragging: boolean;
};

export type SortableListProps<T> = {
  items: T[];
  getItemId: (item: T) => string;
  onReorder: (oldIndex: number, newIndex: number) => void;
  renderItem: (
    item: T,
    index: number,
    drag: SortableDragHandleProps,
  ) => ReactNode;
};

export function SortableList<T>({
  items,
  getItemId,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = items.map(getItemId);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(from, to);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <SortableItem key={getItemId(item)} id={getItemId(item)}>
            {(drag) => renderItem(item, index, drag)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

export { arrayMove };

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (drag: SortableDragHandleProps) => ReactNode;
}) {
  const sortable = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    zIndex: sortable.isDragging ? 10 : undefined,
  };
  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`${styles.item}${sortable.isDragging ? ` ${styles.dragging}` : ""}`}
    >
      {children({
        attributes: sortable.attributes,
        listeners: sortable.listeners,
        setActivatorRef: sortable.setActivatorNodeRef,
        isDragging: sortable.isDragging,
      })}
    </div>
  );
}
