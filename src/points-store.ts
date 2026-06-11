export const AI_GAME_POINTS_STORE_FEATURE_FLAG_ID = "isekai.player-system.points-store.enabled";

export const AI_GAME_POINTS_LEDGER_IDS = ["pp", "esp", "tis", "dis"] as const;

export type AiGamePointsLedgerId = (typeof AI_GAME_POINTS_LEDGER_IDS)[number];

export const AI_GAME_PLAYER_EVOLUTION_STAGES = ["proto-social", "social-lock"] as const;

export type AiGamePlayerEvolutionStage =
  (typeof AI_GAME_PLAYER_EVOLUTION_STAGES)[number];

export const AI_GAME_POINTS_AUTHORITY_BANDS = [
  "self",
  "frontier",
  "civic",
  "divine",
] as const;

export type AiGamePointsAuthorityBand =
  (typeof AI_GAME_POINTS_AUTHORITY_BANDS)[number];

export const AI_GAME_POINTS_AUTHORITY_SYSTEMS = [
  "player-system",
  "exploration-system",
  "territorial-influence-system",
  "divine-influence-system",
] as const;

export type AiGamePointsAuthoritySystem =
  (typeof AI_GAME_POINTS_AUTHORITY_SYSTEMS)[number];

export interface AiGamePointsAuthorityBoundary {
  readonly ledgerId: AiGamePointsLedgerId;
  readonly authorityBand: AiGamePointsAuthorityBand;
  readonly authoritySystem: AiGamePointsAuthoritySystem;
  readonly requiresWorldAuthority: boolean;
  readonly combatSafeOnly: boolean;
}

export interface AiGamePointsLedgerSnapshot {
  readonly ledgerId: AiGamePointsLedgerId;
  readonly balance: number;
  readonly earnedTotal: number;
  readonly spentTotal: number;
  readonly committedTotal: number;
  readonly asOfEpochMs?: number;
}

export interface AiGamePointsSpendAction {
  readonly actionId: string;
  readonly title: string;
  readonly cost: number;
  readonly prerequisiteCodes: readonly string[];
  readonly consequenceCodes: readonly string[];
}

export interface AiGamePointsSpendPolicy {
  readonly policyId: string;
  readonly ledgerId: AiGamePointsLedgerId;
  readonly authorityBoundary: AiGamePointsAuthorityBoundary;
  readonly actions: readonly AiGamePointsSpendAction[];
}

export interface AiGameProtoSocialDevolutionPolicy {
  readonly actionId: "return-to-slime";
  readonly ledgerId: "pp";
  readonly cost: number;
  readonly requiredEvolutionStage: "proto-social";
  readonly closesAtEvolutionStage: "social-lock";
  readonly singleUse: true;
  readonly authorityBoundary: AiGamePointsAuthorityBoundary;
  readonly prerequisiteCodes: readonly string[];
  readonly consequenceCodes: readonly string[];
}

export interface ResolveAiGameProtoSocialDevolutionEligibilityInput {
  readonly evolutionStage: AiGamePlayerEvolutionStage;
  readonly currentBalance: number;
  readonly alreadyUsed: boolean;
}

export interface AiGameProtoSocialDevolutionEligibilityResult {
  readonly available: boolean;
  readonly reasonCodes: readonly string[];
  readonly policy: AiGameProtoSocialDevolutionPolicy;
}

export interface AiGameProtoSocialDevolutionExecution {
  readonly actionId: "return-to-slime";
  readonly ledgerId: "pp";
  readonly cost: number;
  readonly authorityBoundary: AiGamePointsAuthorityBoundary;
  readonly previousEvolutionStage: "proto-social";
  readonly resultingEvolutionStage: "proto-social";
  readonly consequenceCodes: readonly string[];
}

const AI_GAME_POINTS_AUTHORITY_BOUNDARY_BY_LEDGER: Readonly<
  Record<AiGamePointsLedgerId, AiGamePointsAuthorityBoundary>
> = Object.freeze({
  pp: Object.freeze({
    ledgerId: "pp",
    authorityBand: "self",
    authoritySystem: "player-system",
    requiresWorldAuthority: false,
    combatSafeOnly: false,
  }),
  esp: Object.freeze({
    ledgerId: "esp",
    authorityBand: "frontier",
    authoritySystem: "exploration-system",
    requiresWorldAuthority: false,
    combatSafeOnly: true,
  }),
  tis: Object.freeze({
    ledgerId: "tis",
    authorityBand: "civic",
    authoritySystem: "territorial-influence-system",
    requiresWorldAuthority: true,
    combatSafeOnly: false,
  }),
  dis: Object.freeze({
    ledgerId: "dis",
    authorityBand: "divine",
    authoritySystem: "divine-influence-system",
    requiresWorldAuthority: true,
    combatSafeOnly: false,
  }),
});

