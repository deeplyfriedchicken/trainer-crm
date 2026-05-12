"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LuLayoutGrid, LuHistory, LuMessageSquare } from "react-icons/lu";
import { useState } from "react";
import { Tab, TabGroup } from "./TabGroup";

const meta: Meta = {
  title: "Components/TabGroup",
  parameters: { layout: "centered" },
};

export default meta;

function Controlled({
  colorScheme = "pink",
}: {
  colorScheme?: "pink" | "cyan" | "neutral";
}) {
  const [active, setActive] = useState("plans");
  return (
    <div style={{ width: 360 }}>
      <TabGroup colorScheme={colorScheme}>
        <Tab
          active={active === "plans"}
          colorScheme={colorScheme}
          onClick={() => setActive("plans")}
        >
          My Plans
        </Tab>
        <Tab
          active={active === "history"}
          colorScheme={colorScheme}
          onClick={() => setActive("history")}
        >
          History (3)
        </Tab>
        <Tab
          active={active === "chat"}
          colorScheme={colorScheme}
          onClick={() => setActive("chat")}
        >
          Chat
        </Tab>
      </TabGroup>
      <p
        style={{
          marginTop: 16,
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          fontFamily: "monospace",
        }}
      >
        active: {active}
      </p>
    </div>
  );
}

export const PinkScheme: StoryObj = {
  render: () => <Controlled colorScheme="pink" />,
};

export const CyanScheme: StoryObj = {
  render: () => <Controlled colorScheme="cyan" />,
};

export const WithIcons: StoryObj = {
  render: () => {
    const [active, setActive] = useState("plans");
    return (
      <div style={{ width: 360 }}>
        <TabGroup colorScheme="pink">
          <Tab
            active={active === "plans"}
            colorScheme="pink"
            onClick={() => setActive("plans")}
          >
            <LuLayoutGrid size={13} /> Plans
          </Tab>
          <Tab
            active={active === "history"}
            colorScheme="pink"
            onClick={() => setActive("history")}
          >
            <LuHistory size={13} /> History
          </Tab>
          <Tab
            active={active === "chat"}
            colorScheme="pink"
            onClick={() => setActive("chat")}
          >
            <LuMessageSquare size={13} /> Chat
          </Tab>
        </TabGroup>
      </div>
    );
  },
};

export const TwoTabs: StoryObj = {
  render: () => {
    const [active, setActive] = useState("library");
    return (
      <div style={{ width: 260 }}>
        <TabGroup colorScheme="cyan">
          <Tab
            active={active === "library"}
            colorScheme="cyan"
            onClick={() => setActive("library")}
          >
            Library
          </Tab>
          <Tab
            active={active === "upload"}
            colorScheme="cyan"
            onClick={() => setActive("upload")}
          >
            Upload new
          </Tab>
        </TabGroup>
      </div>
    );
  },
};
