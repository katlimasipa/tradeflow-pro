import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Range } from "@/lib/analytics";

interface Props {
  range: Range;
  refDate: Date;
  onChange: (d: Date) => void;
}

export function DateNavigation({ range, refDate, onChange }: Props) {
  if (range === "overall") return null;

  const prev = () => {
    const next = new Date(refDate);
    if (range === "weekly") next.setDate(next.getDate() - 7);
    else if (range === "monthly") next.setMonth(next.getMonth() - 1);
    else if (range === "yearly") next.setFullYear(next.getFullYear() - 1);
    onChange(next);
  };

  const next = () => {
    const n = new Date(refDate);
    if (range === "weekly") n.setDate(n.getDate() + 7);
    else if (range === "monthly") n.setMonth(n.getMonth() + 1);
    else if (range === "yearly") n.setFullYear(n.getFullYear() + 1);
    onChange(n);
  };

  const formatDisplay = () => {
    if (range === "monthly") {
      return refDate.toLocaleString(undefined, { month: "long", year: "numeric" });
    }
    if (range === "yearly") {
      return refDate.getFullYear().toString();
    }
    if (range === "weekly") {
      const start = new Date(refDate);
      const day = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => onChange(new Date())}>
          Today
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm font-medium whitespace-nowrap min-w-[100px] text-center">
        {formatDisplay()}
      </div>
    </div>
  );
}
