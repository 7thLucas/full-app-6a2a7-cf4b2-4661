import { useEffect, useState } from "react";
import { RequireRole } from "~/components/attendsure/require-role";
import { AppShell } from "~/components/attendsure/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { listSops, type SopView } from "~/lib/attendsure.client";
import { FileText, ExternalLink, Loader2 } from "lucide-react";

function RulesContent() {
  const [sops, setSops] = useState<SopView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSops()
      .then(setSops)
      .catch(() => setSops([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Rules &amp; SOPs
        </h1>
        <p className="text-sm text-muted-foreground">
          The policies and procedures that apply to you. One authoritative place.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : sops.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No documents have been published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sops.map((sop) => (
            <Card key={sop.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{sop.title}</CardTitle>
                    {sop.description && (
                      <CardDescription className="line-clamp-2">
                        {sop.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between">
                <span className="truncate text-xs text-muted-foreground">
                  {sop.fileName}
                </span>
                <a href={sop.fileUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Open
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RulesRoute() {
  return (
    <RequireRole role="employee">
      <AppShell>
        <RulesContent />
      </AppShell>
    </RequireRole>
  );
}
