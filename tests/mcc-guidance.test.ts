import { describe, expect, it } from "vitest";

import {
  AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION,
  AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
  AI_GAME_MCC_GROWTH_DIRECTIONS,
  createAiGameMccFocusTarget,
  createAiGameMccGuidanceSnapshot,
  createAiGameMccReadinessState,
  createAiGameMccWarning,
  createAiGameSpellcraftAdvisory,
  createAiGameSpellcraftRecommendation,
  isAiGameMccGrowthDirection,
  isAiGameMccReadinessBand,
  isAiGameMccWarningKind,
  isAiGameMccWarningState,
  isAiGameSpellcraftRecommendationKind,
  isAiGameSpellcraftVerdict,
} from "../src/index.js";

const focusTarget = createAiGameMccFocusTarget({
  targetId: "focus-precision",
  growthDirection: "internalized",
  label: "Precision and control",
  summary: "Build reliable internal control before increasing spell burden.",
  priority: "primary",
  influenceWeight: 0.8,
  reasonCodes: ["player-declared-focus"],
});

const readiness = createAiGameMccReadinessState({
  readinessId: "readiness-1",
  band: "pressured",
  warnings: [
    createAiGameMccWarning({
      warningId: "warning-fatigue",
      kind: "fatigue",
      state: "elevated",
      summary: "Fatigue is trending upward; narrow the next commitment.",
      reasonCodes: ["fatigue-trend"],
    }),
  ],
  reasonCodes: ["bounded-readiness"],
});

const recommendation = createAiGameSpellcraftRecommendation({
  recommendationId: "recommendation-stability-drill",
  kind: "training",
  focusTargetId: focusTarget.targetId,
  title: "Run a stability drill",
  summary: "Use a short control exercise before attempting a higher-burden form.",
  readinessBand: readiness.band,
  prerequisiteCodes: ["stable-channel-control"],
  reasonCodes: ["focus-aligned"],
});

