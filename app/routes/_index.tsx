import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/modules/authentication";
import { Brand } from "~/components/attendsure/brand";

/**
 * Entry route. Routes users to the right home based on role:
 *   - not signed in  → /auth/login
 *   - HR (admin)     → /dashboard
 *   - Employee       → /check-in
 */
export default function IndexRoute() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true });
    } else if (isAdmin) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/check-in", { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <Brand />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
