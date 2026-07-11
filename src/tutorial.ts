export const AI_GAME_TUTORIAL_FEATURE_FLAG_ID =
  "isekai.player-system.tutorial.enabled";

export const AI_GAME_TUTORIAL_CONTRACT_VERSION = "1.0" as const;

export type AiGameTutorialContractVersion =
  typeof AI_GAME_TUTORIAL_CONTRACT_VERSION;

export const AI_GAME_TUTORIAL_STAGES = [
  "stage-1",
  "stage-2",
  "stage-3",
  "stage-4",
  "stage-5",
] as const;

export type AiGameTutorialStage = (typeof AI_GAME_TUTORIAL_STAGES)[number];

export const AI_GAME_TUTORIAL_TRIGGER_KINDS = [
  "awakening",
  "first-action",
  "explicit-request",
  "progression-gated",
] as const;

export type AiGameTutorialTriggerKind =
  (typeof AI_GAME_TUTORIAL_TRIGGER_KINDS)[number];

export const AI_GAME_TUTORIAL_PREREQUISITE_KINDS = [
  "school-access",
  "apprenticeship",
  "academy-admission",
  "guild-standing",
  "divine-progression",
  "spellcraft-readiness",
] as const;

export type AiGameTutorialPrerequisiteKind =
  (typeof AI_GAME_TUTORIAL_PREREQUISITE_KINDS)[number];

export const AI_GAME_TUTORIAL_COMPLETION_STATES = [
  "not-started",
  "active",
  "dormant",
  "completed",
  "declined",
] as const;

export type AiGameTutorialCompletionState =
  (typeof AI_GAME_TUTORIAL_COMPLETION_STATES)[number];

export const AI_GAME_TUTORIAL_MAX_STEPS = 20;
export const AI_GAME_TUTORIAL_MAX_PREREQUISITES = 12;
export const AI_GAME_TUTORIAL_MAX_TRIGGERS = 8;

export interface AiGameTutorialPrerequisite {
  readonly contractVersion: AiGameTutorialContractVersion;
  readonly featureFlagId: typeof AI_GAME_TUTORIAL_FEATURE_FLAG_ID;
  readonly markerId: string;
  readonly kind: AiGameTutorialPrerequisiteKind;
  readonly label: string;
  readonly satisfied: boolean;
  readonly reasonCodes: readonly string[];
}

export interface AiGameTutorialTrigger {
  readonly contractVersion: AiGameTutorialContractVersion;
  readonly featureFlagId: typeof AI_GAME_TUTORIAL_FEATURE_FLAG_ID;
  readonly triggerId: string;
  readonly kind: AiGameTutorialTriggerKind;
  readonly capabilityCode: string;
  readonly firstUseOnly: boolean;
  readonly safeInCombat: boolean;
  readonly reasonCodes: readonly string[];
}

export interface AiGameTutorialStep {
  readonly contractVersion: AiGameTutorialContractVersion;
  readonly featureFlagId: typeof AI_GAME_TUTORIAL_FEATURE_FLAG_ID;
  readonly stepId: string;
  readonly trackId: string;
  readonly stage: AiGameTutorialStage;
  readonly sequence: number;
  readonly title: string;
  readonly summary: string;
  readonly capabilityCode: string;
  readonly triggerKinds: readonly AiGameTutorialTriggerKind[];
  readonly prerequisiteIds: readonly string[];
  readonly safeInCombat: boolean;
  readonly replayable: boolean;
  readonly reasonCodes: readonly string[];
}

export interface AiGameTutorialProgressionState {
  readonly contractVersion: AiGameTutorialContractVersion;
  readonly featureFlagId: typeof AI_GAME_TUTORIAL_FEATURE_FLAG_ID;
  readonly trackId: string;
  readonly status: AiGameTutorialCompletionState;
  readonly currentStepId: string | null;
  readonly completedStepIds: readonly string[];
  readonly refusalCount: number;
  readonly replayCount: number;
  readonly replayable: boolean;
  readonly lastTriggeredAtIso: string | null;
  readonly lastReplayedAtIso: string | null;
  readonly reasonCodes: readonly string[];
}

export interface AiGameTutorialTrack {
  readonly contractVersion: AiGameTutorialContractVersion;
  readonly featureFlagId: typeof AI_GAME_TUTORIAL_FEATURE_FLAG_ID;
  readonly trackId: string;
  readonly title: string;
  readonly summary: string;
  readonly steps: readonly AiGameTutorialStep[];
  readonly prerequisites: readonly AiGameTutorialPrerequisite[];
  readonly triggers: readonly AiGameTutorialTrigger[];
  readonly progression: AiGameTutorialProgressionState;
  readonly reasonCodes: readonly string[];
}

export interface CreateAiGameTutorialPrerequisiteInput
  extends Omit<AiGameTutorialPrerequisite, "contractVersion" | "featureFlagId"> {
  readonly contractVersion?: AiGameTutorialContractVersion;
}

