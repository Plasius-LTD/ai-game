import { describe, expect, it } from "vitest";

import {
  AI_GAME_ENV_PREFIX,
  AI_GAME_EVENT_CONTRACTS_FEATURE_FLAG_ID,
  AI_GAME_EVENT_INGESTION_FEATURE_FLAG_ID,
  AI_GAME_FEATURE_FLAG_ID,
  AI_GAME_FEATURE_FLAGS,
  AI_GAME_GOSSIP_LIFECYCLE_FEATURE_FLAG_ID,
  AI_GAME_GOSSIP_TOPICS_FEATURE_FLAG_ID,
  AI_GAME_INCIDENT_IMPACT_FEATURE_FLAG_ID,
  AI_GAME_PACKAGE,
  AI_GAME_PERSPECTIVE_FEATURE_FLAG_ID,
  AI_GAME_TTS_CACHE_POLICIES,
  classifyAiGameTask,
  isCanonicalWorldEvent,
  isCandidateWorldEvent,
  isGossipTopicActive,
  isGossipTopicCorrected,
  isIncidentResolved,
  normalizeIncidentImpactVector,
  packageDescriptor,
  projectTopicForAudience,
  resolveAiGamePlayerAddressText,
  resolveAiGameTaskBatch,
  type GossipPerspectiveProjection,
  type GossipTopic,
  type WorldIncidentImpactVector,
  type WorldIncidentThread,
} from "../src/index.js";

