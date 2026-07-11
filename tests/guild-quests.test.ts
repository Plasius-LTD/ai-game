import { describe, expect, it } from "vitest";

import {
  AI_GAME_GUILD_QUESTS_CONTRACT_VERSION,
  AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID,
  AI_GAME_GUILD_QUEST_OBJECTIVE_STATUSES,
  AI_GAME_GUILD_QUEST_REWARD_KINDS,
  AI_GAME_GUILD_QUEST_STATUSES,
  AI_GAME_GUILD_QUEST_SYSTEM_RECOMMENDATIONS,
  assertAiGameGuildQuestsContractVersion,
  createAiGameGuildQuest,
  createAiGameGuildQuestSyncPayload,
  isAiGameGuildQuestObjectiveStatus,
  isAiGameGuildQuestRewardKind,
  isAiGameGuildQuestStatus,
  isAiGameGuildQuestSystemRecommendation,
} from "../src/index.js";

const activeQuestInput = {
  questId: "quest-1",
  guildTruth: {
    guildId: "guild-1",
    guildContractId: "contract-1",
    title: "Clear the eastern road",
    summary: "Remove the threat without replacing guild authority.",
    status: "active" as const,
    authorityRevision: 3,
    progress: {
      status: "active" as const,
      updatedAtIso: "2026-07-11T13:00:00.000Z",
      objectives: [
        {
          objectiveId: "objective-1",
          objectiveCode: "eastern-road-threat",
          label: "Resolve the eastern road threat",
          status: "active" as const,
          targetCount: 2,
          currentCount: 1,
          updatedAtIso: "2026-07-11T13:00:00.000Z",
          reasonCodes: ["guild-contract-active"],
        },
      ],
    },
    rewardPreview: {
      previewId: "preview-1",
      entries: [
        {
          rewardId: "reward-1",
          kind: "reputation" as const,
          label: "Guild standing",
          quantity: 1,
        },
      ],
      claimRequirementCodes: ["guild-verification-required"],
      expiresAtIso: "2026-07-18T13:00:00.000Z",
    },
  },
  systemAnnotations: {
    recommendation: "recommended" as const,
    synergyCodes: ["nearby-mission"],
    linkedMissionIds: ["mission-1"],
    reasonCodes: ["matches-player-focus"],
  },
};

