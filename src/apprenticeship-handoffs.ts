import {
  isMccExpressionTrack,
  isTrainingTrustLevel,
  type AiGameTrainingSpecializationLeaning,
  type AiGameTrainingTrustLevel,
} from "./training-state.js";

export const AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID =
  "isekai.training.apprenticeship.enabled";

export const AI_GAME_APPRENTICESHIP_CONTRACT_VERSION = "1.0" as const;

export type AiGameApprenticeshipContractVersion =
  typeof AI_GAME_APPRENTICESHIP_CONTRACT_VERSION;

export const AI_GAME_APPRENTICESHIP_SPONSORSHIP_STATUSES = [
  "proposed",
  "active",
  "suspended",
  "completed",
  "revoked",
] as const;

export type AiGameApprenticeshipSponsorshipStatus =
  (typeof AI_GAME_APPRENTICESHIP_SPONSORSHIP_STATUSES)[number];

export const AI_GAME_APPRENTICESHIP_SUPERVISION_MODES = [
  "direct",
  "delegated",
  "milestone",
] as const;

export type AiGameApprenticeshipSupervisionMode =
  (typeof AI_GAME_APPRENTICESHIP_SUPERVISION_MODES)[number];

export const AI_GAME_APPRENTICESHIP_READINESS_STATES = [
  "ready",
  "needs-prerequisites",
  "institution-gated",
  "supervision-required",
  "blocked",
] as const;

export type AiGameApprenticeshipReadinessState =
  (typeof AI_GAME_APPRENTICESHIP_READINESS_STATES)[number];

export const AI_GAME_APPRENTICESHIP_HANDOFF_TARGETS = [
  "spellcraft-system",
  "item-crafting-system",
  "dungeon-crafting-system",
] as const;

export type AiGameApprenticeshipHandoffTarget =
  (typeof AI_GAME_APPRENTICESHIP_HANDOFF_TARGETS)[number];

export const AI_GAME_APPRENTICESHIP_HANDOFF_KINDS = [
  "spellcraft",
  "item-crafting",
  "dungeon-crafting",
] as const;

export type AiGameApprenticeshipHandoffKind =
  (typeof AI_GAME_APPRENTICESHIP_HANDOFF_KINDS)[number];

export const AI_GAME_APPRENTICESHIP_HANDOFF_INTENTS = [
  "learn",
  "practice",
  "refine",
  "commission",
] as const;

export type AiGameApprenticeshipHandoffIntent =
  (typeof AI_GAME_APPRENTICESHIP_HANDOFF_INTENTS)[number];

export const AI_GAME_APPRENTICESHIP_HANDOFF_COMMITMENT = "request-only" as const;
export const AI_GAME_APPRENTICESHIP_GUIDANCE_OWNER = "player-system" as const;

