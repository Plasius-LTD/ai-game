export const AI_GAME_PLAYER_SYSTEM_FEATURE_FLAG_ID =
  "isekai.player-system.core.enabled";

export const AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION = "1.0" as const;

export type AiGamePlayerSystemContractVersion =
  typeof AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION;

export const AI_GAME_PLAYER_SYSTEM_FOCUS_MODES = [
  "ambient",
  "focused",
  "combat-safe",
] as const;

export type AiGamePlayerSystemFocusMode =
  (typeof AI_GAME_PLAYER_SYSTEM_FOCUS_MODES)[number];

export const AI_GAME_PLAYER_SYSTEM_INPUT_MODALITIES = ["voice", "touch"] as const;

export type AiGamePlayerSystemInputModality =
  (typeof AI_GAME_PLAYER_SYSTEM_INPUT_MODALITIES)[number];

export const AI_GAME_PLAYER_SYSTEM_MODULES = [
  "identity",
  "missions",
  "guild-quests",
  "event-log",
  "mcc",
  "tutorial",
  "points-store",
] as const;

export type AiGamePlayerSystemModule =
  (typeof AI_GAME_PLAYER_SYSTEM_MODULES)[number];

export const AI_GAME_PLAYER_SYSTEM_ALERT_PRIORITIES = [
  "critical",
  "high",
  "normal",
  "low",
] as const;

export type AiGamePlayerSystemAlertPriority =
  (typeof AI_GAME_PLAYER_SYSTEM_ALERT_PRIORITIES)[number];

export const AI_GAME_PLAYER_SYSTEM_PREFERENCE_KINDS = [
  "combat",
  "exploration",
  "crafting",
  "social",
  "governance",
] as const;

export type AiGamePlayerSystemPreferenceKind =
  (typeof AI_GAME_PLAYER_SYSTEM_PREFERENCE_KINDS)[number];

export const AI_GAME_PLAYER_SYSTEM_PREFERENCE_SOURCES = [
  "explicit",
  "observed",
] as const;

export type AiGamePlayerSystemPreferenceSource =
  (typeof AI_GAME_PLAYER_SYSTEM_PREFERENCE_SOURCES)[number];

export const AI_GAME_PLAYER_SYSTEM_CONFIDENCE_BANDS = [
  "low",
  "medium",
  "high",
] as const;

export type AiGamePlayerSystemConfidenceBand =
  (typeof AI_GAME_PLAYER_SYSTEM_CONFIDENCE_BANDS)[number];

export interface AiGamePlayerSystemFocusModeContract {
  readonly contractVersion: AiGamePlayerSystemContractVersion;
  readonly mode: AiGamePlayerSystemFocusMode;
  readonly acceptsInputModalities: readonly AiGamePlayerSystemInputModality[];
  readonly allowsFullNavigation: boolean;
  readonly maximumVisibleModules: number;
  readonly deliverableAlertPriorities: readonly AiGamePlayerSystemAlertPriority[];
}

export interface AiGamePlayerSystemModuleContract {
  readonly contractVersion: AiGamePlayerSystemContractVersion;
  readonly module: AiGamePlayerSystemModule;
  readonly requiresFocusedMode: boolean;
  readonly availableInCombatSafeMode: boolean;
  readonly supportedInputModalities: readonly AiGamePlayerSystemInputModality[];
}

export interface AiGamePlayerSystemAlert {
  readonly alertId: string;
  readonly contractVersion: AiGamePlayerSystemContractVersion;
  readonly priority: AiGamePlayerSystemAlertPriority;
  readonly sourceModule: AiGamePlayerSystemModule;
  readonly title: string;
  readonly message: string;
  readonly createdAtIso: string;
}

export interface AiGamePlayerSystemPreferenceInput {
  readonly inputId: string;
  readonly kind: AiGamePlayerSystemPreferenceKind;
  readonly source: AiGamePlayerSystemPreferenceSource;
  readonly confidenceScore: number;
  readonly capturedAtIso: string;
  readonly reasonCodes: readonly string[];
}

