import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/**
 * AttendSure domain models.
 *
 * These live inside the agentic module folder so they are picked up by the
 * model auto-discovery scan (which only looks at `app/modules/<slug>` and
 * `app/modules/<slug>/src/models`). Face validation is powered by the agentic
 * LLM surface, so this is the natural home for the attendance-integrity domain.
 */

/**
 * An SOP / rules document uploaded by HR. The actual bytes live in the external
 * uploader platform; we store the metadata + the public proxy URL here.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_sop_documents",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class SopDocument extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  title!: string;

  @prop({ type: String, default: "" })
  description!: string;

  /** Public proxy URL returned by the uploader (e.g. /api/uploader/document/:id). */
  @prop({ type: String, required: true })
  fileUrl!: string;

  @prop({ type: String, required: true })
  fileName!: string;

  @prop({ type: String, default: "" })
  mimeType!: string;

  @prop({ type: Number, default: 0 })
  size!: number;

  /** User id of the HR admin who uploaded it. */
  @prop({ type: String, required: true })
  uploadedBy!: string;

  @prop({ type: String, default: "" })
  uploadedByName!: string;
}

export const SopDocumentModel = getModelForClass(SopDocument);

/**
 * A verified attendance check-in. The domain event the app exists to perform.
 * `valid` is binary: true when the face capture was confirmed a real human
 * face, false otherwise.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_attendance_records",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class AttendanceRecord extends CommonTypegooseEntity {
  /** Employee (user) id. */
  @prop({ type: String, required: true, index: true })
  userId!: string;

  @prop({ type: String, default: "" })
  userName!: string;

  @prop({ type: String, default: "" })
  userEmail!: string;

  /** Local calendar day in YYYY-MM-DD form — one valid check-in per day. */
  @prop({ type: String, required: true, index: true })
  day!: string;

  /** Binary validity signal: real human face = true, non-human = false. */
  @prop({ type: Boolean, required: true })
  valid!: boolean;

  /** Model confidence 0..1, for HR context. */
  @prop({ type: Number, default: 0 })
  confidence!: number;

  /** Short human-readable reason from the validator. */
  @prop({ type: String, default: "" })
  reason!: string;

  /** Stored capture image URL (uploader proxy), optional. */
  @prop({ type: String, default: "" })
  captureUrl!: string;
}

export const AttendanceRecordModel = getModelForClass(AttendanceRecord);
