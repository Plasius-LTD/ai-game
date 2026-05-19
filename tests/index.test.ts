import { describe, expect, it } from "vitest";

import {
  AI_GAME_EVENT_CONTRACTS_FEATURE_FLAG_ID,
  AI_GAME_EVENT_INGESTION_FEATURE_FLAG_ID,
  AI_GAME_GOSSIP_LIFECYCLE_FEATURE_FLAG_ID,
  AI_GAME_GOSSIP_TOPICS_FEATURE_FLAG_ID,
  AI_GAME_INCIDENT_IMPACT_FEATURE_FLAG_ID,
  AI_GAME_PERSPECTIVE_FEATURE_FLAG_ID,
  AI_GAME_FEATURE_FLAG_ID,
  AI_GAME_ENV_PREFIX,
  AI_GAME_PACKAGE,
  isCanonicalWorldEvent,
  isCandidateWorldEvent,
  isIncidentResolved,
  isGossipTopicActive,
  isGossipTopicCorrected,
  normalizeIncidentImpactVector,
  packageDescriptor,
  projectTopicForAudience,
  type WorldIncidentThread,
  type WorldIncidentImpactVector,
  type GossipTopic,
  type GossipPerspectiveProjection,
} from "../src/index.js";

describe("@plasius/ai-game", () => {
  it("exports package and feature-flag contract", () => {
    expect(packageDescriptor.packageName).toBe(AI_GAME_PACKAGE);
    expect(packageDescriptor.featureFlagId).toBe(AI_GAME_FEATURE_FLAG_ID);
    expect(packageDescriptor.envPrefix).toBe(AI_GAME_ENV_PREFIX);
    expect(packageDescriptor.summary.length).toBeGreaterThan(0);
    expect(AI_GAME_EVENT_CONTRACTS_FEATURE_FLAG_ID).toBe("ai.game.event-recorder.contracts.enabled");
    expect(AI_GAME_EVENT_INGESTION_FEATURE_FLAG_ID).toBe("ai.game.event-recorder.ingestion.enabled");
    expect(AI_GAME_INCIDENT_IMPACT_FEATURE_FLAG_ID).toBe("ai.game.event-recorder.impact.enabled");
    expect(AI_GAME_GOSSIP_TOPICS_FEATURE_FLAG_ID).toBe("ai.game.npc-gossip.topics.enabled");
    expect(AI_GAME_PERSPECTIVE_FEATURE_FLAG_ID).toBe("ai.game.npc-gossip.perspective.enabled");
    expect(AI_GAME_GOSSIP_LIFECYCLE_FEATURE_FLAG_ID).toBe("ai.game.npc-gossip.lifecycle.enabled");
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

  it("classifies empty and unknown game tasks as unknown", () => {
    expect(classifyAiGameTask("   ")).toBe("unknown");
    expect(classifyAiGameTask("Calculate a harmless weather forecast")).toBe("unknown");
  });

  it("requires operator review for high-impact npc actions by player role", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
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

    expect(impact.security).toBe(42);
    expect(impact.ecology).toBe(0);
    expect(impact.magic).toBe(0);
    expect(impact.politics).toBe(100);

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
    expect(isIncidentResolved(incident)).toBe(true);
    expect(isIncidentResolved({ ...incident, lifecycle: "expired" })).toBe(true);
    expect(isIncidentResolved({ ...incident, lifecycle: "active" })).toBe(false);
  });

  it("defaults absent incident impact dimensions to zero", () => {
    expect(normalizeIncidentImpactVector({})).toEqual({
      security: 0,
      economy: 0,
      ecology: 0,
      politics: 0,
      morale: 0,
      magic: 0,
      population: 0,
    });
  });

  it("projects topics by audience with scope gating", () => {
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

    const projected = projectTopicForAudience(topic, projection, 10);
    expect(projected.visible).toBe(true);
    expect(projected.topicId).toBe("gossip-1");
    expect(projected.redactedPayload).toBeDefined();
    expect(isGossipTopicActive(topic, 10)).toBe(true);
    expect(isGossipTopicCorrected(topic)).toBe(false);

    expect(
      projectTopicForAudience({ ...topic, expiresAtEpochMs: 5 }, projection, 10),
    ).toMatchObject({
      visible: false,
      reasons: ["inactive-or-expired-topic"],
    });

    expect(
      projectTopicForAudience(
        topic,
        {
          ...projection,
          faction: "rivals",
        },
        10,
      ),
    ).toMatchObject({
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
          segmentRules: [
            {
              locality: [],
              factions: ["merchants"],
              relationshipScore: 1,
            },
          ],
        },
        10,
      ),
    ).toMatchObject({
      visible: true,
      reasons: ["npc-level-allowed"],
    });

    expect(
      projectTopicForAudience({ ...topic, audienceScope: "faction" }, projection, 10),
    ).toMatchObject({
      visible: false,
      reasons: ["scope-constraints"],
    });

    expect(result.allowedTaskIds).toContain("task-system");
    expect(result.needsOperatorReview).toBe(false);
    expect(result.audit.result).toBe("allow");
  });

  it("returns an empty policy result for empty task batches", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "operator",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [],
    });

    expect(result.source).toBe("policy-empty");
    expect(result.requestedTasks).toEqual([]);
    expect(result.taskDecisions).toEqual([]);
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

  it("returns no-cache for empty player address text", () => {
    const result = resolveAiGamePlayerAddressText({
      playerAddressText: "   ",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
      },
    });

    expect(result.source).toBe("policy-empty");
    expect(result.reasonCodes).toContain("tts-empty-text");
    expect(result.ttsCachePolicy).toBe("no-cache");
  });

  it("uses exact-cache when enabled text contains no private aliases", () => {
    const result = resolveAiGamePlayerAddressText({
      playerAddressText: "Welcome to the market",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
      },
    });

    expect(result.ttsCachePolicy).toBe("exact-cache");
    expect(result.reasonCodes).toContain("tts-cache-exact");
  });

  it("does not redact configured aliases that are absent from render text", () => {
    const result = resolveAiGamePlayerAddressText({
      playerAddressText: "Welcome to the market",
      playerAlias: "Alice",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
      },
    });

    expect(result.renderText).toBe("Welcome to the market");
    expect(result.reasonCodes).not.toContain("tts-redacted-alice");
    expect(result.ttsCachePolicy).toBe("exact-cache");
  });

  it("exposes allowed cache policy constants", () => {
    expect(AI_GAME_TTS_CACHE_POLICIES).toEqual([
      "exact-cache",
      "near-cache",
      "no-cache",
    ]);
  });
});
