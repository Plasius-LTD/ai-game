export const AI_GAME_QUIET_MEASURE_FEATURE_FLAG_ID =
  "isekai.player-system.quiet-measure.enabled";

export const QUIET_MEASURE_AXES = [
  "selflessness",
  "give",
  "mercy",
  "duty",
  "principle",
  "courtesy",
] as const;

export type QuietMeasureAxis = (typeof QUIET_MEASURE_AXES)[number];

export const QUIET_MEASURE_CONFIDENCE_BANDS = ["low", "medium", "high"] as const;

export type QuietMeasureConfidenceBand =
  (typeof QUIET_MEASURE_CONFIDENCE_BANDS)[number];

export const QUIET_MEASURE_SIGNAL_BANDS = [
  "suppressed",
  "latent",
  "present",
  "dominant",
] as const;

export type QuietMeasureSignalBand = (typeof QUIET_MEASURE_SIGNAL_BANDS)[number];

export const QUIET_MEASURE_PERSPECTIVES = [
  "system-truth",
  "observed-reputation",
] as const;

export type QuietMeasurePerspective = (typeof QUIET_MEASURE_PERSPECTIVES)[number];

export const QUIET_MEASURE_EVIDENCE_CLASSES = [
  "declared-intent",
  "costly-choice",
  "private-conduct",
  "repair-after-harm",
  "weak-party-treatment",
  "observed-pattern",
  "social-mask",
] as const;

export type QuietMeasureEvidenceClass =
  (typeof QUIET_MEASURE_EVIDENCE_CLASSES)[number];

export const QUIET_MEASURE_DERIVED_READS = [
  "nature",
  "mask",
  "veil-gap",
  "restitution",
] as const;

export type QuietMeasureDerivedRead =
  (typeof QUIET_MEASURE_DERIVED_READS)[number];

export const QUIET_MEASURE_MISSION_PROBE_MODES = [
  "clarify",
  "tempt",
  "reinforce",
] as const;

export type QuietMeasureMissionProbeMode =
  (typeof QUIET_MEASURE_MISSION_PROBE_MODES)[number];

export const QUIET_MEASURE_MISSION_RESOLUTION_SHAPES = [
  "restorative",
  "dominant",
  "detached",
  "performative",
] as const;

export type QuietMeasureMissionResolutionShape =
  (typeof QUIET_MEASURE_MISSION_RESOLUTION_SHAPES)[number];

export const QUIET_MEASURE_JUDGMENT_DISCLOSURES = [
  "title-and-verdict-only",
] as const;

export type QuietMeasureJudgmentDisclosure =
  (typeof QUIET_MEASURE_JUDGMENT_DISCLOSURES)[number];

export const QUIET_MEASURE_JUDGMENT_REQUESTERS = [
  "player",
  "system",
  "operator",
] as const;

export type QuietMeasureJudgmentRequester =
  (typeof QUIET_MEASURE_JUDGMENT_REQUESTERS)[number];

export const QUIET_MEASURE_JUDGMENT_MISSING_EVIDENCE = [
  "repeated-meaningful-evidence",
  "private-or-low-witness-evidence",
  "costly-pressure-event",
] as const;

export type QuietMeasureJudgmentMissingEvidence =
  (typeof QUIET_MEASURE_JUDGMENT_MISSING_EVIDENCE)[number];

export interface QuietMeasureEvidenceWindow {
  readonly evidenceClass: QuietMeasureEvidenceClass;
  readonly sampleBand: "sparse" | "growing" | "settled";
  readonly includesPrivateConduct: boolean;
  readonly includesCostlyPressureEvent: boolean;
  readonly includesRepairAfterHarm: boolean;
}

export interface QuietMeasureAxisSummary {
  readonly axis: QuietMeasureAxis;
  readonly signalBand: QuietMeasureSignalBand;
  readonly confidenceBand: QuietMeasureConfidenceBand;
  readonly evidenceWindow: QuietMeasureEvidenceWindow;
}

export interface QuietMeasureDerivedReadSummary {
  readonly read: QuietMeasureDerivedRead;
  readonly perspective: QuietMeasurePerspective;
  readonly signalBand: QuietMeasureSignalBand;
  readonly confidenceBand: QuietMeasureConfidenceBand;
  readonly reasonCodes: readonly string[];
}

export interface QuietMeasureTitleDescriptor {
  readonly titleId: string;
  readonly title: string;
  readonly verdictLabel: string;
  readonly perspective: QuietMeasurePerspective;
  readonly disclosure: QuietMeasureJudgmentDisclosure;
  readonly reasonCodes: readonly string[];
}

