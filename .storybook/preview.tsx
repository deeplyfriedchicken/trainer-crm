import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { Preview } from "@storybook/nextjs-vite";
import React from "react";
import "../src/app/components/neon.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <ChakraProvider value={defaultSystem}>
        <div className="neon" style={{ padding: "32px", minHeight: "100vh" }}>
          <Story />
        </div>
      </ChakraProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "neon-dark",
      values: [{ name: "neon-dark", value: "#070712" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
