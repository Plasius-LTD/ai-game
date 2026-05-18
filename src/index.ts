export interface AiPackageDescriptor {
  readonly packageName: string;
  readonly featureFlagId: string;
  readonly envPrefix: string;
  readonly summary: string;
}

export const AI_GAME_PACKAGE = "@plasius/ai-game";
export const AI_GAME_ENV_PREFIX = "AI_GAME";
export const AI_GAME_FEATURE_FLAG_ID = "ai.game.enabled";

export const AI_GAME_EVENT_CONTRACTS_FEATURE_FLAG_ID = "ai.game.event-recorder.contracts.enabled";
export const AI_GAME_EVENT_INGESTION_FEATURE_FLAG_ID = "ai.game.event-recorder.ingestion.enabled";
export const AI_GAME_INCIDENT_IMPACT_FEATURE_FLAG_ID = "ai.game.event-recorder.impact.enabled";
export const AI_GAME_GOSSIP_TOPICS_FEATURE_FLAG_ID = "ai.game.npc-gossip.topics.enabled";
export const AI_GAME_PERSPECTIVE_FEATURE_FLAG_ID = "ai.game.npc-gossip.perspective.enabled";
export const AI_GAME_GOSSIP_LIFECYCLE_FEATURE_FLAG_ID = "ai.game.npc-gossip.lifecycle.enabled";

export const packageDescriptor: AiPackageDescriptor = Object.freeze({
  packageName: AI_GAME_PACKAGE,
  featureFlagId: AI_GAME_FEATURE_FLAG_ID,
  envPrefix: AI_GAME_ENV_PREFIX,
  summary: "Game-domain AI contracts for event recorder, canonical world-state, and NPC gossip projections.",
});

export const aiGameFeatureFlags = Object.freeze({
  contract: AI_GAME_EVENT_CONTRACTS_FEATURE_FLAG_ID,
  ingestion: AI_GAME_EVENT_INGESTION_FEATURE_FLAG_ID,
  incident: AI_GAME_INCIDENT_IMPACT_FEATURE_FLAG_ID,
  gossipTopics: AI_GAME_GOSSIP_TOPICS_FEATURE_FLAG_ID,
  gossipPerspective: AI_GAME_PERSPECTIVE_FEATURE_FLAG_ID,
  gossipLifecycle: AI_GAME_GOSSIP_LIFECYCLE_FEATURE_FLAG_ID,
});

export const gameEventFeatureFlags = Object.freeze([
  aiGameFeatureFlags.contract,
  aiGameFeatureFlags.ingestion,
  aiGameFeatureFlags.incident,
  aiGameFeatureFlags.gossipTopics,
  aiGameFeatureFlags.gossipPerspective,
  aiGameFeatureFlags.gossipLifecycle,
]);

export {
  isCanonicalWorldEvent,
  isCandidateWorldEvent,
  isIncidentResolved,
  normalizeIncidentImpactVector,
} from "./world-events.js";

export {
  isGossipTopicActive,
  isGossipTopicCorrected,
  projectTopicForAudience,
} from "./gossip.js";

export * from "./world-events.js";
export * from "./gossip.js";
