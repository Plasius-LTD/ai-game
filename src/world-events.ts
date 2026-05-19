type JsonValue = string | number | boolean | null | JsonValue[] | { readonly [key: string]: JsonValue };
type Version = string;

export type GameWorldEventType =
  | "monster.spawned"
  | "monster.killed"
  | "dungeon.created"
  | "dungeon.cleared"
  | "war.declared"
  | "war.resolved"
  | "famine.started"
  | "surplus.updated"
  | "system.checkpoint";

export type GameEventVisibilityClass = "global" | "regional" | "local" | "faction" | "secret";
export type GameEventRecordType = "candidate" | "canonical";
export type GameEventSubmissionChannel = "player" | "system" | "admin" | "simulation";
export type GameEventActorKind = "player" | "npc" | "monster" | "system" | "faction" | "environment";
export type GameEventParticipantRole = "causer" | "target" | "witness" | "owner" | "observer";
export type GameEventSeverity = "info" | "warning" | "critical";

export interface GameEventActor {
  readonly kind: GameEventActorKind;
  readonly subjectRef: string;
}

export interface GameEventParticipant {
  readonly role: GameEventParticipantRole;
  readonly actor: GameEventActor;
}

export interface GameEventLocation {
  readonly world: string;
  readonly zone: string;
  readonly x?: number;
  readonly y?: number;
  readonly radiusMeters?: number;
}

export interface GameEventCausation {
  readonly rootEventId?: string;
  readonly parentEventIds: readonly string[];
  readonly correlationId?: string;
}

export interface GameWorldEventPayloadBase {
  readonly eventKind: GameEventSeverity;
  readonly summary: string;
}

export interface MonsterSpawnedPayload extends GameWorldEventPayloadBase {
  readonly kind: "monster.spawned";
  readonly monsterType: string;
  readonly monsterRef: string;
}

export interface MonsterKilledPayload extends GameWorldEventPayloadBase {
  readonly kind: "monster.killed";
  readonly monsterRef: string;
  readonly killerRef?: string;
  readonly encounterResult: "vanquished" | "escaped" | "failed";
}

export interface DungeonCreatedPayload extends GameWorldEventPayloadBase {
  readonly kind: "dungeon.created";
  readonly dungeonRef: string;
  readonly dungeonType: string;
  readonly difficulty: number;
}

export interface DungeonClearedPayload extends GameWorldEventPayloadBase {
  readonly kind: "dungeon.cleared";
  readonly dungeonRef: string;
  readonly clearedByPartyRef: string;
  readonly durationSeconds: number;
}

export interface WarDeclaredPayload extends GameWorldEventPayloadBase {
  readonly kind: "war.declared";
  readonly aggressorFactionRef: string;
  readonly defenderFactionRef: string;
  readonly disputedZone: string;
}

export interface WarResolvedPayload extends GameWorldEventPayloadBase {
  readonly kind: "war.resolved";
  readonly warEventRef: string;
  readonly outcome: "ceasefire" | "victory" | "loss" | "draw";
  readonly winnerFactionRef?: string;
}

export interface FamineStartedPayload extends GameWorldEventPayloadBase {
  readonly kind: "famine.started";
  readonly zoneRef: string;
  readonly severity: "low" | "moderate" | "high" | "critical";
}

export interface SurplusUpdatedPayload extends GameWorldEventPayloadBase {
  readonly kind: "surplus.updated";
  readonly commodity: string;
  readonly region: string;
  readonly previousBalance: number;
  readonly delta: number;
}

export interface SystemCheckpointPayload extends GameWorldEventPayloadBase {
  readonly kind: "system.checkpoint";
  readonly sequence: string;
  readonly checkpointState: JsonValue;
}

export type GameWorldEventPayload =
  | MonsterSpawnedPayload
  | MonsterKilledPayload
  | DungeonCreatedPayload
  | DungeonClearedPayload
  | WarDeclaredPayload
  | WarResolvedPayload
  | FamineStartedPayload
  | SurplusUpdatedPayload
  | SystemCheckpointPayload;

export interface GameWorldEventEnvelope {
  readonly eventId: string;
  readonly eventType: GameWorldEventType;
  readonly occurredAtEpochMs: number;
  readonly recordedAtEpochMs: number;
  readonly schemaVersion: string;
  readonly visibility: GameEventVisibilityClass;
  readonly location: GameEventLocation;
  readonly participants: readonly GameEventParticipant[];
  readonly causation: GameEventCausation;
  readonly source: string;
  readonly payload: GameWorldEventPayload;
  readonly tags: readonly string[];
}

