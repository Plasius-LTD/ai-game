import { describe, expect, it } from "vitest";

import {
  AI_GAME_PLAYER_SYSTEM_GUIDANCE_CUE_MAX_OCCURRENCES_PER_MINUTE,
  AI_GAME_PLAYER_SYSTEM_GUIDANCE_CUE_MAX_PAYLOAD_BYTES,
  AI_GAME_PLAYER_SYSTEM_GUIDANCE_FALLBACK_CONTRACTS,
  AI_GAME_PLAYER_SYSTEM_GUIDANCE_NFR_FEATURE_FLAG_ID,
  AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
  AI_GAME_PLAYER_SYSTEM_FEATURE_FLAG_ID,
  createAiGamePlayerSystemAlert,
  createAiGamePlayerSystemGuidanceCue,
  createAiGamePlayerSystemPreferenceConfidenceState,
  createAiGamePlayerSystemPreferenceInput,
  createAiGamePlayerSystemPreferenceProfile,
  createAiGamePlayerSystemSession,
  getAiGamePlayerSystemFocusModeContract,
  getAiGamePlayerSystemModuleContract,
  isAiGamePlayerSystemConfidenceBand,
  isAiGamePlayerSystemModule,
  resolveAiGamePlayerSystemConfidenceBand,
  selectAiGamePlayerSystemAlertsForFocusMode,
} from "../src/index.js";

const preferenceInput = createAiGamePlayerSystemPreferenceInput({
  inputId: "input-1",
  kind: "exploration",
  source: "observed",
  confidenceScore: 0.8,
  capturedAtIso: "2026-07-10T18:00:00.000Z",
  reasonCodes: ["repeated-route-selection"],
});

