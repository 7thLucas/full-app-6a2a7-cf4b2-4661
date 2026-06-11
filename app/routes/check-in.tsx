import { useCallback, useEffect, useState } from "react";
import { RequireRole } from "~/components/attendsure/require-role";
import { AppShell } from "~/components/attendsure/app-shell";
import { FaceCapture } from "~/components/attendsure/face-capture";
import { StatusBadge } from "~/components/attendsure/status-badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useConfigurables } from "~/modules/configurables";
import { validateHumanFace } from "~/lib/face-validation.client";
import {
  recordCheckin,
  getMyAttendance,
  type AttendanceView,
} from "~/lib/attendsure.client";
import { Loader2, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

type Phase = "idle" | "verifying" | "result";

interface Verdict {
  valid: boolean;
  confidence: number;
  reason: string;
  alreadyValidToday: boolean;
}

function CheckInContent() {
  const { config } = useConfigurables();
  const title = config?.checkInTitle || "Face check-in";
  const instruction =
    config?.checkInInstruction ||
    "Center your face in the frame and capture. We verify a real human face before recording attendance.";

  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<AttendanceView | null>(null);
  const [history, setHistory] = useState<AttendanceView[]>([]);

  const loadAttendance = useCallback(async () => {
    try {
      const data = await getMyAttendance();
      setToday(data.today);
      setHistory(data.records);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleCapture = useCallback(
    async (image: File, dataUrl: string) => {
      setPreview(dataUrl);
      setPhase("verifying");
      setError(null);
      setVerdict(null);
      try {
        const face = await validateHumanFace(image);
        const result = await recordCheckin({
          valid: face.isHuman,
          confidence: face.confidence,
          reason: face.reason,
        });
        setVerdict({
          valid: result.record.valid,
          confidence: result.record.confidence,
          reason: result.record.reason,
          alreadyValidToday: result.alreadyValidToday,
        });
        setPhase("result");
        await loadAttendance();
      } catch (err: any) {
        setError(err.message ?? "Verification failed. Please try again.");
        setPhase("idle");
      }
    },
    [loadAttendance],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setPreview(null);
    setVerdict(null);
    setError(null);
  }, []);

  const alreadyValid = today?.valid ?? false;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Capture / result panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{instruction}</CardDescription>
            </div>
            <StatusBadge
              variant={
                !today ? "none" : today.valid ? "valid" : "invalid"
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {alreadyValid ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/40 p-8 text-center">
              <CheckCircle2 className="h-10 w-10" style={{ color: config?.validColor || "#16A34A" }} />
              <p className="text-base font-semibold text-foreground">
                You're checked in for today
              </p>
              <p className="text-sm text-muted-foreground">
                A valid face check-in was already recorded. See you tomorrow.
              </p>
            </div>
          ) : phase === "idle" ? (
            <>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <FaceCapture onCapture={handleCapture} />
            </>
          ) : phase === "verifying" ? (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              {preview && (
                <img
                  src={preview}
                  alt="Capture preview"
                  className="h-40 w-32 -scale-x-100 rounded-lg object-cover"
                />
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying a real human face…
              </div>
            </div>
          ) : (
            verdict && (
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                {preview && (
                  <img
                    src={preview}
                    alt="Capture"
                    className="h-40 w-32 -scale-x-100 rounded-lg object-cover"
                  />
                )}
                {verdict.valid ? (
                  <CheckCircle2
                    className="h-12 w-12"
                    style={{ color: config?.validColor || "#16A34A" }}
                  />
                ) : (
                  <XCircle
                    className="h-12 w-12"
                    style={{ color: config?.invalidColor || "#DC2626" }}
                  />
                )}
                <div className="space-y-1">
                  <StatusBadge variant={verdict.valid ? "valid" : "invalid"} />
                  <p className="pt-2 text-base font-semibold text-foreground">
                    {verdict.valid
                      ? verdict.alreadyValidToday
                        ? "Already checked in today"
                        : "Attendance recorded"
                      : "Check-in not valid"}
                  </p>
                  {verdict.reason && (
                    <p className="text-sm text-muted-foreground">{verdict.reason}</p>
                  )}
                </div>
                {!verdict.valid && (
                  <Button onClick={reset} variant="outline" className="gap-1.5">
                    <RotateCcw className="h-4 w-4" />
                    Try again
                  </Button>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent check-ins</CardTitle>
          <CardDescription>Your attendance history</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No check-ins yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((rec) => (
                <li
                  key={rec.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{rec.day}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rec.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <StatusBadge variant={rec.valid ? "valid" : "invalid"} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckInRoute() {
  return (
    <RequireRole role="employee">
      <AppShell>
        <CheckInContent />
      </AppShell>
    </RequireRole>
  );
}
