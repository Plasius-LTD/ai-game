import {
  isMccExpressionTrack,
  type AiGameTrainingSpecializationLeaning,
} from "./training-state.js";

export const AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID =
  "isekai.player-system.mcc-guidance.enabled";

export const AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION = "1.0" as const;

export type AiGameMccGuidanceContractVersion =
  typeof AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION;

export const AI_GAME_MCC_GROWTH_DIRECTIONS = [
  "internalized",
  "externalized",
  "hybrid",
] as const;

export type AiGameMccGrowthDirection = AiGameTrainingSpecializationLeaning;

export const AI_GAME_MCC_FOCUS_PRIORITIES = ["primary", "secondary"] as const;

export type AiGameMccFocusPriority = (typeof AI_GAME_MCC_FOCUS_PRIORITIES)[number];

export const AI_GAME_MCC_READINESS_BANDS = [
  "stable",
  "pressured",
  "restricted",
] as const;

export type AiGameMccReadinessBand = (typeof AI_GAME_MCC_READINESS_BANDS)[number];

export const AI_GAME_MCC_WARNING_STATES = [
  "clear",
  "advisory",
  "elevated",
  "critical",
] as const;

export type AiGameMccWarningState = (typeof AI_GAME_MCC_WARNING_STATES)[number];

export const AI_GAME_MCC_WARNING_KINDS = [
  "thermal",
  "fatigue",
  "chaos-pressure",
  "target-burden",
  "stage-gate",
  "death-impairment",
] as const;

export type AiGameMccWarningKind = (typeof AI_GAME_MCC_WARNING_KINDS)[number];

export const AI_GAME_SPELLCRAFT_RECOMMENDATION_KINDS = [
  "training",
  "material",
  "social-prerequisite",
  "refinement",
] as const;

export type AiGameSpellcraftRecommendationKind =
  (typeof AI_GAME_SPELLCRAFT_RECOMMENDATION_KINDS)[number];

export const AI_GAME_SPELLCRAFT_VERDICTS = [
  "recommended",
  "conditional",
  "blocked",
] as const;

export type AiGameSpellcraftVerdict = (typeof AI_GAME_SPELLCRAFT_VERDICTS)[number];

export const AI_GAME_SPELLCRAFT_TARGET_MODES = [
  "self",
  "single-target",
  "area",
] as const;

export type AiGameSpellcraftTargetMode = (typeof AI_GAME_SPELLCRAFT_TARGET_MODES)[number];

export const AI_GAME_SPELLCRAFT_COMPLEXITIES = ["low", "medium", "high"] as const;

export type AiGameSpellcraftComplexity = (typeof AI_GAME_SPELLCRAFT_COMPLEXITIES)[number];

export const AI_GAME_SPELLCRAFT_CHAOS_PRESSURES = [
  "low",
  "elevated",
  "volatile",
] as const;

export type AiGameSpellcraftChaosPressure =
  (typeof AI_GAME_SPELLCRAFT_CHAOS_PRESSURES)[number];

export const AI_GAME_SPELLCRAFT_FATIGUE_STATES = [
  "steady",
  "strained",
  "exhausted",
] as const;

export type AiGameSpellcraftFatigueState =
  (typeof AI_GAME_SPELLCRAFT_FATIGUE_STATES)[number];

export const AI_GAME_SPELLCRAFT_COMMITMENT = "preview-only" as const;
export const AI_GAME_SPELLCRAFT_AUTHORITATIVE_OWNER = "spellcraft-system" as const;
export const AI_GAME_MCC_GUIDANCE_MAX_FOCUS_TARGETS = 3;
export const AI_GAME_MCC_GUIDANCE_MAX_RECOMMENDATIONS = 5;

