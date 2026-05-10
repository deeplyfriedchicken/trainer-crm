"use client";

import {
  Skeleton as ChakraSkeleton,
  chakra,
  type SkeletonProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";

export type NeonSkeletonProps = SkeletonProps;

const SkeletonBase = forwardRef<HTMLDivElement, NeonSkeletonProps>(
  function Skeleton(props, ref) {
    return (
      <ChakraSkeleton
        ref={ref}
        bg="var(--color-surface-2)"
        borderRadius="8px"
        css={{
          "--start-color": "var(--color-surface-2)",
          "--end-color": "var(--color-surface-3)",
        }}
        {...props}
      />
    );
  },
);

export const Skeleton = chakra(SkeletonBase);
