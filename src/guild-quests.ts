export const AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID =
  "isekai.player-system.guild-quests.enabled";

export const AI_GAME_GUILD_QUESTS_CONTRACT_VERSION = "1.0" as const;

export type AiGameGuildQuestsContractVersion =
  typeof AI_GAME_GUILD_QUESTS_CONTRACT_VERSION;

export const AI_GAME_GUILD_QUEST_STATUSES = [
  "offered",
  "accepted",
  "active",
  "completed",
  "failed",
  "abandoned",
  "expired",
] as const;

export type AiGameGuildQuestStatus =
  (typeof AI_GAME_GUILD_QUEST_STATUSES)[number];

export const AI_GAME_GUILD_QUEST_OBJECTIVE_STATUSES = [
  "pending",
  "active",
  "completed",
  "failed",
] as const;

export type AiGameGuildQuestObjectiveStatus =
  (typeof AI_GAME_GUILD_QUEST_OBJECTIVE_STATUSES)[number];

export const AI_GAME_GUILD_QUEST_REWARD_KINDS = [
  "currency",
  "item",
  "recipe",
  "reputation",
  "access",
] as const;

export type AiGameGuildQuestRewardKind =
  (typeof AI_GAME_GUILD_QUEST_REWARD_KINDS)[number];

export const AI_GAME_GUILD_QUEST_SYSTEM_RECOMMENDATIONS = [
  "recommended",
  "optional",
  "not-recommended",
  "blocked",
] as const;

export type AiGameGuildQuestSystemRecommendation =
  (typeof AI_GAME_GUILD_QUEST_SYSTEM_RECOMMENDATIONS)[number];

export interface AiGameGuildQuestObjectiveProgress {
  readonly objectiveId: string;
  readonly objectiveCode: string;
  readonly label: string;
  readonly status: AiGameGuildQuestObjectiveStatus;
  readonly targetCount: number;
  readonly currentCount: number;
  readonly updatedAtIso: string;
  readonly reasonCodes: readonly string[];
}

export interface AiGameGuildQuestProgress {
  readonly status: AiGameGuildQuestStatus;
  readonly objectives: readonly AiGameGuildQuestObjectiveProgress[];
  readonly updatedAtIso: string;
}

export interface AiGameGuildQuestFailure {
  readonly failureId: string;
  readonly code: string;
  readonly summary: string;
  readonly failedAtIso: string;
  readonly retryable: boolean;
  readonly consequenceReasonCodes: readonly string[];
}

export interface AiGameGuildQuestRewardPreviewEntry {
  readonly rewardId: string;
  readonly kind: AiGameGuildQuestRewardKind;
  readonly label: string;
  readonly quantity: number;
}

export interface AiGameGuildQuestRewardPreview {
  readonly previewId: string;
  readonly authority: "guild";
  readonly previewOnly: true;
  readonly entries: readonly AiGameGuildQuestRewardPreviewEntry[];
  readonly claimRequirementCodes: readonly string[];
  readonly expiresAtIso: string | null;
}

export interface AiGameGuildQuestGuildTruth {
  readonly guildId: string;
  readonly guildContractId: string;
  readonly title: string;
  readonly summary: string;
  readonly status: AiGameGuildQuestStatus;
  readonly authorityRevision: number;
  readonly progress: AiGameGuildQuestProgress;
  readonly failure: AiGameGuildQuestFailure | null;
  readonly rewardPreview: AiGameGuildQuestRewardPreview;
}

