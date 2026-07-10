import { describe, expect, it } from "vitest";

import {
  AI_GAME_MISSIONS_CONTRACT_VERSION,
  AI_GAME_MISSIONS_FEATURE_FLAG_ID,
  assertAiGameMissionContractVersion,
  createAiGameMissionDefinition,
  createAiGameMissionObjectiveState,
  createAiGameMissionPlayerResponse,
  createAiGameMissionRewardEnvelope,
  isAiGameMissionClass,
  isAiGameMissionConfidenceBand,
  isAiGameMissionFeedbackChannel,
  isAiGameMissionObjectiveStatus,
  isAiGameMissionPlayerResponseKind,
  isAiGameMissionPreferenceDimension,
  isAiGameMissionReadinessBand,
  isAiGameMissionRepeatedSignalHandling,
  isAiGameMissionRewardCapSemantic,
  isAiGameMissionRewardKind,
  resolveAiGameMissionConfidenceBand,
} from "../src/index.js";

const objectiveState = {
  objectiveId: "objective-1",
  objectiveCode: "survive-awakening",
  label: "Reach the east gate alive",
  status: "active" as const,
  targetCount: 3,
  currentCount: 1,
  updatedAtIso: "2026-07-10T19:30:00.000Z",
  reasonCodes: ["bootstrap-guidance"],
};

const readinessContext = {
  readinessBand: "needs-prerequisites" as const,
  stageGateRefs: ["system-first-awakening"],
  reasonCodes: ["awaiting-stable-combat-loop"],
};