export interface QuietMeasureMissionProbe {
  readonly probeId: string;
  readonly mode: QuietMeasureMissionProbeMode;
  readonly primaryRead: QuietMeasureDerivedRead;
  readonly supportedResolutionShapes: readonly QuietMeasureMissionResolutionShape[];
  readonly hiddenRuntime: true;
  readonly responsePerspective: QuietMeasurePerspective;
  readonly responseBias:
    | "virtue-biased"
    | "vice-viable"
    | "ambiguity-preserving";
  readonly reasonCodes: readonly string[];
}

export interface QuietMeasureMissionResolutionMetadata {
  readonly resolutionShape: QuietMeasureMissionResolutionShape;
  readonly surplusTendency:
    | "compounding-trust"
    | "fear-and-tribute"
    | "ambiguity-preserving";
  readonly worldReactionMode: "fertile" | "brittle" | "uncertain";
  readonly reasonCodes: readonly string[];
}

export interface QuietMeasureJudgmentRequest {
  readonly subjectId: string;
  readonly requestedAtUtc: string;
  readonly requestedBy: QuietMeasureJudgmentRequester;
  readonly disclosure: QuietMeasureJudgmentDisclosure;
}

export interface QuietMeasureJudgmentEligibility {
  readonly eligible: boolean;
  readonly repeatedMeaningfulEvidence: boolean;
  readonly includesPrivateOrLowWitnessEvidence: boolean;
  readonly includesCostlyPressureEvent: boolean;
  readonly reasonCodes: readonly string[];
}

export interface QuietMeasureJudgmentInsufficientEvidenceResponse {
  readonly kind: "insufficient-evidence";
  readonly request: QuietMeasureJudgmentRequest;
  readonly eligibility: QuietMeasureJudgmentEligibility & {
    readonly eligible: false;
  };
  readonly missingEvidence: readonly QuietMeasureJudgmentMissingEvidence[];
  readonly reasonCodes: readonly string[];
}

export interface QuietMeasureJudgmentVerdictResponse {
  readonly kind: "verdict";
  readonly request: QuietMeasureJudgmentRequest;
  readonly eligibility: QuietMeasureJudgmentEligibility & {
    readonly eligible: true;
  };
  readonly title: QuietMeasureTitleDescriptor;
  readonly dominantReads: readonly QuietMeasureDerivedReadSummary[];
  readonly reasonCodes: readonly string[];
}

export type QuietMeasureJudgmentResponse =
  | QuietMeasureJudgmentInsufficientEvidenceResponse
  | QuietMeasureJudgmentVerdictResponse;

export interface QuietMeasureJudgmentEligibilityInput {
  readonly repeatedMeaningfulEvidence?: boolean;
  readonly includesPrivateOrLowWitnessEvidence?: boolean;
  readonly includesCostlyPressureEvent?: boolean;
  readonly reasonCodes?: readonly string[];
}

export interface CreateQuietMeasureJudgmentResponseInput {
  readonly request: QuietMeasureJudgmentRequest;
  readonly eligibility: QuietMeasureJudgmentEligibility;
  readonly title?: QuietMeasureTitleDescriptor;
  readonly dominantReads?: readonly QuietMeasureDerivedReadSummary[];
  readonly reasonCodes?: readonly string[];
}

function isMember<T extends string>(
  value: string,
  members: readonly T[],
): value is T {
  return (members as readonly string[]).includes(value);
}

function assertRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function normalizeNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a non-empty string.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }

  return normalized;
}

function normalizeBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    throw new TypeError(`${label} must be a boolean.`);
  }

  return value;
}

function normalizeOptionalBoolean(value: unknown, fallback: boolean, label: string): boolean {
  if (value === undefined) {
    return fallback;
  }

  return normalizeBoolean(value, label);
}

function normalizeTimestamp(value: unknown, label: string): string {
  const normalized = normalizeNonEmptyString(value, label);
  const parsed = Date.parse(normalized);

  if (Number.isNaN(parsed)) {
    throw new TypeError(`${label} must be a valid ISO-8601 timestamp.`);
  }

  return normalized;
}

function normalizeMember<T extends string>(
  value: unknown,
  members: readonly T[],
  label: string,
): T {
  const normalized = normalizeNonEmptyString(value, label);

  if (!isMember(normalized, members)) {
    throw new TypeError(`${label} must be one of: ${members.join(", ")}.`);
  }

  return normalized;
}

