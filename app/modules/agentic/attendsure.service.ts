import {
  SopDocumentModel,
  AttendanceRecordModel,
  type SopDocument,
  type AttendanceRecord,
} from "./attendsure.model";

/** YYYY-MM-DD in UTC for a given date. */
export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

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

function toSopView(doc: SopDocument & { _id: any; createdAt?: Date }): SopView {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? "",
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    mimeType: doc.mimeType ?? "",
    size: doc.size ?? 0,
    uploadedByName: doc.uploadedByName ?? "",
    createdAt: (doc.createdAt as Date)?.toISOString?.() ?? "",
  };
}

function toAttendanceView(
  rec: AttendanceRecord & { _id: any; createdAt?: Date },
): AttendanceView {
  return {
    id: rec._id.toString(),
    userId: rec.userId,
    userName: rec.userName ?? "",
    userEmail: rec.userEmail ?? "",
    day: rec.day,
    valid: rec.valid,
    confidence: rec.confidence ?? 0,
    reason: rec.reason ?? "",
    captureUrl: rec.captureUrl ?? "",
    createdAt: (rec.createdAt as Date)?.toISOString?.() ?? "",
  };
}

export class AttendSureService {
  // ── SOP / rules library ───────────────────────────────────────────────────

  static async listSops(): Promise<SopView[]> {
    const docs = await SopDocumentModel.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d) => toSopView(d as any));
  }

  static async createSop(input: {
    title: string;
    description?: string;
    fileUrl: string;
    fileName: string;
    mimeType?: string;
    size?: number;
    uploadedBy: string;
    uploadedByName?: string;
  }): Promise<SopView> {
    const doc = await SopDocumentModel.create({
      title: input.title,
      description: input.description ?? "",
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      mimeType: input.mimeType ?? "",
      size: input.size ?? 0,
      uploadedBy: input.uploadedBy,
      uploadedByName: input.uploadedByName ?? "",
    });
    return toSopView(doc as any);
  }

  static async deleteSop(id: string): Promise<void> {
    await SopDocumentModel.findByIdAndUpdate(id, { deletedAt: new Date() });
  }

  // ── Attendance check-ins ────────────────────────────────────────────────────

  static async recordAttendance(input: {
    userId: string;
    userName?: string;
    userEmail?: string;
    valid: boolean;
    confidence?: number;
    reason?: string;
    captureUrl?: string;
  }): Promise<{ record: AttendanceView; alreadyValidToday: boolean }> {
    const day = dayKey();

    // Already a valid check-in today? Keep the integrity signal stable.
    const existingValid = await AttendanceRecordModel.findOne({
      userId: input.userId,
      day,
      valid: true,
      deletedAt: null,
    }).lean();

    if (existingValid) {
      return {
        record: toAttendanceView(existingValid as any),
        alreadyValidToday: true,
      };
    }

    const rec = await AttendanceRecordModel.create({
      userId: input.userId,
      userName: input.userName ?? "",
      userEmail: input.userEmail ?? "",
      day,
      valid: input.valid,
      confidence: input.confidence ?? 0,
      reason: input.reason ?? "",
      captureUrl: input.captureUrl ?? "",
    });

    return { record: toAttendanceView(rec as any), alreadyValidToday: false };
  }

  /** All check-ins for one employee, most recent first. */
  static async listMyAttendance(userId: string): Promise<AttendanceView[]> {
    const recs = await AttendanceRecordModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();
    return recs.map((r) => toAttendanceView(r as any));
  }

  /** Today's status for one employee. */
  static async todayStatus(userId: string): Promise<AttendanceView | null> {
    const day = dayKey();
    const rec = await AttendanceRecordModel.findOne({
      userId,
      day,
      deletedAt: null,
    })
      .sort({ valid: -1, createdAt: -1 })
      .lean();
    return rec ? toAttendanceView(rec as any) : null;
  }

  // ── HR dashboard ────────────────────────────────────────────────────────────

  /**
   * Dashboard rows: latest record per employee for the requested day plus a
   * rolling validity count, so HR sees attendance integrity at a glance.
   */
  static async dashboard(day?: string): Promise<{
    day: string;
    rows: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      today: AttendanceView | null;
      validCount: number;
      totalCount: number;
    }>;
    totals: { employees: number; validToday: number; invalidToday: number; noCheckin: number };
  }> {
    const targetDay = day ?? dayKey();

    const all = await AttendanceRecordModel.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();

    const byUser = new Map<
      string,
      {
        userId: string;
        userName: string;
        userEmail: string;
        records: AttendanceView[];
      }
    >();

    for (const raw of all) {
      const view = toAttendanceView(raw as any);
      let entry = byUser.get(view.userId);
      if (!entry) {
        entry = {
          userId: view.userId,
          userName: view.userName,
          userEmail: view.userEmail,
          records: [],
        };
        byUser.set(view.userId, entry);
      }
      // Keep a friendly name/email if a later record had one.
      if (!entry.userName && view.userName) entry.userName = view.userName;
      if (!entry.userEmail && view.userEmail) entry.userEmail = view.userEmail;
      entry.records.push(view);
    }

    let validToday = 0;
    let invalidToday = 0;
    let noCheckin = 0;

    const rows = [...byUser.values()].map((entry) => {
      const dayRecords = entry.records.filter((r) => r.day === targetDay);
      // Prefer a valid record for the day if any exists.
      const today =
        dayRecords.find((r) => r.valid) ?? dayRecords[0] ?? null;

      if (!today) noCheckin += 1;
      else if (today.valid) validToday += 1;
      else invalidToday += 1;

      return {
        userId: entry.userId,
        userName: entry.userName,
        userEmail: entry.userEmail,
        today,
        validCount: entry.records.filter((r) => r.valid).length,
        totalCount: entry.records.length,
      };
    });

    rows.sort((a, b) => a.userName.localeCompare(b.userName));

    return {
      day: targetDay,
      rows,
      totals: {
        employees: rows.length,
        validToday,
        invalidToday,
        noCheckin,
      },
    };
  }
}
