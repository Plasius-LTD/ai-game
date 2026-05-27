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

export const AI_GAME_FEATURE_FLAGS = {
  workloads: AI_GAME_FEATURE_FLAG_ID,
  ttsCacheEnabled: "ai.tts.cache.enabled",
  ttsNearReuseEnabled: "ai.tts.near-reuse.enabled",
} as const;

export type AiGameFeatureFlagKey =
  (typeof AI_GAME_FEATURE_FLAGS)[keyof typeof AI_GAME_FEATURE_FLAGS];

export type AiGameFeatureFlagSnapshot = Partial<Record<AiGameFeatureFlagKey, boolean>>;

export const AI_GAME_TASK_KINDS = [
  "player-action-validation",
  "npc-action",
  "npc-dialogue",
  "gossip",
  "governance-feedback",
  "feedback",
  "unknown",
] as const;

export type AiGameTaskKind = (typeof AI_GAME_TASK_KINDS)[number];

export const AI_GAME_TASK_RISK_CLASSES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type AiGameTaskRiskClass = (typeof AI_GAME_TASK_RISK_CLASSES)[number];

export const AI_GAME_TASK_AUTHORITY_BOUNDARIES = [
  "deterministic",
  "human-review",
  "operator-review",
  "blocked",
] as const;

export type AiGameAuthorityBoundary =
  (typeof AI_GAME_TASK_AUTHORITY_BOUNDARIES)[number];

export const AI_GAME_TASK_DECISIONS = ["allow", "operator-review", "blocked"] as const;

export type AiGameTaskDecisionResult =
  (typeof AI_GAME_TASK_DECISIONS)[number];

export const AI_GAME_TASK_RESULTS = ["allow", "defer", "deny"] as const;

export type AiGameTaskResult = (typeof AI_GAME_TASK_RESULTS)[number];

export const AI_GAME_TTS_CACHE_POLICIES = [
  "exact-cache",
  "near-cache",
  "no-cache",
] as const;

export type AiGameTtsCachePolicy =
  (typeof AI_GAME_TTS_CACHE_POLICIES)[number];

export const AI_GAME_ACTOR_ROLES = ["player", "npc", "operator", "system"] as const;

export type AiGameActorRole = (typeof AI_GAME_ACTOR_ROLES)[number];

export interface AiGameTaskRequest {
  readonly taskId: string;
  readonly taskText: string;
  readonly taskKind?: AiGameTaskKind;
}

export interface AiGameTaskDecision {
  readonly taskId: string;
  readonly taskKind: AiGameTaskKind;
  readonly riskClass: AiGameTaskRiskClass;
  readonly authorityBoundary: AiGameAuthorityBoundary;
  readonly decision: AiGameTaskDecisionResult;
  readonly needsOperatorReview: boolean;
  readonly reasonCodes: readonly string[];
}

export interface AiGamePolicyAuditBase {
  readonly policyId: string;
  readonly policyVersion: string;
  readonly correlationId: string;
  readonly requestId?: string;
  readonly actorId?: string;
  readonly actorRole: AiGameActorRole;
  readonly evaluatedAtUtc: string;
}

export interface ResolveAiGameTaskInput {
  readonly actorRole?: AiGameActorRole;
  readonly actorId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly policyId?: string;
  readonly policyVersion?: string;
  readonly featureFlags?: AiGameFeatureFlagSnapshot;
  readonly requests: readonly AiGameTaskRequest[];
  readonly reasonCodes?: readonly string[];
}

export interface AiGameTaskResolution {
  readonly requestedTasks: readonly string[];
  readonly taskDecisions: readonly AiGameTaskDecision[];
  readonly allowedTaskIds: readonly string[];
  readonly reviewTaskIds: readonly string[];
  readonly blockedTaskIds: readonly string[];
  readonly needsOperatorReview: boolean;
  readonly featureEnabled: boolean;
  readonly enabledFeatureFlags: readonly AiGameFeatureFlagKey[];
  readonly source: "policy" | "policy-disabled" | "policy-empty";
  readonly audit: AiGamePolicyAuditBase & {
    readonly result: AiGameTaskResult;
  };
}

