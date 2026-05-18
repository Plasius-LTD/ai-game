export type GossipSalience = "low" | "medium" | "high" | "critical";
export type GossipConfidence = "uncertain" | "possible" | "strong" | "verified";
export type GossipTopicStatus = "active" | "corrected" | "resolved" | "stale";
export type GossipAudienceSegment = "player" | "npc" | "public";
export type GossipProjectionMode = "segment-level" | "npc-level";

export interface EventSourceLink {
  readonly sourceType: "event" | "incident";
  readonly sourceId: string;
}

export interface GossipSpeechHint {
  readonly sentenceTone: "whisper" | "formal" | "urgent";
  readonly localizedHintKey: string;
}

export interface GossipTopicPayload {
  readonly factSummary: string;
  readonly certainty: number;
  readonly salience: GossipSalience;
  readonly evidenceRefs: readonly EventSourceLink[];
  readonly speechHint: GossipSpeechHint;
}

export interface GossipTopic {
  readonly topicId: string;
  readonly status: GossipTopicStatus;
  readonly emittedAtEpochMs: number;
  readonly expiresAtEpochMs: number;
  readonly sourceLink: EventSourceLink;
  readonly sourceEventRef: string;
  readonly lineageOf?: string;
  readonly replacedBy?: string;
  readonly payload: GossipTopicPayload;
  readonly confidenceLevel: GossipConfidence;
  readonly audienceScope: "faction" | "region" | "public";
}

export interface WitnessChannel {
  readonly witnessRef: string;
  readonly seenAtEpochMs: number;
  readonly confidenceWeight: number;
}

export interface PerspectiveRule {
  readonly locality: readonly string[];
  readonly factions: readonly string[];
  readonly relationshipScore: number;
}

export interface KnowledgeSource {
  readonly sourceType: "segment" | "npc";
  readonly sourceRef: string;
  readonly relationshipToAudience?: number;
}

export interface GossipPerspectiveProjection {
  readonly projectionMode: GossipProjectionMode;
  readonly audienceSegment: GossipAudienceSegment;
  readonly requestedByNpcRef?: string;
  readonly locality: string;
  readonly faction: string;
  readonly segmentRules: readonly PerspectiveRule[];
  readonly witnessChannels: readonly WitnessChannel[];
}

export interface ProjectedGossipEnvelope {
  readonly topicId: string;
  readonly visible: boolean;
  readonly redactedPayload?: GossipTopicPayload;
  readonly reasons: readonly string[];
}

export interface GossipLifecyclePort {
  readonly topicId: string;
  load(): Promise<GossipTopic | null>;
  applyCorrection(next: GossipTopic): Promise<void>;
  markResolved(topicId: string, replacementTopicId?: string): Promise<void>;
}

export interface GossipTopicEnvelope {
  readonly topic: GossipTopic;
  readonly topics: readonly EventSourceLink[];
}

export function isGossipTopicActive(topic: GossipTopic, nowEpochMs = Date.now()): boolean {
  return topic.status === "active" && topic.expiresAtEpochMs > nowEpochMs && topic.payload.certainty >= 0.35;
}

export function isGossipTopicCorrected(topic: GossipTopic): boolean {
  return topic.status === "corrected";
}

function matchSegmentAudience(
  sourceValue: readonly string[], targetValue: readonly string[], fallback: boolean,
): boolean {
  if (sourceValue.length === 0 || targetValue.length === 0) {
    return fallback;
  }

  return sourceValue.some((value) => targetValue.includes(value));
}

export function projectTopicForAudience(
  topic: GossipTopic,
  projection: GossipPerspectiveProjection,
  nowEpochMs = Date.now(),
): ProjectedGossipEnvelope {
  if (!isGossipTopicActive(topic, nowEpochMs)) {
    return {
      topicId: topic.topicId,
      visible: false,
      reasons: ["inactive-or-expired-topic"],
    };
  }

  const hasMatchingRule = projection.segmentRules.some((rule) =>
    matchSegmentAudience(rule.locality, [projection.locality], true) &&
    matchSegmentAudience(rule.factions, [projection.faction], false)
  );

  if (!hasMatchingRule) {
    return {
      topicId: topic.topicId,
      visible: false,
      reasons: ["audience-not-authorized"],
    };
  }

  if (projection.projectionMode === "segment-level" && topic.audienceScope === "public") {
    return {
      topicId: topic.topicId,
      visible: true,
      redactedPayload: topic.payload,
      reasons: ["segment-level-allowed"],
    };
  }

  if (
    projection.projectionMode === "npc-level" &&
    projection.requestedByNpcRef &&
    topic.audienceScope !== "public" &&
    projection.requestedByNpcRef.length > 0
  ) {
    return {
      topicId: topic.topicId,
      visible: true,
      redactedPayload: topic.payload,
      reasons: ["npc-level-allowed"],
    };
  }

  return {
    topicId: topic.topicId,
    visible: false,
    reasons: ["scope-constraints"],
  };
}
