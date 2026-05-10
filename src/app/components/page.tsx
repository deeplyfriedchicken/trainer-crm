import { Box } from "@chakra-ui/react";
import { ColorPalette } from "./_showcase/ColorPalette";
import { Hero } from "./_showcase/Hero";
import { Sidebar } from "./_showcase/Sidebar";
import {
  ButtonsSection,
  CardsSection,
  ChatPanelSection,
  DialogSection,
  FeedbackSection,
  FormsSection,
  PageHeaderSection,
  SessionsPanelSection,
  TableSection,
  TextSection,
} from "./_showcase/sections";
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
        <TextSection />
        <ButtonsSection />
        <FormsSection />
        <FeedbackSection />
        <CardsSection />
        <TableSection />
        <SessionsPanelSection />
        <ChatPanelSection />
        <DialogSection />
        <PageHeaderSection />
      </Box>
      <Toaster />
    </Box>
  );
}
