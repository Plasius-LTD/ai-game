import { describe, expect, it } from "vitest";

import {
  AI_GAME_TUTORIAL_CONTRACT_VERSION,
  AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
  AI_GAME_TUTORIAL_STAGES,
  AI_GAME_TUTORIAL_TRIGGER_KINDS,
  createAiGameTutorialPrerequisite,
  createAiGameTutorialProgressionState,
  createAiGameTutorialStep,
  createAiGameTutorialTrack,
  createAiGameTutorialTrigger,
  isAiGameTutorialCompletionState,
  isAiGameTutorialPrerequisiteKind,
  isAiGameTutorialStage,
  isAiGameTutorialTriggerKind,
} from "../src/index.js";

const prerequisite = createAiGameTutorialPrerequisite({
  markerId: "school-access",
  kind: "school-access",
  label: "School access",
  satisfied: true,
  reasonCodes: ["stage-three-entry"],
});

const awakeningTrigger = createAiGameTutorialTrigger({
  triggerId: "awakening",
  kind: "awakening",
  capabilityCode: "system-invocation",
  firstUseOnly: true,
  safeInCombat: true,
  reasonCodes: ["first-contact"],
});

const firstActionTrigger = createAiGameTutorialTrigger({
  triggerId: "first-movement",
  kind: "first-action",
  capabilityCode: "movement",
  firstUseOnly: true,
  safeInCombat: true,
});

const explicitRequestTrigger = createAiGameTutorialTrigger({
  triggerId: "explicit-request",
  kind: "explicit-request",
  capabilityCode: "tutorial-replay",
  firstUseOnly: false,
  safeInCombat: false,
});

const firstStep = createAiGameTutorialStep({
  stepId: "invoke-system",
  trackId: "core-onboarding",
  stage: "stage-1",
  sequence: 1,
  title: "Invoke the System",
  summary: "Learn the first-contact System invocation.",
  capabilityCode: "system-invocation",
  triggerKinds: ["awakening"],
  prerequisiteIds: [],
  safeInCombat: true,
  replayable: true,
  reasonCodes: ["first-contact"],
});

const movementStep = createAiGameTutorialStep({
  stepId: "learn-movement",
  trackId: "core-onboarding",
  stage: "stage-1",
  sequence: 2,
  title: "Learn movement",
  summary: "Learn forward movement and turning without opening a deep pane.",
  capabilityCode: "movement",
  triggerKinds: ["first-action", "explicit-request"],
  prerequisiteIds: [],
  safeInCombat: true,
  replayable: true,
});

const progression = createAiGameTutorialProgressionState({
  trackId: "core-onboarding",
  status: "active",
  currentStepId: firstStep.stepId,
  completedStepIds: [],
  refusalCount: 0,
  replayCount: 1,
  replayable: true,
  lastTriggeredAtIso: "2026-07-11T19:00:00.000Z",
  lastReplayedAtIso: "2026-07-11T18:00:00.000Z",
  reasonCodes: ["resumed-after-request"],
});

