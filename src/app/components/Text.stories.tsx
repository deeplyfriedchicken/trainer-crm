import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VStack } from "@chakra-ui/react";
import { Text, type TextVariant } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "display-7xl", "display-6xl", "display-5xl", "display-4xl", "display-3xl", "display-2xl", "display-xl",
        "body-lg", "body-md", "body-sm", "body-xs", "body-3xs", "label",
        "mono-lg", "mono-md", "mono-sm",
      ] satisfies TextVariant[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: { variant: "body-md", children: "The quick brown fox jumps over the lazy dog." },
};

export const DisplayScale: Story = {
  render: () => (
    <VStack align="flex-start" gap="16px">
      <Text variant="display-7xl">Display 7XL</Text>
      <Text variant="display-6xl">Display 6XL</Text>
      <Text variant="display-5xl">Display 5XL</Text>
      <Text variant="display-4xl">Display 4XL</Text>
      <Text variant="display-3xl">Display 3XL</Text>
      <Text variant="display-2xl">Display 2XL</Text>
      <Text variant="display-xl">Display XL</Text>
    </VStack>
  ),
};

export const BodyScale: Story = {
  render: () => (
    <VStack align="flex-start" gap="12px">
      <Text variant="body-lg">Body Large — The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="body-md">Body Medium — The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="body-sm">Body Small — The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="body-xs">Body XS — The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="body-3xs">Body 3XS — The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="label">Label — Section Title</Text>
    </VStack>
  ),
};

export const MonoScale: Story = {
  render: () => (
    <VStack align="flex-start" gap="12px">
      <Text variant="mono-lg">Mono LG — const value = 42;</Text>
      <Text variant="mono-md">Mono MD — const value = 42;</Text>
      <Text variant="mono-sm">Mono SM — const value = 42;</Text>
    </VStack>
  ),
};
