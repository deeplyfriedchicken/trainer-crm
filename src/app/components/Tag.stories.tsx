import { HStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: { children: "Upper Body" },
};

export const Cyan: Story = {
  args: { children: "Strength", colorScheme: "cyan" },
};

export const Removable: Story = {
  render: () => <Tag onRemove={() => alert("Removed!")}>Removable Tag</Tag>,
};

export const TagGroup: Story = {
  render: () => (
    <HStack gap="6px" flexWrap="wrap">
      <Tag>Strength</Tag>
      <Tag colorScheme="cyan">Cardio</Tag>
      <Tag>Upper Body</Tag>
      <Tag colorScheme="cyan">Core</Tag>
      <Tag onRemove={() => {}}>Removable</Tag>
    </HStack>
  ),
};