describe("Tutorial System contracts", () => {
  it("exports the rollout flag, canonical stages, and trigger vocabulary", () => {
    expect(AI_GAME_TUTORIAL_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.tutorial.enabled",
    );
    expect(AI_GAME_TUTORIAL_CONTRACT_VERSION).toBe("1.0");
    expect(AI_GAME_TUTORIAL_STAGES).toEqual([
      "stage-1",
      "stage-2",
      "stage-3",
      "stage-4",
      "stage-5",
    ]);
    expect(AI_GAME_TUTORIAL_TRIGGER_KINDS).toEqual([
      "awakening",
      "first-action",
      "explicit-request",
      "progression-gated",
    ]);
    expect(isAiGameTutorialStage("stage-4")).toBe(true);
    expect(isAiGameTutorialStage("stage-6")).toBe(false);
    expect(isAiGameTutorialTriggerKind("progression-gated")).toBe(true);
    expect(isAiGameTutorialTriggerKind("timer")).toBe(false);
    expect(isAiGameTutorialPrerequisiteKind("academy-admission")).toBe(true);
    expect(isAiGameTutorialPrerequisiteKind("level")).toBe(false);
    expect(isAiGameTutorialCompletionState("dormant")).toBe(true);
    expect(isAiGameTutorialCompletionState("unknown")).toBe(false);
  });

  it("creates immutable prerequisite, trigger, step, and progression contracts", () => {
    expect(prerequisite).toMatchObject({
      contractVersion: "1.0",
      featureFlagId: AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
      markerId: "school-access",
      satisfied: true,
    });
    expect(awakeningTrigger).toMatchObject({
      kind: "awakening",
      firstUseOnly: true,
      safeInCombat: true,
    });
    expect(firstStep).toMatchObject({
      stage: "stage-1",
      sequence: 1,
      safeInCombat: true,
      replayable: true,
    });
    expect(progression).toMatchObject({
      status: "active",
      currentStepId: "invoke-system",
      replayCount: 1,
      replayable: true,
    });
    expect(Object.isFrozen(prerequisite)).toBe(true);
    expect(Object.isFrozen(awakeningTrigger)).toBe(true);
    expect(Object.isFrozen(firstStep)).toBe(true);
    expect(Object.isFrozen(progression)).toBe(true);
    expect(Object.isFrozen(firstStep.triggerKinds)).toBe(true);
    expect(Object.isFrozen(progression.completedStepIds)).toBe(true);
  });

  it("creates a dormant, replayable track with prerequisites and contextual triggers", () => {
    const dormantProgression = createAiGameTutorialProgressionState({
      ...progression,
      status: "dormant",
      currentStepId: null,
      completedStepIds: [firstStep.stepId, movementStep.stepId],
      replayCount: 2,
    });
    const track = createAiGameTutorialTrack({
      trackId: "core-onboarding",
      title: "Core onboarding",
      summary: "Foregrounded first contact that becomes dormant after completion.",
      steps: [firstStep, movementStep],
      prerequisites: [prerequisite],
      triggers: [awakeningTrigger, firstActionTrigger, explicitRequestTrigger],
      progression: dormantProgression,
      reasonCodes: ["adr-0065", "tdr-0033"],
    });

    expect(track).toMatchObject({
      trackId: "core-onboarding",
      featureFlagId: AI_GAME_TUTORIAL_FEATURE_FLAG_ID,
      progression: { status: "dormant", replayCount: 2 },
    });
    expect(track.steps).toHaveLength(2);
    expect(track.prerequisites[0].markerId).toBe("school-access");
    expect(track.triggers.map((trigger) => trigger.kind)).toEqual([
      "awakening",
      "first-action",
      "explicit-request",
    ]);
    expect(Object.isFrozen(track)).toBe(true);
    expect(Object.isFrozen(track.steps)).toBe(true);
    expect(Object.isFrozen(track.prerequisites)).toBe(true);
    expect(Object.isFrozen(track.triggers)).toBe(true);
  });

  it("rejects unsupported values and malformed replay metadata", () => {
    expect(() =>
      createAiGameTutorialPrerequisite({
        ...prerequisite,
        markerId: " ",
      }),
    ).toThrow("markerId must be a non-empty string");
    expect(() =>
      createAiGameTutorialPrerequisite({
        markerId: "invalid",
        kind: "level" as "school-access",
        label: "Invalid",
        satisfied: true,
      }),
    ).toThrow("kind must be a supported tutorial prerequisite kind");
    expect(() =>
      createAiGameTutorialTrigger({
        triggerId: "invalid",
        kind: "timer" as "awakening",
        capabilityCode: "movement",
        firstUseOnly: false,
        safeInCombat: true,
      }),
    ).toThrow("kind must be a supported tutorial trigger kind");
    expect(() =>
      createAiGameTutorialStep({
        ...firstStep,
        stage: "stage-6" as "stage-1",
      }),
    ).toThrow("stage must be a supported tutorial stage");
    expect(() =>
      createAiGameTutorialStep({
        ...firstStep,
        sequence: 0,
      }),
    ).toThrow("sequence must be a positive integer");
    expect(() =>
      createAiGameTutorialStep({
        ...firstStep,
        triggerKinds: [],
      }),
    ).toThrow("triggerKinds must contain at least one trigger kind");
    expect(() =>
      createAiGameTutorialStep({
        ...firstStep,
        triggerKinds: ["timer" as "awakening"],
      }),
    ).toThrow("triggerKinds must use supported tutorial trigger kinds");
    expect(() =>
      createAiGameTutorialProgressionState({
        ...progression,
        status: "unknown" as "active",
      }),
    ).toThrow("status must be a supported tutorial completion state");
    expect(() =>
      createAiGameTutorialProgressionState({
        ...progression,
        lastTriggeredAtIso: "not-a-date",
      }),
    ).toThrow("lastTriggeredAtIso must be an ISO-8601 timestamp");
    expect(() =>
      createAiGameTutorialProgressionState({
        ...progression,
        refusalCount: -1,
      }),
    ).toThrow("refusalCount must be a non-negative integer");
    expect(() =>
      createAiGameTutorialProgressionState({
        ...progression,
        status: "completed",
        currentStepId: firstStep.stepId,
      }),
    ).toThrow("completed tutorials cannot have a currentStepId");
  });

  it("rejects unsupported versions, missing references, duplicate IDs, and unsafe limits", () => {
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "empty-steps",
        title: "Invalid",
        summary: "Invalid",
        steps: [],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "empty-steps", currentStepId: null },
      }),
    ).toThrow("steps must contain between 1 and 20 steps");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "too-many-prerequisites",
        title: "Invalid",
        summary: "Invalid",
        steps: [firstStep],
        prerequisites: Array.from({ length: 13 }, (_, index) => ({
          ...prerequisite,
          markerId: `marker-${index}`,
        })),
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "too-many-prerequisites", currentStepId: firstStep.stepId },
      }),
    ).toThrow("prerequisites cannot contain more than 12 markers");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "empty-triggers",
        title: "Invalid",
        summary: "Invalid",
        steps: [firstStep],
        prerequisites: [],
        triggers: [],
        progression: { ...progression, trackId: "empty-triggers", currentStepId: firstStep.stepId },
      }),
    ).toThrow("triggers must contain between 1 and 8 triggers");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "too-many-triggers",
        title: "Invalid",
        summary: "Invalid",
        steps: [firstStep],
        prerequisites: [],
        triggers: Array.from({ length: 9 }, (_, index) => ({
          ...awakeningTrigger,
          triggerId: `trigger-${index}`,
        })),
        progression: { ...progression, trackId: "too-many-triggers", currentStepId: firstStep.stepId },
      }),
    ).toThrow("triggers must contain between 1 and 8 triggers");
    expect(() =>
      createAiGameTutorialStep({
        ...firstStep,
        contractVersion: "2.0" as "1.0",
      }),
    ).toThrow("contractVersion must be 1.0");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "invalid-track",
        title: "Invalid",
        summary: "Invalid",
        steps: [
          createAiGameTutorialStep({
            ...firstStep,
            trackId: "invalid-track",
            prerequisiteIds: ["missing-prerequisite"],
          }),
        ],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "invalid-track" },
      }),
    ).toThrow("prerequisiteIds must reference supplied prerequisites");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "missing-trigger",
        title: "Invalid",
        summary: "Invalid",
        steps: [
          createAiGameTutorialStep({
            ...movementStep,
            trackId: "missing-trigger",
          }),
        ],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "missing-trigger", currentStepId: movementStep.stepId },
      }),
    ).toThrow("triggerKinds must reference supplied triggers");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "missing-step",
        title: "Invalid",
        summary: "Invalid",
        steps: [
          createAiGameTutorialStep({
            ...firstStep,
            trackId: "missing-step",
          }),
        ],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "missing-step", currentStepId: "unknown-step" },
      }),
    ).toThrow("currentStepId must reference a supplied tutorial step");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "duplicate-step",
        title: "Invalid",
        summary: "Invalid",
        steps: [
          createAiGameTutorialStep({ ...firstStep, trackId: "duplicate-step" }),
          createAiGameTutorialStep({ ...firstStep, trackId: "duplicate-step" }),
        ],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "duplicate-step", currentStepId: firstStep.stepId },
      }),
    ).toThrow("steps must have unique IDs");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "mismatched-progression",
        title: "Invalid",
        summary: "Invalid",
        steps: [
          createAiGameTutorialStep({ ...firstStep, trackId: "mismatched-progression" }),
        ],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "other-track", currentStepId: firstStep.stepId },
      }),
    ).toThrow("progression trackId must match the tutorial track");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "missing-completed-step",
        title: "Invalid",
        summary: "Invalid",
        steps: [
          createAiGameTutorialStep({ ...firstStep, trackId: "missing-completed-step" }),
        ],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: {
          ...progression,
          trackId: "missing-completed-step",
          currentStepId: null,
          completedStepIds: ["unknown-step"],
        },
      }),
    ).toThrow("completedStepIds must reference supplied tutorial steps");
    expect(() =>
      createAiGameTutorialTrack({
        trackId: "mismatched-step",
        title: "Invalid",
        summary: "Invalid",
        steps: [
          createAiGameTutorialStep({ ...firstStep, trackId: "other-track" }),
        ],
        prerequisites: [],
        triggers: [awakeningTrigger],
        progression: { ...progression, trackId: "mismatched-step", currentStepId: firstStep.stepId },
      }),
    ).toThrow("step trackId must match the tutorial track");
  });
});