export interface AiGamePlayerSystemPreferenceConfidenceState {
  readonly confidenceScore: number;
  readonly confidenceBand: AiGamePlayerSystemConfidenceBand;
  readonly sampleCount: number;
  readonly lastUpdatedAtIso: string;
}

export interface AiGamePlayerSystemPreferenceProfile {
  readonly profileId: string;
  readonly contractVersion: AiGamePlayerSystemContractVersion;
  readonly inputs: readonly AiGamePlayerSystemPreferenceInput[];
  readonly confidence: AiGamePlayerSystemPreferenceConfidenceState;
}

export interface AiGamePlayerSystemSession {
  readonly sessionId: string;
  readonly contractVersion: AiGamePlayerSystemContractVersion;
  readonly featureFlagId: typeof AI_GAME_PLAYER_SYSTEM_FEATURE_FLAG_ID;
  readonly focusMode: AiGamePlayerSystemFocusMode;
  readonly activeModule: AiGamePlayerSystemModule | null;
  readonly modules: readonly AiGamePlayerSystemModuleContract[];
  readonly acceptedInputModalities: readonly AiGamePlayerSystemInputModality[];
  readonly pendingAlerts: readonly AiGamePlayerSystemAlert[];
  readonly preferenceProfile: AiGamePlayerSystemPreferenceProfile;
}

export interface CreateAiGamePlayerSystemSessionInput {
  readonly sessionId: string;
  readonly focusMode: AiGamePlayerSystemFocusMode;
  readonly activeModule?: AiGamePlayerSystemModule | null;
  readonly modules?: readonly AiGamePlayerSystemModuleContract[];
  readonly acceptedInputModalities?: readonly AiGamePlayerSystemInputModality[];
  readonly pendingAlerts?: readonly AiGamePlayerSystemAlert[];
  readonly preferenceProfile: AiGamePlayerSystemPreferenceProfile;
}

const DEFAULT_FOCUS_MODE_CONTRACTS: Readonly<
  Record<AiGamePlayerSystemFocusMode, AiGamePlayerSystemFocusModeContract>
> = Object.freeze({
  ambient: Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    mode: "ambient",
    acceptsInputModalities: Object.freeze([]) as readonly AiGamePlayerSystemInputModality[],
    allowsFullNavigation: false,
    maximumVisibleModules: 1,
    deliverableAlertPriorities: Object.freeze([
      "critical",
      "high",
      "normal",
      "low",
    ]) as readonly AiGamePlayerSystemAlertPriority[],
  }),
  focused: Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    mode: "focused",
    acceptsInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
    allowsFullNavigation: true,
    maximumVisibleModules: 3,
    deliverableAlertPriorities: Object.freeze([
      "critical",
      "high",
      "normal",
      "low",
    ]) as readonly AiGamePlayerSystemAlertPriority[],
  }),
  "combat-safe": Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    mode: "combat-safe",
    acceptsInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
    allowsFullNavigation: false,
    maximumVisibleModules: 1,
    deliverableAlertPriorities: Object.freeze([
      "critical",
      "high",
    ]) as readonly AiGamePlayerSystemAlertPriority[],
  }),
});

const DEFAULT_MODULE_CONTRACTS: Readonly<
  Record<AiGamePlayerSystemModule, AiGamePlayerSystemModuleContract>
> = Object.freeze({
  identity: Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    module: "identity",
    requiresFocusedMode: false,
    availableInCombatSafeMode: true,
    supportedInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
  }),
  missions: Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    module: "missions",
    requiresFocusedMode: true,
    availableInCombatSafeMode: false,
    supportedInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
  }),
  "guild-quests": Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    module: "guild-quests",
    requiresFocusedMode: true,
    availableInCombatSafeMode: false,
    supportedInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
  }),
  "event-log": Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    module: "event-log",
    requiresFocusedMode: true,
    availableInCombatSafeMode: false,
    supportedInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
  }),
  mcc: Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    module: "mcc",
    requiresFocusedMode: true,
    availableInCombatSafeMode: false,
    supportedInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
  }),
  tutorial: Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    module: "tutorial",
    requiresFocusedMode: true,
    availableInCombatSafeMode: false,
    supportedInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
  }),
  "points-store": Object.freeze({
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    module: "points-store",
    requiresFocusedMode: true,
    availableInCombatSafeMode: false,
    supportedInputModalities: Object.freeze([
      "voice",
      "touch",
    ]) as readonly AiGamePlayerSystemInputModality[],
  }),
});