export interface CreateAiGameTutorialTriggerInput
  extends Omit<AiGameTutorialTrigger, "contractVersion" | "featureFlagId"> {
  readonly contractVersion?: AiGameTutorialContractVersion;
}

export interface CreateAiGameTutorialStepInput
  extends Omit<AiGameTutorialStep, "contractVersion" | "featureFlagId"> {
  readonly contractVersion?: AiGameTutorialContractVersion;
}

export interface CreateAiGameTutorialProgressionStateInput
  extends Omit<AiGameTutorialProgressionState, "contractVersion" | "featureFlagId"> {
  readonly contractVersion?: AiGameTutorialContractVersion;
}

export interface CreateAiGameTutorialTrackInput {
  readonly contractVersion?: AiGameTutorialContractVersion;
  readonly trackId: string;
  readonly title: string;
  readonly summary: string;
  readonly steps: readonly CreateAiGameTutorialStepInput[];
  readonly prerequisites: readonly CreateAiGameTutorialPrerequisiteInput[];
  readonly triggers: readonly CreateAiGameTutorialTriggerInput[];
  readonly progression: CreateAiGameTutorialProgressionStateInput;
  readonly reasonCodes?: readonly string[];
}

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function createStringArray(
  values: readonly string[] | undefined,
  label: string,
): readonly string[] {
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
): asserts value is AiGameTutorialContractVersion {
  if (value !== AI_GAME_TUTORIAL_CONTRACT_VERSION) {
    throw new Error(`contractVersion must be ${AI_GAME_TUTORIAL_CONTRACT_VERSION}`);
  }
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}

function assertIsoTimestampOrNull(value: string | null, label: string): void {
  if (value !== null && Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be an ISO-8601 timestamp`);
  }
}

function isMember<T extends string>(value: string, members: readonly T[]): value is T {
  return (members as readonly string[]).includes(value);
}

function assertUniqueIds(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} must have unique IDs`);
  }
}

export function isAiGameTutorialStage(value: string): value is AiGameTutorialStage {
  return isMember(value, AI_GAME_TUTORIAL_STAGES);
}

export function isAiGameTutorialTriggerKind(
  value: string,
): value is AiGameTutorialTriggerKind {
  return isMember(value, AI_GAME_TUTORIAL_TRIGGER_KINDS);
}

export function isAiGameTutorialPrerequisiteKind(
  value: string,
): value is AiGameTutorialPrerequisiteKind {
  return isMember(value, AI_GAME_TUTORIAL_PREREQUISITE_KINDS);
}

export function isAiGameTutorialCompletionState(
  value: string,
): value is AiGameTutorialCompletionState {
  return isMember(value, AI_GAME_TUTORIAL_COMPLETION_STATES);
}

