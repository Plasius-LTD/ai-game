export const AI_GAME_MISSIONS_FEATURE_FLAG_ID =
  "isekai.player-system.missions.enabled";

export const AI_GAME_MISSIONS_CONTRACT_VERSION = "1.0" as const;

export type AiGameMissionsContractVersion =
  typeof AI_GAME_MISSIONS_CONTRACT_VERSION;

export const AI_GAME_MISSION_CLASSES = [
  "bootstrap",
  "short-term",
  "medium-term",
  "long-horizon",
] as const;

export type AiGameMissionClass = (typeof AI_GAME_MISSION_CLASSES)[number];

export const AI_GAME_MISSION_OBJECTIVE_STATUSES = [
  "pending",
  "active",
  "completed",
  "failed",
  "abandoned",
] as const;

export type AiGameMissionObjectiveStatus =
  (typeof AI_GAME_MISSION_OBJECTIVE_STATUSES)[number];

export const AI_GAME_MISSION_PLAYER_RESPONSE_KINDS = [
  "accepted",
  "refused",
  "ignored",
  "declined",
  "pinned",
  "completed",
  "failed",
  "abandoned",
] as const;

export type AiGameMissionPlayerResponseKind =
  (typeof AI_GAME_MISSION_PLAYER_RESPONSE_KINDS)[number];

export const AI_GAME_MISSION_PREFERENCE_DIMENSIONS = [
  "combat",
  "exploration",
  "crafting",
  "social",
  "governance",
] as const;

export type AiGameMissionPreferenceDimension =
  (typeof AI_GAME_MISSION_PREFERENCE_DIMENSIONS)[number];

export const AI_GAME_MISSION_CONFIDENCE_BANDS = [
  "low",
  "medium",
  "high",
] as const;

export type AiGameMissionConfidenceBand =
  (typeof AI_GAME_MISSION_CONFIDENCE_BANDS)[number];

export const AI_GAME_MISSION_INFLUENCE_SOURCES = [
  "mission-response",
  "player-declared",
  "world-observation",
  "mcc-focus",
  "world-pressure",
  "bootstrap-policy",
] as const;

export type AiGameMissionInfluenceSource =
  (typeof AI_GAME_MISSION_INFLUENCE_SOURCES)[number];

export const AI_GAME_MISSION_REPEATED_SIGNAL_HANDLING = [
  "accumulate",
  "cap-at-confidence",
  "decay-duplicate",
  "ignore-duplicate",
] as const;

export type AiGameMissionRepeatedSignalHandling =
  (typeof AI_GAME_MISSION_REPEATED_SIGNAL_HANDLING)[number];

export const AI_GAME_MISSION_READINESS_BANDS = [
  "bootstrap",
  "ready",
  "needs-prerequisites",
  "institution-gated",
] as const;

export type AiGameMissionReadinessBand =
  (typeof AI_GAME_MISSION_READINESS_BANDS)[number];

export const AI_GAME_MISSION_FEEDBACK_CHANNELS = [
  "audio",
  "visual",
] as const;

export type AiGameMissionFeedbackChannel =
  (typeof AI_GAME_MISSION_FEEDBACK_CHANNELS)[number];

export const AI_GAME_MISSION_REWARD_KINDS = [
  "currency",
  "item",
  "recipe",
  "temporary-modifier",
  "knowledge-unlock",
] as const;

export type AiGameMissionRewardKind =
  (typeof AI_GAME_MISSION_REWARD_KINDS)[number];

export const AI_GAME_MISSION_REWARD_CAP_SEMANTICS = [
  "hard-cap",
  "soft-cap",
  "non-stackable",
] as const;

export type AiGameMissionRewardCapSemantic =
  (typeof AI_GAME_MISSION_REWARD_CAP_SEMANTICS)[number];

