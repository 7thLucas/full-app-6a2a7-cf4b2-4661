import { apiGet, apiRequest } from "~/lib/api.client";

// ── Types (client-safe mirrors of the server views) ──────────────────────────

export interface SopView {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedByName: string;
  createdAt: string;
}

export interface AttendanceView {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  day: string;
  valid: boolean;
  confidence: number;
  reason: string;
  captureUrl: string;
  createdAt: string;
}

export interface DashboardRow {
  userId: string;
  userName: string;
  userEmail: string;
  today: AttendanceView | null;
  validCount: number;
  totalCount: number;
}

export interface DashboardData {
  day: string;
  rows: DashboardRow[];
  totals: {
    employees: number;
    validToday: number;
    invalidToday: number;
    noCheckin: number;
  };
}

export interface UploadedFileMeta {
  url: string;
  path: string;
  originalname: string;
  size: number;
  mimeType: string;
}

// ── SOP library ───────────────────────────────────────────────────────────────

export async function listSops(): Promise<SopView[]> {
  const res = await apiGet<SopView[]>("/api/attendsure/sops");
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to load SOPs");
  return res.data;
}

/** Upload the raw file to the uploader platform, returning its metadata. */
export async function uploadDocument(file: File): Promise<UploadedFileMeta> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/uploader/document", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const payload = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: UploadedFileMeta;
  };
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message ?? "File upload failed");
  }
  return payload.data;
}

export async function createSop(input: {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  mimeType?: string;
  size?: number;
}): Promise<SopView> {
  const res = await apiRequest<SopView>("/api/attendsure/sops", {
    method: "POST",
    data: input,
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to save SOP");
  return res.data;
}

export async function deleteSop(id: string): Promise<void> {
  const res = await apiRequest(`/api/attendsure/sops/delete/${id}`, {
    method: "POST",
  });
  if (!res.success) throw new Error(res.message ?? "Failed to delete SOP");
}

// ── Attendance ──────────────────────────────────────────────────────────────

export async function recordCheckin(input: {
  valid: boolean;
  confidence?: number;
  reason?: string;
  captureUrl?: string;
}): Promise<{ record: AttendanceView; alreadyValidToday: boolean }> {
  const res = await apiRequest<{ record: AttendanceView; alreadyValidToday: boolean }>(
    "/api/attendsure/checkin",
    { method: "POST", data: input },
  );
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to record check-in");
  return res.data;
}

export async function getMyAttendance(): Promise<{
  records: AttendanceView[];
  today: AttendanceView | null;
}> {
  const res = await apiGet<{ records: AttendanceView[]; today: AttendanceView | null }>(
    "/api/attendsure/my-attendance",
  );
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to load attendance");
  return res.data;
}

export async function getDashboard(day?: string): Promise<DashboardData> {
  const res = await apiGet<DashboardData>(
    "/api/attendsure/dashboard",
    day ? { day } : undefined,
  );
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to load dashboard");
  return res.data;
}
