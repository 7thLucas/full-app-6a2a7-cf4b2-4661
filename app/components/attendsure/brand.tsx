import { useConfigurables } from "~/modules/configurables";
import { ShieldCheck } from "lucide-react";

/** App wordmark + logo, driven entirely by configurables. */
export function Brand({ className = "" }: { className?: string }) {
  const { config } = useConfigurables();
  const appName = config?.appName && !config.appName.startsWith("FILL_")
    ? config.appName
    : "AttendSure";
  const logoUrl =
    config?.logoUrl && !config.logoUrl.startsWith("FILL_") ? config.logoUrl : "";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={appName}
          className="h-8 w-8 rounded-md object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </span>
      )}
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {appName}
      </span>
    </div>
  );
}
