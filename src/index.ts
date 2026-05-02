export interface AiPackageDescriptor {
  readonly packageName: string;
  readonly featureFlagId: string;
  readonly envPrefix: string;
  readonly summary: string;
}

export const AI_GAME_PACKAGE = "@plasius/ai-game";
export const AI_GAME_FEATURE_FLAG_ID = "ai.game.enabled";
export const AI_GAME_ENV_PREFIX = "AI_GAME";

export const packageDescriptor: AiPackageDescriptor = Object.freeze({
  packageName: AI_GAME_PACKAGE,
  featureFlagId: AI_GAME_FEATURE_FLAG_ID,
  envPrefix: AI_GAME_ENV_PREFIX,
  summary: "Game-domain AI contracts for player action validation, NPC actions, gossip, and feedback.",
});
