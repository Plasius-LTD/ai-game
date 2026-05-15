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
  });
});