export function createAiGameTutorialPrerequisite(
  input: CreateAiGameTutorialPrerequisiteInput,
): AiGameTutorialPrerequisite {
  assertNonEmptyString(input.markerId, "markerId");
  assertContractVersion(input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION);

  if (!isAiGameTutorialPrerequisiteKind(input.kind)) {
    throw new Error("kind must be a supported tutorial prerequisite kind");
  }

  assertNonEmptyString(input.label, "label");

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION,
    featureFlagId: AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
    markerId: input.markerId,
    kind: input.kind,
    label: input.label,
    satisfied: input.satisfied,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameTutorialTrigger(
  input: CreateAiGameTutorialTriggerInput,
): AiGameTutorialTrigger {
  assertNonEmptyString(input.triggerId, "triggerId");
  assertContractVersion(input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION);

  if (!isAiGameTutorialTriggerKind(input.kind)) {
    throw new Error("kind must be a supported tutorial trigger kind");
  }

  assertNonEmptyString(input.capabilityCode, "capabilityCode");

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION,
    featureFlagId: AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
    triggerId: input.triggerId,
    kind: input.kind,
    capabilityCode: input.capabilityCode,
    firstUseOnly: input.firstUseOnly,
    safeInCombat: input.safeInCombat,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameTutorialStep(
  input: CreateAiGameTutorialStepInput,
): AiGameTutorialStep {
  assertNonEmptyString(input.stepId, "stepId");
  assertNonEmptyString(input.trackId, "trackId");
  assertContractVersion(input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION);

  if (!isAiGameTutorialStage(input.stage)) {
    throw new Error("stage must be a supported tutorial stage");
  }

  assertPositiveInteger(input.sequence, "sequence");
  assertNonEmptyString(input.title, "title");
  assertNonEmptyString(input.summary, "summary");
  assertNonEmptyString(input.capabilityCode, "capabilityCode");

  if (input.triggerKinds.length === 0) {
    throw new Error("triggerKinds must contain at least one trigger kind");
  }

  input.triggerKinds.forEach((kind) => {
    if (!isAiGameTutorialTriggerKind(kind)) {
      throw new Error("triggerKinds must use supported tutorial trigger kinds");
    }
  });

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION,
    featureFlagId: AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
    stepId: input.stepId,
    trackId: input.trackId,
    stage: input.stage,
    sequence: input.sequence,
    title: input.title,
    summary: input.summary,
    capabilityCode: input.capabilityCode,
    triggerKinds: freezeReadonlyArray(input.triggerKinds),
    prerequisiteIds: createStringArray(input.prerequisiteIds, "prerequisiteIds"),
    safeInCombat: input.safeInCombat,
    replayable: input.replayable,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameTutorialProgressionState(
  input: CreateAiGameTutorialProgressionStateInput,
): AiGameTutorialProgressionState {
  assertNonEmptyString(input.trackId, "trackId");
  assertContractVersion(input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION);

  if (!isAiGameTutorialCompletionState(input.status)) {
    throw new Error("status must be a supported tutorial completion state");
  }

  if (input.currentStepId !== null) {
    assertNonEmptyString(input.currentStepId, "currentStepId");
  }

  const completedStepIds = createStringArray(input.completedStepIds, "completedStepIds");
  assertUniqueIds(completedStepIds, "completedStepIds");
  assertNonNegativeInteger(input.refusalCount, "refusalCount");
  assertNonNegativeInteger(input.replayCount, "replayCount");
  assertIsoTimestampOrNull(input.lastTriggeredAtIso, "lastTriggeredAtIso");
  assertIsoTimestampOrNull(input.lastReplayedAtIso, "lastReplayedAtIso");

  if (input.status === "completed" && input.currentStepId !== null) {
    throw new Error("completed tutorials cannot have a currentStepId");
  }

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION,
    featureFlagId: AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
    trackId: input.trackId,
    status: input.status,
    currentStepId: input.currentStepId,
    completedStepIds,
    refusalCount: input.refusalCount,
    replayCount: input.replayCount,
    replayable: input.replayable,
    lastTriggeredAtIso: input.lastTriggeredAtIso,
    lastReplayedAtIso: input.lastReplayedAtIso,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameTutorialTrack(
  input: CreateAiGameTutorialTrackInput,
): AiGameTutorialTrack {
  assertNonEmptyString(input.trackId, "trackId");
  assertContractVersion(input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION);
  assertNonEmptyString(input.title, "title");
  assertNonEmptyString(input.summary, "summary");

  if (input.steps.length === 0 || input.steps.length > AI_GAME_TUTORIAL_MAX_STEPS) {
    throw new Error(
      `steps must contain between 1 and ${AI_GAME_TUTORIAL_MAX_STEPS} steps`,
    );
  }

  if (input.prerequisites.length > AI_GAME_TUTORIAL_MAX_PREREQUISITES) {
    throw new Error(
      `prerequisites cannot contain more than ${AI_GAME_TUTORIAL_MAX_PREREQUISITES} markers`,
    );
  }

  if (input.triggers.length === 0 || input.triggers.length > AI_GAME_TUTORIAL_MAX_TRIGGERS) {
    throw new Error(
      `triggers must contain between 1 and ${AI_GAME_TUTORIAL_MAX_TRIGGERS} triggers`,
    );
  }

  const steps = freezeReadonlyArray(
    input.steps.map((step) => createAiGameTutorialStep(step)),
  );
  const prerequisites = freezeReadonlyArray(
    input.prerequisites.map((marker) => createAiGameTutorialPrerequisite(marker)),
  );
  const triggers = freezeReadonlyArray(
    input.triggers.map((trigger) => createAiGameTutorialTrigger(trigger)),
  );
  const progression = createAiGameTutorialProgressionState(input.progression);

  assertUniqueIds(steps.map((step) => step.stepId), "steps");
  assertUniqueIds(prerequisites.map((marker) => marker.markerId), "prerequisites");
  assertUniqueIds(triggers.map((trigger) => trigger.triggerId), "triggers");

  if (progression.trackId !== input.trackId) {
    throw new Error("progression trackId must match the tutorial track");
  }

  const stepIds = new Set(steps.map((step) => step.stepId));
  const prerequisiteIds = new Set(prerequisites.map((marker) => marker.markerId));
  const triggerKinds = new Set(triggers.map((trigger) => trigger.kind));

  if (progression.currentStepId !== null && !stepIds.has(progression.currentStepId)) {
    throw new Error("currentStepId must reference a supplied tutorial step");
  }

  if (progression.completedStepIds.some((stepId) => !stepIds.has(stepId))) {
    throw new Error("completedStepIds must reference supplied tutorial steps");
  }

  steps.forEach((step) => {
    if (step.trackId !== input.trackId) {
      throw new Error("step trackId must match the tutorial track");
    }

    if (step.prerequisiteIds.some((markerId) => !prerequisiteIds.has(markerId))) {
      throw new Error("prerequisiteIds must reference supplied prerequisites");
    }

    if (step.triggerKinds.some((kind) => !triggerKinds.has(kind))) {
      throw new Error("triggerKinds must reference supplied triggers");
    }
  });

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_TUTORIAL_CONTRACT_VERSION,
    featureFlagId: AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
    trackId: input.trackId,
    title: input.title,
    summary: input.summary,
    steps,
    prerequisites,
    triggers,
    progression,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}
