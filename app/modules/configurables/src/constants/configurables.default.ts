/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  tagline?: string;
  loginHeading?: string;
  checkInTitle?: string;
  checkInInstruction?: string;
  validBadgeLabel?: string;
  invalidBadgeLabel?: string;
  validColor?: string;
  invalidColor?: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "AttendSure",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#2563EB",
    secondary: "#0F172A",
    accent: "#16A34A",
  },
  tagline: "Attendance you can trust.", // fill it here
  loginHeading: "Sign in to AttendSure", // fill it here
  checkInTitle: "Face check-in", // fill it here
  checkInInstruction:
    "Center your face in the frame and capture. We verify a real human face before recording attendance.", // fill it here
  validBadgeLabel: "Valid", // fill it here
  invalidBadgeLabel: "Invalid", // fill it here
  validColor: "#16A34A", // fill it here
  invalidColor: "#DC2626", // fill it here
  // ─────────────────────────────────────────────────────────────────────
  // Add new field defaults here. See RULES.md §5 for per-type shape.
  // Required branding fields → use the FILL_X_HERE placeholder pattern.
  // Optional/typed defaults → real value with a "// fill it here" comment:
  //
  //   maxItemsPerPage: 12,                     // fill it here
  //   enableNotifications: true,               // fill it here
  //   featuredCategories: [],                  // fill it here
  //   defaultLanguage: "en",                   // must match enum options
  //   launchDate: "2025-01-01T00:00:00.000Z",  // ISO-8601
  //   heroImage: "",                           // resolved URL after upload
  //   galleryImages: [],                       // array of resolved URLs
  // ─────────────────────────────────────────────────────────────────────
};