const DEFAULT_SESSION_MODULES = Object.freeze([DEFAULT_MODULE_CONTRACTS.identity]);

export const AI_GAME_PLAYER_SYSTEM_FOCUS_MODE_CONTRACTS = Object.freeze(
  AI_GAME_PLAYER_SYSTEM_FOCUS_MODES.map(
    (mode) => DEFAULT_FOCUS_MODE_CONTRACTS[mode],
  ),
);

export const AI_GAME_PLAYER_SYSTEM_MODULE_CONTRACTS = Object.freeze(
  AI_GAME_PLAYER_SYSTEM_MODULES.map((module) => DEFAULT_MODULE_CONTRACTS[module]),
);

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertContractVersion(
  value: string,
  label = "contractVersion",
): asserts value is AiGamePlayerSystemContractVersion {
  if (value !== AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION) {
    throw new Error(`${label} must be ${AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION}`);
  }
}

function assertIsoTimestamp(value: string, label: string): void {
  assertNonEmptyString(value, label);

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be an ISO-8601 timestamp`);
  }
}

function assertConfidenceScore(value: number, label = "confidenceScore"): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be between 0 and 1`);
  }
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}

function isMember<T extends string>(value: string, members: readonly T[]): value is T {
  return (members as readonly string[]).includes(value);
}

export function isAiGamePlayerSystemFocusMode(
  value: string,
): value is AiGamePlayerSystemFocusMode {
  return isMember(value, AI_GAME_PLAYER_SYSTEM_FOCUS_MODES);
}

export function isAiGamePlayerSystemInputModality(
  value: string,
): value is AiGamePlayerSystemInputModality {
  return isMember(value, AI_GAME_PLAYER_SYSTEM_INPUT_MODALITIES);
}

export function isAiGamePlayerSystemModule(
  value: string,
): value is AiGamePlayerSystemModule {
  return isMember(value, AI_GAME_PLAYER_SYSTEM_MODULES);
}

export function isAiGamePlayerSystemAlertPriority(
  value: string,
): value is AiGamePlayerSystemAlertPriority {
  return isMember(value, AI_GAME_PLAYER_SYSTEM_ALERT_PRIORITIES);
}

export function isAiGamePlayerSystemPreferenceKind(
  value: string,
): value is AiGamePlayerSystemPreferenceKind {
  return isMember(value, AI_GAME_PLAYER_SYSTEM_PREFERENCE_KINDS);
}

export function isAiGamePlayerSystemPreferenceSource(
  value: string,
): value is AiGamePlayerSystemPreferenceSource {
  return isMember(value, AI_GAME_PLAYER_SYSTEM_PREFERENCE_SOURCES);
}

export function isAiGamePlayerSystemConfidenceBand(
  value: string,
): value is AiGamePlayerSystemConfidenceBand {
  return isMember(value, AI_GAME_PLAYER_SYSTEM_CONFIDENCE_BANDS);
}

export function getAiGamePlayerSystemFocusModeContract(
  mode: AiGamePlayerSystemFocusMode,
): AiGamePlayerSystemFocusModeContract {
  return DEFAULT_FOCUS_MODE_CONTRACTS[mode];
}

export function getAiGamePlayerSystemModuleContract(
  module: AiGamePlayerSystemModule,
): AiGamePlayerSystemModuleContract {
  return DEFAULT_MODULE_CONTRACTS[module];
}

export function isAiGamePlayerSystemAlertDeliverable(
  alert: Pick<AiGamePlayerSystemAlert, "priority">,
  mode: AiGamePlayerSystemFocusMode,
): boolean {
  return getAiGamePlayerSystemFocusModeContract(mode).deliverableAlertPriorities.includes(
    alert.priority,
  );
}

