export const AI_GAME_OBSERVED_EVENT_LOG_FEATURE_FLAG_ID =
  "isekai.player-system.logs.enabled";

export const AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION = "1.0" as const;

export type AiGameObservedEventLogContractVersion =
  typeof AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION;

export const AI_GAME_OBSERVED_EVENT_KINDS = [
  "combat",
  "crafting",
  "discovery",
  "mission",
  "social",
  "travel",
  "world",
] as const;

export type AiGameObservedEventKind =
  (typeof AI_GAME_OBSERVED_EVENT_KINDS)[number];

export const AI_GAME_OBSERVED_EVENT_SOURCES = [
  "player-action",
  "system-observation",
  "world-state",
] as const;

export type AiGameObservedEventSource =
  (typeof AI_GAME_OBSERVED_EVENT_SOURCES)[number];

export const AI_GAME_OBSERVED_EVENT_VISIBILITIES = [
  "private",
  "party",
  "local",
  "public",
] as const;

export type AiGameObservedEventVisibility =
  (typeof AI_GAME_OBSERVED_EVENT_VISIBILITIES)[number];

export const AI_GAME_OBSERVED_EVENT_SIGNIFICANCE = [
  "routine",
  "notable",
  "critical",
] as const;

export type AiGameObservedEventSignificance =
  (typeof AI_GAME_OBSERVED_EVENT_SIGNIFICANCE)[number];

export const AI_GAME_GOSSIP_EXPORT_AUDIENCES = [
  "player",
  "npc",
  "public",
] as const;

export type AiGameGossipExportAudience =
  (typeof AI_GAME_GOSSIP_EXPORT_AUDIENCES)[number];

export const AI_GAME_OBSERVED_EVENT_MAX_SUMMARY_LENGTH = 500;
export const AI_GAME_OBSERVED_EVENT_MAX_TAGS = 20;
export const AI_GAME_OBSERVED_EVENT_MAX_TAG_LENGTH = 64;
export const AI_GAME_OBSERVED_EVENT_MAX_WINDOW_EVENTS = 100;

export interface AiGameObservedEvent {
  readonly contractVersion: AiGameObservedEventLogContractVersion;
  readonly eventId: string;
  readonly occurredAtIso: string;
  readonly kind: AiGameObservedEventKind;
  readonly source: AiGameObservedEventSource;
  readonly subjectRef: string;
  readonly summary: string;
  readonly significance: AiGameObservedEventSignificance;
  readonly visibility: AiGameObservedEventVisibility;
  readonly tags: readonly string[];
}

export interface AiGameObservedEventRecencyWindow {
  readonly contractVersion: AiGameObservedEventLogContractVersion;
  readonly windowId: string;
  readonly startsAtIso: string;
  readonly endsAtIso: string;
  readonly events: readonly AiGameObservedEvent[];
}

