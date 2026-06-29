import { Badge } from "@/components/ui/badge";

export function StatusBadge({ value }: { value?: string | null }) {
  const label = value || "Not set";
  const normalized = label.toLowerCase();
  const variant =
    normalized.includes("resolved") ||
    normalized.includes("closed") ||
    normalized.includes("approved") ||
    normalized.includes("active") ||
    normalized.includes("low")
      ? "success"
      : normalized.includes("urgent") ||
          normalized.includes("high") ||
          normalized.includes("missing") ||
          normalized.includes("new")
        ? "danger"
        : normalized.includes("waiting") ||
            normalized.includes("repair") ||
            normalized.includes("submitted") ||
            normalized.includes("admin") ||
            normalized.includes("normal")
          ? "warning"
          : "neutral";

  return <Badge variant={variant}>{label}</Badge>;
}
