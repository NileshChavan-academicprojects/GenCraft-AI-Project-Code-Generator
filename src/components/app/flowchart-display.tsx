"use client";

import { cn } from "@/lib/utils";

interface FlowchartDisplayProps {
  svgString: string;
  className?: string;
}

export function FlowchartDisplay({ svgString, className }: FlowchartDisplayProps) {
  if (!svgString) {
    return null;
  }

  return (
    <div
      className={cn("w-full overflow-auto rounded-lg border bg-card p-4", className)}
      dangerouslySetInnerHTML={{ __html: svgString }}
      aria-label="Flowchart Diagram"
    />
  );
}