export interface AiGameObservedEventHighlightSummary {
  readonly contractVersion: AiGameObservedEventLogContractVersion;
  readonly summaryId: string;
  readonly windowId: string;
  readonly title: string;
  readonly summary: string;
  readonly significance: AiGameObservedEventSignificance;
  readonly eventIds: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface AiGameGossipExport {
  readonly contractVersion: AiGameObservedEventLogContractVersion;
  readonly exportId: string;
  readonly exportedAtIso: string;
  readonly audience: AiGameGossipExportAudience;
  readonly sourceWindow: AiGameObservedEventRecencyWindow;
  readonly highlights: readonly AiGameObservedEventHighlightSummary[];
}

export interface CreateAiGameObservedEventInput {
  readonly contractVersion?: string;
  readonly eventId: string;
  readonly occurredAtIso: string;
  readonly kind: string;
  readonly source: string;
  readonly subjectRef: string;
  readonly summary: string;
  readonly significance: string;
  readonly visibility: string;
  readonly tags?: readonly string[];
}

export interface CreateAiGameObservedEventRecencyWindowInput {
  readonly contractVersion?: string;
  readonly windowId: string;
  readonly startsAtIso: string;
  readonly endsAtIso: string;
  readonly events: readonly AiGameObservedEvent[];
}

export interface CreateAiGameObservedEventHighlightSummaryInput {
  readonly contractVersion?: string;
  readonly summaryId: string;
  readonly windowId: string;
  readonly title: string;
  readonly summary: string;
  readonly significance: string;
  readonly eventIds: readonly string[];
  readonly reasonCodes?: readonly string[];
}

export interface CreateAiGameGossipExportInput {
  readonly contractVersion?: string;
  readonly exportId: string;
  readonly exportedAtIso: string;
  readonly audience: string;
  readonly sourceWindow: AiGameObservedEventRecencyWindow;
  readonly highlights: readonly AiGameObservedEventHighlightSummary[];
}

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function isMember<T extends string>(
  value: string,
  members: readonly T[],
): value is T {
  return (members as readonly string[]).includes(value);
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertSafeText(
  value: string,
  label: string,
  maxLength: number,
): void {
  assertNonEmptyString(value, label);

  if (value.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer`);
  }

  if (
    [...value].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 0x1f || codePoint === 0x7f;
    })
  ) {
    throw new Error(`${label} must not contain control characters`);
  }
}

function assertIsoTimestamp(value: string, label: string): void {
  assertNonEmptyString(value, label);

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be an ISO-8601 timestamp`);
  }
}

function assertContractVersion(
  value: string,
): asserts value is AiGameObservedEventLogContractVersion {
  if (value !== AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION) {
    throw new Error(
      `contractVersion must be ${AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION}`,
    );
  }
}

function assertArrayLimit(
  value: readonly unknown[],
  label: string,
  maximum: number,
): void {
  if (value.length > maximum) {
    throw new Error(`${label} must contain ${maximum} items or fewer`);
  }
}

function createStringArray(
  values: readonly string[],
  label: string,
  maximum: number,
  itemMaximum: number,
): readonly string[] {
  assertArrayLimit(values, label, maximum);
  const result = values.map((value, index) => {
    assertSafeText(value, `${label}[${index}]`, itemMaximum);
    return value.trim();
  });

  if (new Set(result).size !== result.length) {
    throw new Error(`${label} must not contain duplicate values`);
  }

  return freezeReadonlyArray(result);
}

function assertUniqueIds(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} must not contain duplicate values`);
  }
}

function cloneObservedEvent(event: AiGameObservedEvent): AiGameObservedEvent {
  return createAiGameObservedEvent(event);
}

function cloneRecencyWindow(
  window: AiGameObservedEventRecencyWindow,
): AiGameObservedEventRecencyWindow {
  return createAiGameObservedEventRecencyWindow({
    contractVersion: window.contractVersion,
    windowId: window.windowId,
    startsAtIso: window.startsAtIso,
    endsAtIso: window.endsAtIso,
    events: window.events,
  });
}

function cloneHighlightSummary(
  summary: AiGameObservedEventHighlightSummary,
): AiGameObservedEventHighlightSummary {
  return createAiGameObservedEventHighlightSummary({
    contractVersion: summary.contractVersion,
    summaryId: summary.summaryId,
    windowId: summary.windowId,
    title: summary.title,
    summary: summary.summary,
    significance: summary.significance,
    eventIds: summary.eventIds,
    reasonCodes: summary.reasonCodes,
  });
}

export function isAiGameObservedEventKind(
  value: string,
): value is AiGameObservedEventKind {
  return isMember(value, AI_GAME_OBSERVED_EVENT_KINDS);
}

export function isAiGameObservedEventSource(
  value: string,
): value is AiGameObservedEventSource {
  return isMember(value, AI_GAME_OBSERVED_EVENT_SOURCES);
}

export function isAiGameObservedEventVisibility(
  value: string,
): value is AiGameObservedEventVisibility {
  return isMember(value, AI_GAME_OBSERVED_EVENT_VISIBILITIES);
}

export function isAiGameObservedEventSignificance(
  value: string,
): value is AiGameObservedEventSignificance {
  return isMember(value, AI_GAME_OBSERVED_EVENT_SIGNIFICANCE);
}

export function isAiGameGossipExportAudience(
  value: string,
): value is AiGameGossipExportAudience {
  return isMember(value, AI_GAME_GOSSIP_EXPORT_AUDIENCES);
}

export function createAiGameObservedEvent(
  input: CreateAiGameObservedEventInput,
): AiGameObservedEvent {
  const contractVersion =
    input.contractVersion ?? AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION;
  assertContractVersion(contractVersion);
  assertSafeText(input.eventId, "eventId", 200);
  assertIsoTimestamp(input.occurredAtIso, "occurredAtIso");
  assertSafeText(input.subjectRef, "subjectRef", 200);
  assertSafeText(
    input.summary,
    "summary",
    AI_GAME_OBSERVED_EVENT_MAX_SUMMARY_LENGTH,
  );

  if (!isAiGameObservedEventKind(input.kind)) {
    throw new Error(`kind must be one of: ${AI_GAME_OBSERVED_EVENT_KINDS.join(", ")}`);
  }

  if (!isAiGameObservedEventSource(input.source)) {
    throw new Error(
      `source must be one of: ${AI_GAME_OBSERVED_EVENT_SOURCES.join(", ")}`,
    );
  }

  if (!isAiGameObservedEventSignificance(input.significance)) {
    throw new Error(
      `significance must be one of: ${AI_GAME_OBSERVED_EVENT_SIGNIFICANCE.join(", ")}`,
    );
  }

  if (!isAiGameObservedEventVisibility(input.visibility)) {
    throw new Error(
      `visibility must be one of: ${AI_GAME_OBSERVED_EVENT_VISIBILITIES.join(", ")}`,
    );
  }

  const tags = createStringArray(
    input.tags ?? [],
    "tags",
    AI_GAME_OBSERVED_EVENT_MAX_TAGS,
    AI_GAME_OBSERVED_EVENT_MAX_TAG_LENGTH,
  );

  return Object.freeze({
    contractVersion,
    eventId: input.eventId.trim(),
    occurredAtIso: input.occurredAtIso,
    kind: input.kind,
    source: input.source,
    subjectRef: input.subjectRef.trim(),
    summary: input.summary.trim(),
    significance: input.significance,
    visibility: input.visibility,
    tags,
  });
}

export function createAiGameObservedEventRecencyWindow(
  input: CreateAiGameObservedEventRecencyWindowInput,
): AiGameObservedEventRecencyWindow {
  const contractVersion =
    input.contractVersion ?? AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION;
  assertContractVersion(contractVersion);
  assertSafeText(input.windowId, "windowId", 200);
  assertIsoTimestamp(input.startsAtIso, "startsAtIso");
  assertIsoTimestamp(input.endsAtIso, "endsAtIso");

  const startsAt = Date.parse(input.startsAtIso);
  const endsAt = Date.parse(input.endsAtIso);
  if (startsAt > endsAt) {
    throw new Error("startsAtIso must be before or equal to endsAtIso");
  }

  assertArrayLimit(
    input.events,
    "events",
    AI_GAME_OBSERVED_EVENT_MAX_WINDOW_EVENTS,
  );
  const events = input.events.map(cloneObservedEvent);
  const eventIds = events.map((event) => event.eventId);
  assertUniqueIds(eventIds, "events");

  for (const event of events) {
    const occurredAt = Date.parse(event.occurredAtIso);
    if (occurredAt < startsAt || occurredAt > endsAt) {
      throw new Error(`event ${event.eventId} must occur inside the recency window`);
    }
  }

  return Object.freeze({
    contractVersion,
    windowId: input.windowId.trim(),
    startsAtIso: input.startsAtIso,
    endsAtIso: input.endsAtIso,
    events: freezeReadonlyArray(events),
  });
}

export function createAiGameObservedEventHighlightSummary(
  input: CreateAiGameObservedEventHighlightSummaryInput,
): AiGameObservedEventHighlightSummary {
  const contractVersion =
    input.contractVersion ?? AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION;
  assertContractVersion(contractVersion);
  assertSafeText(input.summaryId, "summaryId", 200);
  assertSafeText(input.windowId, "windowId", 200);
  assertSafeText(input.title, "title", 200);
  assertSafeText(
    input.summary,
    "summary",
    AI_GAME_OBSERVED_EVENT_MAX_SUMMARY_LENGTH,
  );

  if (!isAiGameObservedEventSignificance(input.significance)) {
    throw new Error(
      `significance must be one of: ${AI_GAME_OBSERVED_EVENT_SIGNIFICANCE.join(", ")}`,
    );
  }

  const eventIds = createStringArray(input.eventIds, "eventIds", 100, 200);
  if (eventIds.length === 0) {
    throw new Error("eventIds must contain at least one event id");
  }

  const reasonCodes = createStringArray(
    input.reasonCodes ?? [],
    "reasonCodes",
    20,
    100,
  );

  return Object.freeze({
    contractVersion,
    summaryId: input.summaryId.trim(),
    windowId: input.windowId.trim(),
    title: input.title.trim(),
    summary: input.summary.trim(),
    significance: input.significance,
    eventIds,
    reasonCodes,
  });
}

export function createAiGameGossipExport(
  input: CreateAiGameGossipExportInput,
): AiGameGossipExport {
  const contractVersion =
    input.contractVersion ?? AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION;
  assertContractVersion(contractVersion);
  assertSafeText(input.exportId, "exportId", 200);
  assertIsoTimestamp(input.exportedAtIso, "exportedAtIso");

  if (!isAiGameGossipExportAudience(input.audience)) {
    throw new Error(
      `audience must be one of: ${AI_GAME_GOSSIP_EXPORT_AUDIENCES.join(", ")}`,
    );
  }

  const sourceWindow = cloneRecencyWindow(input.sourceWindow);
  const eventIds = new Set(sourceWindow.events.map((event) => event.eventId));
  const highlights = input.highlights.map(cloneHighlightSummary);
  const summaryIds = highlights.map((summary) => summary.summaryId);
  assertUniqueIds(summaryIds, "highlights");

  for (const highlight of highlights) {
    if (highlight.windowId !== sourceWindow.windowId) {
      throw new Error("highlight windowId must match sourceWindow windowId");
    }

    if (highlight.eventIds.some((eventId) => !eventIds.has(eventId))) {
      throw new Error("highlight eventIds must reference sourceWindow events");
    }
  }

  return Object.freeze({
    contractVersion,
    exportId: input.exportId.trim(),
    exportedAtIso: input.exportedAtIso,
    audience: input.audience,
    sourceWindow,
    highlights: freezeReadonlyArray(highlights),
  });
}

export function assertAiGameObservedEventLogContractVersion(
  value: string,
): void {
  assertContractVersion(value);
}