export function selectAiGamePlayerSystemAlertsForFocusMode(
  alerts: readonly AiGamePlayerSystemAlert[],
  mode: AiGamePlayerSystemFocusMode,
): readonly AiGamePlayerSystemAlert[] {
  return freezeReadonlyArray(
    alerts.filter((alert) => isAiGamePlayerSystemAlertDeliverable(alert, mode)),
  );
}

export function createAiGamePlayerSystemAlert(
  input: Omit<AiGamePlayerSystemAlert, "contractVersion"> & {
    readonly contractVersion?: AiGamePlayerSystemContractVersion;
  },
): AiGamePlayerSystemAlert {
  assertNonEmptyString(input.alertId, "alertId");
  assertNonEmptyString(input.title, "title");
  assertNonEmptyString(input.message, "message");
  assertIsoTimestamp(input.createdAtIso, "createdAtIso");
  assertContractVersion(input.contractVersion ?? AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION);

  if (!isAiGamePlayerSystemAlertPriority(input.priority)) {
    throw new Error("priority must be a supported Player System alert priority");
  }

  if (!isAiGamePlayerSystemModule(input.sourceModule)) {
    throw new Error("sourceModule must be a supported Player System module");
  }

  return Object.freeze({
    ...input,
    contractVersion:
      input.contractVersion ?? AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
  });
}

export function resolveAiGamePlayerSystemConfidenceBand(
  confidenceScore: number,
): AiGamePlayerSystemConfidenceBand {
  assertConfidenceScore(confidenceScore);

  if (confidenceScore >= 0.67) {
    return "high";
  }

  if (confidenceScore >= 0.34) {
    return "medium";
  }

  return "low";
}

export function createAiGamePlayerSystemPreferenceInput(
  input: Omit<AiGamePlayerSystemPreferenceInput, "reasonCodes"> & {
    readonly reasonCodes?: readonly string[];
  },
): AiGamePlayerSystemPreferenceInput {
  assertNonEmptyString(input.inputId, "inputId");
  assertIsoTimestamp(input.capturedAtIso, "capturedAtIso");
  assertConfidenceScore(input.confidenceScore);

  if (!isAiGamePlayerSystemPreferenceKind(input.kind)) {
    throw new Error("kind must be a supported Player System preference kind");
  }

  if (!isAiGamePlayerSystemPreferenceSource(input.source)) {
    throw new Error("source must be a supported Player System preference source");
  }

  return Object.freeze({
    ...input,
    reasonCodes: freezeReadonlyArray(input.reasonCodes ?? []),
  });
}

export function createAiGamePlayerSystemPreferenceConfidenceState(
  input: Omit<AiGamePlayerSystemPreferenceConfidenceState, "confidenceBand"> & {
    readonly confidenceBand?: AiGamePlayerSystemConfidenceBand;
  },
): AiGamePlayerSystemPreferenceConfidenceState {
  assertConfidenceScore(input.confidenceScore);
  assertNonNegativeInteger(input.sampleCount, "sampleCount");
  assertIsoTimestamp(input.lastUpdatedAtIso, "lastUpdatedAtIso");

  const confidenceBand = resolveAiGamePlayerSystemConfidenceBand(
    input.confidenceScore,
  );

  if (input.confidenceBand !== undefined && input.confidenceBand !== confidenceBand) {
    throw new Error("confidenceBand must match confidenceScore");
  }

  return Object.freeze({
    confidenceScore: input.confidenceScore,
    confidenceBand,
    sampleCount: input.sampleCount,
    lastUpdatedAtIso: input.lastUpdatedAtIso,
  });
}

