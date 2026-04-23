"use client";

import { Card as ChakraCard, type CardRootProps } from "@chakra-ui/react";
import { forwardRef } from "react";

export type NeonCardVariant = "solid" | "outlined" | "glow";

export interface NeonCardProps
  extends Omit<CardRootProps, "variant" | "size"> {
  variant?: NeonCardVariant;
  glowColor?: "pink" | "cyan";
}

export const Card = forwardRef<HTMLDivElement, NeonCardProps>(function Card(
  { variant = "solid", glowColor = "pink", children, ...rest },
  ref,
) {
  const color = `var(--neon-${glowColor})`;
  const chrome =
    variant === "outlined"
      ? {
          bg: "transparent",
          border: "1px solid var(--neon-border)",
        }
      : variant === "glow"
        ? {
            bg: "var(--neon-surface)",
            border: "1px solid",
            borderColor: `${color}55`,
            boxShadow: `0 0 32px ${color}1a, 0 10px 40px rgba(0,0,0,0.4)`,
          }
        : {
            bg: "var(--neon-surface)",
            border: "1px solid var(--neon-border)",
          };

  return (
    <ChakraCard.Root
      ref={ref}
      borderRadius="14px"
      color="var(--neon-text)"
      fontFamily="var(--font-neon-body), sans-serif"
      overflow="hidden"
      {...chrome}
      {...rest}
    >
      {children}
    </ChakraCard.Root>
  );
});

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChakraCard.Header>
>(function CardHeader(props, ref) {
  return (
    <ChakraCard.Header
      ref={ref}
      p="20px 22px 12px"
      borderBottom="1px solid var(--neon-border)"
      {...props}
    />
  );
});

export const CardTitle = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChakraCard.Title>
>(function CardTitle(props, ref) {
  return (
    <ChakraCard.Title
      ref={ref}
      fontFamily="var(--font-neon-display), sans-serif"
      fontSize="18px"
      fontWeight={700}
      letterSpacing="-0.01em"
      color="var(--neon-text)"
      {...props}
    />
  );
});

export const CardDescription = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChakraCard.Description>
>(function CardDescription(props, ref) {
  return (
    <ChakraCard.Description
      ref={ref}
      fontSize="12px"
      color="var(--neon-text-muted)"
      mt="4px"
      {...props}
    />
  );
});

export const CardBody = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChakraCard.Body>
>(function CardBody(props, ref) {
  return (
    <ChakraCard.Body
      ref={ref}
      p="18px 22px"
      fontSize="13px"
      color="var(--neon-text)"
      {...props}
    />
  );
});

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChakraCard.Footer>
>(function CardFooter(props, ref) {
  return (
    <ChakraCard.Footer
      ref={ref}
      p="14px 22px 18px"
      borderTop="1px solid var(--neon-border)"
      display="flex"
      gap="10px"
      {...props}
    />
  );
});
