import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  icon: Icon,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("w-full shadow-xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline text-primary">
          {Icon && <Icon className="mr-3 h-6 w-6" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("font-body", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
