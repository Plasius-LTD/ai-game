import {
  TRAINING_FEATURE_FLAG_ID,
  TRAINING_MARTIAL_FEATURE_FLAG_ID,
  TRAINING_MARTIAL_TECHNIQUE_TRACKS,
  TRAINING_BARRACKS_DRILL_DELIVERY_MODES,
  TRAINING_MARTIAL_TECHNIQUE_FAMILIES,
  TRAINING_ANTI_SPELL_FIELDCRAFT_FAMILIES,
  TRAINING_ANTI_SPELL_COUNTER_WINDOWS,
  createTrainingAntiSpellFieldcraftDiscipline,
  createTrainingBarracksDrill,
  createTrainingInstitution,
  createTrainingMartialTechnique,
  createTrainingMissionTechniqueUnlock,
  createTrainingProgressionRecord,
  isMccExpressionTrack,
  isTrainingAntiSpellCounterWindow,
  isTrainingAntiSpellFieldcraftFamily,
  isTrainingBarracksDrillDeliveryMode,
  isTrainingMartialTechniqueFamily,
  isTrainingMartialTechniqueTrack,
  isTrainingTrustLevel,
  type MccExpressionTrack,
  type TrainingAntiSpellCounterWindow,
  type TrainingAntiSpellFieldcraftDiscipline,
  type TrainingAntiSpellFieldcraftFamily,
  type TrainingBarracksDrill,
  type TrainingBarracksDrillDeliveryMode,
  type TrainingInstitution,
  type TrainingInstitutionType,
  type TrainingMartialTechnique,
  type TrainingMartialTechniqueFamily,
  type TrainingMartialTechniqueTrack,
  type TrainingMissionTechniqueUnlock,
  type TrainingProgressionRecord,
  type TrainingTrustLevel,
} from "@plasius/training";

export {
  isMccExpressionTrack,
  isTrainingAntiSpellCounterWindow as isAiGameTrainingAntiSpellCounterWindow,
  isTrainingAntiSpellFieldcraftFamily as isAiGameTrainingAntiSpellFieldcraftFamily,
  isTrainingBarracksDrillDeliveryMode as isAiGameTrainingBarracksDrillDeliveryMode,
  isTrainingMartialTechniqueFamily as isAiGameTrainingMartialTechniqueFamily,
  isTrainingMartialTechniqueTrack as isAiGameTrainingMartialTechniqueTrack,
  isTrainingTrustLevel,
  TRAINING_FEATURE_FLAG_ID as AI_GAME_TRAINING_INSTITUTIONS_FEATURE_FLAG_ID,
  TRAINING_MARTIAL_FEATURE_FLAG_ID as AI_GAME_TRAINING_MARTIAL_FEATURE_FLAG_ID,
  TRAINING_MARTIAL_TECHNIQUE_TRACKS as AI_GAME_TRAINING_MARTIAL_TECHNIQUE_TRACKS,
  TRAINING_BARRACKS_DRILL_DELIVERY_MODES as AI_GAME_TRAINING_BARRACKS_DRILL_DELIVERY_MODES,
  TRAINING_MARTIAL_TECHNIQUE_FAMILIES as AI_GAME_TRAINING_MARTIAL_TECHNIQUE_FAMILIES,
  TRAINING_ANTI_SPELL_FIELDCRAFT_FAMILIES as AI_GAME_TRAINING_ANTI_SPELL_FIELDCRAFT_FAMILIES,
  TRAINING_ANTI_SPELL_COUNTER_WINDOWS as AI_GAME_TRAINING_ANTI_SPELL_COUNTER_WINDOWS,
};

export type {
  MccExpressionTrack as AiGameTrainingSpecializationLeaning,
  TrainingAntiSpellCounterWindow as AiGameTrainingAntiSpellCounterWindow,
  TrainingAntiSpellFieldcraftDiscipline as AiGameTrainingAntiSpellFieldcraftDiscipline,
  TrainingAntiSpellFieldcraftFamily as AiGameTrainingAntiSpellFieldcraftFamily,
  TrainingBarracksDrill as AiGameTrainingBarracksDrill,
  TrainingBarracksDrillDeliveryMode as AiGameTrainingBarracksDrillDeliveryMode,
  TrainingInstitution as AiGameTrainingInstitution,
  TrainingInstitutionType as AiGameTrainingInstitutionType,
  TrainingMartialTechnique as AiGameTrainingMartialTechnique,
  TrainingMartialTechniqueFamily as AiGameTrainingMartialTechniqueFamily,
  TrainingMartialTechniqueTrack as AiGameTrainingMartialTechniqueTrack,
  TrainingMissionTechniqueUnlock as AiGameTrainingMissionTechniqueUnlock,
  TrainingProgressionRecord as AiGameTrainingState,
  TrainingTrustLevel as AiGameTrainingTrustLevel,
};

