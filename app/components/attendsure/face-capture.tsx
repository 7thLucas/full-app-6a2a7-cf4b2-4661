import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Camera, RefreshCw, AlertTriangle } from "lucide-react";

interface FaceCaptureProps {
  onCapture: (image: File, dataUrl: string) => void;
  disabled?: boolean;
}

/**
 * Centered camera frame with a capture button. Streams getUserMedia into a
 * <video>, captures a still to a canvas, and hands back a JPEG File.
 */
export function FaceCapture({ onCapture, disabled }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      }
    } catch {
      setError(
        "Camera unavailable. Allow camera access in your browser, then retry.",
      );
    }
  }, []);

  useEffect(() => {
    startStream();
    return () => stopStream();
  }, [startStream, stopStream]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `checkin-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file, dataUrl);
      },
      "image/jpeg",
      0.9,
    );
  }, [onCapture]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border border-border bg-slate-900">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full -scale-x-100 object-cover"
        />
        {/* Framing guide */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-32 rounded-[50%] border-2 border-white/70 sm:h-48 sm:w-40" />
        </div>
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
            Starting camera…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <p className="text-sm text-white/90">{error}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={startStream}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <Button
        type="button"
        size="lg"
        className="w-full max-w-md gap-2"
        onClick={handleCapture}
        disabled={disabled || !ready}
      >
        <Camera className="h-5 w-5" />
        Capture & verify
      </Button>
    </div>
  );
}
