import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HStack } from "@chakra-ui/react";
import { Button } from "./Button";
import { Card, CardBody, CardFooter, CardHeader, CardTitle, CardDescription } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "select", options: ["solid", "outlined", "glow"] },
    glowColor: { control: "select", options: ["pink", "cyan"] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Solid: Story = {
  render: () => (
    <Card variant="solid" maxW="360px">
      <CardHeader>
        <CardTitle>Solid Card</CardTitle>
        <CardDescription>Subtle surface background</CardDescription>
      </CardHeader>
      <CardBody>Card content goes here.</CardBody>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" maxW="360px">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>Transparent with border</CardDescription>
      </CardHeader>
      <CardBody>Card content goes here.</CardBody>
    </Card>
  ),
};

export const GlowPink: Story = {
  render: () => (
    <Card variant="glow" glowColor="pink" maxW="360px">
      <CardHeader>
        <CardTitle>Glow Card</CardTitle>
        <CardDescription>Pink ambient glow</CardDescription>
      </CardHeader>
      <CardBody>Card content goes here.</CardBody>
      <CardFooter>
        <Button size="sm" variant="outline">Cancel</Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const GlowCyan: Story = {
  render: () => (
    <Card variant="glow" glowColor="cyan" maxW="360px">
      <CardHeader>
        <CardTitle>Cyan Glow</CardTitle>
        <CardDescription>Cyan ambient glow</CardDescription>
      </CardHeader>
      <CardBody>Card content goes here.</CardBody>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <HStack gap="16px" align="stretch" flexWrap="wrap">
      <Card variant="solid" flex="1" minW="220px">
        <CardHeader><CardTitle>Solid</CardTitle></CardHeader>
        <CardBody>Default surface.</CardBody>
      </Card>
      <Card variant="outlined" flex="1" minW="220px">
        <CardHeader><CardTitle>Outlined</CardTitle></CardHeader>
        <CardBody>Transparent.</CardBody>
      </Card>
      <Card variant="glow" glowColor="pink" flex="1" minW="220px">
        <CardHeader><CardTitle>Glow</CardTitle></CardHeader>
        <CardBody>With aura.</CardBody>
      </Card>
    </HStack>
  ),
};
