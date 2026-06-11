import { useEffect, useState } from "react";
import { RequireRole } from "~/components/attendsure/require-role";
import { AppShell } from "~/components/attendsure/app-shell";
import { StatusBadge } from "~/components/attendsure/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useConfigurables } from "~/modules/configurables";
import { getDashboard, type DashboardData } from "~/lib/attendsure.client";
import { Loader2, Users, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-lg"
          style={{
            backgroundColor: color ? `${color}1A` : "var(--muted)",
            color: color ?? "var(--muted-foreground)",
          }}
        >
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { config } = useConfigurables();
  const validColor = config?.validColor || "#16A34A";
  const invalidColor = config?.invalidColor || "#DC2626";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Attendance dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Verified attendance integrity at a glance{data ? ` · ${data.day}` : ""}.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Unable to load the dashboard.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Employees"
              value={data.totals.employees}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Valid today"
              value={data.totals.validToday}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color={validColor}
            />
            <StatCard
              label="Invalid today"
              value={data.totals.invalidToday}
              icon={<XCircle className="h-5 w-5" />}
              color={invalidColor}
            />
            <StatCard
              label="No check-in"
              value={data.totals.noCheckin}
              icon={<MinusCircle className="h-5 w-5" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employees</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.rows.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  No attendance records yet. Employees appear here once they check in.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-6 py-3 font-medium">Employee</th>
                        <th className="px-6 py-3 font-medium">Today</th>
                        <th className="px-6 py-3 font-medium">Time</th>
                        <th className="px-6 py-3 text-right font-medium">
                          Valid check-ins
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.map((row) => {
                        const validity = !row.today
                          ? "none"
                          : row.today.valid
                            ? "valid"
                            : "invalid";
                        return (
                          <tr
                            key={row.userId}
                            className="border-b border-border last:border-0 hover:bg-muted/40"
                          >
                            <td className="px-6 py-4">
                              <p className="font-medium text-foreground">
                                {row.userName || "Employee"}
                              </p>
                              {row.userEmail && (
                                <p className="text-xs text-muted-foreground">
                                  {row.userEmail}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge variant={validity} />
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {row.today
                                ? new Date(row.today.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-semibold text-foreground">
                                {row.validCount}
                              </span>
                              <span className="text-muted-foreground">
                                {" "}
                                / {row.totalCount}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function DashboardRoute() {
  return (
    <RequireRole role="hr">
      <AppShell>
        <DashboardContent />
      </AppShell>
    </RequireRole>
  );
}