describe("MCC guidance contracts", () => {
  it("exports the inherited rollout contract and shared growth-direction vocabulary", () => {
    expect(AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.mcc-guidance.enabled",
    );
    expect(AI_GAME_MCC_GUIDANCE_CONTRACT_VERSION).toBe("1.0");
    expect(AI_GAME_MCC_GROWTH_DIRECTIONS).toEqual([
      "internalized",
      "externalized",
      "hybrid",
    ]);
    expect(isAiGameMccGrowthDirection("hybrid")).toBe(true);
    expect(isAiGameMccGrowthDirection("unknown")).toBe(false);
  });

  it("creates immutable focus targets with bounded mission influence", () => {
    expect(focusTarget).toMatchObject({
      contractVersion: "1.0",
      featureFlagId: "isekai.player-system.mcc-guidance.enabled",
      growthDirection: "internalized",
      priority: "primary",
      influenceWeight: 0.8,
    });
    expect(Object.isFrozen(focusTarget)).toBe(true);
    expect(Object.isFrozen(focusTarget.reasonCodes)).toBe(true);

    expect(() =>
      createAiGameMccFocusTarget({
        targetId: "invalid",
        growthDirection: "hybrid",
        label: "Invalid",
        summary: "Invalid",
        priority: "secondary",
        influenceWeight: 1.1,
      }),
    ).toThrow("influenceWeight must be between 0 and 1");
  });

  it("rejects unsupported focus, warning, readiness, and contract values", () => {
    expect(() =>
      createAiGameMccFocusTarget({
        ...focusTarget,
        targetId: " ",
      }),
    ).toThrow("targetId must be a non-empty string");
    expect(() =>
      createAiGameMccFocusTarget({
        ...focusTarget,
        growthDirection: "unknown" as "internalized",
      }),
    ).toThrow("growthDirection must be a supported MCC growth direction");
    expect(() =>
      createAiGameMccFocusTarget({
        ...focusTarget,
        priority: "tertiary" as "primary",
      }),
    ).toThrow("priority must be a supported MCC focus priority");
    expect(() =>
      createAiGameMccFocusTarget({
        ...focusTarget,
        contractVersion: "2.0" as "1.0",
      }),
    ).toThrow("contractVersion must be 1.0");

    expect(() =>
      createAiGameMccWarning({
        warningId: "invalid-kind",
        kind: "latency" as "thermal",
        state: "advisory",
        summary: "Invalid warning.",
      }),
    ).toThrow("kind must be a supported MCC warning kind");
    expect(() =>
      createAiGameMccWarning({
        warningId: "invalid-state",
        kind: "thermal",
        state: "clear",
        summary: "Invalid warning.",
      }),
    ).toThrow("state must be an active MCC warning state");
  });

  it("derives a bounded readiness warning state and rejects inconsistent severity", () => {
    expect(readiness).toMatchObject({
      band: "pressured",
      warningState: "elevated",
    });
    expect(Object.isFrozen(readiness)).toBe(true);
    expect(Object.isFrozen(readiness.warnings)).toBe(true);

    expect(isAiGameMccReadinessBand("stable")).toBe(true);
    expect(isAiGameMccReadinessBand("unknown")).toBe(false);
    expect(isAiGameMccWarningKind("chaos-pressure")).toBe(true);
    expect(isAiGameMccWarningKind("latency")).toBe(false);
    expect(isAiGameMccWarningState("critical")).toBe(true);
    expect(isAiGameMccWarningState("unknown")).toBe(false);

    expect(() =>
      createAiGameMccReadinessState({
        readinessId: "inconsistent",
        band: "stable",
        warningState: "clear",
        warnings: [
          createAiGameMccWarning({
            warningId: "critical-warning",
            kind: "thermal",
            state: "critical",
            summary: "Thermal pressure requires a hold.",
          }),
        ],
      }),
    ).toThrow("warningState must match the most severe warning");
  });

  it("creates advisory-only spellcraft recommendations and payloads", () => {
    const advisory = createAiGameSpellcraftAdvisory({
      advisoryId: "advisory-1",
      recommendationId: recommendation.recommendationId,
      verdict: "conditional",
      targetMode: "single-target",
      complexity: "medium",
      chaosPressure: "elevated",
      fatigueState: "strained",
      readinessBand: readiness.band,
      prerequisiteCodes: recommendation.prerequisiteCodes,
      warningCodes: readiness.warnings.map((warning) => warning.warningId),
      summary: "Narrow the target and complete the prerequisite before commitment.",
      reasonCodes: ["bounded-preview"],
    });

    expect(recommendation).toMatchObject({
      kind: "training",
      readinessBand: "pressured",
    });
    expect(advisory).toMatchObject({
      verdict: "conditional",
      commitment: "preview-only",
      authoritativeOwner: "spellcraft-system",
      featureFlagId: AI_GAME_MCC_GUIDANCE_FEATURE_FLAG_ID,
    });
    expect(Object.isFrozen(recommendation)).toBe(true);
    expect(Object.isFrozen(advisory)).toBe(true);
    expect(isAiGameSpellcraftRecommendationKind("material")).toBe(true);
    expect(isAiGameSpellcraftRecommendationKind("combat")).toBe(false);
    expect(isAiGameSpellcraftVerdict("blocked")).toBe(true);
    expect(isAiGameSpellcraftVerdict("approved")).toBe(false);
  });

  it("rejects unsupported readiness, recommendation, and advisory values", () => {
    expect(() =>
      createAiGameMccReadinessState({
        readinessId: "invalid-band",
        band: "unknown" as "stable",
        warnings: [],
      }),
    ).toThrow("band must be a supported MCC readiness band");
    expect(() =>
      createAiGameMccReadinessState({
        readinessId: "invalid-warning-state",
        band: "stable",
        warningState: "unknown" as "clear",
        warnings: [],
      }),
    ).toThrow("warningState must be a supported MCC warning state");
    expect(() =>
      createAiGameSpellcraftRecommendation({
        ...recommendation,
        kind: "combat" as "training",
      }),
    ).toThrow("kind must be a supported spellcraft recommendation kind");
    expect(() =>
      createAiGameSpellcraftRecommendation({
        ...recommendation,
        readinessBand: "unknown" as "pressured",
      }),
    ).toThrow("readinessBand must be a supported MCC readiness band");

    const advisoryInput = {
      advisoryId: "invalid-advisory",
      recommendationId: recommendation.recommendationId,
      verdict: "conditional",
      targetMode: "single-target",
      complexity: "medium",
      chaosPressure: "elevated",
      fatigueState: "strained",
      readinessBand: readiness.band,
      prerequisiteCodes: [],
      warningCodes: [],
      summary: "Advisory.",
    } as const;
    expect(() =>
      createAiGameSpellcraftAdvisory({
        ...advisoryInput,
        verdict: "approved" as "conditional",
      }),
    ).toThrow("verdict must be a supported spellcraft verdict");
    expect(() =>
      createAiGameSpellcraftAdvisory({
        ...advisoryInput,
        targetMode: "cone" as "single-target",
      }),
    ).toThrow("targetMode must be a supported spellcraft target mode");
    expect(() =>
      createAiGameSpellcraftAdvisory({
        ...advisoryInput,
        complexity: "extreme" as "medium",
      }),
    ).toThrow("complexity must be a supported spellcraft complexity");
    expect(() =>
      createAiGameSpellcraftAdvisory({
        ...advisoryInput,
        chaosPressure: "critical" as "elevated",
      }),
    ).toThrow("chaosPressure must be a supported spellcraft chaos pressure");
    expect(() =>
      createAiGameSpellcraftAdvisory({
        ...advisoryInput,
        fatigueState: "overloaded" as "strained",
      }),
    ).toThrow("fatigueState must be a supported spellcraft fatigue state");
    expect(() =>
      createAiGameSpellcraftAdvisory({
        ...advisoryInput,
        readinessBand: "unknown" as "pressured",
      }),
    ).toThrow("readinessBand must be a supported MCC readiness band");
  });

  it("builds an immutable guidance snapshot and validates focus references", () => {
    const snapshot = createAiGameMccGuidanceSnapshot({
      guidanceId: "guidance-1",
      focusTargets: [focusTarget],
      readiness,
      recommendations: [recommendation],
      advisory: createAiGameSpellcraftAdvisory({
        advisoryId: "advisory-2",
        recommendationId: recommendation.recommendationId,
        verdict: "conditional",
        targetMode: "single-target",
        complexity: "medium",
        chaosPressure: "low",
        fatigueState: "steady",
        readinessBand: readiness.band,
        prerequisiteCodes: [],
        warningCodes: [],
        summary: "Preview only.",
      }),
    });

    expect(snapshot.contractVersion).toBe("1.0");
    expect(snapshot.focusTargets[0].targetId).toBe(focusTarget.targetId);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.focusTargets)).toBe(true);
    expect(Object.isFrozen(snapshot.recommendations)).toBe(true);

    expect(() =>
      createAiGameMccGuidanceSnapshot({
        guidanceId: "missing-focus",
        focusTargets: [focusTarget],
        readiness,
        recommendations: [
          createAiGameSpellcraftRecommendation({
            ...recommendation,
            focusTargetId: "unknown-focus",
          }),
        ],
        advisory: snapshot.advisory,
      }),
    ).toThrow("focusTargetId must reference a supplied focus target");

    expect(() =>
      createAiGameMccGuidanceSnapshot({
        guidanceId: "empty-focus",
        focusTargets: [],
        readiness,
        recommendations: [recommendation],
        advisory: snapshot.advisory,
      }),
    ).toThrow("focusTargets must contain between 1 and 3 targets");
    expect(() =>
      createAiGameMccGuidanceSnapshot({
        guidanceId: "empty-recommendations",
        focusTargets: [focusTarget],
        readiness,
        recommendations: [],
        advisory: snapshot.advisory,
      }),
    ).toThrow("recommendations must contain between 1 and 5 items");
    expect(() =>
      createAiGameMccGuidanceSnapshot({
        guidanceId: "duplicate-focus",
        focusTargets: [focusTarget, focusTarget],
        readiness,
        recommendations: [recommendation],
        advisory: snapshot.advisory,
      }),
    ).toThrow("focusTargets must have unique targetId values");
    expect(() =>
      createAiGameMccGuidanceSnapshot({
        guidanceId: "missing-recommendation",
        focusTargets: [focusTarget],
        readiness,
        recommendations: [recommendation],
        advisory: {
          ...snapshot.advisory,
          recommendationId: "unknown-recommendation",
        },
      }),
    ).toThrow("advisory recommendationId must reference a supplied recommendation");
  });
});
