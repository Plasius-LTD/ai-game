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
  AI_GAME_PLAYER_EVOLUTION_STAGES,
  AI_GAME_PERSPECTIVE_FEATURE_FLAG_ID,
  AI_GAME_POINTS_AUTHORITY_BANDS,
  AI_GAME_POINTS_LEDGER_IDS,
  AI_GAME_POINTS_STORE_FEATURE_FLAG_ID,
  AI_GAME_TTS_CACHE_POLICIES,
  classifyAiGameTask,
  createAiGamePointsLedgerSnapshot,
  evaluateAiGameProtoSocialDevolutionEligibility,
  getAiGameProtoSocialDevolutionPolicy,
  getDefaultAiGamePointsSpendPolicies,
  isCanonicalWorldEvent,
  isCandidateWorldEvent,
  isGossipTopicActive,
  isGossipTopicCorrected,
  isIncidentResolved,
  isAiGamePointsLedgerId,
  normalizeIncidentImpactVector,
  packageDescriptor,
  projectTopicForAudience,
  resolveAiGamePointsAuthorityBoundary,
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
    expect(AI_GAME_POINTS_STORE_FEATURE_FLAG_ID).toBe("isekai.player-system.points-store.enabled");
  });

  it("exports points-store ledger, spend-policy, and authority-boundary contracts", () => {
    expect(AI_GAME_POINTS_LEDGER_IDS).toEqual(["pp", "esp", "tis", "dis"]);
    expect(AI_GAME_POINTS_AUTHORITY_BANDS).toEqual(["self", "frontier", "civic", "divine"]);
    expect(AI_GAME_PLAYER_EVOLUTION_STAGES).toEqual(["proto-social", "social-lock"]);
    expect(isAiGamePointsLedgerId("esp")).toBe(true);
    expect(isAiGamePointsLedgerId("unknown")).toBe(false);
    expect(resolveAiGamePointsAuthorityBoundary("pp")).toMatchObject({
      ledgerId: "pp",
      authorityBand: "self",
      authoritySystem: "player-system",
      requiresWorldAuthority: false,
    });
    expect(resolveAiGamePointsAuthorityBoundary("dis")).toMatchObject({
      ledgerId: "dis",
      authorityBand: "divine",
      authoritySystem: "divine-influence-system",
      requiresWorldAuthority: true,
    });
    expect(
      getDefaultAiGamePointsSpendPolicies().map((policy) => policy.ledgerId),
    ).toEqual(["pp", "esp", "tis", "dis"]);
    expect(
      getDefaultAiGamePointsSpendPolicies().find((policy) => policy.ledgerId === "esp")
        ?.authorityBoundary,
    ).toMatchObject({
      authorityBand: "frontier",
      combatSafeOnly: true,
    });
    expect(
      createAiGamePointsLedgerSnapshot({
        ledgerId: "esp",
        balance: 11.9,
        earnedTotal: 14,
        spentTotal: -1,
        committedTotal: Number.NaN,
      }),
    ).toMatchObject({
      ledgerId: "esp",
      balance: 11,
      earnedTotal: 14,
      spentTotal: 0,
      committedTotal: 0,
    });
  });

  it("evaluates proto-social devolution eligibility deterministically", () => {
    const policy = getAiGameProtoSocialDevolutionPolicy();
    const available = evaluateAiGameProtoSocialDevolutionEligibility({
      evolutionStage: "proto-social",
      currentBalance: policy.cost,
      alreadyUsed: false,
    });
    const locked = evaluateAiGameProtoSocialDevolutionEligibility({
      evolutionStage: "social-lock",
      currentBalance: policy.cost + 5,
      alreadyUsed: false,
    });
    const exhausted = evaluateAiGameProtoSocialDevolutionEligibility({
      evolutionStage: "proto-social",
      currentBalance: policy.cost - 1,
      alreadyUsed: true,
    });

    expect(policy).toMatchObject({
      actionId: "return-to-slime",
      ledgerId: "pp",
      requiredEvolutionStage: "proto-social",
      closesAtEvolutionStage: "social-lock",
      singleUse: true,
    });
    expect(available).toEqual({
      available: true,
      reasonCodes: ["devolution-allowed"],
      policy,
    });
    expect(locked.available).toBe(false);
    expect(locked.reasonCodes).toContain("devolution-window-closed");
    expect(exhausted.available).toBe(false);
    expect(exhausted.reasonCodes).toContain("devolution-already-used");
    expect(exhausted.reasonCodes).toContain("insufficient-pp-balance");
  });

  it("classifies supported game task intents", () => {
    expect(classifyAiGameTask("The player move the relic to the altar")).toBe("player-action-validation");
    expect(classifyAiGameTask("summon the elder dragon near town")).toBe("npc-action");
    expect(classifyAiGameTask("The guard says hello")).toBe("npc-dialogue");
    expect(classifyAiGameTask("Rumors are spreading through the tavern")).toBe("gossip");
    expect(classifyAiGameTask("punish this faction for griefing")).toBe("governance-feedback");
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
          taskText: "punish and seize faction property",
        },
      ],
    });

    expect(result.source).toBe("policy");
    expect(result.reviewTaskIds).toContain("task-review");
    expect(result.blockedTaskIds).toContain("task-blocked");
    expect(result.needsOperatorReview).toBe(true);
    expect(result.audit.result).toBe("deny");

    const deterministic = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [
        {
          taskId: "task-dialogue",
          taskText: "The guard says hello",
        },
      ],
    });

    expect(deterministic.allowedTaskIds).toEqual(["task-dialogue"]);
    expect(deterministic.taskDecisions[0]?.authorityBoundary).toBe("deterministic");

    const explicitKind = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [
        {
          taskId: "task-explicit-dialogue",
          taskKind: "npc-dialogue",
          taskText: "summon the village guard",
        },
      ],
    });
    const reviewOnly = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [
        {
          taskId: "task-review-only",
          taskText: "summon an npc action",
        },
      ],
    });

    expect(explicitKind.taskDecisions[0]?.taskKind).toBe("npc-dialogue");
    expect(explicitKind.allowedTaskIds).toEqual(["task-explicit-dialogue"]);
    expect(reviewOnly.audit.result).toBe("defer");
  });

  it("falls back to unknown for malformed task kinds from decoded inputs", () => {
    const result = resolveAiGameTaskBatch({
      actorRole: "player",
      featureFlags: {
        [AI_GAME_FEATURE_FLAGS.workloads]: true,
      },
      requests: [
        {
          taskId: "task-forward-kind",
          taskKind: "future-task-kind" as never,
          taskText: "summon an npc action",
        },
      ],
    });

    expect(result.taskDecisions[0]).toMatchObject({
      taskId: "task-forward-kind",
      taskKind: "unknown",
      authorityBoundary: "deterministic",
      decision: "allow",
    });
    expect(result.allowedTaskIds).toEqual(["task-forward-kind"]);
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
    expect(
      resolveAiGamePlayerAddressText({
        playerAddressText: "A traveller arrived at the gate",
        playerAlias: "Alice",
        featureFlags: {
          [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
        },
      }).ttsCachePolicy,
    ).toBe("exact-cache");
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

    expect(
      projectTopicForAudience(
        topic,
        {
          ...projection,
          projectionMode: "npc-level",
          requestedByNpcRef: "npc-1",
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
  });
});
