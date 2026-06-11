import { useConfigurables } from "~/modules/configurables";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

type Variant = "valid" | "invalid" | "none";

/**
 * Binary validity badge — color + label + icon, never color alone (a11y).
 * Colors come from configurables (validColor / invalidColor) with sensible
 * fallbacks matching the design system.
 */
export function StatusBadge({
  variant,
  className = "",
}: {
  variant: Variant;
  className?: string;
}) {
  const { config } = useConfigurables();

  const validColor = config?.validColor || "#16A34A";
  const invalidColor = config?.invalidColor || "#DC2626";
  const validLabel = config?.validBadgeLabel || "Valid";
  const invalidLabel = config?.invalidBadgeLabel || "Invalid";

  if (variant === "none") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ${className}`}
      >
        <MinusCircle className="h-3.5 w-3.5" />
        No check-in
      </span>
    );
  }

  const isValid = variant === "valid";
  const color = isValid ? validColor : invalidColor;
  const label = isValid ? validLabel : invalidLabel;
  const Icon = isValid ? CheckCircle2 : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: `${color}1A`, // ~10% alpha
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