export interface AiGameMissionReadinessContext {
  readonly readinessBand: AiGameMissionReadinessBand;
  readonly stageGateRefs: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameMissionMccFocusInfluence {
  readonly targetCode: string;
  readonly influenceWeight: number;
  readonly reasonCodes: readonly string[];
}

export interface AiGameMissionPlayerModelEvidence {
  readonly evidenceId: string;
  readonly sourceId: string;
  readonly capturedAtIso: string;
  readonly repeatedSignalCount: number;
  readonly reasonCodes: readonly string[];
}

export interface AiGameMissionPlayerModelInfluenceInput {
  readonly influenceId: string;
  readonly missionId: string;
  readonly preferenceDimension: AiGameMissionPreferenceDimension;
  readonly source: AiGameMissionInfluenceSource;
  readonly confidenceScore: number;
  readonly confidenceBand: AiGameMissionConfidenceBand;
  readonly evidence: AiGameMissionPlayerModelEvidence;
  readonly repeatedSignalHandling: AiGameMissionRepeatedSignalHandling;
  readonly readinessContext: AiGameMissionReadinessContext;
  readonly mccFocusInfluence: AiGameMissionMccFocusInfluence | null;
  readonly reasonCodes: readonly string[];
}

export interface AiGameMissionRewardBound {
  readonly minimum: number;
  readonly maximum: number;
  readonly cap: number;
  readonly capSemantic: AiGameMissionRewardCapSemantic;
}

export interface AiGameMissionRewardGrant {
  readonly rewardId: string;
  readonly kind: AiGameMissionRewardKind;
  readonly label: string;
  readonly bound: AiGameMissionRewardBound;
  readonly readinessContext: AiGameMissionReadinessContext;
  readonly stageGateRefs: readonly string[];
  readonly cannotSkipReasonCodes: readonly string[];
  readonly temporaryDurationMinutes: number | null;
}

export interface AiGameMissionRewardEnvelope {
  readonly contractVersion: AiGameMissionsContractVersion;
  readonly missionId: string;
  readonly featureFlagId: typeof AI_GAME_MISSIONS_FEATURE_FLAG_ID;
  readonly progressionSafe: true;
  readonly accelerantOnly: true;
  readonly grants: readonly AiGameMissionRewardGrant[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameMissionObjectiveState {
  readonly contractVersion: AiGameMissionsContractVersion;
  readonly objectiveId: string;
  readonly objectiveCode: string;
  readonly label: string;
  readonly status: AiGameMissionObjectiveStatus;
  readonly targetCount: number;
  readonly currentCount: number;
  readonly optional: boolean;
  readonly updatedAtIso: string;
  readonly reasonCodes: readonly string[];
}

export interface AiGameMissionDefinition {
  readonly contractVersion: AiGameMissionsContractVersion;
  readonly missionId: string;
  readonly missionCode: string;
  readonly featureFlagId: typeof AI_GAME_MISSIONS_FEATURE_FLAG_ID;
  readonly missionClass: AiGameMissionClass;
  readonly title: string;
  readonly summary: string;
  readonly bootstrapSafe: boolean;
  readonly feedbackChannels: readonly AiGameMissionFeedbackChannel[];
  readonly preferenceDimensions: readonly AiGameMissionPreferenceDimension[];
  readonly nearbyOpportunityCodes: readonly string[];
  readonly worldPressureCodes: readonly string[];
  readonly readinessContext: AiGameMissionReadinessContext;
  readonly objectiveStates: readonly AiGameMissionObjectiveState[];
  readonly rewardEnvelope: AiGameMissionRewardEnvelope;
  readonly reasonCodes: readonly string[];
}

export interface AiGameMissionPlayerResponse {
  readonly contractVersion: AiGameMissionsContractVersion;
  readonly responseId: string;
  readonly missionId: string;
  readonly responseKind: AiGameMissionPlayerResponseKind;
  readonly respondedAtIso: string;
  readonly objectiveStates: readonly AiGameMissionObjectiveState[];
  readonly influenceInputs: readonly AiGameMissionPlayerModelInfluenceInput[];
  readonly reasonCodes: readonly string[];
}

export interface CreateAiGameMissionReadinessContextInput {
  readonly readinessBand: AiGameMissionReadinessBand;
  readonly stageGateRefs?: readonly string[];
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameMissionMccFocusInfluenceInput {
  readonly targetCode: string;
  readonly influenceWeight: number;
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameMissionPlayerModelEvidenceInput {
  readonly evidenceId: string;
  readonly sourceId: string;
  readonly capturedAtIso: string;
  readonly repeatedSignalCount: number;
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameMissionPlayerModelInfluenceInput {
  readonly influenceId: string;
  readonly missionId: string;
  readonly preferenceDimension: AiGameMissionPreferenceDimension;
  readonly source: AiGameMissionInfluenceSource;
  readonly confidenceScore: number;
  readonly confidenceBand?: AiGameMissionConfidenceBand;
  readonly evidence: CreateAiGameMissionPlayerModelEvidenceInput;
  readonly repeatedSignalHandling: AiGameMissionRepeatedSignalHandling;
  readonly readinessContext: CreateAiGameMissionReadinessContextInput;
  readonly mccFocusInfluence?: CreateAiGameMissionMccFocusInfluenceInput | null;
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameMissionRewardBoundInput {
  readonly minimum: number;
  readonly maximum: number;
  readonly cap: number;
  readonly capSemantic: AiGameMissionRewardCapSemantic;
}

export interface CreateAiGameMissionRewardGrantInput {
  readonly rewardId: string;
  readonly kind: AiGameMissionRewardKind;
  readonly label: string;
  readonly bound: CreateAiGameMissionRewardBoundInput;
  readonly readinessContext: CreateAiGameMissionReadinessContextInput;
  readonly stageGateRefs?: readonly string[];
  readonly cannotSkipReasonCodes: readonly string[];
  readonly temporaryDurationMinutes?: number | null;
}

export interface CreateAiGameMissionRewardEnvelopeInput {
  readonly missionId: string;
  readonly grants: readonly CreateAiGameMissionRewardGrantInput[];
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameMissionObjectiveStateInput {
  readonly objectiveId: string;
  readonly objectiveCode: string;
  readonly label: string;
  readonly status: AiGameMissionObjectiveStatus;
  readonly targetCount: number;
  readonly currentCount?: number;
  readonly optional?: boolean;
  readonly updatedAtIso: string;
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameMissionDefinitionInput {
  readonly missionId: string;
  readonly missionCode: string;
  readonly missionClass: AiGameMissionClass;
  readonly title: string;
  readonly summary: string;
  readonly bootstrapSafe?: boolean;
  readonly feedbackChannels?: readonly AiGameMissionFeedbackChannel[];
  readonly preferenceDimensions: readonly AiGameMissionPreferenceDimension[];
  readonly nearbyOpportunityCodes?: readonly string[];
  readonly worldPressureCodes?: readonly string[];
  readonly readinessContext: CreateAiGameMissionReadinessContextInput;
  readonly objectiveStates: readonly CreateAiGameMissionObjectiveStateInput[];
  readonly rewardEnvelope: CreateAiGameMissionRewardEnvelopeInput;
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameMissionPlayerResponseInput {
  readonly responseId: string;
  readonly missionId: string;
  readonly responseKind: AiGameMissionPlayerResponseKind;
  readonly respondedAtIso: string;
  readonly objectiveStates?: readonly CreateAiGameMissionObjectiveStateInput[];
  readonly influenceInputs?: readonly CreateAiGameMissionPlayerModelInfluenceInput[];
  readonly reasonCodes?: readonly string[];
}

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function isMember<T extends string>(value: string, members: readonly T[]): value is T {
  return (members as readonly string[]).includes(value);
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

function assertBoundedConfidence(value: number, label = "confidenceScore"): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be between 0 and 1`);
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

function createStringArray(
  values: readonly string[] | undefined,
  label: string,
): readonly string[] {
  return freezeReadonlyArray(
    (values ?? []).map((value, index) => {
      assertNonEmptyString(value, `${label}[${index}]`);
      return value;
    }),
  );
}

function assertContractVersion(
  value: string,
  label = "contractVersion",
): asserts value is AiGameMissionsContractVersion {
  if (value !== AI_GAME_MISSIONS_CONTRACT_VERSION) {
    throw new Error(`${label} must be ${AI_GAME_MISSIONS_CONTRACT_VERSION}`);
  }
}

function assertFeedbackChannels(
  channels: readonly AiGameMissionFeedbackChannel[],
): void {
  const set = new Set(channels);

  if (!set.has("audio") || !set.has("visual")) {
    throw new Error("feedbackChannels must include both audio and visual");
  }
}

export function isAiGameMissionClass(value: string): value is AiGameMissionClass {
  return isMember(value, AI_GAME_MISSION_CLASSES);
}

export function isAiGameMissionObjectiveStatus(
  value: string,
): value is AiGameMissionObjectiveStatus {
  return isMember(value, AI_GAME_MISSION_OBJECTIVE_STATUSES);
}

export function isAiGameMissionPlayerResponseKind(
  value: string,
): value is AiGameMissionPlayerResponseKind {
  return isMember(value, AI_GAME_MISSION_PLAYER_RESPONSE_KINDS);
}

export function isAiGameMissionPreferenceDimension(
  value: string,
): value is AiGameMissionPreferenceDimension {
  return isMember(value, AI_GAME_MISSION_PREFERENCE_DIMENSIONS);
}

export function isAiGameMissionConfidenceBand(
  value: string,
): value is AiGameMissionConfidenceBand {
  return isMember(value, AI_GAME_MISSION_CONFIDENCE_BANDS);
}

export function isAiGameMissionInfluenceSource(
  value: string,
): value is AiGameMissionInfluenceSource {
  return isMember(value, AI_GAME_MISSION_INFLUENCE_SOURCES);
}

export function isAiGameMissionRepeatedSignalHandling(
  value: string,
): value is AiGameMissionRepeatedSignalHandling {
  return isMember(value, AI_GAME_MISSION_REPEATED_SIGNAL_HANDLING);
}

export function isAiGameMissionReadinessBand(
  value: string,
): value is AiGameMissionReadinessBand {
  return isMember(value, AI_GAME_MISSION_READINESS_BANDS);
}

export function isAiGameMissionFeedbackChannel(
  value: string,
): value is AiGameMissionFeedbackChannel {
  return isMember(value, AI_GAME_MISSION_FEEDBACK_CHANNELS);
}

export function isAiGameMissionRewardKind(
  value: string,
): value is AiGameMissionRewardKind {
  return isMember(value, AI_GAME_MISSION_REWARD_KINDS);
}

export function isAiGameMissionRewardCapSemantic(
  value: string,
): value is AiGameMissionRewardCapSemantic {
  return isMember(value, AI_GAME_MISSION_REWARD_CAP_SEMANTICS);
}

export function resolveAiGameMissionConfidenceBand(
  confidenceScore: number,
): AiGameMissionConfidenceBand {
  assertBoundedConfidence(confidenceScore);

  if (confidenceScore < 0.34) {
    return "low";
  }

  if (confidenceScore < 0.67) {
    return "medium";
  }

  return "high";
}

export function createAiGameMissionReadinessContext(
  input: CreateAiGameMissionReadinessContextInput,
): AiGameMissionReadinessContext {
  if (!isAiGameMissionReadinessBand(input.readinessBand)) {
    throw new Error("readinessBand must be a supported mission readiness band");
  }

  return Object.freeze({
    readinessBand: input.readinessBand,
    stageGateRefs: createStringArray(input.stageGateRefs, "stageGateRefs"),
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMissionMccFocusInfluence(
  input: CreateAiGameMissionMccFocusInfluenceInput,
): AiGameMissionMccFocusInfluence {
  assertNonEmptyString(input.targetCode, "targetCode");
  assertBoundedConfidence(input.influenceWeight, "influenceWeight");

  return Object.freeze({
    targetCode: input.targetCode,
    influenceWeight: input.influenceWeight,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMissionPlayerModelEvidence(
  input: CreateAiGameMissionPlayerModelEvidenceInput,
): AiGameMissionPlayerModelEvidence {
  assertNonEmptyString(input.evidenceId, "evidenceId");
  assertNonEmptyString(input.sourceId, "sourceId");
  assertIsoTimestamp(input.capturedAtIso, "capturedAtIso");
  assertPositiveInteger(input.repeatedSignalCount, "repeatedSignalCount");

  return Object.freeze({
    evidenceId: input.evidenceId,
    sourceId: input.sourceId,
    capturedAtIso: input.capturedAtIso,
    repeatedSignalCount: input.repeatedSignalCount,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMissionPlayerModelInfluenceInput(
  input: CreateAiGameMissionPlayerModelInfluenceInput,
): AiGameMissionPlayerModelInfluenceInput {
  assertNonEmptyString(input.influenceId, "influenceId");
  assertNonEmptyString(input.missionId, "missionId");

  if (!isAiGameMissionPreferenceDimension(input.preferenceDimension)) {
    throw new Error(
      "preferenceDimension must be a supported mission preference dimension",
    );
  }

  if (!isAiGameMissionInfluenceSource(input.source)) {
    throw new Error("source must be a supported mission influence source");
  }

  if (!isAiGameMissionRepeatedSignalHandling(input.repeatedSignalHandling)) {
    throw new Error(
      "repeatedSignalHandling must be a supported repeated signal handling mode",
    );
  }

  assertBoundedConfidence(input.confidenceScore);
  const confidenceBand = input.confidenceBand
    ?? resolveAiGameMissionConfidenceBand(input.confidenceScore);

  if (!isAiGameMissionConfidenceBand(confidenceBand)) {
    throw new Error("confidenceBand must be a supported mission confidence band");
  }

  if (confidenceBand !== resolveAiGameMissionConfidenceBand(input.confidenceScore)) {
    throw new Error("confidenceBand must match confidenceScore");
  }

  return Object.freeze({
    influenceId: input.influenceId,
    missionId: input.missionId,
    preferenceDimension: input.preferenceDimension,
    source: input.source,
    confidenceScore: input.confidenceScore,
    confidenceBand,
    evidence: createAiGameMissionPlayerModelEvidence(input.evidence),
    repeatedSignalHandling: input.repeatedSignalHandling,
    readinessContext: createAiGameMissionReadinessContext(input.readinessContext),
    mccFocusInfluence: input.mccFocusInfluence
      ? createAiGameMissionMccFocusInfluence(input.mccFocusInfluence)
      : null,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMissionRewardBound(
  input: CreateAiGameMissionRewardBoundInput,
): AiGameMissionRewardBound {
  assertNonNegativeInteger(input.minimum, "minimum");
  assertNonNegativeInteger(input.maximum, "maximum");
  assertNonNegativeInteger(input.cap, "cap");

  if (!isAiGameMissionRewardCapSemantic(input.capSemantic)) {
    throw new Error("capSemantic must be a supported mission reward cap semantic");
  }

  if (input.maximum < input.minimum) {
    throw new Error("maximum must be greater than or equal to minimum");
  }

  if (input.cap < input.maximum) {
    throw new Error("cap must be greater than or equal to maximum");
  }

  return Object.freeze({
    minimum: input.minimum,
    maximum: input.maximum,
    cap: input.cap,
    capSemantic: input.capSemantic,
  });
}

export function createAiGameMissionRewardGrant(
  input: CreateAiGameMissionRewardGrantInput,
): AiGameMissionRewardGrant {
  assertNonEmptyString(input.rewardId, "rewardId");
  assertNonEmptyString(input.label, "label");

  if (!isAiGameMissionRewardKind(input.kind)) {
    throw new Error("kind must be a supported mission reward kind");
  }

  const cannotSkipReasonCodes = createStringArray(
    input.cannotSkipReasonCodes,
    "cannotSkipReasonCodes",
  );

  if (cannotSkipReasonCodes.length === 0) {
    throw new Error("cannotSkipReasonCodes must contain at least one reason code");
  }

  const temporaryDurationMinutes = input.temporaryDurationMinutes ?? null;
  if (temporaryDurationMinutes !== null) {
    assertPositiveInteger(temporaryDurationMinutes, "temporaryDurationMinutes");
  }

  if (input.kind === "temporary-modifier" && temporaryDurationMinutes === null) {
    throw new Error(
      "temporaryDurationMinutes is required for temporary-modifier rewards",
    );
  }

  return Object.freeze({
    rewardId: input.rewardId,
    kind: input.kind,
    label: input.label,
    bound: createAiGameMissionRewardBound(input.bound),
    readinessContext: createAiGameMissionReadinessContext(input.readinessContext),
    stageGateRefs: createStringArray(input.stageGateRefs, "stageGateRefs"),
    cannotSkipReasonCodes,
    temporaryDurationMinutes,
  });
}

export function createAiGameMissionRewardEnvelope(
  input: CreateAiGameMissionRewardEnvelopeInput,
): AiGameMissionRewardEnvelope {
  assertNonEmptyString(input.missionId, "missionId");

  if (input.grants.length === 0) {
    throw new Error("grants must contain at least one reward grant");
  }

  return Object.freeze({
    contractVersion: AI_GAME_MISSIONS_CONTRACT_VERSION,
    missionId: input.missionId,
    featureFlagId: AI_GAME_MISSIONS_FEATURE_FLAG_ID,
    progressionSafe: true,
    accelerantOnly: true,
    grants: freezeReadonlyArray(
      input.grants.map((grant) => createAiGameMissionRewardGrant(grant)),
    ),
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMissionObjectiveState(
  input: CreateAiGameMissionObjectiveStateInput,
): AiGameMissionObjectiveState {
  assertNonEmptyString(input.objectiveId, "objectiveId");
  assertNonEmptyString(input.objectiveCode, "objectiveCode");
  assertNonEmptyString(input.label, "label");

  if (!isAiGameMissionObjectiveStatus(input.status)) {
    throw new Error("status must be a supported mission objective status");
  }

  assertPositiveInteger(input.targetCount, "targetCount");
  const currentCount = input.currentCount ?? 0;
  assertNonNegativeInteger(currentCount, "currentCount");

  if (currentCount > input.targetCount) {
    throw new Error("currentCount must be less than or equal to targetCount");
  }

  assertIsoTimestamp(input.updatedAtIso, "updatedAtIso");

  return Object.freeze({
    contractVersion: AI_GAME_MISSIONS_CONTRACT_VERSION,
    objectiveId: input.objectiveId,
    objectiveCode: input.objectiveCode,
    label: input.label,
    status: input.status,
    targetCount: input.targetCount,
    currentCount,
    optional: input.optional ?? false,
    updatedAtIso: input.updatedAtIso,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMissionDefinition(
  input: CreateAiGameMissionDefinitionInput,
): AiGameMissionDefinition {
  assertNonEmptyString(input.missionId, "missionId");
  assertNonEmptyString(input.missionCode, "missionCode");
  assertNonEmptyString(input.title, "title");
  assertNonEmptyString(input.summary, "summary");

  if (!isAiGameMissionClass(input.missionClass)) {
    throw new Error("missionClass must be a supported mission class");
  }

  const feedbackChannels = freezeReadonlyArray(
    (input.feedbackChannels ?? AI_GAME_MISSION_FEEDBACK_CHANNELS).map((channel) => {
      if (!isAiGameMissionFeedbackChannel(channel)) {
        throw new Error("feedbackChannels must use supported mission channels");
      }
      return channel;
    }),
  );
  assertFeedbackChannels(feedbackChannels);

  if (input.preferenceDimensions.length === 0) {
    throw new Error(
      "preferenceDimensions must contain at least one mission preference dimension",
    );
  }

  const preferenceDimensions = freezeReadonlyArray(
    input.preferenceDimensions.map((dimension) => {
      if (!isAiGameMissionPreferenceDimension(dimension)) {
        throw new Error(
          "preferenceDimensions must use supported mission preference dimensions",
        );
      }
      return dimension;
    }),
  );

  if (input.objectiveStates.length === 0) {
    throw new Error("objectiveStates must contain at least one mission objective");
  }

  return Object.freeze({
    contractVersion: AI_GAME_MISSIONS_CONTRACT_VERSION,
    missionId: input.missionId,
    missionCode: input.missionCode,
    featureFlagId: AI_GAME_MISSIONS_FEATURE_FLAG_ID,
    missionClass: input.missionClass,
    title: input.title,
    summary: input.summary,
    bootstrapSafe: input.bootstrapSafe ?? input.missionClass === "bootstrap",
    feedbackChannels,
    preferenceDimensions,
    nearbyOpportunityCodes: createStringArray(
      input.nearbyOpportunityCodes,
      "nearbyOpportunityCodes",
    ),
    worldPressureCodes: createStringArray(
      input.worldPressureCodes,
      "worldPressureCodes",
    ),
    readinessContext: createAiGameMissionReadinessContext(input.readinessContext),
    objectiveStates: freezeReadonlyArray(
      input.objectiveStates.map((objectiveState) =>
        createAiGameMissionObjectiveState(objectiveState),
      ),
    ),
    rewardEnvelope: createAiGameMissionRewardEnvelope(input.rewardEnvelope),
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameMissionPlayerResponse(
  input: CreateAiGameMissionPlayerResponseInput,
): AiGameMissionPlayerResponse {
  assertNonEmptyString(input.responseId, "responseId");
  assertNonEmptyString(input.missionId, "missionId");
  assertIsoTimestamp(input.respondedAtIso, "respondedAtIso");

  if (!isAiGameMissionPlayerResponseKind(input.responseKind)) {
    throw new Error("responseKind must be a supported mission player response kind");
  }

  return Object.freeze({
    contractVersion: AI_GAME_MISSIONS_CONTRACT_VERSION,
    responseId: input.responseId,
    missionId: input.missionId,
    responseKind: input.responseKind,
    respondedAtIso: input.respondedAtIso,
    objectiveStates: freezeReadonlyArray(
      (input.objectiveStates ?? []).map((objectiveState) =>
        createAiGameMissionObjectiveState(objectiveState),
      ),
    ),
    influenceInputs: freezeReadonlyArray(
      (input.influenceInputs ?? []).map((influenceInput) =>
        createAiGameMissionPlayerModelInfluenceInput(influenceInput),
      ),
    ),
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function assertAiGameMissionContractVersion(value: string): void {
  assertContractVersion(value);
}