export const AI_GAME_TRAINING_STAGE_GATES = [
  "system-first-awakening",
  "field-repetition",
  "first-social-institution",
  "advanced-specialization",
  "dominion-and-divine",
] as const;

export type AiGameTrainingStageGate =
  (typeof AI_GAME_TRAINING_STAGE_GATES)[number];

export const AI_GAME_TRAINING_TRUST_MARKER_SOURCES = [
  "system",
  "mission",
  "institution",
  "sponsor",
] as const;

export type AiGameTrainingTrustMarkerSource =
  (typeof AI_GAME_TRAINING_TRUST_MARKER_SOURCES)[number];

export const AI_GAME_TRAINING_RECOMMENDATION_CONFIDENCE_BANDS = [
  "low",
  "medium",
  "high",
] as const;

export type AiGameTrainingRecommendationConfidenceBand =
  (typeof AI_GAME_TRAINING_RECOMMENDATION_CONFIDENCE_BANDS)[number];

export const AI_GAME_TRAINING_RECOMMENDATION_READINESS = [
  "ready",
  "needs-prerequisites",
  "institution-gated",
] as const;

export type AiGameTrainingRecommendationReadiness =
  (typeof AI_GAME_TRAINING_RECOMMENDATION_READINESS)[number];

export interface AiGameInstitutionEligibility {
  readonly institutionId: string;
  readonly institutionType: TrainingInstitutionType;
  readonly track: MccExpressionTrack;
  readonly eligible: boolean;
  readonly requiredStageGate: AiGameTrainingStageGate;
  readonly trustLevel: TrainingTrustLevel;
  readonly unmetPrerequisiteCodes: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameTrainingTrustMarker {
  readonly markerId: string;
  readonly institutionId: string;
  readonly trustLevel: TrainingTrustLevel;
  readonly source: AiGameTrainingTrustMarkerSource;
  readonly awardedAtIso: string;
  readonly reasonCodes: readonly string[];
}

export interface AiGameSpecializationRecommendation {
  readonly recommendationId: string;
  readonly institutionId: string;
  readonly institutionType: TrainingInstitutionType;
  readonly leaning: MccExpressionTrack;
  readonly recommendedTrack: MccExpressionTrack;
  readonly confidenceBand: AiGameTrainingRecommendationConfidenceBand;
  readonly readiness: AiGameTrainingRecommendationReadiness;
  readonly unmetPrerequisiteCodes: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameTrainingStateSnapshot {
  readonly progression: TrainingProgressionRecord;
  readonly institution: TrainingInstitution;
  readonly eligibility: readonly AiGameInstitutionEligibility[];
  readonly trustMarkers: readonly AiGameTrainingTrustMarker[];
  readonly recommendations: readonly AiGameSpecializationRecommendation[];
}

export interface AiGameMartialTrainingSnapshot {
  readonly barracksDrills: readonly TrainingBarracksDrill[];
  readonly missionTechniqueUnlocks: readonly TrainingMissionTechniqueUnlock[];
  readonly martialTechniques: readonly TrainingMartialTechnique[];
  readonly antiSpellFieldcraft: readonly TrainingAntiSpellFieldcraftDiscipline[];
}

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertIsoTimestamp(value: string, label: string): void {
  assertNonEmptyString(value, label);

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be an ISO-8601 timestamp`);
  }
}

function isTrainingInstitutionType(value: string): value is TrainingInstitutionType {
  return value === "school"
    || value === "barracks"
    || value === "academy"
    || value === "apprenticeship";
}

export function isAiGameTrainingStageGate(
  value: string,
): value is AiGameTrainingStageGate {
  return (AI_GAME_TRAINING_STAGE_GATES as readonly string[]).includes(value);
}

export function isAiGameTrainingTrustMarkerSource(
  value: string,
): value is AiGameTrainingTrustMarkerSource {
  return (AI_GAME_TRAINING_TRUST_MARKER_SOURCES as readonly string[]).includes(value);
}

export function isAiGameTrainingRecommendationConfidenceBand(
  value: string,
): value is AiGameTrainingRecommendationConfidenceBand {
  return (AI_GAME_TRAINING_RECOMMENDATION_CONFIDENCE_BANDS as readonly string[]).includes(value);
}

export function isAiGameTrainingRecommendationReadiness(
  value: string,
): value is AiGameTrainingRecommendationReadiness {
  return (AI_GAME_TRAINING_RECOMMENDATION_READINESS as readonly string[]).includes(value);
}

export function createAiGameInstitutionEligibility(
  input: AiGameInstitutionEligibility,
): AiGameInstitutionEligibility {
  assertNonEmptyString(input.institutionId, "institutionId");

  if (!isTrainingInstitutionType(input.institutionType)) {
    throw new Error("institutionType must be a supported training institution type");
  }

  if (!isMccExpressionTrack(input.track)) {
    throw new Error("track must be a supported MCC expression track");
  }

  if (!isAiGameTrainingStageGate(input.requiredStageGate)) {
    throw new Error("requiredStageGate must be a supported training stage gate");
  }

  if (!isTrainingTrustLevel(input.trustLevel)) {
    throw new Error("trustLevel must be a supported training trust level");
  }

  return Object.freeze({
    ...input,
    unmetPrerequisiteCodes: freezeReadonlyArray(input.unmetPrerequisiteCodes),
    reasonCodes: freezeReadonlyArray(input.reasonCodes),
  });
}

export function createAiGameTrainingTrustMarker(
  input: AiGameTrainingTrustMarker,
): AiGameTrainingTrustMarker {
  assertNonEmptyString(input.markerId, "markerId");
  assertNonEmptyString(input.institutionId, "institutionId");
  assertIsoTimestamp(input.awardedAtIso, "awardedAtIso");

  if (!isTrainingTrustLevel(input.trustLevel)) {
    throw new Error("trustLevel must be a supported training trust level");
  }

  if (!isAiGameTrainingTrustMarkerSource(input.source)) {
    throw new Error("source must be a supported training trust marker source");
  }

  return Object.freeze({
    ...input,
    reasonCodes: freezeReadonlyArray(input.reasonCodes),
  });
}

export function createAiGameSpecializationRecommendation(
  input: AiGameSpecializationRecommendation,
): AiGameSpecializationRecommendation {
  assertNonEmptyString(input.recommendationId, "recommendationId");
  assertNonEmptyString(input.institutionId, "institutionId");

  if (!isTrainingInstitutionType(input.institutionType)) {
    throw new Error("institutionType must be a supported training institution type");
  }

  if (!isMccExpressionTrack(input.leaning)) {
    throw new Error("leaning must be a supported MCC expression track");
  }

  if (!isMccExpressionTrack(input.recommendedTrack)) {
    throw new Error("recommendedTrack must be a supported MCC expression track");
  }

  if (!isAiGameTrainingRecommendationConfidenceBand(input.confidenceBand)) {
    throw new Error("confidenceBand must be a supported training recommendation confidence band");
  }

  if (!isAiGameTrainingRecommendationReadiness(input.readiness)) {
    throw new Error("readiness must be a supported training recommendation readiness");
  }

  return Object.freeze({
    ...input,
    unmetPrerequisiteCodes: freezeReadonlyArray(input.unmetPrerequisiteCodes),
    reasonCodes: freezeReadonlyArray(input.reasonCodes),
  });
}

export function createAiGameTrainingStateSnapshot(
  input: AiGameTrainingStateSnapshot,
): AiGameTrainingStateSnapshot {
  return Object.freeze({
    progression: createTrainingProgressionRecord(input.progression),
    institution: createTrainingInstitution(input.institution),
    eligibility: freezeReadonlyArray(
      input.eligibility.map(createAiGameInstitutionEligibility),
    ),
    trustMarkers: freezeReadonlyArray(
      input.trustMarkers.map(createAiGameTrainingTrustMarker),
    ),
    recommendations: freezeReadonlyArray(
      input.recommendations.map(createAiGameSpecializationRecommendation),
    ),
  });
}

export function createAiGameMartialTrainingSnapshot(
  input: AiGameMartialTrainingSnapshot,
): AiGameMartialTrainingSnapshot {
  return Object.freeze({
    barracksDrills: freezeReadonlyArray(
      input.barracksDrills.map(createTrainingBarracksDrill),
    ),
    missionTechniqueUnlocks: freezeReadonlyArray(
      input.missionTechniqueUnlocks.map(createTrainingMissionTechniqueUnlock),
    ),
    martialTechniques: freezeReadonlyArray(
      input.martialTechniques.map(createTrainingMartialTechnique),
    ),
    antiSpellFieldcraft: freezeReadonlyArray(
      input.antiSpellFieldcraft.map(createTrainingAntiSpellFieldcraftDiscipline),
    ),
  });
}