describe("guild quest contracts", () => {
  it("exports rollout vocabulary and guards", () => {
    expect(AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.guild-quests.enabled",
    );
    expect(AI_GAME_GUILD_QUESTS_CONTRACT_VERSION).toBe("1.0");
    expect(AI_GAME_GUILD_QUEST_STATUSES).toContain("failed");
    expect(AI_GAME_GUILD_QUEST_OBJECTIVE_STATUSES).toContain("completed");
    expect(AI_GAME_GUILD_QUEST_REWARD_KINDS).toContain("reputation");
    expect(AI_GAME_GUILD_QUEST_SYSTEM_RECOMMENDATIONS).toContain("blocked");
    expect(isAiGameGuildQuestStatus("active")).toBe(true);
    expect(isAiGameGuildQuestStatus("in-progress")).toBe(false);
    expect(isAiGameGuildQuestObjectiveStatus("failed")).toBe(true);
    expect(isAiGameGuildQuestObjectiveStatus("cancelled")).toBe(false);
    expect(isAiGameGuildQuestRewardKind("access")).toBe(true);
    expect(isAiGameGuildQuestRewardKind("power")).toBe(false);
    expect(isAiGameGuildQuestSystemRecommendation("optional")).toBe(true);
    expect(isAiGameGuildQuestSystemRecommendation("automatic")).toBe(false);
    expect(() => assertAiGameGuildQuestsContractVersion("2.0")).toThrow();
  });

  it("creates immutable guild truth and separate advisory System annotations", () => {
    const quest = createAiGameGuildQuest(activeQuestInput);

    expect(quest.featureFlagId).toBe(AI_GAME_GUILD_QUESTS_FEATURE_FLAG_ID);
    expect(quest.guildTruth.status).toBe("active");
    expect(quest.guildTruth.progress.objectives[0]?.currentCount).toBe(1);
    expect(quest.guildTruth.rewardPreview).toMatchObject({
      authority: "guild",
      previewOnly: true,
    });
    expect(quest.systemAnnotations.recommendation).toBe("recommended");
    expect(quest.guildTruth).not.toHaveProperty("recommendation");
    expect(quest.systemAnnotations).not.toHaveProperty("rewardPreview");
    expect(Object.isFrozen(quest)).toBe(true);
    expect(Object.isFrozen(quest.guildTruth)).toBe(true);
    expect(Object.isFrozen(quest.guildTruth.progress.objectives)).toBe(true);
    expect(Object.isFrozen(quest.guildTruth.rewardPreview.entries)).toBe(true);
    expect(Object.isFrozen(quest.systemAnnotations)).toBe(true);
  });

  it("creates revisioned sync payloads with upserts and tombstones", () => {
    const payload = createAiGameGuildQuestSyncPayload({
      guildId: "guild-1",
      authorityRevision: 4,
      syncedAtIso: "2026-07-11T13:05:00.000Z",
      quests: [activeQuestInput],
      removedQuestIds: ["quest-old"],
    });

    expect(payload.quests[0]?.questId).toBe("quest-1");
    expect(payload.removedQuestIds).toEqual(["quest-old"]);
    expect(Object.isFrozen(payload)).toBe(true);
    expect(Object.isFrozen(payload.quests)).toBe(true);
  });

  it("applies safe defaults for optional progress, expiry, and annotation fields", () => {
    const quest = createAiGameGuildQuest({
      ...activeQuestInput,
      systemAnnotations: undefined,
      guildTruth: {
        ...activeQuestInput.guildTruth,
        progress: {
          ...activeQuestInput.guildTruth.progress,
          objectives: [
            {
              ...activeQuestInput.guildTruth.progress.objectives[0],
              currentCount: undefined,
              reasonCodes: undefined,
            },
          ],
        },
        rewardPreview: {
          ...activeQuestInput.guildTruth.rewardPreview,
          expiresAtIso: undefined,
        },
      },
    });

    expect(quest.guildTruth.progress.objectives[0]?.currentCount).toBe(0);
    expect(quest.guildTruth.progress.objectives[0]?.reasonCodes).toEqual([]);
    expect(quest.guildTruth.rewardPreview.expiresAtIso).toBeNull();
    expect(quest.systemAnnotations.recommendation).toBe("optional");
  });

  it("requires failure details for failed quests and validates progress bounds", () => {
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          status: "failed",
          progress: { ...activeQuestInput.guildTruth.progress, status: "failed" },
        },
      }),
    ).toThrow("failed guild quests must include failure details");

    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          progress: {
            ...activeQuestInput.guildTruth.progress,
            objectives: [
              {
                ...activeQuestInput.guildTruth.progress.objectives[0],
                currentCount: 3,
              },
            ],
          },
        },
      }),
    ).toThrow("currentCount must be less than or equal to targetCount");

    const failed = createAiGameGuildQuest({
      ...activeQuestInput,
      guildTruth: {
        ...activeQuestInput.guildTruth,
        status: "failed",
        progress: { ...activeQuestInput.guildTruth.progress, status: "failed" },
        failure: {
          failureId: "failure-1",
          code: "missed-deadline",
          summary: "The guild deadline elapsed.",
          failedAtIso: "2026-07-11T14:00:00.000Z",
          retryable: true,
          consequenceReasonCodes: ["reoffer-requires-guild-review"],
        },
      },
    });
    expect(failed.guildTruth.failure?.retryable).toBe(true);
  });

  it("fails closed for invalid identifiers, states, timestamps, and duplicates", () => {
    expect(() =>
      createAiGameGuildQuest({ ...activeQuestInput, questId: " " }),
    ).toThrow("questId must be a non-empty string");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: { ...activeQuestInput.guildTruth, authorityRevision: 0 },
      }),
    ).toThrow("authorityRevision must be a positive integer");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          progress: {
            ...activeQuestInput.guildTruth.progress,
            updatedAtIso: "not-a-timestamp",
          },
        },
      }),
    ).toThrow("updatedAtIso must be an ISO-8601 timestamp");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          progress: {
            ...activeQuestInput.guildTruth.progress,
            objectives: [
              {
                ...activeQuestInput.guildTruth.progress.objectives[0],
                currentCount: -1,
              },
            ],
          },
        },
      }),
    ).toThrow("currentCount must be a non-negative integer");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          progress: {
            ...activeQuestInput.guildTruth.progress,
            objectives: [
              {
                ...activeQuestInput.guildTruth.progress.objectives[0],
                status: "invalid" as never,
              },
            ],
          },
        },
      }),
    ).toThrow("status must be a supported guild-quest objective status");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          progress: { ...activeQuestInput.guildTruth.progress, status: "invalid" as never },
        },
      }),
    ).toThrow("status must be a supported guild-quest status");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          progress: { ...activeQuestInput.guildTruth.progress, objectives: [] },
        },
      }),
    ).toThrow("objectives must contain at least one objective");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          progress: {
            ...activeQuestInput.guildTruth.progress,
            objectives: [
              activeQuestInput.guildTruth.progress.objectives[0],
              activeQuestInput.guildTruth.progress.objectives[0],
            ],
          },
        },
      }),
    ).toThrow("objectiveIds must be unique within a quest");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          rewardPreview: {
            ...activeQuestInput.guildTruth.rewardPreview,
            entries: [
              {
                ...activeQuestInput.guildTruth.rewardPreview.entries[0],
                kind: "invalid" as never,
              },
            ],
          },
        },
      }),
    ).toThrow("kind must be a supported guild-quest reward kind");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          rewardPreview: {
            ...activeQuestInput.guildTruth.rewardPreview,
            entries: [
              activeQuestInput.guildTruth.rewardPreview.entries[0],
              activeQuestInput.guildTruth.rewardPreview.entries[0],
            ],
          },
        },
      }),
    ).toThrow("rewardIds must be unique within a reward preview");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: { ...activeQuestInput.guildTruth, status: "invalid" as never },
      }),
    ).toThrow("status must be a supported guild-quest status");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: { ...activeQuestInput.guildTruth, status: "completed" },
      }),
    ).toThrow("progress.status must match guildTruth.status");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          failure: {
            failureId: "failure-1",
            code: "manual-failure",
            summary: "Guild authority failed the quest.",
            failedAtIso: "2026-07-11T14:00:00.000Z",
            retryable: false,
          },
        },
      }),
    ).toThrow("failure details are only valid for failed guild quests");
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        systemAnnotations: { recommendation: "invalid" as never },
      }),
    ).toThrow("recommendation must be a supported System annotation");
    expect(() =>
      createAiGameGuildQuestSyncPayload({
        guildId: "guild-1",
        authorityRevision: 4,
        syncedAtIso: "2026-07-11T13:05:00.000Z",
        quests: [activeQuestInput, activeQuestInput],
      }),
    ).toThrow("questIds must be unique within a sync payload");
  });

  it("rejects malformed reward previews and inconsistent sync payloads", () => {
    expect(() =>
      createAiGameGuildQuest({
        ...activeQuestInput,
        guildTruth: {
          ...activeQuestInput.guildTruth,
          rewardPreview: {
            ...activeQuestInput.guildTruth.rewardPreview,
            claimRequirementCodes: [],
          },
        },
      }),
    ).toThrow("claimRequirementCodes must contain at least one value");

    expect(() =>
      createAiGameGuildQuestSyncPayload({
        guildId: "guild-2",
        authorityRevision: 4,
        syncedAtIso: "2026-07-11T13:05:00.000Z",
        quests: [activeQuestInput],
      }),
    ).toThrow("all quests in a sync payload must belong to guildId");

    expect(() =>
      createAiGameGuildQuestSyncPayload({
        guildId: "guild-1",
        authorityRevision: 4,
        syncedAtIso: "2026-07-11T13:05:00.000Z",
        quests: [activeQuestInput],
        removedQuestIds: ["quest-1"],
      }),
    ).toThrow("removedQuestIds cannot overlap quests");

    expect(() =>
      createAiGameGuildQuestSyncPayload({
        guildId: "guild-1",
        authorityRevision: 4,
        syncedAtIso: "2026-07-11T13:05:00.000Z",
      }),
    ).toThrow("sync payload must contain quests or removedQuestIds");
  });
});