export interface ResolveAiGamePlayerAddressInput {
  readonly playerAddressText: string;
  readonly playerAlias?: string;
  readonly accountAlias?: string;
  readonly actorRole?: AiGameActorRole;
  readonly actorId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly policyId?: string;
  readonly policyVersion?: string;
  readonly featureFlags?: AiGameFeatureFlagSnapshot;
  readonly reasonCodes?: readonly string[];
}

export interface ResolveAiGamePlayerAddressResult {
  readonly sourceText: string;
  readonly renderText: string;
  readonly ttsCachePolicy: AiGameTtsCachePolicy;
  readonly reasonCodes: readonly string[];
  readonly enabledFeatureFlags: readonly AiGameFeatureFlagKey[];
  readonly source: "policy" | "policy-disabled" | "policy-empty";
  readonly audit: AiGamePolicyAuditBase & {
    readonly cachePolicy: AiGameTtsCachePolicy;
  };
}

interface AiGameTaskProfile {
  readonly riskClass: AiGameTaskRiskClass;
  readonly authorityBoundary: AiGameAuthorityBoundary;
  readonly keywords: readonly string[];
}

const AI_GAME_TASK_PROFILE_BY_KIND: Record<AiGameTaskKind, AiGameTaskProfile> = {
  "player-action-validation": {
    riskClass: "medium",
    authorityBoundary: "human-review",
    keywords: ["move", "attack", "collect", "use", "open", "pick", "trade", "target"],
  },
  "npc-action": {
    riskClass: "high",
    authorityBoundary: "operator-review",
    keywords: ["summon", "kill", "ban", "spawn", "eject", "resurrect", "npc action", "npc-action"],
  },
  "npc-dialogue": {
    riskClass: "low",
    authorityBoundary: "deterministic",
    keywords: ["say", "says", "reply", "chat", "dialogue", "greet", "warn", "request"],
  },
  gossip: {
    riskClass: "high",
    authorityBoundary: "operator-review",
    keywords: ["rumor", "rumors", "gossip", "hearsay", "whisper", "spread", "denounce"],
  },
  "governance-feedback": {
    riskClass: "critical",
    authorityBoundary: "blocked",
    keywords: ["punish", "expel", "revoke", "ban", "forbid", "seize"],
  },
  feedback: {
    riskClass: "low",
    authorityBoundary: "operator-review",
    keywords: ["feedback", "rating", "report", "score", "review", "complaint"],
  },
  unknown: {
    riskClass: "low",
    authorityBoundary: "deterministic",
    keywords: [""],
  },
};

const AI_GAME_TASK_KEYWORD_PATTERNS: Readonly<Record<AiGameTaskKind, RegExp>> = {
  "player-action-validation": buildTaskPattern(
    AI_GAME_TASK_PROFILE_BY_KIND["player-action-validation"].keywords,
  ),
  "npc-action": buildTaskPattern(AI_GAME_TASK_PROFILE_BY_KIND["npc-action"].keywords),
  "npc-dialogue": buildTaskPattern(AI_GAME_TASK_PROFILE_BY_KIND["npc-dialogue"].keywords),
  gossip: buildTaskPattern(AI_GAME_TASK_PROFILE_BY_KIND.gossip.keywords),
  "governance-feedback": buildTaskPattern(AI_GAME_TASK_PROFILE_BY_KIND["governance-feedback"].keywords),
  feedback: buildTaskPattern(AI_GAME_TASK_PROFILE_BY_KIND.feedback.keywords),
  unknown: buildTaskPattern(AI_GAME_TASK_PROFILE_BY_KIND.unknown.keywords),
};

function nowIsoString(): string {
  return new Date().toISOString();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeToken(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function buildTaskPattern(keywords: readonly string[]): RegExp {
  return new RegExp(
    keywords.filter((keyword) => keyword.length > 0).map((keyword) => `\\b${escapeRegExp(keyword)}\\b`).join("|") || "^$",
    "i",
  );
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.length > 0)));
}

