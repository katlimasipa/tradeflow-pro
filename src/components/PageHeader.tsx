import { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{eyebrow}</div>
        )}
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