const AI_GAME_DEFAULT_POINTS_SPEND_POLICIES: readonly AiGamePointsSpendPolicy[] =
  Object.freeze([
    Object.freeze({
      policyId: "pp-personal-respec",
      ledgerId: "pp",
      authorityBoundary: AI_GAME_POINTS_AUTHORITY_BOUNDARY_BY_LEDGER.pp,
      actions: Object.freeze([
        Object.freeze({
          actionId: "return-to-slime",
          title: "Return to slime",
          cost: 12,
          prerequisiteCodes: Object.freeze(["proto-social-window-open", "single-use-remaining"]),
          consequenceCodes: Object.freeze(["reset-social-form", "consume-pp-balance"]),
        }),
      ]),
    }),
    Object.freeze({
      policyId: "esp-exploration-routing",
      ledgerId: "esp",
      authorityBoundary: AI_GAME_POINTS_AUTHORITY_BOUNDARY_BY_LEDGER.esp,
      actions: Object.freeze([
        Object.freeze({
          actionId: "fast-travel-upgrade",
          title: "Unlock frontier fast travel",
          cost: 8,
          prerequisiteCodes: Object.freeze(["frontier-route-discovered", "out-of-combat-only"]),
          consequenceCodes: Object.freeze(["reduce-route-friction"]),
        }),
      ]),
    }),
    Object.freeze({
      policyId: "tis-civic-investment",
      ledgerId: "tis",
      authorityBoundary: AI_GAME_POINTS_AUTHORITY_BOUNDARY_BY_LEDGER.tis,
      actions: Object.freeze([
        Object.freeze({
          actionId: "district-favor",
          title: "Commit district influence favor",
          cost: 5,
          prerequisiteCodes: Object.freeze(["civic-authority-approval"]),
          consequenceCodes: Object.freeze(["alter-territorial-standing"]),
        }),
      ]),
    }),
    Object.freeze({
      policyId: "dis-divine-covenant",
      ledgerId: "dis",
      authorityBoundary: AI_GAME_POINTS_AUTHORITY_BOUNDARY_BY_LEDGER.dis,
      actions: Object.freeze([
        Object.freeze({
          actionId: "divine-oath",
          title: "Bind a divine covenant",
          cost: 3,
          prerequisiteCodes: Object.freeze(["divine-clearance-granted"]),
          consequenceCodes: Object.freeze(["alter-divine-standing"]),
        }),
      ]),
    }),
  ]);

const AI_GAME_PROTO_SOCIAL_DEVOLUTION_POLICY: AiGameProtoSocialDevolutionPolicy =
  Object.freeze({
    actionId: "return-to-slime",
    ledgerId: "pp",
    cost: 12,
    requiredEvolutionStage: "proto-social",
    closesAtEvolutionStage: "social-lock",
    singleUse: true,
    authorityBoundary: AI_GAME_POINTS_AUTHORITY_BOUNDARY_BY_LEDGER.pp,
    prerequisiteCodes: Object.freeze(["proto-social-window-open", "single-use-remaining"]),
    consequenceCodes: Object.freeze(["reset-social-form", "consume-pp-balance"]),
  });

function normalizeNonNegativeInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

export function isAiGamePointsLedgerId(value: string): value is AiGamePointsLedgerId {
  return (AI_GAME_POINTS_LEDGER_IDS as readonly string[]).includes(value);
}

export function isAiGamePlayerEvolutionStage(
  value: string,
): value is AiGamePlayerEvolutionStage {
  return (AI_GAME_PLAYER_EVOLUTION_STAGES as readonly string[]).includes(value);
}

export function resolveAiGamePointsAuthorityBoundary(
  ledgerId: AiGamePointsLedgerId,
): AiGamePointsAuthorityBoundary {
  return AI_GAME_POINTS_AUTHORITY_BOUNDARY_BY_LEDGER[ledgerId];
}

export function createAiGamePointsLedgerSnapshot(
  input: AiGamePointsLedgerSnapshot,
): AiGamePointsLedgerSnapshot {
  return Object.freeze({
    ledgerId: input.ledgerId,
    balance: normalizeNonNegativeInteger(input.balance),
    earnedTotal: normalizeNonNegativeInteger(input.earnedTotal),
    spentTotal: normalizeNonNegativeInteger(input.spentTotal),
    committedTotal: normalizeNonNegativeInteger(input.committedTotal),
    asOfEpochMs: input.asOfEpochMs,
  });
}

export function getDefaultAiGamePointsSpendPolicies(): readonly AiGamePointsSpendPolicy[] {
  return AI_GAME_DEFAULT_POINTS_SPEND_POLICIES;
}

export function getAiGameProtoSocialDevolutionPolicy(): AiGameProtoSocialDevolutionPolicy {
  return AI_GAME_PROTO_SOCIAL_DEVOLUTION_POLICY;
}

/**
 * Evaluate whether the one-time PP devolution action is still allowed.
 */
export function evaluateAiGameProtoSocialDevolutionEligibility(
  input: ResolveAiGameProtoSocialDevolutionEligibilityInput,
): AiGameProtoSocialDevolutionEligibilityResult {
  const reasonCodes: string[] = [];
  const policy = AI_GAME_PROTO_SOCIAL_DEVOLUTION_POLICY;
  const currentBalance = normalizeNonNegativeInteger(input.currentBalance);

  if (input.evolutionStage !== policy.requiredEvolutionStage) {
    reasonCodes.push("devolution-window-closed");
  }

  if (input.alreadyUsed) {
    reasonCodes.push("devolution-already-used");
  }

  if (currentBalance < policy.cost) {
    reasonCodes.push("insufficient-pp-balance");
  }

  if (reasonCodes.length === 0) {
    reasonCodes.push("devolution-allowed");
  }

  return Object.freeze({
    available: reasonCodes.length === 1 && reasonCodes[0] === "devolution-allowed",
    reasonCodes: Object.freeze(reasonCodes),
    policy,
  });
}
