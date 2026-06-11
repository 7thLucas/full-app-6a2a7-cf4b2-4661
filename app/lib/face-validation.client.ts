import { invokeLLM } from "~/modules/agentic";

export interface FaceValidationResult {
  isHuman: boolean;
  confidence: number;
  reason: string;
}

/**
 * Validate a captured image as a real human face using the agentic LLM surface.
 *
 * Binary and explicit: a real, live human face → isHuman: true; anything else
 * (no face, an object, a screen/photo of a photo, a drawing, an animal) →
 * isHuman: false. This is the integrity check behind every attendance record.
 */
export async function validateHumanFace(image: File): Promise<FaceValidationResult> {
  const result = await invokeLLM({
    message:
      "You are an attendance-integrity face verifier. Look at the attached image " +
      "and decide whether it shows a single, real, live human face suitable for a " +
      "workplace attendance check-in. Return isHuman=true ONLY if a genuine human " +
      "face is clearly visible. Return isHuman=false for: no face, an object, an " +
      "animal, a cartoon/drawing, a blank or black frame, or an obvious photo-of-a-" +
      "photo / screen capture. Provide a confidence between 0 and 1 and a short reason.",
    schema: {
      type: "object",
      properties: {
        isHuman: { type: "boolean" },
        confidence: { type: "number" },
        reason: { type: "string" },
      },
      required: ["isHuman", "confidence", "reason"],
    },
    systemPrompt:
      "You are a strict, binary face-validity classifier. Respond with concise JSON only.",
    files: [image],
  });

  if (result.status === "ERROR" || !result.response) {
    throw new Error(result.error ?? "Face validation failed");
  }

  const r = result.response as {
    isHuman?: boolean;
    confidence?: number;
    reason?: string;
  };

  return {
    isHuman: Boolean(r.isHuman),
    confidence: typeof r.confidence === "number" ? r.confidence : 0,
    reason: typeof r.reason === "string" ? r.reason : "",
  };
}