function isFeatureEnabled(
  featureFlag: AiGameFeatureFlagKey,
  snapshot: AiGameFeatureFlagSnapshot = {},
): boolean {
  return snapshot[featureFlag] === true;
}

function normalizeTaskText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isActorRole(role?: AiGameActorRole): AiGameActorRole {
  return role ?? "player";
}

function normalizeTaskKind(taskKind?: AiGameTaskKind): AiGameTaskKind | undefined {
  if (!taskKind) {
    return undefined;
  }

  return (AI_GAME_TASK_KINDS as readonly string[]).includes(taskKind)
    ? taskKind
    : "unknown";
}

export function classifyAiGameTask(taskText: string): AiGameTaskKind {
  const normalized = normalizeTaskText(taskText);

  if (!normalized) {
    return "unknown";
  }

  for (const taskKind of AI_GAME_TASK_KINDS) {
    if (AI_GAME_TASK_KEYWORD_PATTERNS[taskKind].test(normalized)) {
      return taskKind;
    }
  }

  return "unknown";
}

function resolveTaskAuthority(taskKind: AiGameTaskKind): AiGameTaskProfile {
  return AI_GAME_TASK_PROFILE_BY_KIND[taskKind];
}

function resolveTaskDecision(
  taskKind: AiGameTaskKind,
  profile: AiGameTaskProfile,
  actorRole: AiGameActorRole,
): Omit<AiGameTaskDecision, "taskId" | "taskKind" | "riskClass" | "authorityBoundary" | "reasonCodes"> {
  if (profile.authorityBoundary === "blocked") {
    return {
      decision: "blocked",
      needsOperatorReview: actorRole !== "system",
    };
  }

  if (profile.authorityBoundary === "deterministic") {
    return {
      decision: "allow",
      needsOperatorReview: false,
    };
  }

  if (actorRole === "system") {
    return {
      decision: "allow",
      needsOperatorReview: false,
    };
  }

  return {
    decision: "operator-review",
    needsOperatorReview: true,
  };
}

function buildRequestIds(requests: readonly AiGameTaskRequest[]): string[] {
  return uniqueStrings(requests.map((request) => request.taskId.trim()).filter(Boolean));
}

/**
 * Resolve game AI task contracts for player actions, NPC actions, gossip, and governance.
 */
