import type { ReactNode } from "react";
import { Form, NavLink } from "react-router";
import { useAuth } from "~/modules/authentication";
import { UserRole } from "~/modules/authentication/authentication.types";
import { Brand } from "./brand";
import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
}

/** Authenticated app chrome: top nav + content area. Minimal and content-forward. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();

  const items: NavItem[] = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/sops", label: "SOP Library" },
      ]
    : [
        { to: "/check-in", label: "Check-in" },
        { to: "/rules", label: "Rules" },
      ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Brand />
            <nav className="hidden items-center gap-1 sm:flex">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none text-foreground">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "HR" : "Employee"}
              </p>
            </div>
            <Form method="post" action="/auth/logout">
              <Button type="submit" variant="ghost" size="sm" className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </Form>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 border-t border-border px-4 py-2 sm:hidden">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export { UserRole };
