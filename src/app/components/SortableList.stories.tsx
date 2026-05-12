import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { LuGripVertical } from "react-icons/lu";
import { arrayMove, SortableList } from "./SortableList";

const meta: Meta = {
  title: "Components/SortableList",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

type Item = { id: string; label: string };

const initial: Item[] = [
  { id: "1", label: "Barbell Back Squat" },
  { id: "2", label: "Bench Press" },
  { id: "3", label: "Deadlift" },
  { id: "4", label: "Pull-Ups" },
  { id: "5", label: "Plank Hold" },
];

function Demo() {
  const [items, setItems] = useState<Item[]>(initial);
  return (
    <div
      style={{
        width: 360,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 24,
        background: "var(--color-bg, #070712)",
        borderRadius: 12,
      }}
    >
      <SortableList
        items={items}
        getItemId={(i) => i.id}
        onReorder={(from, to) => setItems((prev) => arrayMove(prev, from, to))}
        renderItem={(item, idx, drag) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "var(--color-surface, #0f0f1e)",
              border: "1px solid var(--color-border, rgba(255,255,255,0.07))",
              borderRadius: 8,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              {...drag.attributes}
              {...drag.listeners}
              ref={drag.setActivatorRef}
              aria-label={`Drag ${item.label}`}
              style={{
                cursor: drag.isDragging ? "grabbing" : "grab",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              <LuGripVertical size={16} />
            </button>
            <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>
              {idx + 1}. {item.label}
            </span>
          </div>
        )}
      />
    </div>
  );
}

export const Basic: Story = {
  render: () => <Demo />,
};
