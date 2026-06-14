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
  AI_GAME_QUIET_MEASURE_FEATURE_FLAG_ID,
  QUIET_MEASURE_AXES,
  QUIET_MEASURE_DERIVED_READS,
  QUIET_MEASURE_MISSION_PROBE_MODES,
  QUIET_MEASURE_MISSION_RESOLUTION_SHAPES,
  AI_GAME_TTS_CACHE_POLICIES,
  classifyAiGameTask,
  createQuietMeasureJudgmentEligibility,
  createQuietMeasureJudgmentResponse,
  isCanonicalWorldEvent,
  isCandidateWorldEvent,
  isGossipTopicActive,
  isQuietMeasureAxis,
  isQuietMeasureMissionProbeMode,
  isQuietMeasureMissionResolutionShape,
  isGossipTopicCorrected,
  isIncidentResolved,
  listQuietMeasureMissingEvidence,
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
    expect(AI_GAME_QUIET_MEASURE_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.quiet-measure.enabled",
    );
  });

  it("exports Quiet Measure axes, probe metadata, and eligibility helpers", () => {
    expect(QUIET_MEASURE_AXES).toEqual([
      "selflessness",
      "give",
      "mercy",
      "duty",
      "principle",
      "courtesy",
    ]);
    expect(QUIET_MEASURE_DERIVED_READS).toEqual([
      "nature",
      "mask",
      "veil-gap",
      "restitution",
    ]);
    expect(QUIET_MEASURE_MISSION_PROBE_MODES).toEqual([
      "clarify",
      "tempt",
      "reinforce",
    ]);
    expect(QUIET_MEASURE_MISSION_RESOLUTION_SHAPES).toEqual([
      "restorative",
      "dominant",
      "detached",
      "performative",
    ]);

    expect(isQuietMeasureAxis("mercy")).toBe(true);
    expect(isQuietMeasureAxis("alignment")).toBe(false);
    expect(isQuietMeasureMissionProbeMode("tempt")).toBe(true);
    expect(isQuietMeasureMissionProbeMode("reward")).toBe(false);
    expect(isQuietMeasureMissionResolutionShape("restorative")).toBe(true);
    expect(isQuietMeasureMissionResolutionShape("punitive")).toBe(false);

    const eligibility = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: false,
      includesCostlyPressureEvent: false,
      reasonCodes: ["awaiting-pattern"],
    });

    expect(eligibility.eligible).toBe(false);
    expect(listQuietMeasureMissingEvidence(eligibility)).toEqual([
      "private-or-low-witness-evidence",
      "costly-pressure-event",
    ]);
  });

  it("creates insufficient-evidence and verdict Judgment responses without exposing raw scores", () => {
    const insufficientRequest = {
      subjectId: "player-1",
      requestedAtUtc: "2026-06-04T11:00:00.000Z",
      requestedBy: "player",
      disclosure: "title-and-verdict-only",
    } as const;
    const insufficientEligibility = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: false,
      includesCostlyPressureEvent: false,
    });
    const insufficient = createQuietMeasureJudgmentResponse({
      request: insufficientRequest,
      eligibility: insufficientEligibility,
      reasonCodes: ["insufficient-signal"],
    });

    expect(insufficient.kind).toBe("insufficient-evidence");
    expect(insufficient.missingEvidence).toEqual([
      "private-or-low-witness-evidence",
      "costly-pressure-event",
    ]);

    const verdictRequest = {
      subjectId: "player-1",
      requestedAtUtc: "2026-06-04T11:05:00.000Z",
      requestedBy: "player",
      disclosure: "title-and-verdict-only",
    } as const;
    const verdictEligibility = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: true,
      includesCostlyPressureEvent: true,
      reasonCodes: ["earned-judgment"],
    });
    const verdict = createQuietMeasureJudgmentResponse({
      request: verdictRequest,
      eligibility: verdictEligibility,
      title: {
        titleId: "restorative-warden",
        title: "Restorative Warden",
        verdictLabel: "Mercy outweighed appetite for domination.",
        perspective: "system-truth",
        disclosure: "title-and-verdict-only",
        reasonCodes: ["verdict-restorative"],
      },
      dominantReads: [
        {
          read: "nature",
          perspective: "system-truth",
          signalBand: "present",
          confidenceBand: "high",
          reasonCodes: ["pattern-settled"],
        },
        {
          read: "restitution",
          perspective: "system-truth",
          signalBand: "dominant",
          confidenceBand: "high",
          reasonCodes: ["repair-after-harm"],
        },
      ],
      reasonCodes: ["verdict-ready"],
    });

    expect(verdict.kind).toBe("verdict");
    expect(verdict.title.title).toBe("Restorative Warden");
    expect(verdict.dominantReads).toHaveLength(2);
    expect("score" in verdict).toBe(false);
  });

  it("defaults reason codes when quiet-measure reason list is omitted", () => {
    const request = {
      subjectId: "player-2",
      requestedAtUtc: "2026-06-04T12:30:00.000Z",
      requestedBy: "player",
      disclosure: "title-and-verdict-only" as const,
    };
    const eligibility = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: false,
      includesPrivateOrLowWitnessEvidence: true,
      includesCostlyPressureEvent: true,
    });
    const response = createQuietMeasureJudgmentResponse({
      request,
      eligibility,
    });

    expect(response.kind).toBe("insufficient-evidence");
    expect(response.reasonCodes).toEqual([]);
  });

  it("defaults dominant reads to empty list when not provided", () => {
    const request = {
      subjectId: "player-3",
      requestedAtUtc: "2026-06-04T12:40:00.000Z",
      requestedBy: "operator" as const,
      disclosure: "title-and-verdict-only" as const,
    };
    const eligibility = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: true,
      includesCostlyPressureEvent: true,
    });
    const response = createQuietMeasureJudgmentResponse({
      request,
      eligibility,
      title: {
        titleId: "dominant-empty",
        title: "The Quiet Auditor",
        verdictLabel: "Measured restraint observed.",
        perspective: "system-truth",
        disclosure: "title-and-verdict-only",
        reasonCodes: ["verdict-ready"],
      },
    });

    expect(response.kind).toBe("verdict");
    expect(response.dominantReads).toEqual([]);
    expect(response.reasonCodes).toEqual([]);
  });

  it("deduplicates quiet-measure reason codes and defaults eligibility inputs", () => {
    const eligibility = createQuietMeasureJudgmentEligibility({
      reasonCodes: ["signal-noise", "signal-noise", "quiet-cadence"],
    });
    const request = {
      subjectId: "player-1",
      requestedAtUtc: "2026-06-04T12:00:00.000Z",
      requestedBy: "system" as const,
      disclosure: "title-and-verdict-only" as const,
    };

    expect(createQuietMeasureJudgmentResponse({
      request,
      eligibility,
      reasonCodes: ["signal-noise", "signal-noise", "quiet-cadence"],
    })).toMatchObject({
      kind: "insufficient-evidence",
      missingEvidence: [
        "repeated-meaningful-evidence",
        "private-or-low-witness-evidence",
        "costly-pressure-event",
      ],
      reasonCodes: ["signal-noise", "quiet-cadence"],
    });

    expect(eligibility.reasonCodes).toEqual(["signal-noise", "quiet-cadence"]);
  });

  it("derives verdict eligibility from evidence booleans", () => {
    const request = {
      subjectId: "player-2",
      requestedAtUtc: "2026-06-04T13:00:00.000Z",
      requestedBy: "system" as const,
      disclosure: "title-and-verdict-only" as const,
    };

    const tamperedEligibility = {
      ...createQuietMeasureJudgmentEligibility({
        repeatedMeaningfulEvidence: true,
        includesPrivateOrLowWitnessEvidence: false,
        includesCostlyPressureEvent: false,
      }),
      eligible: true,
    };

    const verdict = createQuietMeasureJudgmentResponse({
      request,
      eligibility: tamperedEligibility,
    });

    expect(verdict.kind).toBe("insufficient-evidence");
    expect(verdict.eligibility.eligible).toBe(false);
    expect(verdict.missingEvidence).toEqual([
      "private-or-low-witness-evidence",
      "costly-pressure-event",
    ]);
  });

  it("validates quiet-measure title input when eligibility is met", () => {
    const eligible = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: true,
      includesCostlyPressureEvent: true,
    });
    const request = {
      subjectId: "player-1",
      requestedAtUtc: "2026-06-04T12:15:00.000Z",
      requestedBy: "operator" as const,
      disclosure: "title-and-verdict-only" as const,
    };

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request,
        eligibility: eligible,
        reasonCodes: ["verdict-ready"],
      })
    ).toThrow(
      "Quiet Measure verdict responses require a title descriptor when eligibility is met.",
    );
  });

  it("rejects malformed public Quiet Measure request and title payloads", () => {
    const eligible = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: true,
      includesCostlyPressureEvent: true,
    });

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request: {
          subjectId: "   ",
          requestedAtUtc: "2026-06-04T12:15:00.000Z",
          requestedBy: "player",
          disclosure: "title-and-verdict-only",
        } as unknown as Parameters<typeof createQuietMeasureJudgmentResponse>[0]["request"],
        eligibility: eligible,
        title: {
          titleId: "restorative-warden",
          title: "Restorative Warden",
          verdictLabel: "Mercy outweighed appetite for domination.",
          perspective: "system-truth",
          disclosure: "title-and-verdict-only",
          reasonCodes: ["verdict-restorative"],
        },
      })
    ).toThrow("Quiet Measure judgment request subjectId must be a non-empty string.");

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request: {
          subjectId: "player-1",
          requestedAtUtc: "not-a-date",
          requestedBy: "player",
          disclosure: "title-and-verdict-only",
        } as unknown as Parameters<typeof createQuietMeasureJudgmentResponse>[0]["request"],
        eligibility: eligible,
        title: {
          titleId: "restorative-warden",
          title: "Restorative Warden",
          verdictLabel: "Mercy outweighed appetite for domination.",
          perspective: "system-truth",
          disclosure: "title-and-verdict-only",
          reasonCodes: ["verdict-restorative"],
        },
      })
    ).toThrow("Quiet Measure judgment request requestedAtUtc must be a valid ISO-8601 timestamp.");

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request: {
          subjectId: "player-1",
          requestedAtUtc: "2026-06-04T12:15:00.000Z",
          requestedBy: "player",
          disclosure: "full-breakdown",
        } as unknown as Parameters<typeof createQuietMeasureJudgmentResponse>[0]["request"],
        eligibility: eligible,
        title: {
          titleId: "restorative-warden",
          title: "Restorative Warden",
          verdictLabel: "Mercy outweighed appetite for domination.",
          perspective: "system-truth",
          disclosure: "title-and-verdict-only",
          reasonCodes: ["verdict-restorative"],
        },
      })
    ).toThrow(
      "Quiet Measure judgment request disclosure must be one of: title-and-verdict-only.",
    );

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request: {
          subjectId: "player-1",
          requestedAtUtc: "2026-06-04T12:15:00.000Z",
          requestedBy: "player",
          disclosure: "title-and-verdict-only",
        },
        eligibility: eligible,
        title: {
          titleId: "   ",
          title: "Restorative Warden",
          verdictLabel: "Mercy outweighed appetite for domination.",
          perspective: "system-truth",
          disclosure: "title-and-verdict-only",
          reasonCodes: ["verdict-restorative"],
        } as unknown as Parameters<typeof createQuietMeasureJudgmentResponse>[0]["title"],
      })
    ).toThrow("Quiet Measure title titleId must be a non-empty string.");

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request: {
          subjectId: "player-1",
          requestedAtUtc: "2026-06-04T12:15:00.000Z",
          requestedBy: "player",
          disclosure: "title-and-verdict-only",
        },
        eligibility: eligible,
        title: {
          titleId: "restorative-warden",
          title: "Restorative Warden",
          verdictLabel: "Mercy outweighed appetite for domination.",
          perspective: "public-opinion",
          disclosure: "title-and-verdict-only",
          reasonCodes: ["verdict-restorative"],
        } as unknown as Parameters<typeof createQuietMeasureJudgmentResponse>[0]["title"],
      })
    ).toThrow(
      "Quiet Measure title perspective must be one of: system-truth, observed-reputation.",
    );
  });

  it("rejects malformed reason-code and dominant-read payloads", () => {
    expect(() =>
      createQuietMeasureJudgmentEligibility({
        reasonCodes: ["  valid-code  ", "", { invalid: true }] as unknown as string[],
      })
    ).toThrow("Quiet Measure eligibility reasonCodes[2] must be a string.");

    const eligible = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: true,
      includesCostlyPressureEvent: true,
    });

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request: {
          subjectId: "player-1",
          requestedAtUtc: "2026-06-04T12:15:00.000Z",
          requestedBy: "player",
          disclosure: "title-and-verdict-only",
        },
        eligibility: eligible,
        title: {
          titleId: "restorative-warden",
          title: "Restorative Warden",
          verdictLabel: "Mercy outweighed appetite for domination.",
          perspective: "system-truth",
          disclosure: "title-and-verdict-only",
          reasonCodes: ["verdict-restorative"],
        },
        dominantReads: [
          {
            read: "alignment",
            perspective: "system-truth",
            signalBand: "present",
            confidenceBand: "high",
            reasonCodes: ["pattern-settled"],
          },
        ] as unknown as Parameters<typeof createQuietMeasureJudgmentResponse>[0]["dominantReads"],
      })
    ).toThrow(
      "Quiet Measure dominantReads[0] read must be one of: nature, mask, veil-gap, restitution.",
    );

    expect(() =>
      createQuietMeasureJudgmentResponse({
        request: {
          subjectId: "player-1",
          requestedAtUtc: "2026-06-04T12:15:00.000Z",
          requestedBy: "player",
          disclosure: "title-and-verdict-only",
        },
        eligibility: eligible,
        title: {
          titleId: "restorative-warden",
          title: "Restorative Warden",
          verdictLabel: "Mercy outweighed appetite for domination.",
          perspective: "system-truth",
          disclosure: "title-and-verdict-only",
          reasonCodes: ["verdict-restorative"],
        },
        dominantReads: [
          {
            read: "nature",
            perspective: "system-truth",
            signalBand: "present",
            confidenceBand: "high",
            reasonCodes: ["pattern-settled", "   "],
          },
        ] as unknown as Parameters<typeof createQuietMeasureJudgmentResponse>[0]["dominantReads"],
      })
    ).toThrow(
      "Quiet Measure dominantReads[0] reasonCodes must not contain blank strings.",
    );
  });

  it("defensively copies quiet-measure nested public payloads", () => {
    const request = {
      subjectId: "player-1",
      requestedAtUtc: "2026-06-04T11:05:00.000Z",
      requestedBy: "player" as const,
      disclosure: "title-and-verdict-only" as const,
    };
    const title = {
      titleId: "restorative-warden",
      title: "Restorative Warden",
      verdictLabel: "Mercy outweighed appetite for domination.",
      perspective: "system-truth" as const,
      disclosure: "title-and-verdict-only" as const,
      reasonCodes: ["verdict-restorative"],
    };
    const dominantReads = [
      {
        read: "nature" as const,
        perspective: "system-truth" as const,
        signalBand: "present" as const,
        confidenceBand: "high" as const,
        reasonCodes: ["pattern-settled"],
      },
    ];
    const eligibility = createQuietMeasureJudgmentEligibility({
      repeatedMeaningfulEvidence: true,
      includesPrivateOrLowWitnessEvidence: true,
      includesCostlyPressureEvent: true,
      reasonCodes: ["earned-judgment"],
    });

    const verdict = createQuietMeasureJudgmentResponse({
      request,
      eligibility,
      title,
      dominantReads,
      reasonCodes: ["verdict-ready"],
    });

    request.subjectId = "mutated-subject";
    title.title = "Mutated Title";
    title.reasonCodes.push("mutated-title-code");
    dominantReads[0].read = "mask";
    dominantReads[0].reasonCodes.push("mutated-read-code");

    expect(verdict.kind).toBe("verdict");
    if (verdict.kind !== "verdict") {
      throw new Error("expected verdict response");
    }

    expect(verdict.request.subjectId).toBe("player-1");
    expect(verdict.title.title).toBe("Restorative Warden");
    expect(verdict.title.reasonCodes).toEqual(["verdict-restorative"]);
    expect(verdict.dominantReads[0]?.read).toBe("nature");
    expect(verdict.dominantReads[0]?.reasonCodes).toEqual(["pattern-settled"]);
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