describe("@plasius/ai-game", () => {
  it("exports package and feature-flag contract", () => {
    expect(packageDescriptor.packageName).toBe(AI_GAME_PACKAGE);
    expect(packageDescriptor.featureFlagId).toBe(AI_GAME_FEATURE_FLAG_ID);
    expect(packageDescriptor.envPrefix).toBe(AI_GAME_ENV_PREFIX);
    expect(AI_GAME_FEATURE_FLAGS.workloads).toBe(AI_GAME_FEATURE_FLAG_ID);
    expect(AI_GAME_EVENT_CONTRACTS_FEATURE_FLAG_ID).toBe("ai.game.event-recorder.contracts.enabled");
    expect(AI_GAME_EVENT_INGESTION_FEATURE_FLAG_ID).toBe("ai.game.event-recorder.ingestion.enabled");
    expect(AI_GAME_INCIDENT_IMPACT_FEATURE_FLAG_ID).toBe("ai.game.event-recorder.impact.enabled");
    expect(AI_GAME_GOSSIP_TOPICS_FEATURE_FLAG_ID).toBe("ai.game.npc-gossip.topics.enabled");
    expect(AI_GAME_PERSPECTIVE_FEATURE_FLAG_ID).toBe("ai.game.npc-gossip.perspective.enabled");
    expect(AI_GAME_GOSSIP_LIFECYCLE_FEATURE_FLAG_ID).toBe("ai.game.npc-gossip.lifecycle.enabled");
  });

  it("classifies supported game task intents", () => {
    expect(classifyAiGameTask("The player move the relic to the altar")).toBe("player-action-validation");
    expect(classifyAiGameTask("summon the elder dragon near town")).toBe("npc-action");
    expect(classifyAiGameTask("The guard says hello")).toBe("npc-dialogue");
    expect(classifyAiGameTask("Rumors are spreading through the tavern")).toBe("gossip");
    expect(classifyAiGameTask("ban this faction from the region")).toBe("governance-feedback");
    expect(classifyAiGameTask("Player feedback report")).toBe("feedback");
    expect(classifyAiGameTask("   ")).toBe("unknown");
    expect(classifyAiGameTask("Calculate a harmless weather forecast")).toBe("unknown");
  });

  it("resolves task batches without removing review or block semantics", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [
        {
          taskId: "task-review",
          taskText: "summon an npc action",
        },
        {
          taskId: "task-blocked",
          taskText: "ban and seize faction property",
        },
      ],
    });

    expect(result.source).toBe("policy");
    expect(result.reviewTaskIds).toContain("task-review");
    expect(result.blockedTaskIds).toContain("task-blocked");
    expect(result.needsOperatorReview).toBe(true);
    expect(result.audit.result).toBe("deny");
  });

  it("allows system-originated review-bound work and preserves empty batches", () => {
    const systemResult = resolveAiGameTaskBatch({
      actorRole: "system",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [
        {
          taskId: "task-system",
          taskText: "npc action request",
        },
      ],
    });
    const emptyResult = resolveAiGameTaskBatch({
      actorRole: "operator",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [],
    });

    expect(systemResult.allowedTaskIds).toContain("task-system");
    expect(systemResult.needsOperatorReview).toBe(false);
    expect(emptyResult.source).toBe("policy-empty");
    expect(emptyResult.taskDecisions).toEqual([]);
  });

  it("blocks task batches when the workload flag is disabled", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "operator",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: false,
      },
      requests: [
        {
          taskId: "task-disabled",
          taskText: "say hello",
        },
      ],
    });

    expect(result.source).toBe("policy-disabled");
    expect(result.blockedTaskIds).toEqual(["task-disabled"]);
    expect(result.featureEnabled).toBe(false);
  });

  it("keeps player and account aliases out of TTS cacheable render text", () => {
    const redacted = resolveAiGamePlayerAddressText({
      playerAddressText: "Bob and Alice discuss the quest",
      playerAlias: "Alice",
      accountAlias: "Bob",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
      },
    });
    const nearCache = resolveAiGamePlayerAddressText({
      playerAddressText: "Player Alice gave the potion to Bob",
      playerAlias: "Alice",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
        [AI_GAME_FEATURE_FLAGS.ttsNearReuseEnabled]: true,
      },
    });

    expect(redacted.renderText).toContain("[PLAYER]");
    expect(redacted.renderText).toContain("[ACCOUNT]");
    expect(redacted.ttsCachePolicy).toBe("no-cache");
    expect(nearCache.ttsCachePolicy).toBe("near-cache");
    expect(nearCache.renderText).not.toContain("Alice");
  });

  it("handles empty, disabled, and exact TTS cache policies", () => {
    expect(AI_GAME_TTS_CACHE_POLICIES).toEqual(["exact-cache", "near-cache", "no-cache"]);
    expect(
      resolveAiGamePlayerAddressText({
        playerAddressText: "   ",
        featureFlags: {
          [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
        },
      }).source,
    ).toBe("policy-empty");
    expect(
      resolveAiGamePlayerAddressText({
        playerAddressText: "Aria is nearby",
        playerAlias: "Aria",
        featureFlags: {
          [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: false,
        },
      }).source,
    ).toBe("policy-disabled");
    expect(
      resolveAiGamePlayerAddressText({
        playerAddressText: "Welcome to the market",
        featureFlags: {
          [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
        },
      }).ttsCachePolicy,
    ).toBe("exact-cache");
  });

  it("classifies candidate and canonical event envelopes", () => {
    const candidate = {
      recordType: "candidate",
      eventId: "evt-1",
      eventType: "monster.spawned",
      occurredAtEpochMs: 1,
      recordedAtEpochMs: 1,
      schemaVersion: "1.0.0",
      visibility: "regional",
      location: { world: "isle", zone: "north" },
      participants: [],
      causation: { parentEventIds: [] },
      source: "sim",
      payload: {
        kind: "monster.spawned",
        eventKind: "info",
        summary: "A monster appeared.",
        monsterType: "hound",
        monsterRef: "monster-1",
      },
      tags: [],
      candidateId: "cand-1",
      submittedAtEpochMs: 1,
      submissionChannel: "system",
    } as const;
    const canonical = {
      ...candidate,
      recordType: "canonical",
      canonicalEventId: "can-1",
      approvedBy: "moderator",
      approvedAtEpochMs: 2,
    } as const;

    expect(isCandidateWorldEvent(candidate)).toBe(true);
    expect(isCanonicalWorldEvent(candidate)).toBe(false);
    expect(isCanonicalWorldEvent(canonical)).toBe(true);
  });

  it("normalizes incident impact vectors and resolves lifecycle state", () => {
    const impact: WorldIncidentImpactVector = normalizeIncidentImpactVector({
      security: 42,
      economy: 10,
      ecology: -2,
      politics: 101,
      morale: 50,
      magic: Number.NaN,
      population: 25,
    });
    const incident: WorldIncidentThread = {
      incidentId: "inc-1",
      scope: "regional",
      lifecycle: "resolved",
      causeEventRef: "evt-1",
      impact,
      openedAtEpochMs: 1,
      updatedAtEpochMs: 2,
      affectedEventRefs: [],
    };

    expect(impact.ecology).toBe(0);
    expect(impact.magic).toBe(0);
    expect(impact.politics).toBe(100);
    expect(normalizeIncidentImpactVector({}).population).toBe(0);
    expect(isIncidentResolved(incident)).toBe(true);
    expect(isIncidentResolved({ ...incident, lifecycle: "active" })).toBe(false);
  });

  it("projects gossip topics by audience and scope", () => {
    const topic: GossipTopic = {
      topicId: "gossip-1",
      status: "active",
      emittedAtEpochMs: 1,
      expiresAtEpochMs: 1_000,
      sourceLink: {
        sourceType: "event",
        sourceId: "evt-1",
      },
      sourceEventRef: "evt-1",
      payload: {
        factSummary: "Rumors spread about a warfront.",
        certainty: 0.6,
        salience: "high",
        evidenceRefs: [{ sourceType: "event", sourceId: "evt-1" }],
        speechHint: {
          sentenceTone: "formal",
          localizedHintKey: "gossip.warfront",
        },
      },
      confidenceLevel: "strong",
      audienceScope: "public",
    };
    const projection: GossipPerspectiveProjection = {
      projectionMode: "segment-level",
      audienceSegment: "public",
      locality: "north",
      faction: "merchants",
      segmentRules: [
        {
          locality: ["north"],
          factions: ["merchants", "knights"],
          relationshipScore: 1,
        },
      ],
      witnessChannels: [],
    };

    expect(isGossipTopicActive(topic, 10)).toBe(true);
    expect(isGossipTopicCorrected({ ...topic, status: "corrected" })).toBe(true);
    expect(projectTopicForAudience(topic, projection, 10).visible).toBe(true);
    expect(projectTopicForAudience({ ...topic, expiresAtEpochMs: 5 }, projection, 10)).toMatchObject({
      visible: false,
      reasons: ["inactive-or-expired-topic"],
    });
    expect(projectTopicForAudience(topic, { ...projection, faction: "rivals" }, 10)).toMatchObject({
      visible: false,
      reasons: ["audience-not-authorized"],
    });
    expect(
      projectTopicForAudience(
        { ...topic, audienceScope: "faction" },
        {
          ...projection,
          projectionMode: "npc-level",
          requestedByNpcRef: "npc-1",
          segmentRules: [{ locality: [], factions: ["merchants"], relationshipScore: 1 }],
        },
        10,
      ),
    ).toMatchObject({
      visible: true,
      reasons: ["npc-level-allowed"],
    });
  });
});