export function resolveAiGameTaskBatch(
  input: ResolveAiGameTaskInput,
): AiGameTaskResolution {
  const actorRole = isActorRole(input.actorRole);
  const featureEnabled = isFeatureEnabled(
    AI_GAME_FEATURE_FLAGS.workloads,
    input.featureFlags,
  );
  const reasonCodes = [...(input.reasonCodes ?? [])];
  type ResolvedAiGameTaskRequest = AiGameTaskRequest & { taskKind: AiGameTaskKind };
  const requests: ResolvedAiGameTaskRequest[] = input.requests.map((request): ResolvedAiGameTaskRequest => ({
    ...request,
    taskKind: normalizeTaskKind(request.taskKind) ?? classifyAiGameTask(request.taskText),
  }));

  if (!featureEnabled) {
    reasonCodes.push("game-feature-disabled");
    const requestIds = buildRequestIds(requests);

    return {
      requestedTasks: requestIds,
      taskDecisions: Object.freeze(
        requestIds.map<AiGameTaskDecision>((taskId) => ({
          taskId,
          taskKind: "unknown",
          riskClass: "critical",
          authorityBoundary: "blocked",
          decision: "blocked",
          needsOperatorReview: false,
          reasonCodes: ["feature-disabled"],
        })),
      ),
      allowedTaskIds: Object.freeze([] as const),
      reviewTaskIds: Object.freeze([] as const),
      blockedTaskIds: Object.freeze(requestIds),
      needsOperatorReview: false,
      featureEnabled,
      enabledFeatureFlags: [],
      source: "policy-disabled",
      audit: {
        policyId: input.policyId ?? "game-task-policy-v1",
        policyVersion: input.policyVersion ?? "2026-05-01",
        correlationId: input.correlationId ?? crypto.randomUUID(),
        requestId: input.requestId,
        actorId: input.actorId,
        actorRole,
        evaluatedAtUtc: nowIsoString(),
        result: "deny",
      },
    };
  }

  if (requests.length === 0) {
    reasonCodes.push("game-task-empty-request");

    return {
      requestedTasks: Object.freeze([] as const),
      taskDecisions: Object.freeze([] as const),
      allowedTaskIds: Object.freeze([] as const),
      reviewTaskIds: Object.freeze([] as const),
      blockedTaskIds: Object.freeze([] as const),
      needsOperatorReview: false,
      featureEnabled,
      enabledFeatureFlags: [AI_GAME_FEATURE_FLAGS.workloads],
      source: "policy-empty",
      audit: {
        policyId: input.policyId ?? "game-task-policy-v1",
        policyVersion: input.policyVersion ?? "2026-05-01",
        correlationId: input.correlationId ?? crypto.randomUUID(),
        requestId: input.requestId,
        actorId: input.actorId,
        actorRole,
        evaluatedAtUtc: nowIsoString(),
        result: "allow",
      },
    };
  }
  const taskDecisions: AiGameTaskDecision[] = [];
  for (const request of requests) {
    const taskKind: AiGameTaskKind = request.taskKind;
    const profile = resolveTaskAuthority(taskKind);
    const decision: Omit<
      AiGameTaskDecision,
      "taskId" | "taskKind" | "riskClass" | "authorityBoundary" | "reasonCodes"
    > = resolveTaskDecision(taskKind, profile, actorRole);

    taskDecisions.push({
      taskId: request.taskId,
      taskKind,
      riskClass: profile.riskClass,
      authorityBoundary: profile.authorityBoundary,
      ...decision,
      reasonCodes: [`task-${taskKind}-${decision.decision}`],
    });
  }

  const allowedTaskIds: string[] = [];
  const reviewTaskIds: string[] = [];
  const blockedTaskIds: string[] = [];

  for (const decision of taskDecisions) {
    if (decision.decision === "allow") {
      allowedTaskIds.push(decision.taskId);
    } else if (decision.decision === "operator-review") {
      reviewTaskIds.push(decision.taskId);
    } else {
      blockedTaskIds.push(decision.taskId);
    }

    reasonCodes.push(...decision.reasonCodes);
  }

  const hasBlockedTasks = blockedTaskIds.length > 0;
  const needsOperatorReview = taskDecisions.some((decision) => decision.needsOperatorReview);

  return {
    requestedTasks: Object.freeze(buildRequestIds(requests)),
    taskDecisions: Object.freeze(taskDecisions),
    allowedTaskIds: Object.freeze(uniqueStrings(allowedTaskIds)),
    reviewTaskIds: Object.freeze(uniqueStrings(reviewTaskIds)),
    blockedTaskIds: Object.freeze(uniqueStrings(blockedTaskIds)),
    needsOperatorReview,
    featureEnabled,
    enabledFeatureFlags: [AI_GAME_FEATURE_FLAGS.workloads],
    source: "policy",
    audit: {
      policyId: input.policyId ?? "game-task-policy-v1",
      policyVersion: input.policyVersion ?? "2026-05-01",
      correlationId: input.correlationId ?? crypto.randomUUID(),
      requestId: input.requestId,
      actorId: input.actorId,
      actorRole,
      evaluatedAtUtc: nowIsoString(),
      result: hasBlockedTasks ? "deny" : needsOperatorReview ? "defer" : "allow",
    },
  };
}

/**
 * Resolve cache policy for player-account text before speech rendering.
 */