describe("Player System shared contracts", () => {
  it("exports guidance cue priorities, budgets, and accessible fallbacks", () => {
    expect(AI_GAME_PLAYER_SYSTEM_GUIDANCE_NFR_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.guidance-nfr.enabled",
    );
    expect(AI_GAME_PLAYER_SYSTEM_GUIDANCE_CUE_MAX_PAYLOAD_BYTES).toBe(4096);
    expect(AI_GAME_PLAYER_SYSTEM_GUIDANCE_CUE_MAX_OCCURRENCES_PER_MINUTE).toBe(30);
    expect(AI_GAME_PLAYER_SYSTEM_GUIDANCE_FALLBACK_CONTRACTS).toEqual([
      {
        id: "voice-unavailable",
        source: "voice",
        behavior: "touch-controls-and-text-summary",
      },
      {
        id: "narration-unavailable",
        source: "narration",
        behavior: "status-copy-and-live-region",
      },
      {
        id: "speech-capture-unavailable",
        source: "speech-capture",
        behavior: "manual-actions-stay-visible",
      },
    ]);
  });

  it("creates bounded guidance cues and rejects unsafe metadata", () => {
    const cue = createAiGamePlayerSystemGuidanceCue({
      cueId: "narration-alert",
      priority: "high",
      source: "narration",
      fallbackId: "narration-unavailable",
      maxPayloadBytes: 1024,
      maxOccurrencesPerMinute: 4,
    });

    expect(cue).toMatchObject({
      contractVersion: "1.0",
      featureFlagId: "isekai.player-system.guidance-nfr.enabled",
      fallbackId: "narration-unavailable",
    });
    expect(Object.isFrozen(cue)).toBe(true);

    expect(() =>
      createAiGamePlayerSystemGuidanceCue({
        cueId: "mismatched-fallback",
        priority: "normal",
        source: "voice",
        fallbackId: "narration-unavailable",
        maxPayloadBytes: 1024,
        maxOccurrencesPerMinute: 1,
      }),
    ).toThrow("fallbackId must match the guidance cue source");

    expect(() =>
      createAiGamePlayerSystemGuidanceCue({
        cueId: "oversized",
        priority: "normal",
        source: "voice",
        fallbackId: "voice-unavailable",
        maxPayloadBytes: AI_GAME_PLAYER_SYSTEM_GUIDANCE_CUE_MAX_PAYLOAD_BYTES + 1,
        maxOccurrencesPerMinute: 1,
      }),
    ).toThrow("maxPayloadBytes must be between 1 and 4096");

    expect(() =>
      createAiGamePlayerSystemGuidanceCue({
        cueId: "too-frequent",
        priority: "normal",
        source: "voice",
        fallbackId: "voice-unavailable",
        maxPayloadBytes: 1024,
        maxOccurrencesPerMinute:
          AI_GAME_PLAYER_SYSTEM_GUIDANCE_CUE_MAX_OCCURRENCES_PER_MINUTE + 1,
      }),
    ).toThrow("maxOccurrencesPerMinute must be between 1 and 30");
  });

  it("exposes the inherited feature flag and versioned focus contracts", () => {
    expect(AI_GAME_PLAYER_SYSTEM_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.core.enabled",
    );
    expect(AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION).toBe("1.0");
    expect(getAiGamePlayerSystemFocusModeContract("focused")).toMatchObject({
      contractVersion: "1.0",
      acceptsInputModalities: ["voice", "touch"],
      allowsFullNavigation: true,
    });
    expect(getAiGamePlayerSystemFocusModeContract("combat-safe")).toMatchObject({
      deliverableAlertPriorities: ["critical", "high"],
      maximumVisibleModules: 1,
    });
  });

  it("guards module values and derives bounded preference confidence", () => {
    expect(isAiGamePlayerSystemModule("missions")).toBe(true);
    expect(isAiGamePlayerSystemModule("unknown")).toBe(false);
    expect(isAiGamePlayerSystemConfidenceBand("unknown")).toBe(false);
    expect(getAiGamePlayerSystemModuleContract("identity").module).toBe("identity");
    expect(resolveAiGamePlayerSystemConfidenceBand(0.1)).toBe("low");
    expect(resolveAiGamePlayerSystemConfidenceBand(0.5)).toBe("medium");
    expect(resolveAiGamePlayerSystemConfidenceBand(0.9)).toBe("high");
    expect(
      createAiGamePlayerSystemPreferenceInput({
        inputId: "input-without-reasons",
        kind: "social",
        source: "explicit",
        confidenceScore: 0.5,
        capturedAtIso: "2026-07-10T18:00:00.000Z",
      }).reasonCodes,
    ).toEqual([]);
  });

  it("creates privacy-safe immutable preference profiles", () => {
    const profile = createAiGamePlayerSystemPreferenceProfile({
      profileId: "profile-1",
      inputs: [preferenceInput],
      confidence: {
        confidenceScore: 0.8,
        sampleCount: 1,
        lastUpdatedAtIso: "2026-07-10T18:00:00.000Z",
      },
    });

    expect(profile.confidence).toMatchObject({
      confidenceScore: 0.8,
      confidenceBand: "high",
      sampleCount: 1,
    });
    expect(Object.isFrozen(profile)).toBe(true);
    expect(Object.isFrozen(profile.inputs)).toBe(true);
    expect(Object.isFrozen(profile.inputs[0])).toBe(true);
    expect(Object.isFrozen(profile.inputs[0].reasonCodes)).toBe(true);
  });

  it("creates session/module state and keeps both input modalities in focused mode", () => {
    const profile = createAiGamePlayerSystemPreferenceProfile({
      profileId: "profile-2",
      inputs: [preferenceInput],
      confidence: {
        confidenceScore: 0.8,
        sampleCount: 1,
        lastUpdatedAtIso: "2026-07-10T18:00:00.000Z",
      },
    });
    const session = createAiGamePlayerSystemSession({
      sessionId: "session-1",
      focusMode: "focused",
      activeModule: "missions",
      modules: [
        {
          contractVersion: "1.0",
          module: "missions",
          requiresFocusedMode: true,
          availableInCombatSafeMode: false,
          supportedInputModalities: ["voice", "touch"],
        },
      ],
      preferenceProfile: profile,
    });

    expect(session.featureFlagId).toBe(AI_GAME_PLAYER_SYSTEM_FEATURE_FLAG_ID);
    expect(session.acceptedInputModalities).toEqual(["voice", "touch"]);
    expect(session.activeModule).toBe("missions");
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.modules)).toBe(true);
    expect(Object.isFrozen(session.modules[0])).toBe(true);
  });

  it("creates a minimal ambient session when no visible modules are supplied", () => {
    const session = createAiGamePlayerSystemSession({
      sessionId: "session-ambient",
      focusMode: "ambient",
      preferenceProfile: createAiGamePlayerSystemPreferenceProfile({
        profileId: "profile-ambient",
      }),
    });

    expect(session.modules.map((moduleContract) => moduleContract.module)).toEqual([
      "identity",
    ]);
    expect(session.acceptedInputModalities).toEqual([]);
  });

  it("preserves critical and high alerts while reducing combat-safe delivery", () => {
    const alerts = [
      createAiGamePlayerSystemAlert({
        alertId: "alert-critical",
        priority: "critical",
        sourceModule: "identity",
        title: "Incoming attack",
        message: "A hostile target is approaching.",
        createdAtIso: "2026-07-10T18:00:00.000Z",
      }),
      createAiGamePlayerSystemAlert({
        alertId: "alert-normal",
        priority: "normal",
        sourceModule: "missions",
        title: "Mission update",
        message: "A new optional mission is available.",
        createdAtIso: "2026-07-10T18:01:00.000Z",
      }),
    ];

    expect(selectAiGamePlayerSystemAlertsForFocusMode(alerts, "combat-safe")).toHaveLength(1);
    expect(selectAiGamePlayerSystemAlertsForFocusMode(alerts, "combat-safe")[0].priority).toBe(
      "critical",
    );
  });

  it("rejects invalid confidence, timestamps, and unsafe combat-safe modules", () => {
    expect(() =>
      createAiGamePlayerSystemAlert({
        alertId: "",
        priority: "high",
        sourceModule: "identity",
        title: "Alert",
        message: "Message",
        createdAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("alertId must be a non-empty string");

    expect(() =>
      createAiGamePlayerSystemPreferenceInput({
        inputId: "invalid",
        kind: "combat",
        source: "explicit",
        confidenceScore: 1.1,
        capturedAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("confidenceScore must be between 0 and 1");

    expect(() =>
      createAiGamePlayerSystemPreferenceInput({
        inputId: "invalid-kind",
        kind: "unknown" as "combat",
        source: "explicit",
        confidenceScore: 0.5,
        capturedAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("kind must be a supported Player System preference kind");

    expect(() =>
      createAiGamePlayerSystemPreferenceInput({
        inputId: "invalid-source",
        kind: "combat",
        source: "telemetry" as "explicit",
        confidenceScore: 0.5,
        capturedAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("source must be a supported Player System preference source");

    expect(() =>
      createAiGamePlayerSystemPreferenceConfidenceState({
        confidenceScore: 0.5,
        sampleCount: -1,
        lastUpdatedAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("sampleCount must be a non-negative integer");

    expect(() =>
      createAiGamePlayerSystemPreferenceConfidenceState({
        confidenceScore: 0.8,
        confidenceBand: "low",
        sampleCount: 1,
        lastUpdatedAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("confidenceBand must match confidenceScore");

    expect(
      createAiGamePlayerSystemPreferenceProfile({
        profileId: "profile-average",
        inputs: [preferenceInput],
      }).confidence.confidenceScore,
    ).toBe(0.8);

    expect(() =>
      createAiGamePlayerSystemAlert({
        alertId: "invalid",
        priority: "high",
        sourceModule: "identity",
        title: "Alert",
        message: "Message",
        createdAtIso: "not-a-date",
      }),
    ).toThrow("createdAtIso must be an ISO-8601 timestamp");

    expect(() =>
      createAiGamePlayerSystemAlert({
        alertId: "invalid-priority",
        priority: "urgent" as "high",
        sourceModule: "identity",
        title: "Alert",
        message: "Message",
        createdAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("priority must be a supported Player System alert priority");

    expect(() =>
      createAiGamePlayerSystemAlert({
        alertId: "invalid-source-module",
        priority: "high",
        sourceModule: "unknown" as "identity",
        title: "Alert",
        message: "Message",
        createdAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("sourceModule must be a supported Player System module");

    expect(() =>
      createAiGamePlayerSystemAlert({
        alertId: "unsupported-version",
        contractVersion: "2.0" as "1.0",
        priority: "high",
        sourceModule: "identity",
        title: "Alert",
        message: "Message",
        createdAtIso: "2026-07-10T18:00:00.000Z",
      }),
    ).toThrow("contractVersion must be 1.0");

    const profile = createAiGamePlayerSystemPreferenceProfile({ profileId: "profile-3" });
    const alert = createAiGamePlayerSystemAlert({
      alertId: "pending",
      priority: "high",
      sourceModule: "identity",
      title: "Alert",
      message: "Message",
      createdAtIso: "2026-07-10T18:00:00.000Z",
    });

    expect(
      createAiGamePlayerSystemSession({
        sessionId: "session-pending-alert",
        focusMode: "focused",
        pendingAlerts: [alert],
        preferenceProfile: profile,
      }).pendingAlerts,
    ).toHaveLength(1);

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "",
        focusMode: "focused",
        preferenceProfile: profile,
      }),
    ).toThrow("sessionId must be a non-empty string");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-invalid-focus",
        focusMode: "invalid" as "focused",
        preferenceProfile: profile,
      }),
    ).toThrow("focusMode must be a supported Player System focus mode");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-invalid-active-module",
        focusMode: "focused",
        activeModule: "unknown" as "identity",
        preferenceProfile: profile,
      }),
    ).toThrow("activeModule must be a supported Player System module");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-too-many-modules",
        focusMode: "ambient",
        modules: [
          getAiGamePlayerSystemModuleContract("identity"),
          getAiGamePlayerSystemModuleContract("identity"),
        ],
        preferenceProfile: profile,
      }),
    ).toThrow("modules exceed the focus mode visibility limit");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-invalid-input",
        focusMode: "focused",
        acceptedInputModalities: ["keyboard" as "voice"],
        preferenceProfile: profile,
      }),
    ).toThrow("acceptedInputModalities contains an unsupported modality");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-invalid-module",
        focusMode: "focused",
        modules: [
          {
            ...getAiGamePlayerSystemModuleContract("identity"),
            module: "unknown" as "identity",
          },
        ],
        preferenceProfile: profile,
      }),
    ).toThrow("modules contains an unsupported Player System module");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-invalid-module-input",
        focusMode: "focused",
        modules: [
          {
            ...getAiGamePlayerSystemModuleContract("identity"),
            supportedInputModalities: ["keyboard" as "voice"],
          },
        ],
        preferenceProfile: profile,
      }),
    ).toThrow("modules contains an unsupported input modality");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-unsafe",
        focusMode: "combat-safe",
        modules: [
          {
            contractVersion: "1.0",
            module: "missions",
            requiresFocusedMode: true,
            availableInCombatSafeMode: false,
            supportedInputModalities: ["voice", "touch"],
          },
        ],
        preferenceProfile: profile,
      }),
    ).toThrow("combat-safe sessions cannot expose unsafe modules");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-active-module-not-visible",
        focusMode: "focused",
        activeModule: "missions",
        modules: [getAiGamePlayerSystemModuleContract("identity")],
        preferenceProfile: profile,
      }),
    ).toThrow("activeModule must be included in modules");

    expect(() =>
      createAiGamePlayerSystemSession({
        sessionId: "session-input",
        focusMode: "focused",
        acceptedInputModalities: ["voice"],
        preferenceProfile: profile,
      }),
    ).toThrow("focused sessions must accept both voice and touch input");
  });
});
