import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/modules/authentication";
import { Brand } from "./brand";

type Role = "hr" | "employee" | "any";

/**
 * Client-side route guard. Redirects unauthenticated users to login and
 * mismatched roles to their own home. Renders children only when allowed.
 */
export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true });
      return;
    }
    if (role === "hr" && !isAdmin) {
      navigate("/check-in", { replace: true });
    } else if (role === "employee" && isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, role, navigate]);

  const allowed =
    isAuthenticated &&
    (role === "any" ||
      (role === "hr" && isAdmin) ||
      (role === "employee" && !isAdmin));

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <Brand />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