export function createAiGamePlayerSystemPreferenceProfile(input: {
  readonly profileId: string;
  readonly inputs?: readonly AiGamePlayerSystemPreferenceInput[];
  readonly confidence?: Omit<
    AiGamePlayerSystemPreferenceConfidenceState,
    "confidenceBand"
  > & { readonly confidenceBand?: AiGamePlayerSystemConfidenceBand };
}): AiGamePlayerSystemPreferenceProfile {
  assertNonEmptyString(input.profileId, "profileId");

  const inputs = (input.inputs ?? []).map((preferenceInput) =>
    createAiGamePlayerSystemPreferenceInput(preferenceInput),
  );
  const lastUpdatedAtIso =
    input.confidence?.lastUpdatedAtIso ?? new Date(0).toISOString();
  const confidenceScore =
    input.confidence?.confidenceScore ??
    (inputs.length === 0
      ? 0
      : inputs.reduce((total, preferenceInput) => total + preferenceInput.confidenceScore, 0) /
        inputs.length);
  const confidence = createAiGamePlayerSystemPreferenceConfidenceState({
    confidenceScore,
    sampleCount: input.confidence?.sampleCount ?? inputs.length,
    lastUpdatedAtIso,
    confidenceBand: input.confidence?.confidenceBand,
  });

  return Object.freeze({
    profileId: input.profileId,
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    inputs: freezeReadonlyArray(inputs),
    confidence,
  });
}

export function createAiGamePlayerSystemSession(
  input: CreateAiGamePlayerSystemSessionInput,
): AiGamePlayerSystemSession {
  assertNonEmptyString(input.sessionId, "sessionId");

  if (!isAiGamePlayerSystemFocusMode(input.focusMode)) {
    throw new Error("focusMode must be a supported Player System focus mode");
  }

  if (
    input.activeModule !== null &&
    input.activeModule !== undefined &&
    !isAiGamePlayerSystemModule(input.activeModule)
  ) {
    throw new Error("activeModule must be a supported Player System module");
  }

  const modeContract = getAiGamePlayerSystemFocusModeContract(input.focusMode);
  const modules = freezeReadonlyArray(
    (input.modules ?? DEFAULT_SESSION_MODULES).map((moduleContract) =>
      Object.freeze({
        ...moduleContract,
        supportedInputModalities: freezeReadonlyArray(
          moduleContract.supportedInputModalities,
        ),
      }),
    ),
  );
  const acceptedInputModalities = freezeReadonlyArray(
    input.acceptedInputModalities ?? modeContract.acceptsInputModalities,
  );
  const pendingAlerts = freezeReadonlyArray(
    (input.pendingAlerts ?? []).map((alert) => createAiGamePlayerSystemAlert(alert)),
  );

  if (modules.length > modeContract.maximumVisibleModules) {
    throw new Error("modules exceed the focus mode visibility limit");
  }

  for (const modality of acceptedInputModalities) {
    if (!isAiGamePlayerSystemInputModality(modality)) {
      throw new Error("acceptedInputModalities contains an unsupported modality");
    }
  }

  if (
    input.focusMode === "focused" &&
    (!acceptedInputModalities.includes("voice") ||
      !acceptedInputModalities.includes("touch"))
  ) {
    throw new Error("focused sessions must accept both voice and touch input");
  }

  for (const moduleContract of modules) {
    assertContractVersion(moduleContract.contractVersion, "module contractVersion");

    if (!isAiGamePlayerSystemModule(moduleContract.module)) {
      throw new Error("modules contains an unsupported Player System module");
    }

    for (const modality of moduleContract.supportedInputModalities) {
      if (!isAiGamePlayerSystemInputModality(modality)) {
        throw new Error("modules contains an unsupported input modality");
      }
    }

    if (
      input.focusMode === "combat-safe" &&
      !moduleContract.availableInCombatSafeMode
    ) {
      throw new Error("combat-safe sessions cannot expose unsafe modules");
    }
  }

  if (
    input.activeModule !== null &&
    input.activeModule !== undefined &&
    !modules.some((moduleContract) => moduleContract.module === input.activeModule)
  ) {
    throw new Error("activeModule must be included in modules");
  }

  return Object.freeze({
    sessionId: input.sessionId,
    contractVersion: AI_GAME_PLAYER_SYSTEM_CONTRACT_VERSION,
    featureFlagId: AI_GAME_PLAYER_SYSTEM_FEATURE_FLAG_ID,
    focusMode: input.focusMode,
    activeModule: input.activeModule ?? null,
    modules,
    acceptedInputModalities,
    pendingAlerts,
    preferenceProfile: createAiGamePlayerSystemPreferenceProfile({
      profileId: input.preferenceProfile.profileId,
      inputs: input.preferenceProfile.inputs,
      confidence: input.preferenceProfile.confidence,
    }),
  });
}
