"use client";

import { Skeleton as ChakraSkeleton, type SkeletonProps } from "@chakra-ui/react";
import { forwardRef } from "react";

export type NeonSkeletonProps = SkeletonProps;

export const Skeleton = forwardRef<HTMLDivElement, NeonSkeletonProps>(
  function Skeleton(props, ref) {
    return (
      <ChakraSkeleton
        ref={ref}
        bg="var(--neon-surface-2)"
        borderRadius="8px"
        css={{
          "--start-color": "var(--neon-surface-2)",
          "--end-color": "var(--neon-surface-3)",
        }}
        {...props}
      />
    );
  },
);