export interface AiGameApprenticeshipSponsorship {
  readonly contractVersion: AiGameApprenticeshipContractVersion;
  readonly featureFlagId: typeof AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID;
  readonly sponsorshipId: string;
  readonly apprenticeSubjectId: string;
  readonly sponsorSubjectId: string;
  readonly institutionId: string;
  readonly disciplineCode: string;
  readonly status: AiGameApprenticeshipSponsorshipStatus;
  readonly issuedAtIso: string;
  readonly expiresAtIso: string | null;
  readonly scopeCodes: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameApprenticeshipSupervision {
  readonly contractVersion: AiGameApprenticeshipContractVersion;
  readonly featureFlagId: typeof AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID;
  readonly supervisionId: string;
  readonly sponsorshipId: string;
  readonly supervisorSubjectId: string;
  readonly mode: AiGameApprenticeshipSupervisionMode;
  readonly checkpointCodes: readonly string[];
  readonly startedAtIso: string;
  readonly endsAtIso: string | null;
  readonly reasonCodes: readonly string[];
}

export interface AiGameApprenticeshipReadiness {
  readonly contractVersion: AiGameApprenticeshipContractVersion;
  readonly featureFlagId: typeof AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID;
  readonly readinessId: string;
  readonly sponsorshipId: string;
  readonly disciplineCode: string;
  readonly state: AiGameApprenticeshipReadinessState;
  readonly requiredTrustLevel: AiGameTrainingTrustLevel;
  readonly requiredTrack: AiGameTrainingSpecializationLeaning;
  readonly supervisionRequired: boolean;
  readonly unmetPrerequisiteCodes: readonly string[];
  readonly evaluatedAtIso: string;
  readonly reasonCodes: readonly string[];
}

export interface AiGameApprenticeshipHandoffBase {
  readonly contractVersion: AiGameApprenticeshipContractVersion;
  readonly featureFlagId: typeof AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID;
  readonly handoffId: string;
  readonly requestId: string;
  readonly apprenticeshipId: string;
  readonly sponsorshipId: string;
  readonly supervisionId: string;
  readonly readinessId: string;
  readonly readinessState: "ready";
  readonly apprenticeSubjectId: string;
  readonly disciplineCode: string;
  readonly intent: AiGameApprenticeshipHandoffIntent;
  readonly requestedAtIso: string;
  readonly commitment: typeof AI_GAME_APPRENTICESHIP_HANDOFF_COMMITMENT;
  readonly guidanceOwner: typeof AI_GAME_APPRENTICESHIP_GUIDANCE_OWNER;
  readonly reasonCodes: readonly string[];
}

export interface AiGameSpellcraftHandoff extends AiGameApprenticeshipHandoffBase {
  readonly kind: "spellcraft";
  readonly targetSystem: "spellcraft-system";
  readonly recommendationId: string | null;
  readonly requestedTrack: AiGameTrainingSpecializationLeaning;
}

export interface AiGameItemCraftingHandoff extends AiGameApprenticeshipHandoffBase {
  readonly kind: "item-crafting";
  readonly targetSystem: "item-crafting-system";
  readonly recipeFamilyCode: string | null;
}

export interface AiGameDungeonCraftingHandoff extends AiGameApprenticeshipHandoffBase {
  readonly kind: "dungeon-crafting";
  readonly targetSystem: "dungeon-crafting-system";
  readonly blueprintFamilyCode: string | null;
  readonly sealingObjectiveCode: string | null;
}

export type AiGameApprenticeshipHandoff =
  | AiGameSpellcraftHandoff
  | AiGameItemCraftingHandoff
  | AiGameDungeonCraftingHandoff;

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertIsoTimestamp(value: string, label: string): void {
  assertNonEmptyString(value, label);

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be an ISO-8601 timestamp`);
  }
}

function assertIsoTimestampOrNull(value: string | null, label: string): void {
  if (value !== null) {
    assertIsoTimestamp(value, label);
  }
}

function assertContractVersion(
  value: string,
): asserts value is AiGameApprenticeshipContractVersion {
  if (value !== AI_GAME_APPRENTICESHIP_CONTRACT_VERSION) {
    throw new Error(
      `contractVersion must be ${AI_GAME_APPRENTICESHIP_CONTRACT_VERSION}`,
    );
  }
}

function assertMember<T extends string>(
  value: string,
  values: readonly T[],
  label: string,
): asserts value is T {
  if (!(values as readonly string[]).includes(value)) {
    throw new Error(`${label} must be a supported apprenticeship value`);
  }
}

function createStringArray(
  values: readonly string[],
  label: string,
): readonly string[] {
  values.forEach((value) => assertNonEmptyString(value, `${label} entry`));
  return freezeReadonlyArray(values);
}

function assertHandoffBase(
  input: Omit<AiGameApprenticeshipHandoffBase, "contractVersion" | "featureFlagId">,
): void {
  assertNonEmptyString(input.handoffId, "handoffId");
  assertNonEmptyString(input.requestId, "requestId");
  assertNonEmptyString(input.apprenticeshipId, "apprenticeshipId");
  assertNonEmptyString(input.sponsorshipId, "sponsorshipId");
  assertNonEmptyString(input.supervisionId, "supervisionId");
  assertNonEmptyString(input.readinessId, "readinessId");
  if (input.readinessState !== "ready") {
    throw new Error("readinessState must be ready for an apprenticeship handoff");
  }
  assertNonEmptyString(input.apprenticeSubjectId, "apprenticeSubjectId");
  assertNonEmptyString(input.disciplineCode, "disciplineCode");
  assertMember(
    input.intent,
    AI_GAME_APPRENTICESHIP_HANDOFF_INTENTS,
    "intent",
  );
  assertIsoTimestamp(input.requestedAtIso, "requestedAtIso");
}

export function isAiGameApprenticeshipReadinessState(
  value: string,
): value is AiGameApprenticeshipReadinessState {
  return (AI_GAME_APPRENTICESHIP_READINESS_STATES as readonly string[]).includes(value);
}

export function createAiGameApprenticeshipSponsorship(
  input: Omit<AiGameApprenticeshipSponsorship, "contractVersion" | "featureFlagId"> & {
    readonly contractVersion?: AiGameApprenticeshipContractVersion;
  },
): AiGameApprenticeshipSponsorship {
  assertContractVersion(input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION);
  assertNonEmptyString(input.sponsorshipId, "sponsorshipId");
  assertNonEmptyString(input.apprenticeSubjectId, "apprenticeSubjectId");
  assertNonEmptyString(input.sponsorSubjectId, "sponsorSubjectId");
  assertNonEmptyString(input.institutionId, "institutionId");
  assertNonEmptyString(input.disciplineCode, "disciplineCode");
  assertMember(
    input.status,
    AI_GAME_APPRENTICESHIP_SPONSORSHIP_STATUSES,
    "status",
  );
  assertIsoTimestamp(input.issuedAtIso, "issuedAtIso");
  assertIsoTimestampOrNull(input.expiresAtIso, "expiresAtIso");

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION,
    featureFlagId: AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID,
    sponsorshipId: input.sponsorshipId,
    apprenticeSubjectId: input.apprenticeSubjectId,
    sponsorSubjectId: input.sponsorSubjectId,
    institutionId: input.institutionId,
    disciplineCode: input.disciplineCode,
    status: input.status,
    issuedAtIso: input.issuedAtIso,
    expiresAtIso: input.expiresAtIso,
    scopeCodes: createStringArray(input.scopeCodes, "scopeCodes"),
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameApprenticeshipSupervision(
  input: Omit<AiGameApprenticeshipSupervision, "contractVersion" | "featureFlagId"> & {
    readonly contractVersion?: AiGameApprenticeshipContractVersion;
  },
): AiGameApprenticeshipSupervision {
  assertContractVersion(input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION);
  assertNonEmptyString(input.supervisionId, "supervisionId");
  assertNonEmptyString(input.sponsorshipId, "sponsorshipId");
  assertNonEmptyString(input.supervisorSubjectId, "supervisorSubjectId");
  assertMember(input.mode, AI_GAME_APPRENTICESHIP_SUPERVISION_MODES, "mode");
  assertIsoTimestamp(input.startedAtIso, "startedAtIso");
  assertIsoTimestampOrNull(input.endsAtIso, "endsAtIso");

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION,
    featureFlagId: AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID,
    supervisionId: input.supervisionId,
    sponsorshipId: input.sponsorshipId,
    supervisorSubjectId: input.supervisorSubjectId,
    mode: input.mode,
    checkpointCodes: createStringArray(input.checkpointCodes, "checkpointCodes"),
    startedAtIso: input.startedAtIso,
    endsAtIso: input.endsAtIso,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameApprenticeshipReadiness(
  input: Omit<AiGameApprenticeshipReadiness, "contractVersion" | "featureFlagId"> & {
    readonly contractVersion?: AiGameApprenticeshipContractVersion;
  },
): AiGameApprenticeshipReadiness {
  assertContractVersion(input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION);
  assertNonEmptyString(input.readinessId, "readinessId");
  assertNonEmptyString(input.sponsorshipId, "sponsorshipId");
  assertNonEmptyString(input.disciplineCode, "disciplineCode");
  assertMember(input.state, AI_GAME_APPRENTICESHIP_READINESS_STATES, "state");

  if (!isTrainingTrustLevel(input.requiredTrustLevel)) {
    throw new Error("requiredTrustLevel must be a supported training trust level");
  }

  if (!isMccExpressionTrack(input.requiredTrack)) {
    throw new Error("requiredTrack must be a supported MCC expression track");
  }

  assertIsoTimestamp(input.evaluatedAtIso, "evaluatedAtIso");

  if (input.state === "ready" && input.unmetPrerequisiteCodes.length > 0) {
    throw new Error("ready apprenticeship state cannot have unmet prerequisites");
  }

  return Object.freeze({
    contractVersion: input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION,
    featureFlagId: AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID,
    readinessId: input.readinessId,
    sponsorshipId: input.sponsorshipId,
    disciplineCode: input.disciplineCode,
    state: input.state,
    requiredTrustLevel: input.requiredTrustLevel,
    requiredTrack: input.requiredTrack,
    supervisionRequired: input.supervisionRequired,
    unmetPrerequisiteCodes: createStringArray(
      input.unmetPrerequisiteCodes,
      "unmetPrerequisiteCodes",
    ),
    evaluatedAtIso: input.evaluatedAtIso,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameApprenticeshipHandoff(
  input: Omit<AiGameApprenticeshipHandoffBase, "contractVersion" | "featureFlagId"> &
    ({
      readonly kind: "spellcraft";
      readonly recommendationId?: string | null;
      readonly requestedTrack: AiGameTrainingSpecializationLeaning;
    } | {
      readonly kind: "item-crafting";
      readonly recipeFamilyCode?: string | null;
    } | {
      readonly kind: "dungeon-crafting";
      readonly blueprintFamilyCode?: string | null;
      readonly sealingObjectiveCode?: string | null;
    }) & { readonly contractVersion?: AiGameApprenticeshipContractVersion },
): AiGameApprenticeshipHandoff {
  assertContractVersion(input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION);
  assertHandoffBase(input);
  assertMember(input.kind, AI_GAME_APPRENTICESHIP_HANDOFF_KINDS, "kind");

  if (input.kind === "spellcraft") {
    if (!isMccExpressionTrack(input.requestedTrack)) {
      throw new Error("requestedTrack must be a supported MCC expression track");
    }

    if (input.recommendationId !== null && input.recommendationId !== undefined) {
      assertNonEmptyString(input.recommendationId, "recommendationId");
    }
  }

  if (
    input.kind === "item-crafting"
    && input.recipeFamilyCode !== null
    && input.recipeFamilyCode !== undefined
  ) {
    assertNonEmptyString(input.recipeFamilyCode, "recipeFamilyCode");
  }

  if (input.kind === "dungeon-crafting") {
    if (
      input.blueprintFamilyCode !== null
      && input.blueprintFamilyCode !== undefined
    ) {
      assertNonEmptyString(input.blueprintFamilyCode, "blueprintFamilyCode");
    }
    if (
      input.sealingObjectiveCode !== null
      && input.sealingObjectiveCode !== undefined
    ) {
      assertNonEmptyString(input.sealingObjectiveCode, "sealingObjectiveCode");
    }
  }

  const base: Omit<AiGameApprenticeshipHandoffBase, "contractVersion" | "featureFlagId"> & {
    readonly contractVersion: AiGameApprenticeshipContractVersion;
    readonly featureFlagId: typeof AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID;
  } = {
    contractVersion: input.contractVersion ?? AI_GAME_APPRENTICESHIP_CONTRACT_VERSION,
    featureFlagId: AI_GAME_APPRENTICESHIP_FEATURE_FLAG_ID,
    handoffId: input.handoffId,
    requestId: input.requestId,
    apprenticeshipId: input.apprenticeshipId,
    sponsorshipId: input.sponsorshipId,
    supervisionId: input.supervisionId,
    readinessId: input.readinessId,
    readinessState: input.readinessState,
    apprenticeSubjectId: input.apprenticeSubjectId,
    disciplineCode: input.disciplineCode,
    intent: input.intent,
    requestedAtIso: input.requestedAtIso,
    commitment: AI_GAME_APPRENTICESHIP_HANDOFF_COMMITMENT,
    guidanceOwner: AI_GAME_APPRENTICESHIP_GUIDANCE_OWNER,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  };

  if (input.kind === "spellcraft") {
    return Object.freeze({
      ...base,
      kind: input.kind,
      targetSystem: "spellcraft-system",
      recommendationId: input.recommendationId ?? null,
      requestedTrack: input.requestedTrack,
    });
  }

  if (input.kind === "item-crafting") {
    return Object.freeze({
      ...base,
      kind: input.kind,
      targetSystem: "item-crafting-system",
      recipeFamilyCode: input.recipeFamilyCode ?? null,
    });
  }

  return Object.freeze({
    ...base,
    kind: input.kind,
    targetSystem: "dungeon-crafting-system",
    blueprintFamilyCode: input.blueprintFamilyCode ?? null,
    sealingObjectiveCode: input.sealingObjectiveCode ?? null,
  });
}