function normalizeReasonCodes(value: unknown, label: string): readonly string[] {
  if (value === undefined) {
    return Object.freeze([]);
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array of strings.`);
  }

  for (const [index, entry] of value.entries()) {
    if (typeof entry !== "string") {
      throw new TypeError(`${label}[${index}] must be a string.`);
    }
  }

  const normalized = value.map((entry) => entry.trim());
  if (normalized.some((entry) => entry.length === 0)) {
    throw new TypeError(`${label} must not contain blank strings.`);
  }

  return Object.freeze(Array.from(new Set(normalized)));
}

function normalizeJudgmentRequest(input: unknown): QuietMeasureJudgmentRequest {
  const request = assertRecord(input, "Quiet Measure judgment request");

  return Object.freeze({
    subjectId: normalizeNonEmptyString(
      request.subjectId,
      "Quiet Measure judgment request subjectId",
    ),
    requestedAtUtc: normalizeTimestamp(
      request.requestedAtUtc,
      "Quiet Measure judgment request requestedAtUtc",
    ),
    requestedBy: normalizeMember(
      request.requestedBy,
      QUIET_MEASURE_JUDGMENT_REQUESTERS,
      "Quiet Measure judgment request requestedBy",
    ),
    disclosure: normalizeMember(
      request.disclosure,
      QUIET_MEASURE_JUDGMENT_DISCLOSURES,
      "Quiet Measure judgment request disclosure",
    ),
  });
}

function normalizeJudgmentEligibility(input: unknown): QuietMeasureJudgmentEligibility {
  const eligibility = assertRecord(input, "Quiet Measure judgment eligibility");
  const repeatedMeaningfulEvidence = normalizeBoolean(
    eligibility.repeatedMeaningfulEvidence,
    "Quiet Measure judgment eligibility repeatedMeaningfulEvidence",
  );
  const includesPrivateOrLowWitnessEvidence = normalizeBoolean(
    eligibility.includesPrivateOrLowWitnessEvidence,
    "Quiet Measure judgment eligibility includesPrivateOrLowWitnessEvidence",
  );
  const includesCostlyPressureEvent = normalizeBoolean(
    eligibility.includesCostlyPressureEvent,
    "Quiet Measure judgment eligibility includesCostlyPressureEvent",
  );

  return Object.freeze({
    eligible:
      repeatedMeaningfulEvidence
      && includesPrivateOrLowWitnessEvidence
      && includesCostlyPressureEvent,
    repeatedMeaningfulEvidence,
    includesPrivateOrLowWitnessEvidence,
    includesCostlyPressureEvent,
    reasonCodes: normalizeReasonCodes(
      eligibility.reasonCodes,
      "Quiet Measure eligibility reasonCodes",
    ),
  });
}

function normalizeTitleDescriptor(input: unknown): QuietMeasureTitleDescriptor {
  const title = assertRecord(input, "Quiet Measure title");

  return Object.freeze({
    titleId: normalizeNonEmptyString(title.titleId, "Quiet Measure title titleId"),
    title: normalizeNonEmptyString(title.title, "Quiet Measure title title"),
    verdictLabel: normalizeNonEmptyString(
      title.verdictLabel,
      "Quiet Measure title verdictLabel",
    ),
    perspective: normalizeMember(
      title.perspective,
      QUIET_MEASURE_PERSPECTIVES,
      "Quiet Measure title perspective",
    ),
    disclosure: normalizeMember(
      title.disclosure,
      QUIET_MEASURE_JUDGMENT_DISCLOSURES,
      "Quiet Measure title disclosure",
    ),
    reasonCodes: normalizeReasonCodes(title.reasonCodes, "Quiet Measure title reasonCodes"),
  });
}

function normalizeDerivedReadSummary(
  input: unknown,
  index: number,
): QuietMeasureDerivedReadSummary {
  const prefix = `Quiet Measure dominantReads[${index}]`;
  const dominantRead = assertRecord(input, prefix);

  return Object.freeze({
    read: normalizeMember(
      dominantRead.read,
      QUIET_MEASURE_DERIVED_READS,
      `${prefix} read`,
    ),
    perspective: normalizeMember(
      dominantRead.perspective,
      QUIET_MEASURE_PERSPECTIVES,
      `${prefix} perspective`,
    ),
    signalBand: normalizeMember(
      dominantRead.signalBand,
      QUIET_MEASURE_SIGNAL_BANDS,
      `${prefix} signalBand`,
    ),
    confidenceBand: normalizeMember(
      dominantRead.confidenceBand,
      QUIET_MEASURE_CONFIDENCE_BANDS,
      `${prefix} confidenceBand`,
    ),
    reasonCodes: normalizeReasonCodes(
      dominantRead.reasonCodes,
      `${prefix} reasonCodes`,
    ),
  });
}

function normalizeDominantReads(
  value: unknown,
): readonly QuietMeasureDerivedReadSummary[] {
  if (value === undefined) {
    return Object.freeze([]);
  }

  if (!Array.isArray(value)) {
    throw new TypeError("Quiet Measure dominantReads must be an array.");
  }

  return Object.freeze(value.map((entry, index) => normalizeDerivedReadSummary(entry, index)));
}

export function isQuietMeasureAxis(value: string): value is QuietMeasureAxis {
  return isMember(value, QUIET_MEASURE_AXES);
}

export function isQuietMeasureMissionProbeMode(
  value: string,
): value is QuietMeasureMissionProbeMode {
  return isMember(value, QUIET_MEASURE_MISSION_PROBE_MODES);
}

export function isQuietMeasureMissionResolutionShape(
  value: string,
): value is QuietMeasureMissionResolutionShape {
  return isMember(value, QUIET_MEASURE_MISSION_RESOLUTION_SHAPES);
}

export function createQuietMeasureJudgmentEligibility(
  input: QuietMeasureJudgmentEligibilityInput = {},
): QuietMeasureJudgmentEligibility {
  const repeatedMeaningfulEvidence = normalizeOptionalBoolean(
    input.repeatedMeaningfulEvidence,
    false,
    "Quiet Measure eligibility repeatedMeaningfulEvidence",
  );
  const includesPrivateOrLowWitnessEvidence = normalizeOptionalBoolean(
    input.includesPrivateOrLowWitnessEvidence,
    false,
    "Quiet Measure eligibility includesPrivateOrLowWitnessEvidence",
  );
  const includesCostlyPressureEvent = normalizeOptionalBoolean(
    input.includesCostlyPressureEvent,
    false,
    "Quiet Measure eligibility includesCostlyPressureEvent",
  );

  return Object.freeze({
    eligible:
      repeatedMeaningfulEvidence
      && includesPrivateOrLowWitnessEvidence
      && includesCostlyPressureEvent,
    repeatedMeaningfulEvidence,
    includesPrivateOrLowWitnessEvidence,
    includesCostlyPressureEvent,
    reasonCodes: normalizeReasonCodes(input.reasonCodes, "Quiet Measure eligibility reasonCodes"),
  });
}

export function listQuietMeasureMissingEvidence(
  eligibility: QuietMeasureJudgmentEligibility,
): readonly QuietMeasureJudgmentMissingEvidence[] {
  const normalizedEligibility = normalizeJudgmentEligibility(eligibility);
  const missing: QuietMeasureJudgmentMissingEvidence[] = [];

  if (!normalizedEligibility.repeatedMeaningfulEvidence) {
    missing.push("repeated-meaningful-evidence");
  }

  if (!normalizedEligibility.includesPrivateOrLowWitnessEvidence) {
    missing.push("private-or-low-witness-evidence");
  }

  if (!normalizedEligibility.includesCostlyPressureEvent) {
    missing.push("costly-pressure-event");
  }

  return Object.freeze(missing);
}

export function createQuietMeasureJudgmentResponse(
  input: CreateQuietMeasureJudgmentResponseInput,
): QuietMeasureJudgmentResponse {
  const request = normalizeJudgmentRequest(input.request);
  const eligibility = normalizeJudgmentEligibility(input.eligibility);
  const missingEvidence = listQuietMeasureMissingEvidence(eligibility);
  const reasonCodes = normalizeReasonCodes(
    input.reasonCodes,
    "Quiet Measure judgment response reasonCodes",
  );
  const hasRequiredEvidence = missingEvidence.length === 0;

  if (!hasRequiredEvidence) {
    return Object.freeze({
      kind: "insufficient-evidence",
      request,
      eligibility: Object.freeze({
        ...eligibility,
        eligible: false,
      }),
      missingEvidence,
      reasonCodes,
    });
  }

  if (!input.title) {
    throw new TypeError(
      "Quiet Measure verdict responses require a title descriptor when eligibility is met.",
    );
  }

  return Object.freeze({
    kind: "verdict",
    request,
    eligibility: Object.freeze({
      ...eligibility,
      eligible: true,
    }),
    title: normalizeTitleDescriptor(input.title),
    dominantReads: normalizeDominantReads(input.dominantReads),
    reasonCodes,
  });
}
