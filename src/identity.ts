export const AI_GAME_IDENTITY_FEATURE_FLAG_ID =
  "isekai.player-system.identity.enabled";

export const AI_GAME_IDENTITY_CONTRACT_VERSION = "1.0" as const;

export type AiGameIdentityContractVersion =
  typeof AI_GAME_IDENTITY_CONTRACT_VERSION;

export const AI_GAME_IDENTITY_PROJECTION_READS = [
  "self",
  "partial",
  "full",
] as const;

export type AiGameIdentityProjectionRead =
  (typeof AI_GAME_IDENTITY_PROJECTION_READS)[number];

export const AI_GAME_IDENTITY_TARGET_CATEGORIES = [
  "allied",
  "neutral",
  "unknown",
  "unfriendly",
] as const;

export type AiGameIdentityTargetCategory =
  (typeof AI_GAME_IDENTITY_TARGET_CATEGORIES)[number];

export const AI_GAME_IDENTITY_KNOWLEDGE_STATES = [
  "unknown",
  "partial",
  "full",
] as const;

export type AiGameIdentityKnowledgeState =
  (typeof AI_GAME_IDENTITY_KNOWLEDGE_STATES)[number];

export const AI_GAME_IDENTITY_VISIBILITY_STATES = ["visible", "occluded"] as const;

export type AiGameIdentityVisibilityState =
  (typeof AI_GAME_IDENTITY_VISIBILITY_STATES)[number];

export interface AiGameIdentityProjectionField {
  readonly contractVersion: AiGameIdentityContractVersion;
  readonly label: string;
  readonly value: string;
  readonly redacted: boolean;
}

export interface AiGameIdentitySelfProjection {
  readonly contractVersion: AiGameIdentityContractVersion;
  readonly entityId: string;
  readonly label: string;
  readonly projectionRead: "self";
  readonly summary: string;
  readonly fields: readonly AiGameIdentityProjectionField[];
}

export interface AiGameIdentityTargetProjection {
  readonly contractVersion: AiGameIdentityContractVersion;
  readonly targetId: string;
  readonly label: string;
  readonly category: AiGameIdentityTargetCategory;
  readonly knowledgeState: AiGameIdentityKnowledgeState;
  readonly visibility: AiGameIdentityVisibilityState;
  readonly lineOfSight: boolean;
  readonly projectionRead: "partial" | "full";
  readonly summary: string;
  readonly combatSummary: string;
  readonly fields: readonly AiGameIdentityProjectionField[];
}

export interface AiGameIdentityDisclosurePolicy {
  readonly self: "full";
  readonly visibleTargets: "partial-or-full-by-knowledge";
  readonly occludedTargets: "partial-redacted";
}

export interface AiGameIdentityProjectionContract {
  readonly contractVersion: AiGameIdentityContractVersion;
  readonly featureFlagId: typeof AI_GAME_IDENTITY_FEATURE_FLAG_ID;
  readonly authorityOwner: "identity-card";
  readonly authorityMode: "projection-only";
  readonly disclosurePolicy: AiGameIdentityDisclosurePolicy;
  readonly self: AiGameIdentitySelfProjection;
  readonly targets: readonly AiGameIdentityTargetProjection[];
}

export interface CreateAiGameIdentitySelfProjectionInput {
  readonly entityId: string;
  readonly label: string;
  readonly summary: string;
  readonly fields: readonly (Omit<
    AiGameIdentityProjectionField,
    "contractVersion" | "redacted"
  > & { readonly redacted?: boolean })[];
}

export interface CreateAiGameIdentityTargetProjectionInput {
  readonly targetId: string;
  readonly label: string;
  readonly category: AiGameIdentityTargetCategory;
  readonly knowledgeState: AiGameIdentityKnowledgeState;
  readonly lineOfSight: boolean;
  readonly summary: string;
  readonly combatSummary: string;
  readonly fields: readonly (Omit<
    AiGameIdentityProjectionField,
    "contractVersion" | "redacted"
  > & { readonly redacted?: boolean })[];
}

export interface CreateAiGameIdentityProjectionContractInput {
  readonly self: CreateAiGameIdentitySelfProjectionInput;
  readonly targets?: readonly CreateAiGameIdentityTargetProjectionInput[];
}

export const AI_GAME_IDENTITY_DISCLOSURE_POLICY: AiGameIdentityDisclosurePolicy =
  Object.freeze({
    self: "full",
    visibleTargets: "partial-or-full-by-knowledge",
    occludedTargets: "partial-redacted",
  });

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertContractVersion(
  value: string,
  label = "contractVersion",
): asserts value is AiGameIdentityContractVersion {
  if (value !== AI_GAME_IDENTITY_CONTRACT_VERSION) {
    throw new Error(`${label} must be ${AI_GAME_IDENTITY_CONTRACT_VERSION}`);
  }
}

function isMember<T extends string>(value: string, members: readonly T[]): value is T {
  return (members as readonly string[]).includes(value);
}