export interface AiGameMccFocusTarget {
  readonly contractVersion: AiGameMccGuidanceContractVersion;
  readonly featureFlagId: typeof AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID;
  readonly targetId: string;
  readonly growthDirection: AiGameMccGrowthDirection;
  readonly label: string;
  readonly summary: string;
  readonly priority: AiGameMccFocusPriority;
  readonly influenceWeight: number;
  readonly reasonCodes: readonly string[];
}

export interface AiGameMccWarning {
  readonly contractVersion: AiGameMccGuidanceContractVersion;
  readonly featureFlagId: typeof AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID;
  readonly warningId: string;
  readonly kind: AiGameMccWarningKind;
  readonly state: AiGameMccWarningState;
  readonly summary: string;
  readonly reasonCodes: readonly string[];
}

export interface AiGameMccReadinessState {
  readonly contractVersion: AiGameMccGuidanceContractVersion;
  readonly featureFlagId: typeof AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID;
  readonly readinessId: string;
  readonly band: AiGameMccReadinessBand;
  readonly warningState: AiGameMccWarningState;
  readonly warnings: readonly AiGameMccWarning[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameSpellcraftRecommendation {
  readonly contractVersion: AiGameMccGuidanceContractVersion;
  readonly featureFlagId: typeof AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID;
  readonly recommendationId: string;
  readonly kind: AiGameSpellcraftRecommendationKind;
  readonly focusTargetId: string;
  readonly title: string;
  readonly summary: string;
  readonly readinessBand: AiGameMccReadinessBand;
  readonly prerequisiteCodes: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameSpellcraftAdvisory {
  readonly contractVersion: AiGameMccGuidanceContractVersion;
  readonly featureFlagId: typeof AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID;
  readonly advisoryId: string;
  readonly recommendationId: string;
  readonly verdict: AiGameSpellcraftVerdict;
  readonly targetMode: AiGameSpellcraftTargetMode;
  readonly complexity: AiGameSpellcraftComplexity;
  readonly chaosPressure: AiGameSpellcraftChaosPressure;
  readonly fatigueState: AiGameSpellcraftFatigueState;
  readonly readinessBand: AiGameMccReadinessBand;
  readonly prerequisiteCodes: readonly string[];
  readonly warningCodes: readonly string[];
  readonly summary: string;
  readonly reasonCodes: readonly string[];
  readonly commitment: typeof AI_GAME_SPELLCRAFT_COMMITMENT;
  readonly authoritativeOwner: typeof AI_GAME_SPELLCRAFT_AUTHORITATIVE_OWNER;
}

export interface AiGameMccGuidanceSnapshot {
  readonly contractVersion: AiGameMccGuidanceContractVersion;
  readonly featureFlagId: typeof AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID;
  readonly guidanceId: string;
  readonly focusTargets: readonly AiGameMccFocusTarget[];
  readonly readiness: AiGameMccReadinessState;
  readonly recommendations: readonly AiGameSpellcraftRecommendation[];
  readonly advisory: AiGameSpellcraftAdvisory;
}

export interface CreateAiGameMccFocusTargetInput
  extends Omit<AiGameMccFocusTarget, "contractVersion" | "featureFlagId"> {
  readonly contractVersion?: AiGameMccGuidanceContractVersion;
}

export interface CreateAiGameMccWarningInput
  extends Omit<AiGameMccWarning, "contractVersion" | "featureFlagId"> {
  readonly contractVersion?: AiGameMccGuidanceContractVersion;
}

export interface CreateAiGameMccReadinessStateInput
  extends Omit<AiGameMccReadinessState, "contractVersion" | "featureFlagId" | "warnings"> {
  readonly contractVersion?: AiGameMccGuidanceContractVersion;
  readonly warnings: readonly CreateAiGameMccWarningInput[];
}

export interface CreateAiGameSpellcraftRecommendationInput
  extends Omit<AiGameSpellcraftRecommendation, "contractVersion" | "featureFlagId"> {
  readonly contractVersion?: AiGameMccGuidanceContractVersion;
}

export interface CreateAiGameSpellcraftAdvisoryInput
  extends Omit<
    AiGameSpellcraftAdvisory,
    | "contractVersion"
    | "featureFlagId"
    | "commitment"
    | "authoritativeOwner"
  > {
  readonly contractVersion?: AiGameMccGuidanceContractVersion;
}

export interface CreateAiGameMccGuidanceSnapshotInput {
  readonly guidanceId: string;
  readonly focusTargets: readonly CreateAiGameMccFocusTargetInput[];
  readonly readiness: CreateAiGameMccReadinessStateInput;
  readonly recommendations: readonly CreateAiGameSpellcraftRecommendationInput[];
  readonly advisory: CreateAiGameSpellcraftAdvisoryInput;
  readonly contractVersion?: AiGameMccGuidanceContractVersion;
}

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function createStringArray(values: readonly string[] | undefined, label: string): readonly string[] {
  const normalized = values ?? [];

  normalized.forEach((value) => assertNonEmptyString(value, `${label} entry`));
  return freezeReadonlyArray(normalized);
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertContractVersion(
  value: string,
  label = "contractVersion",
): asserts value is AiGameMccGuidanceContractVersion {
  if (value !== AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION) {
    throw new Error(`${label} must be ${AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION}`);
  }
}

function assertBoundedFraction(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be between 0 and 1`);
  }
}

function isMember<T extends string>(value: string, members: readonly T[]): value is T {
  return (members as readonly string[]).includes(value);
}

function getWarningStateRank(state: AiGameMccWarningState): number {
  return AI_GAME_MCC_WARNING_STATES.indexOf(state);
}

function resolveWarningState(warnings: readonly AiGameMccWarning[]): AiGameMccWarningState {
  return warnings.reduce<AiGameMccWarningState>(
    (mostSevere, warning) =>
      getWarningStateRank(warning.state) > getWarningStateRank(mostSevere)
        ? warning.state
        : mostSevere,
    "clear",
  );
}

export function isAiGameMccGrowthDirection(
  value: string,
): value is AiGameMccGrowthDirection {
  return isMccExpressionTrack(value);
}

export function isAiGameMccFocusPriority(value: string): value is AiGameMccFocusPriority {
  return isMember(value, AI_GAME_MCC_FOCUS_PRIORITIES);
}

export function isAiGameMccReadinessBand(value: string): value is AiGameMccReadinessBand {
  return isMember(value, AI_GAME_MCC_READINESS_BANDS);
}

export function isAiGameMccWarningState(value: string): value is AiGameMccWarningState {
  return isMember(value, AI_GAME_MCC_WARNING_STATES);
}

export function isAiGameMccWarningKind(value: string): value is AiGameMccWarningKind {
  return isMember(value, AI_GAME_MCC_WARNING_KINDS);
}

export function isAiGameSpellcraftRecommendationKind(
  value: string,
): value is AiGameSpellcraftRecommendationKind {
  return isMember(value, AI_GAME_SPELLCRAFT_RECOMMENDATION_KINDS);
}

export function isAiGameSpellcraftVerdict(value: string): value is AiGameSpellcraftVerdict {
  return isMember(value, AI_GAME_SPELLCRAFT_VERDICTS);
}

export function isAiGameSpellcraftTargetMode(value: string): value is AiGameSpellcraftTargetMode {
  return isMember(value, AI_GAME_SPELLCRAFT_TARGET_MODES);
}

export function isAiGameSpellcraftComplexity(value: string): value is AiGameSpellcraftComplexity {
  return isMember(value, AI_GAME_SPELLCRAFT_COMPLEXITIES);
}

export function isAiGameSpellcraftChaosPressure(
  value: string,
): value is AiGameSpellcraftChaosPressure {
  return isMember(value, AI_GAME_SPELLCRAFT_CHAOS_PRESSURES);
}

export function isAiGameSpellcraftFatigueState(
  value: string,
): value is AiGameSpellcraftFatigueState {
  return isMember(value, AI_GAME_SPELLCRAFT_FATIGUE_STATES);
}

export function createAiGameMccFocusTarget(
  input: CreateAiGameMccFocusTargetInput,
): AiGameMccFocusTarget {
  assertNonEmptyString(input.targetId, "targetId");
  assertContractVersion(input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION);

  if (!isAiGameMccGrowthDirection(input.growthDirection)) {
    throw new Error("growthDirection must be a supported MCC growth direction");
  }

  if (!isAiGameMccFocusPriority(input.priority)) {
    throw new Error("priority must be a supported MCC focus priority");
  }

  assertNonEmptyString(input.label, "label");
  assertNonEmptyString(input.summary, "summary");
  assertBoundedFraction(input.influenceWeight, "influenceWeight");

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION,
    featureFlagId: AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
    targetId: input.targetId,
    growthDirection: input.growthDirection,
    label: input.label,
    summary: input.summary,
    priority: input.priority,
    influenceWeight: input.influenceWeight,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMccWarning(input: CreateAiGameMccWarningInput): AiGameMccWarning {
  assertNonEmptyString(input.warningId, "warningId");
  assertContractVersion(input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION);

  if (!isAiGameMccWarningKind(input.kind)) {
    throw new Error("kind must be a supported MCC warning kind");
  }

  if (!isAiGameMccWarningState(input.state) || input.state === "clear") {
    throw new Error("state must be an active MCC warning state");
  }

  assertNonEmptyString(input.summary, "summary");

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION,
    featureFlagId: AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
    warningId: input.warningId,
    kind: input.kind,
    state: input.state,
    summary: input.summary,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMccReadinessState(
  input: CreateAiGameMccReadinessStateInput,
): AiGameMccReadinessState {
  assertNonEmptyString(input.readinessId, "readinessId");
  assertContractVersion(input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION);

  if (!isAiGameMccReadinessBand(input.band)) {
    throw new Error("band must be a supported MCC readiness band");
  }

  const warnings = freezeReadonlyArray(
    input.warnings.map((warning) => createAiGameMccWarning(warning)),
  );
  const derivedWarningState = resolveWarningState(warnings);
  const warningState = input.warningState ?? derivedWarningState;

  if (!isAiGameMccWarningState(warningState)) {
    throw new Error("warningState must be a supported MCC warning state");
  }

  if (warningState !== derivedWarningState) {
    throw new Error("warningState must match the most severe warning");
  }

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION,
    featureFlagId: AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
    readinessId: input.readinessId,
    band: input.band,
    warningState,
    warnings,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameSpellcraftRecommendation(
  input: CreateAiGameSpellcraftRecommendationInput,
): AiGameSpellcraftRecommendation {
  assertNonEmptyString(input.recommendationId, "recommendationId");
  assertNonEmptyString(input.focusTargetId, "focusTargetId");
  assertContractVersion(input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION);

  if (!isAiGameSpellcraftRecommendationKind(input.kind)) {
    throw new Error("kind must be a supported spellcraft recommendation kind");
  }

  assertNonEmptyString(input.title, "title");
  assertNonEmptyString(input.summary, "summary");

  if (!isAiGameMccReadinessBand(input.readinessBand)) {
    throw new Error("readinessBand must be a supported MCC readiness band");
  }

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION,
    featureFlagId: AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
    recommendationId: input.recommendationId,
    kind: input.kind,
    focusTargetId: input.focusTargetId,
    title: input.title,
    summary: input.summary,
    readinessBand: input.readinessBand,
    prerequisiteCodes: createStringArray(input.prerequisiteCodes, "prerequisiteCodes"),
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameSpellcraftAdvisory(
  input: CreateAiGameSpellcraftAdvisoryInput,
): AiGameSpellcraftAdvisory {
  assertNonEmptyString(input.advisoryId, "advisoryId");
  assertNonEmptyString(input.recommendationId, "recommendationId");
  assertContractVersion(input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION);

  if (!isAiGameSpellcraftVerdict(input.verdict)) {
    throw new Error("verdict must be a supported spellcraft verdict");
  }

  if (!isAiGameSpellcraftTargetMode(input.targetMode)) {
    throw new Error("targetMode must be a supported spellcraft target mode");
  }

  if (!isAiGameSpellcraftComplexity(input.complexity)) {
    throw new Error("complexity must be a supported spellcraft complexity");
  }

  if (!isAiGameSpellcraftChaosPressure(input.chaosPressure)) {
    throw new Error("chaosPressure must be a supported spellcraft chaos pressure");
  }

  if (!isAiGameSpellcraftFatigueState(input.fatigueState)) {
    throw new Error("fatigueState must be a supported spellcraft fatigue state");
  }

  if (!isAiGameMccReadinessBand(input.readinessBand)) {
    throw new Error("readinessBand must be a supported MCC readiness band");
  }

  assertNonEmptyString(input.summary, "summary");

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION,
    featureFlagId: AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
    advisoryId: input.advisoryId,
    recommendationId: input.recommendationId,
    verdict: input.verdict,
    targetMode: input.targetMode,
    complexity: input.complexity,
    chaosPressure: input.chaosPressure,
    fatigueState: input.fatigueState,
    readinessBand: input.readinessBand,
    prerequisiteCodes: createStringArray(input.prerequisiteCodes, "prerequisiteCodes"),
    warningCodes: createStringArray(input.warningCodes, "warningCodes"),
    summary: input.summary,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
    commitment: AI_GAME_SPELLCRAFT_COMMITMENT,
    authoritativeOwner: AI_GAME_SPELLCRAFT_AUTHORITATIVE_OWNER,
  });
}

export function createAiGameMccGuidanceSnapshot(
  input: CreateAiGameMccGuidanceSnapshotInput,
): AiGameMccGuidanceSnapshot {
  assertNonEmptyString(input.guidanceId, "guidanceId");
  assertContractVersion(input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION);

  if (
    input.focusTargets.length === 0
    || input.focusTargets.length > AI_GAME_MCC_GUIDANCE_MAX_FOCUS_TARGETS
  ) {
    throw new Error(
      `focusTargets must contain between 1 and ${AI_GAME_MCC_GUIDANCE_MAX_FOCUS_TARGETS} targets`,
    );
  }

  if (
    input.recommendations.length === 0
    || input.recommendations.length > AI_GAME_MCC_GUIDANCE_MAX_RECOMMENDATIONS
  ) {
    throw new Error(
      `recommendations must contain between 1 and ${AI_GAME_MCC_GUIDANCE_MAX_RECOMMENDATIONS} items`,
    );
  }

  const focusTargets = freezeReadonlyArray(
    input.focusTargets.map((target) => createAiGameMccFocusTarget(target)),
  );
  const focusTargetIds = new Set(focusTargets.map((target) => target.targetId));
  if (focusTargetIds.size !== focusTargets.length) {
    throw new Error("focusTargets must have unique targetId values");
  }

  const readiness = createAiGameMccReadinessState(input.readiness);
  const recommendations = freezeReadonlyArray(
    input.recommendations.map((recommendation) => {
      const created = createAiGameSpellcraftRecommendation(recommendation);
      if (!focusTargetIds.has(created.focusTargetId)) {
        throw new Error("focusTargetId must reference a supplied focus target");
      }
      return created;
    }),
  );
  const advisory = createAiGameSpellcraftAdvisory(input.advisory);

  if (!recommendations.some((recommendation) => recommendation.recommendationId === advisory.recommendationId)) {
    throw new Error("advisory recommendationId must reference a supplied recommendation");
  }

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION,
    featureFlagId: AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
    guidanceId: input.guidanceId,
    focusTargets,
    readiness,
    recommendations,
    advisory,
  });
}