export interface AiGameGuildQuestSystemAnnotations {
  readonly recommendation: AiGameGuildQuestSystemRecommendation;
  readonly synergyCodes: readonly string[];
  readonly linkedMissionIds: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameGuildQuestContract {
  readonly contractVersion: AiGameGuildQuestsContractVersion;
  readonly featureFlagId: typeof AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID;
  readonly questId: string;
  readonly guildTruth: AiGameGuildQuestGuildTruth;
  readonly systemAnnotations: AiGameGuildQuestSystemAnnotations;
}

export interface AiGameGuildQuestSyncPayload {
  readonly contractVersion: AiGameGuildQuestsContractVersion;
  readonly featureFlagId: typeof AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID;
  readonly guildId: string;
  readonly authorityRevision: number;
  readonly syncedAtIso: string;
  readonly quests: readonly AiGameGuildQuestContract[];
  readonly removedQuestIds: readonly string[];
}

export interface CreateAiGameGuildQuestObjectiveProgressInput {
  readonly objectiveId: string;
  readonly objectiveCode: string;
  readonly label: string;
  readonly status: AiGameGuildQuestObjectiveStatus;
  readonly targetCount: number;
  readonly currentCount?: number;
  readonly updatedAtIso: string;
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameGuildQuestProgressInput {
  readonly status: AiGameGuildQuestStatus;
  readonly objectives: readonly CreateAiGameGuildQuestObjectiveProgressInput[];
  readonly updatedAtIso: string;
}

export interface CreateAiGameGuildQuestFailureInput {
  readonly failureId: string;
  readonly code: string;
  readonly summary: string;
  readonly failedAtIso: string;
  readonly retryable: boolean;
  readonly consequenceReasonCodes?: readonly string[];
}

export interface CreateAiGameGuildQuestRewardPreviewEntryInput {
  readonly rewardId: string;
  readonly kind: AiGameGuildQuestRewardKind;
  readonly label: string;
  readonly quantity: number;
}

export interface CreateAiGameGuildQuestRewardPreviewInput {
  readonly previewId: string;
  readonly entries: readonly CreateAiGameGuildQuestRewardPreviewEntryInput[];
  readonly claimRequirementCodes: readonly string[];
  readonly expiresAtIso?: string | null;
}

export interface CreateAiGameGuildQuestGuildTruthInput {
  readonly guildId: string;
  readonly guildContractId: string;
  readonly title: string;
  readonly summary: string;
  readonly status: AiGameGuildQuestStatus;
  readonly authorityRevision: number;
  readonly progress: CreateAiGameGuildQuestProgressInput;
  readonly failure?: CreateAiGameGuildQuestFailureInput | null;
  readonly rewardPreview: CreateAiGameGuildQuestRewardPreviewInput;
}

export interface CreateAiGameGuildQuestSystemAnnotationsInput {
  readonly recommendation?: AiGameGuildQuestSystemRecommendation;
  readonly synergyCodes?: readonly string[];
  readonly linkedMissionIds?: readonly string[];
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameGuildQuestInput {
  readonly questId: string;
  readonly contractVersion?: AiGameGuildQuestsContractVersion;
  readonly guildTruth: CreateAiGameGuildQuestGuildTruthInput;
  readonly systemAnnotations?: CreateAiGameGuildQuestSystemAnnotationsInput;
}

export interface CreateAiGameGuildQuestSyncPayloadInput {
  readonly guildId: string;
  readonly authorityRevision: number;
  readonly syncedAtIso: string;
  readonly quests?: readonly CreateAiGameGuildQuestInput[];
  readonly removedQuestIds?: readonly string[];
  readonly contractVersion?: AiGameGuildQuestsContractVersion;
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

function assertContractVersion(
  value: string,
): asserts value is AiGameGuildQuestsContractVersion {
  if (value !== AI_GAME_GUILD_QUESTS_CONTRACT_VERSION) {
    throw new Error(
      `contractVersion must be ${AI_GAME_GUILD_QUESTS_CONTRACT_VERSION}`,
    );
  }
}

function createStringArray(
  values: readonly string[] | undefined,
  label: string,
  requireAtLeastOne = false,
): readonly string[] {
  const result = freezeReadonlyArray(values ?? []);

  result.forEach((value) => assertNonEmptyString(value, `${label} entry`));

  if (requireAtLeastOne && result.length === 0) {
    throw new Error(`${label} must contain at least one value`);
  }

  return result;
}

export function isAiGameGuildQuestStatus(
  value: string,
): value is AiGameGuildQuestStatus {
  return isMember(value, AI_GAME_GUILD_QUEST_STATUSES);
}

export function isAiGameGuildQuestObjectiveStatus(
  value: string,
): value is AiGameGuildQuestObjectiveStatus {
  return isMember(value, AI_GAME_GUILD_QUEST_OBJECTIVE_STATUSES);
}

export function isAiGameGuildQuestRewardKind(
  value: string,
): value is AiGameGuildQuestRewardKind {
  return isMember(value, AI_GAME_GUILD_QUEST_REWARD_KINDS);
}

export function isAiGameGuildQuestSystemRecommendation(
  value: string,
): value is AiGameGuildQuestSystemRecommendation {
  return isMember(value, AI_GAME_GUILD_QUEST_SYSTEM_RECOMMENDATIONS);
}

export function createAiGameGuildQuestObjectiveProgress(
  input: CreateAiGameGuildQuestObjectiveProgressInput,
): AiGameGuildQuestObjectiveProgress {
  assertNonEmptyString(input.objectiveId, "objectiveId");
  assertNonEmptyString(input.objectiveCode, "objectiveCode");
  assertNonEmptyString(input.label, "label");
  assertIsoTimestamp(input.updatedAtIso, "updatedAtIso");
  assertPositiveInteger(input.targetCount, "targetCount");

  const currentCount = input.currentCount ?? 0;
  assertNonNegativeInteger(currentCount, "currentCount");

  if (currentCount > input.targetCount) {
    throw new Error("currentCount must be less than or equal to targetCount");
  }

  if (!isAiGameGuildQuestObjectiveStatus(input.status)) {
    throw new Error("status must be a supported guild-quest objective status");
  }

  return Object.freeze({
    objectiveId: input.objectiveId,
    objectiveCode: input.objectiveCode,
    label: input.label,
    status: input.status,
    targetCount: input.targetCount,
    currentCount,
    updatedAtIso: input.updatedAtIso,
    reasonCodes: createStringArray(input.reasonCodes, "reasonCodes"),
  });
}

export function createAiGameGuildQuestProgress(
  input: CreateAiGameGuildQuestProgressInput,
): AiGameGuildQuestProgress {
  assertIsoTimestamp(input.updatedAtIso, "updatedAtIso");

  if (!isAiGameGuildQuestStatus(input.status)) {
    throw new Error("status must be a supported guild-quest status");
  }

  if (input.objectives.length === 0) {
    throw new Error("objectives must contain at least one objective");
  }

  const objectives = input.objectives.map((objective) =>
    createAiGameGuildQuestObjectiveProgress(objective),
  );
  const objectiveIds = new Set<string>();
  for (const objective of objectives) {
    if (objectiveIds.has(objective.objectiveId)) {
      throw new Error("objectiveIds must be unique within a quest");
    }
    objectiveIds.add(objective.objectiveId);
  }

  return Object.freeze({
    status: input.status,
    objectives: freezeReadonlyArray(objectives),
    updatedAtIso: input.updatedAtIso,
  });
}

export function createAiGameGuildQuestFailure(
  input: CreateAiGameGuildQuestFailureInput,
): AiGameGuildQuestFailure {
  assertNonEmptyString(input.failureId, "failureId");
  assertNonEmptyString(input.code, "code");
  assertNonEmptyString(input.summary, "summary");
  assertIsoTimestamp(input.failedAtIso, "failedAtIso");

  return Object.freeze({
    failureId: input.failureId,
    code: input.code,
    summary: input.summary,
    failedAtIso: input.failedAtIso,
    retryable: input.retryable,
    consequenceReasonCodes: createStringArray(
      input.consequenceReasonCodes,
      "consequenceReasonCodes",
    ),
  });
}

export function createAiGameGuildQuestRewardPreview(
  input: CreateAiGameGuildQuestRewardPreviewInput,
): AiGameGuildQuestRewardPreview {
  assertNonEmptyString(input.previewId, "previewId");

  const entries = input.entries.map((entry) => {
    assertNonEmptyString(entry.rewardId, "rewardId");
    assertNonEmptyString(entry.label, "label");
    assertPositiveInteger(entry.quantity, "quantity");

    if (!isAiGameGuildQuestRewardKind(entry.kind)) {
      throw new Error("kind must be a supported guild-quest reward kind");
    }

    return Object.freeze({
      rewardId: entry.rewardId,
      kind: entry.kind,
      label: entry.label,
      quantity: entry.quantity,
    });
  });

  const rewardIds = new Set<string>();
  for (const entry of entries) {
    if (rewardIds.has(entry.rewardId)) {
      throw new Error("rewardIds must be unique within a reward preview");
    }
    rewardIds.add(entry.rewardId);
  }

  const expiresAtIso = input.expiresAtIso ?? null;
  if (expiresAtIso !== null) {
    assertIsoTimestamp(expiresAtIso, "expiresAtIso");
  }

  return Object.freeze({
    previewId: input.previewId,
    authority: "guild" as const,
    previewOnly: true as const,
    entries: freezeReadonlyArray(entries),
    claimRequirementCodes: createStringArray(
      input.claimRequirementCodes,
      "claimRequirementCodes",
      true,
    ),
    expiresAtIso,
  });
}

export function createAiGameGuildQuest(
  input: CreateAiGameGuildQuestInput,
): AiGameGuildQuestContract {
  assertNonEmptyString(input.questId, "questId");
  assertContractVersion(
    input.contractVersion ?? AI_GAME_GUILD_QUESTS_CONTRACT_VERSION,
  );
  assertNonEmptyString(input.guildTruth.guildId, "guildId");
  assertNonEmptyString(input.guildTruth.guildContractId, "guildContractId");
  assertNonEmptyString(input.guildTruth.title, "title");
  assertNonEmptyString(input.guildTruth.summary, "summary");
  assertPositiveInteger(input.guildTruth.authorityRevision, "authorityRevision");

  if (!isAiGameGuildQuestStatus(input.guildTruth.status)) {
    throw new Error("status must be a supported guild-quest status");
  }

  const progress = createAiGameGuildQuestProgress(input.guildTruth.progress);
  if (progress.status !== input.guildTruth.status) {
    throw new Error("progress.status must match guildTruth.status");
  }

  const failure = input.guildTruth.failure
    ? createAiGameGuildQuestFailure(input.guildTruth.failure)
    : null;
  if (input.guildTruth.status === "failed" && failure === null) {
    throw new Error("failed guild quests must include failure details");
  }
  if (input.guildTruth.status !== "failed" && failure !== null) {
    throw new Error("failure details are only valid for failed guild quests");
  }

  const annotations = input.systemAnnotations ?? {};
  const recommendation = annotations.recommendation ?? "optional";
  if (!isAiGameGuildQuestSystemRecommendation(recommendation)) {
    throw new Error("recommendation must be a supported System annotation");
  }

  return Object.freeze({
    contractVersion:
      input.contractVersion ?? AI_GAME_GUILD_QUESTS_CONTRACT_VERSION,
    featureFlagId: AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID,
    questId: input.questId,
    guildTruth: Object.freeze({
      guildId: input.guildTruth.guildId,
      guildContractId: input.guildTruth.guildContractId,
      title: input.guildTruth.title,
      summary: input.guildTruth.summary,
      status: input.guildTruth.status,
      authorityRevision: input.guildTruth.authorityRevision,
      progress,
      failure,
      rewardPreview: createAiGameGuildQuestRewardPreview(
        input.guildTruth.rewardPreview,
      ),
    }),
    systemAnnotations: Object.freeze({
      recommendation,
      synergyCodes: createStringArray(
        annotations.synergyCodes,
        "synergyCodes",
      ),
      linkedMissionIds: createStringArray(
        annotations.linkedMissionIds,
        "linkedMissionIds",
      ),
      reasonCodes: createStringArray(annotations.reasonCodes, "reasonCodes"),
    }),
  });
}

export function createAiGameGuildQuestSyncPayload(
  input: CreateAiGameGuildQuestSyncPayloadInput,
): AiGameGuildQuestSyncPayload {
  assertNonEmptyString(input.guildId, "guildId");
  assertPositiveInteger(input.authorityRevision, "authorityRevision");
  assertIsoTimestamp(input.syncedAtIso, "syncedAtIso");
  assertContractVersion(
    input.contractVersion ?? AI_GAME_GUILD_QUESTS_CONTRACT_VERSION,
  );

  const quests = (input.quests ?? []).map((quest) =>
    createAiGameGuildQuest(quest),
  );
  const questIds = new Set<string>();
  for (const quest of quests) {
    if (questIds.has(quest.questId)) {
      throw new Error("questIds must be unique within a sync payload");
    }
    if (quest.guildTruth.guildId !== input.guildId) {
      throw new Error("all quests in a sync payload must belong to guildId");
    }
    questIds.add(quest.questId);
  }

  const removedQuestIds = createStringArray(
    input.removedQuestIds,
    "removedQuestIds",
  );
  if (new Set(removedQuestIds).size !== removedQuestIds.length) {
    throw new Error("removedQuestIds must be unique within a sync payload");
  }
  if (quests.length === 0 && removedQuestIds.length === 0) {
    throw new Error("sync payload must contain quests or removedQuestIds");
  }

  for (const removedQuestId of removedQuestIds) {
    if (questIds.has(removedQuestId)) {
      throw new Error("removedQuestIds cannot overlap quests");
    }
  }

  return Object.freeze({
    contractVersion:
      input.contractVersion ?? AI_GAME_GUILD_QUESTS_CONTRACT_VERSION,
    featureFlagId: AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID,
    guildId: input.guildId,
    authorityRevision: input.authorityRevision,
    syncedAtIso: input.syncedAtIso,
    quests: freezeReadonlyArray(quests),
    removedQuestIds,
  });
}

export function assertAiGameGuildQuestsContractVersion(value: string): void {
  assertContractVersion(value);
}