function createField(
  field: Omit<AiGameIdentityProjectionField, "contractVersion" | "redacted"> & {
    readonly redacted?: boolean;
  },
): AiGameIdentityProjectionField {
  assertNonEmptyString(field.label, "field.label");
  assertNonEmptyString(field.value, "field.value");

  return Object.freeze({
    contractVersion: AI_GAME_IDENTITY_CONTRACT_VERSION,
    label: field.label,
    value: field.value,
    redacted: field.redacted ?? false,
  });
}

function redactField(
  field: Omit<AiGameIdentityProjectionField, "contractVersion" | "redacted"> & {
    readonly redacted?: boolean;
  },
  value: "Unknown" | "Withheld",
): AiGameIdentityProjectionField {
  return createField({
    label: field.label,
    value,
    redacted: true,
  });
}

export function isAiGameIdentityProjectionRead(
  value: string,
): value is AiGameIdentityProjectionRead {
  return isMember(value, AI_GAME_IDENTITY_PROJECTION_READS);
}

export function isAiGameIdentityTargetCategory(
  value: string,
): value is AiGameIdentityTargetCategory {
  return isMember(value, AI_GAME_IDENTITY_TARGET_CATEGORIES);
}

export function isAiGameIdentityKnowledgeState(
  value: string,
): value is AiGameIdentityKnowledgeState {
  return isMember(value, AI_GAME_IDENTITY_KNOWLEDGE_STATES);
}

export function isAiGameIdentityVisibilityState(
  value: string,
): value is AiGameIdentityVisibilityState {
  return isMember(value, AI_GAME_IDENTITY_VISIBILITY_STATES);
}

export function resolveAiGameIdentityProjectionRead(input: {
  readonly knowledgeState: AiGameIdentityKnowledgeState;
  readonly lineOfSight: boolean;
}): "partial" | "full" {
  return input.lineOfSight && input.knowledgeState === "full" ? "full" : "partial";
}

export function createAiGameIdentitySelfProjection(
  input: CreateAiGameIdentitySelfProjectionInput,
): AiGameIdentitySelfProjection {
  assertNonEmptyString(input.entityId, "entityId");
  assertNonEmptyString(input.label, "label");
  assertNonEmptyString(input.summary, "summary");

  return Object.freeze({
    contractVersion: AI_GAME_IDENTITY_CONTRACT_VERSION,
    entityId: input.entityId,
    label: input.label,
    projectionRead: "self",
    summary: input.summary,
    fields: freezeReadonlyArray(input.fields.map((field) => createField(field))),
  });
}

export function createAiGameIdentityTargetProjection(
  input: CreateAiGameIdentityTargetProjectionInput,
): AiGameIdentityTargetProjection {
  assertNonEmptyString(input.targetId, "targetId");
  assertNonEmptyString(input.label, "label");
  assertNonEmptyString(input.summary, "summary");
  assertNonEmptyString(input.combatSummary, "combatSummary");

  if (!isAiGameIdentityTargetCategory(input.category)) {
    throw new Error("category must be a supported identity target category");
  }

  if (!isAiGameIdentityKnowledgeState(input.knowledgeState)) {
    throw new Error("knowledgeState must be a supported identity knowledge state");
  }

  const projectionRead = resolveAiGameIdentityProjectionRead(input);
  const visibility = input.lineOfSight ? "visible" : "occluded";
  const fields = input.fields.map((field) =>
    projectionRead === "full"
      ? createField(field)
      : redactField(field, input.lineOfSight ? "Unknown" : "Withheld"),
  );

  return Object.freeze({
    contractVersion: AI_GAME_IDENTITY_CONTRACT_VERSION,
    targetId: input.targetId,
    label: input.label,
    category: input.category,
    knowledgeState: input.knowledgeState,
    visibility,
    lineOfSight: input.lineOfSight,
    projectionRead,
    summary: input.summary,
    combatSummary: input.combatSummary,
    fields: freezeReadonlyArray(fields),
  });
}

export function selectAiGameVisibleIdentityTargets(
  targets: readonly AiGameIdentityTargetProjection[],
): readonly AiGameIdentityTargetProjection[] {
  return freezeReadonlyArray(
    targets.filter((target) => target.visibility === "visible" && target.lineOfSight),
  );
}

export function createAiGameIdentityProjectionContract(
  input: CreateAiGameIdentityProjectionContractInput,
): AiGameIdentityProjectionContract {
  const self = createAiGameIdentitySelfProjection(input.self);
  const targets = freezeReadonlyArray(
    (input.targets ?? []).map((target) => createAiGameIdentityTargetProjection(target)),
  );

  return Object.freeze({
    contractVersion: AI_GAME_IDENTITY_CONTRACT_VERSION,
    featureFlagId: AI_GAME_IDENTITY_FEATURE_FLAG_ID,
    authorityOwner: "identity-card",
    authorityMode: "projection-only",
    disclosurePolicy: AI_GAME_IDENTITY_DISCLOSURE_POLICY,
    self,
    targets,
  });
}

export function assertAiGameIdentityProjectionContractVersion(
  value: string,
): void {
  assertContractVersion(value);
}
