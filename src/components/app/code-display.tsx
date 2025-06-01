"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Or any other theme
import { cn } from "@/lib/utils";

interface CodeDisplayProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeDisplay({ code, language = "jsx", className }: CodeDisplayProps) {
  if (!code) {
    return null;
  }

  return (
    <div className={cn("rounded-lg overflow-hidden text-sm font-code", className)}>
      <SyntaxHighlighter language={language} style={vscDarkPlus} showLineNumbers>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