export function resolveAiGamePlayerAddressText(
  input: ResolveAiGamePlayerAddressInput,
): ResolveAiGamePlayerAddressResult {
  const actorRole = isActorRole(input.actorRole);
  const cacheEnabled = isFeatureEnabled(
    AI_GAME_FEATURE_FLAGS.ttsCacheEnabled,
    input.featureFlags,
  );
  const sourceText = normalizeToken(input.playerAddressText);
  const reasonCodes = [...(input.reasonCodes ?? [])];

  if (!sourceText) {
    reasonCodes.push("tts-empty-text");

    return {
      sourceText,
      renderText: "",
      ttsCachePolicy: "no-cache",
      reasonCodes,
      enabledFeatureFlags: [],
      source: "policy-empty",
      audit: {
        policyId: input.policyId ?? "game-task-policy-v1",
        policyVersion: input.policyVersion ?? "2026-05-01",
        correlationId: input.correlationId ?? crypto.randomUUID(),
        requestId: input.requestId,
        actorId: input.actorId,
        actorRole,
        evaluatedAtUtc: nowIsoString(),
        cachePolicy: "no-cache",
      },
    };
  }

  const aliasEntries = [
    ...uniqueStrings([normalizeToken(input.playerAlias ?? "")])
      .filter(Boolean)
      .map((alias) => ({
        alias,
        isAccountAlias: false,
      })),
    ...uniqueStrings([normalizeToken(input.accountAlias ?? "")])
      .filter(Boolean)
      .map((alias) => ({
        alias,
        isAccountAlias: true,
      })),
  ];

  let renderText = sourceText;
  let replaced = false;

  for (const alias of aliasEntries) {
    const pattern = new RegExp(`\\b${escapeRegExp(alias.alias)}\\b`, "gi");

    if (pattern.test(renderText)) {
      renderText = renderText.replace(pattern, alias.isAccountAlias ? "[ACCOUNT]" : "[PLAYER]");
      replaced = true;
      reasonCodes.push(`tts-redacted-${alias.alias.toLowerCase()}`);
    }
  }

  const nearCacheEnabled = isFeatureEnabled(
    AI_GAME_FEATURE_FLAGS.ttsNearReuseEnabled,
    input.featureFlags,
  );

  if (!cacheEnabled) {
    reasonCodes.push("tts-cache-disabled");

    return {
      sourceText,
      renderText,
      ttsCachePolicy: "no-cache",
      reasonCodes,
      enabledFeatureFlags: [],
      source: "policy-disabled",
      audit: {
        policyId: input.policyId ?? "game-task-policy-v1",
        policyVersion: input.policyVersion ?? "2026-05-01",
        correlationId: input.correlationId ?? crypto.randomUUID(),
        requestId: input.requestId,
        actorId: input.actorId,
        actorRole,
        evaluatedAtUtc: nowIsoString(),
        cachePolicy: "no-cache",
      },
    };
  }

  const cachePolicy: AiGameTtsCachePolicy =
    !replaced
      ? "exact-cache"
      : nearCacheEnabled
        ? "near-cache"
        : "no-cache";

  if (cachePolicy === "exact-cache") {
    reasonCodes.push("tts-cache-exact");
  }

  if (cachePolicy === "near-cache") {
    reasonCodes.push("tts-cache-near");
  }

  if (cachePolicy === "no-cache") {
    reasonCodes.push("tts-cache-not-available");
  }

  return {
    sourceText,
    renderText,
    ttsCachePolicy: cachePolicy,
    reasonCodes,
    enabledFeatureFlags: Object.freeze([
      AI_GAME_FEATURE_FLAGS.workloads,
      AI_GAME_FEATURE_FLAGS.ttsCacheEnabled,
      ...(nearCacheEnabled ? [AI_GAME_FEATURE_FLAGS.ttsNearReuseEnabled] : []),
    ]),
    source: "policy",
    audit: {
      policyId: input.policyId ?? "game-task-policy-v1",
      policyVersion: input.policyVersion ?? "2026-05-01",
      correlationId: input.correlationId ?? crypto.randomUUID(),
      requestId: input.requestId,
      actorId: input.actorId,
      actorRole,
      evaluatedAtUtc: nowIsoString(),
      cachePolicy,
    },
  };
}

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