export interface GameWorldEventCandidate extends GameWorldEventEnvelope {
  readonly recordType: "candidate";
  readonly candidateId: string;
  readonly submittedBy?: GameEventActor;
  readonly submittedAtEpochMs: number;
  readonly submissionChannel: GameEventSubmissionChannel;
}

export interface GameWorldEventCanonical extends GameWorldEventEnvelope {
  readonly recordType: "canonical";
  readonly canonicalEventId: string;
  readonly sourceCandidateId?: string;
  readonly approvedBy: string;
  readonly approvedAtEpochMs: number;
}

export type GameWorldEvent = GameWorldEventCandidate | GameWorldEventCanonical;

export interface GameEventValidationIssue {
  readonly field: string;
  readonly message: string;
  readonly severity: GameEventSeverity;
}

export interface GameEventValidationResult {
  readonly valid: boolean;
  readonly issues: readonly GameEventValidationIssue[];
}

export interface GameEventSubmissionReceipt {
  readonly accepted: boolean;
  readonly candidateId: string;
  readonly eventId: string;
  readonly notes: readonly string[];
}

export interface GameEventCommitReceipt {
  readonly committed: boolean;
  readonly eventId: string;
  readonly sequence: string;
}

export interface ProjectionProjectorCheckpoint {
  readonly streamId: string;
  readonly lastAppliedEventOffset: number;
  readonly lastAppliedEventId: string;
  readonly eventVersion: Version;
  readonly updatedAtEpochMs: number;
}

export interface ProjectionCheckpointStore {
  getCheckpoint(streamId: string): Promise<ProjectionProjectorCheckpoint | null>;
  setCheckpoint(checkpoint: ProjectionProjectorCheckpoint): Promise<void>;
}

export interface WorldEventIngestionPort {
  submitCandidate(candidate: GameWorldEventCandidate): Promise<GameEventSubmissionReceipt>;
  commitCanonical(event: GameWorldEventCanonical): Promise<GameEventCommitReceipt>;
  validateCandidate(candidate: GameWorldEventCandidate): GameEventValidationResult;
}

export interface WorldEventProjectorPort {
  readonly streamId: string;
  readonly checkpointStore: ProjectionCheckpointStore;
  project(event: GameWorldEventCanonical): Promise<void>;
}

export type WorldIncidentImpactKey = "security" | "economy" | "ecology" | "politics" | "morale" | "magic" | "population";

export type WorldIncidentScope = "local" | "regional" | "global";

export type WorldIncidentLifecycle = "active" | "resolved" | "superseded" | "expired";

export interface WorldIncidentImpactVector {
  readonly security: number;
  readonly economy: number;
  readonly ecology: number;
  readonly politics: number;
  readonly morale: number;
  readonly magic: number;
  readonly population: number;
}

export interface WorldIncidentResolution {
  readonly resolvedAtEpochMs: number;
  readonly closingEventRef: string;
  readonly summary: string;
}

export interface WorldIncidentThread {
  readonly incidentId: string;
  readonly scope: WorldIncidentScope;
  readonly lifecycle: WorldIncidentLifecycle;
  readonly causeEventRef: string;
  readonly impact: WorldIncidentImpactVector;
  readonly openedAtEpochMs: number;
  readonly updatedAtEpochMs: number;
  readonly supersededBy?: string;
  readonly resolution?: WorldIncidentResolution;
  readonly affectedEventRefs: readonly string[];
}

export interface WorldIncidentRegistry {
  readonly incidents: readonly WorldIncidentThread[];
  readonly activeCount: number;
}

export function isCanonicalWorldEvent(event: GameWorldEvent): event is GameWorldEventCanonical {
  return event.recordType === "canonical";
}

export function isCandidateWorldEvent(event: GameWorldEvent): event is GameWorldEventCandidate {
  return event.recordType === "candidate";
}

const WORLD_IMPACT_SCALE_LIMIT = 100;

function clampImpactValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(WORLD_IMPACT_SCALE_LIMIT, value));
}

export function normalizeIncidentImpactVector(
  impact: Partial<WorldIncidentImpactVector> | Record<string, number>,
): Readonly<WorldIncidentImpactVector> {
  return Object.freeze({
    security: clampImpactValue(Number(impact.security ?? 0)),
    economy: clampImpactValue(Number(impact.economy ?? 0)),
    ecology: clampImpactValue(Number(impact.ecology ?? 0)),
    politics: clampImpactValue(Number(impact.politics ?? 0)),
    morale: clampImpactValue(Number(impact.morale ?? 0)),
    magic: clampImpactValue(Number(impact.magic ?? 0)),
    population: clampImpactValue(Number(impact.population ?? 0)),
  });
}

export function isIncidentResolved(incident: WorldIncidentThread): boolean {
  return incident.lifecycle === "resolved" || incident.lifecycle === "expired";
}
