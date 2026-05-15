import { describe, expect, it } from "vitest";

import {
  AI_GAME_FEATURE_FLAGS,
  AI_GAME_FEATURE_FLAG_ID,
  AI_GAME_PACKAGE,
  AI_GAME_TTS_CACHE_POLICIES,
  AI_GAME_ENV_PREFIX,
  classifyAiGameTask,
  resolveAiGamePlayerAddressText,
  resolveAiGameTaskBatch,
  packageDescriptor,
} from "../src/index.js";

describe("@plasius/ai-game", () => {
  it("exports the package descriptor contract", () => {
    expect(packageDescriptor.packageName).toBe(AI_GAME_PACKAGE);
    expect(packageDescriptor.featureFlagId).toBe(AI_GAME_FEATURE_FLAG_ID);
    expect(packageDescriptor.envPrefix).toBe(AI_GAME_ENV_PREFIX);
    expect(packageDescriptor.summary.length).toBeGreaterThan(0);
  });

  it("declares expected feature flags", () => {
    expect(AI_GAME_FEATURE_FLAGS).toEqual({
      workloads: AI_GAME_FEATURE_FLAG_ID,
      ttsCacheEnabled: "ai.tts.cache.enabled",
      ttsNearReuseEnabled: "ai.tts.near-reuse.enabled",
    });
  });

  it("classifies player-action, npc-dialogue, and gossip task intents", () => {
    expect(classifyAiGameTask("The player move the relic to the altar")).toBe(
      "player-action-validation",
    );
    expect(classifyAiGameTask("The guard NPC says he can help"))
      .toBe("npc-dialogue");
    expect(classifyAiGameTask("Rumors are spreading through the tavern today"))
      .toBe("gossip");
  });

  it("requires operator review for high-impact npc actions by player role", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [{
        taskId: "task-1",
        taskText: "A player NPC action should summon a guard and lock the gate",
      }],
    });

    expect(result.reviewTaskIds).toContain("task-1");
    expect(result.allowedTaskIds).toHaveLength(0);
    expect(result.taskDecisions[0]?.needsOperatorReview).toBe(true);
    expect(result.taskDecisions[0]?.decision).toBe("operator-review");
    expect(result.audit.result).toBe("defer");
  });

  it("routes operator role tasks to review for high-impact tasks", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "operator",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [{
        taskId: "task-2",
        taskText: "Apply an NPC action that summons two guards",
      }],
    });

    expect(result.allowedTaskIds).toHaveLength(0);
    expect(result.reviewTaskIds).toContain("task-2");
    expect(result.audit.result).toBe("defer");
  });

  it("allows deterministic NPC dialogue tasks", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [{
        taskId: "task-3",
        taskText: "NPC says you should stay here and wait",
      }],
    });

    expect(result.allowedTaskIds).toContain("task-3");
    expect(result.reviewTaskIds).toHaveLength(0);
    expect(result.blockedTaskIds).toHaveLength(0);
  });

  it("blocks all game-task resolution when feature flag is disabled", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "player",
      requests: [
        {
          taskId: "task-4",
          taskText: "Player asks to punish an NPC",
        },
      ],
    });

    expect(result.source).toBe("policy-disabled");
    expect(result.blockedTaskIds).toContain("task-4");
    expect(result.allowedTaskIds).toHaveLength(0);
    expect(result.audit.result).toBe("deny");
  });

  it("returns a deny audit result when any enabled task is blocked", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [
        {
          taskId: "task-blocked",
          taskText: "Player asks the system to punish a faction member",
        },
        {
          taskId: "task-allowed",
          taskText: "NPC says the road is safe",
        },
      ],
    });

    expect(result.blockedTaskIds).toContain("task-blocked");
    expect(result.allowedTaskIds).toContain("task-allowed");
    expect(result.needsOperatorReview).toBe(true);
    expect(result.audit.result).toBe("deny");
  });

  it("keeps player names out of TTS render text and defaults to no-cache without near reuse", () => {
    const result = resolveAiGamePlayerAddressText({
      playerAddressText: "Welcome, Aria Valon, to the market",
      playerAlias: "Aria Valon",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
      },
    });

    expect(result.renderText).not.toContain("Aria Valon");
    expect(result.ttsCachePolicy).toBe("no-cache");
  });

  it("returns near-cache for redacted player names when near reuse is enabled", () => {
    const result = resolveAiGamePlayerAddressText({
      playerAddressText: "Player Alice gave the potion to Bob",
      playerAlias: "Alice",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
        [AI_GAME_FEATURE_FLAGS.ttsNearReuseEnabled]: true,
      },
    });

    expect(result.ttsCachePolicy).toBe("near-cache");
    expect(result.renderText).toContain("[PLAYER]");
    expect(result.renderText).not.toContain("Alice");
  });

  it("falls back to no-cache when near-cache flag is absent", () => {
    const result = resolveAiGamePlayerAddressText({
      playerAddressText: "Bob and Alice discuss the quest",
      playerAlias: "Alice",
      accountAlias: "Bob",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
      },
    });

    expect(result.ttsCachePolicy).toBe("no-cache");
    expect(result.renderText).toContain("[PLAYER]");
    expect(result.renderText).toContain("[ACCOUNT]");
  });

  it("disables tts cache policy when cache flag is off", () => {
    const result = resolveAiGamePlayerAddressText({
      playerAddressText: "Aria is nearby",
      playerAlias: "Aria",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: false,
      },
    });

    expect(result.source).toBe("policy-disabled");
    expect(result.ttsCachePolicy).toBe("no-cache");
  });

  it("exposes allowed cache policy constants", () => {
    expect(AI_GAME_TTS_CACHE_POLICIES).toEqual([
      "exact-cache",
      "near-cache",
      "no-cache",
    ]);
  });
});
