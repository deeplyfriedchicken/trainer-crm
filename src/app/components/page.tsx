import { Box } from "@chakra-ui/react";
import { ColorPalette } from "./_showcase/ColorPalette";
import { Hero } from "./_showcase/Hero";
import {
  ButtonsSection,
  CardsSection,
  ChatPanelSection,
  FeedbackSection,
  FormsSection,
  SessionsPanelSection,
  TableSection,
} from "./_showcase/sections";
import { Sidebar } from "./_showcase/Sidebar";
import { TypographyScale } from "./_showcase/TypographyScale";
import { Toaster } from "./Toast";

export default function ComponentsShowcase() {
  return (
    <Box display="flex" minH="100vh" position="relative" zIndex={1}>
      <Sidebar />
      <Box as="main" flex="1" overflowX="hidden">
        <Hero />
        <ColorPalette />
        <TypographyScale />
        <ButtonsSection />
        <FormsSection />
        <FeedbackSection />
        <CardsSection />
        <TableSection />
        <SessionsPanelSection />
        <ChatPanelSection />
      </Box>
      <Toaster />
    </Box>
  );
}