describe("adaptive mission contracts", () => {
  it("exports rollout metadata and guard helpers", () => {
    expect(AI_GAME_MISSIONS_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.missions.enabled",
    );
    expect(AI_GAME_MISSIONS_CONTRACT_VERSION).toBe("1.0");
    expect(isAiGameMissionClass("bootstrap")).toBe(true);
    expect(isAiGameMissionClass("epic")).toBe(false);
    expect(isAiGameMissionObjectiveStatus("completed")).toBe(true);
    expect(isAiGameMissionObjectiveStatus("queued")).toBe(false);
    expect(isAiGameMissionPlayerResponseKind("ignored")).toBe(true);
    expect(isAiGameMissionPlayerResponseKind("deferred")).toBe(false);
    expect(isAiGameMissionPreferenceDimension("social")).toBe(true);
    expect(isAiGameMissionPreferenceDimension("stealth")).toBe(false);
    expect(isAiGameMissionConfidenceBand("high")).toBe(true);
    expect(isAiGameMissionConfidenceBand("certain")).toBe(false);
    expect(isAiGameMissionRepeatedSignalHandling("cap-at-confidence")).toBe(
      true,
    );
    expect(isAiGameMissionRepeatedSignalHandling("replay")).toBe(false);
    expect(isAiGameMissionReadinessBand("institution-gated")).toBe(true);
    expect(isAiGameMissionReadinessBand("blocked")).toBe(false);
    expect(isAiGameMissionFeedbackChannel("audio")).toBe(true);
    expect(isAiGameMissionFeedbackChannel("mail")).toBe(false);
    expect(isAiGameMissionRewardKind("knowledge-unlock")).toBe(true);
    expect(isAiGameMissionRewardKind("teleport")).toBe(false);
    expect(isAiGameMissionRewardCapSemantic("hard-cap")).toBe(true);
    expect(isAiGameMissionRewardCapSemantic("infinite")).toBe(false);
    expect(resolveAiGameMissionConfidenceBand(0.1)).toBe("low");
    expect(resolveAiGameMissionConfidenceBand(0.5)).toBe("medium");
    expect(resolveAiGameMissionConfidenceBand(0.9)).toBe("high");
  });

  it("creates immutable mission definitions, bounded rewards, and player responses", () => {
    const rewardEnvelope = createAiGameMissionRewardEnvelope({
      missionId: "mission-1",
      grants: [
        {
          rewardId: "reward-currency",
          kind: "currency",
          label: "Field stipend",
          bound: {
            minimum: 10,
            maximum: 25,
            cap: 25,
            capSemantic: "hard-cap",
          },
          readinessContext,
          stageGateRefs: ["system-first-awakening"],
          cannotSkipReasonCodes: ["bounded-bootstrap-currency"],
        },
        {
          rewardId: "reward-knowledge",
          kind: "knowledge-unlock",
          label: "Herbal route note",
          bound: {
            minimum: 1,
            maximum: 1,
            cap: 1,
            capSemantic: "non-stackable",
          },
          readinessContext: {
            readinessBand: "ready",
            stageGateRefs: ["field-repetition"],
            reasonCodes: ["safe-knowledge-surface"],
          },
          stageGateRefs: ["field-repetition"],
          cannotSkipReasonCodes: ["knowledge-does-not-grant-power-tier"],
        },
        {
          rewardId: "reward-buff",
          kind: "temporary-modifier",
          label: "Calm focus blessing",
          bound: {
            minimum: 1,
            maximum: 1,
            cap: 1,
            capSemantic: "soft-cap",
          },
          readinessContext,
          stageGateRefs: ["system-first-awakening"],
          cannotSkipReasonCodes: ["temporary-modifier-expires"],
          temporaryDurationMinutes: 15,
        },
      ],
      reasonCodes: ["bounded-bootstrap-envelope"],
    });

    const definition = createAiGameMissionDefinition({
      missionId: "mission-1",
      missionCode: "bootstrap-east-gate",
      missionClass: "bootstrap",
      title: "Find the east gate",
      summary: "Use the System's first safe route to leave the crash site.",
      preferenceDimensions: ["exploration", "combat"],
      nearbyOpportunityCodes: ["east-gate-route", "field-herbs"],
      worldPressureCodes: ["low-supply", "nightfall-near"],
      readinessContext,
      objectiveStates: [objectiveState],
      rewardEnvelope,
      reasonCodes: ["bootstrap-safe", "survival-priority"],
    });

    const response = createAiGameMissionPlayerResponse({
      responseId: "response-1",
      missionId: "mission-1",
      responseKind: "pinned",
      respondedAtIso: "2026-07-10T19:31:00.000Z",
      objectiveStates: [objectiveState],
      influenceInputs: [
        {
          influenceId: "influence-1",
          missionId: "mission-1",
          preferenceDimension: "exploration",
          source: "mission-response",
          confidenceScore: 0.82,
          evidence: {
            evidenceId: "evidence-1",
            sourceId: "response-1",
            capturedAtIso: "2026-07-10T19:31:00.000Z",
            repeatedSignalCount: 2,
            reasonCodes: ["repeat-route-selection"],
          },
          repeatedSignalHandling: "cap-at-confidence",
          readinessContext,
          mccFocusInfluence: {
            targetCode: "hybrid",
            influenceWeight: 0.6,
            reasonCodes: ["balanced-caster-pressure"],
          },
          reasonCodes: ["pinning-shows-follow-through"],
        },
      ],
      reasonCodes: ["player-pinned-guidance"],
    });

    expect(rewardEnvelope).toMatchObject({
      contractVersion: "1.0",
      featureFlagId: AI_GAME_MISSIONS_FEATURE_FLAG_ID,
      progressionSafe: true,
      accelerantOnly: true,
    });
    expect(definition.feedbackChannels).toEqual(["audio", "visual"]);
    expect(definition.objectiveStates[0]?.status).toBe("active");
    expect(response.influenceInputs[0]?.confidenceBand).toBe("high");
    expect(response.influenceInputs[0]?.mccFocusInfluence?.targetCode).toBe(
      "hybrid",
    );
    expect(Object.isFrozen(definition)).toBe(true);
    expect(Object.isFrozen(definition.objectiveStates)).toBe(true);
    expect(Object.isFrozen(rewardEnvelope.grants)).toBe(true);
    expect(Object.isFrozen(response.influenceInputs)).toBe(true);
  });

  it("validates versioning, bounded rewards, channels, and objective counts", () => {
    expect(() => assertAiGameMissionContractVersion("1.0")).not.toThrow();
    expect(() => assertAiGameMissionContractVersion("2.0")).toThrow(
      "contractVersion must be 1.0",
    );

    expect(() =>
      createAiGameMissionRewardEnvelope({
        missionId: "mission-invalid",
        grants: [
          {
            rewardId: "reward-invalid",
            kind: "currency",
            label: "Broken reward",
            bound: {
              minimum: 5,
              maximum: 10,
              cap: 9,
              capSemantic: "hard-cap",
            },
            readinessContext,
            cannotSkipReasonCodes: ["still-bounded"],
          },
        ],
      }),
    ).toThrow("cap must be greater than or equal to maximum");

    expect(() =>
      createAiGameMissionDefinition({
        missionId: "mission-invalid",
        missionCode: "invalid",
        missionClass: "short-term",
        title: "Invalid mission",
        summary: "Missing one feedback channel.",
        feedbackChannels: ["audio"],
        preferenceDimensions: ["social"],
        readinessContext,
        objectiveStates: [objectiveState],
        rewardEnvelope: {
          missionId: "mission-invalid",
          grants: [
            {
              rewardId: "reward-1",
              kind: "item",
              label: "Starter satchel",
              bound: {
                minimum: 1,
                maximum: 1,
                cap: 1,
                capSemantic: "non-stackable",
              },
              readinessContext,
              cannotSkipReasonCodes: ["starter-item-only"],
            },
          ],
        },
      }),
    ).toThrow("feedbackChannels must include both audio and visual");

    expect(() =>
      createAiGameMissionObjectiveState({
        ...objectiveState,
        currentCount: 4,
      }),
    ).toThrow("currentCount must be less than or equal to targetCount");

    expect(() =>
      createAiGameMissionPlayerResponse({
        responseId: "response-invalid",
        missionId: "mission-1",
        responseKind: "deferred" as "accepted",
        respondedAtIso: "2026-07-10T19:31:00.000Z",
      }),
    ).toThrow("responseKind must be a supported mission player response kind");

    expect(() =>
      createAiGameMissionRewardEnvelope({
        missionId: "mission-invalid",
        grants: [
          {
            rewardId: "reward-temp",
            kind: "temporary-modifier",
            label: "Broken temp reward",
            bound: {
              minimum: 1,
              maximum: 1,
              cap: 1,
              capSemantic: "soft-cap",
            },
            readinessContext,
            cannotSkipReasonCodes: ["expires"],
          },
        ],
      }),
    ).toThrow(
      "temporaryDurationMinutes is required for temporary-modifier rewards",
    );
  });
});
