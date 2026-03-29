import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: "Green" | "Yellow" | "Red" }) {
  return (
    <span
      className={cn(
        "badge",
        status === "Green" && "badge-green",
        status === "Yellow" && "badge-yellow",
        status === "Red" && "badge-red"
      )}
    >
      {status}
    </span>
  );
}
