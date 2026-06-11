import { useCallback, useEffect, useRef, useState } from "react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  listSops,
  uploadDocument,
  createSop,
  deleteSop,
  type SopView,
} from "~/lib/attendsure.client";
import { FileText, ExternalLink, Loader2, Trash2, UploadCloud } from "lucide-react";

function SopsContent() {
  const [sops, setSops] = useState<SopView[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    listSops()
      .then(setSops)
      .catch(() => setSops([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !file) {
        setError("A title and a document file are required.");
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        const meta = await uploadDocument(file);
        await createSop({
          title: title.trim(),
          description: description.trim(),
          fileUrl: meta.url,
          fileName: meta.originalname,
          mimeType: meta.mimeType,
          size: meta.size,
        });
        setTitle("");
        setDescription("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        load();
      } catch (err: any) {
        setError(err.message ?? "Upload failed.");
      } finally {
        setSubmitting(false);
      }
    },
    [title, description, file, load],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setSops((prev) => prev.filter((s) => s.id !== id));
      try {
        await deleteSop(id);
      } catch {
        load();
      }
    },
    [load],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          SOP Library
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload the rules and procedures employees operate under.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Upload form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Upload document</CardTitle>
            <CardDescription>PDF or document files up to 20MB.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Attendance Policy 2026"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Document</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Publish document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : sops.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                No documents yet. Upload your first SOP.
              </CardContent>
            </Card>
          ) : (
            sops.map((sop) => (
              <Card key={sop.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {sop.title}
                    </p>
                    {sop.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {sop.description}
                      </p>
                    )}
                    <p className="truncate text-xs text-muted-foreground">
                      {sop.fileName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <a href={sop.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        Open
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(sop.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function SopsRoute() {
  return (
    <RequireRole role="hr">
      <AppShell>
        <SopsContent />
      </AppShell>
    </RequireRole>
  );
}
