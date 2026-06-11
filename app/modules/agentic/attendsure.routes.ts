import { Router } from "express";
import type { Request, Response } from "express";
import {
  requireAuth,
  requireAdmin,
} from "~/modules/authentication/authentication.middleware";
import { AttendSureService } from "./attendsure.service";

const router = Router();

/**
 * AttendSure domain API. Mounted under /api by route auto-discovery.
 *
 * Roles: HR = admin, Employee = authenticated. SOP writes are admin-only;
 * SOP reads and attendance check-ins are available to any authenticated user.
 */

// ── SOP / rules library ──────────────────────────────────────────────────────

// List SOPs — any authenticated user (HR + employees) may read policy.
router.get(
  "/attendsure/sops",
  requireAuth,
  async (_req: Request, res: Response) => {
    try {
      const sops = await AttendSureService.listSops();
      res.json({ success: true, data: sops });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error.message ?? "Failed to load SOPs" });
    }
  },
);

// Create an SOP record (after the file is uploaded via /api/uploader/document).
router.post(
  "/attendsure/sops",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { title, description, fileUrl, fileName, mimeType, size } = req.body ?? {};
      if (!title || !fileUrl || !fileName) {
        res.status(400).json({
          success: false,
          message: "title, fileUrl and fileName are required",
        });
        return;
      }
      const sop = await AttendSureService.createSop({
        title,
        description,
        fileUrl,
        fileName,
        mimeType,
        size,
        uploadedBy: req.user!.id,
        uploadedByName: req.user!.username,
      });
      res.status(201).json({ success: true, data: sop });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error.message ?? "Failed to save SOP" });
    }
  },
);

// Delete (soft) an SOP — admin only.
router.post(
  "/attendsure/sops/delete/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      await AttendSureService.deleteSop(String(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error.message ?? "Failed to delete SOP" });
    }
  },
);

// ── Attendance check-ins ──────────────────────────────────────────────────────

// Record a verified check-in. The client supplies the binary face verdict
// (validated via the agentic LLM surface before posting here).
router.post(
  "/attendsure/checkin",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { valid, confidence, reason, captureUrl } = req.body ?? {};
      if (typeof valid !== "boolean") {
        res
          .status(400)
          .json({ success: false, message: "valid (boolean) is required" });
        return;
      }
      const result = await AttendSureService.recordAttendance({
        userId: req.user!.id,
        userName: req.user!.username,
        userEmail: req.user!.email,
        valid,
        confidence: typeof confidence === "number" ? confidence : 0,
        reason: typeof reason === "string" ? reason : "",
        captureUrl: typeof captureUrl === "string" ? captureUrl : "",
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error.message ?? "Failed to record check-in" });
    }
  },
);

// My check-in history.
router.get(
  "/attendsure/my-attendance",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const [records, today] = await Promise.all([
        AttendSureService.listMyAttendance(req.user!.id),
        AttendSureService.todayStatus(req.user!.id),
      ]);
      res.json({ success: true, data: { records, today } });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error.message ?? "Failed to load attendance" });
    }
  },
);

// ── HR dashboard ──────────────────────────────────────────────────────────────

router.get(
  "/attendsure/dashboard",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const day = typeof req.query.day === "string" ? req.query.day : undefined;
      const data = await AttendSureService.dashboard(day);
      res.json({ success: true, data });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: error.message ?? "Failed to load dashboard" });
    }
  },
);

export default router;
