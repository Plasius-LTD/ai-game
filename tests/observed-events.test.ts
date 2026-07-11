import { describe, expect, it } from "vitest";

import {
  AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION,
  AI_GAME_OBSERVED_EVENT_LOG_FEATURE_FLAG_ID,
  createAiGameGossipExport,
  createAiGameObservedEvent,
  createAiGameObservedEventHighlightSummary,
  createAiGameObservedEventRecencyWindow,
  isAiGameGossipExportAudience,
  isAiGameObservedEventKind,
  isAiGameObservedEventSignificance,
  isAiGameObservedEventSource,
  isAiGameObservedEventVisibility,
} from "../src/index.js";

const eventOne = createAiGameObservedEvent({
  eventId: "event-1",
  occurredAtIso: "2026-07-11T10:00:00.000Z",
  kind: "discovery",
  source: "world-state",
  subjectRef: "ruins-east-gate",
  summary: "A sealed ruin was discovered near the eastern gate.",
  significance: "notable",
  visibility: "local",
  tags: ["ruin", "discovery"],
});

const eventTwo = createAiGameObservedEvent({
  eventId: "event-2",
  occurredAtIso: "2026-07-11T10:30:00.000Z",
  kind: "social",
  source: "player-action",
  subjectRef: "village-watch",
  summary: "The village watch shared a warning about the eastern road.",
  significance: "routine",
  visibility: "party",
});

describe("observed event and gossip export contracts", () => {
  it("exports the feature flag, version, and vocabulary guards", () => {
    expect(AI_GAME_OBSERVED_EVENT_LOG_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.logs.enabled",
    );
    expect(AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION).toBe("1.0");
    expect(isAiGameObservedEventKind("discovery")).toBe(true);
    expect(isAiGameObservedEventKind("telemetry")).toBe(false);
    expect(isAiGameObservedEventSource("world-state")).toBe(true);
    expect(isAiGameObservedEventSource("database")).toBe(false);
    expect(isAiGameObservedEventSignificance("critical")).toBe(true);
    expect(isAiGameObservedEventSignificance("certain")).toBe(false);
    expect(isAiGameObservedEventVisibility("local")).toBe(true);
    expect(isAiGameObservedEventVisibility("global")).toBe(false);
    expect(isAiGameGossipExportAudience("npc")).toBe(true);
    expect(isAiGameGossipExportAudience("admin")).toBe(false);
  });

  it("creates immutable observed events and recency windows", () => {
    const window = createAiGameObservedEventRecencyWindow({
      windowId: "window-1",
      startsAtIso: "2026-07-11T09:00:00.000Z",
      endsAtIso: "2026-07-11T11:00:00.000Z",
      events: [eventOne, eventTwo],
    });

    expect(window.events).toHaveLength(2);
    expect(window.events[0]?.tags).toEqual(["ruin", "discovery"]);
    expect(Object.isFrozen(eventOne)).toBe(true);
    expect(Object.isFrozen(eventOne.tags)).toBe(true);
    expect(Object.isFrozen(window)).toBe(true);
    expect(Object.isFrozen(window.events)).toBe(true);
    expect(window.contractVersion).toBe("1.0");
  });

  it("creates highlights and exports using the same observed-event window", () => {
    const window = createAiGameObservedEventRecencyWindow({
      windowId: "window-1",
      startsAtIso: "2026-07-11T09:00:00.000Z",
      endsAtIso: "2026-07-11T11:00:00.000Z",
      events: [eventOne, eventTwo],
    });
    const highlight = createAiGameObservedEventHighlightSummary({
      summaryId: "summary-1",
      windowId: window.windowId,
      title: "Eastern road warning",
      summary: "A local discovery and watch warning share the same recent window.",
      significance: "notable",
      eventIds: [eventOne.eventId, eventTwo.eventId],
      reasonCodes: ["shared-location", "recent-observation"],
    });
    const exported = createAiGameGossipExport({
      exportId: "gossip-1",
      exportedAtIso: "2026-07-11T11:05:00.000Z",
      audience: "npc",
      sourceWindow: window,
      highlights: [highlight],
    });

    expect(exported.sourceWindow.events.map((event) => event.eventId)).toEqual([
      "event-1",
      "event-2",
    ]);
    expect(exported.highlights[0]?.eventIds).toEqual(["event-1", "event-2"]);
    expect(Object.isFrozen(exported)).toBe(true);
    expect(Object.isFrozen(exported.sourceWindow)).toBe(true);
    expect(Object.isFrozen(exported.highlights)).toBe(true);
  });

  it("rejects invalid windows, duplicate events, and detached highlights", () => {
    expect(() =>
      createAiGameObservedEventRecencyWindow({
        windowId: "window-invalid",
        startsAtIso: "2026-07-11T11:00:00.000Z",
        endsAtIso: "2026-07-11T09:00:00.000Z",
        events: [eventOne],
      }),
    ).toThrow("startsAtIso must be before or equal to endsAtIso");

    expect(() =>
      createAiGameObservedEventRecencyWindow({
        windowId: "window-invalid",
        startsAtIso: "2026-07-11T09:00:00.000Z",
        endsAtIso: "2026-07-11T11:00:00.000Z",
        events: [eventOne, eventOne],
      }),
    ).toThrow("events must not contain duplicate values");

    const window = createAiGameObservedEventRecencyWindow({
      windowId: "window-1",
      startsAtIso: "2026-07-11T09:00:00.000Z",
      endsAtIso: "2026-07-11T11:00:00.000Z",
      events: [eventOne],
    });
    const detachedHighlight = createAiGameObservedEventHighlightSummary({
      summaryId: "summary-1",
      windowId: window.windowId,
      title: "Detached event",
      summary: "This summary refers to an event outside the window.",
      significance: "notable",
      eventIds: ["event-outside-window"],
    });

    expect(() =>
      createAiGameGossipExport({
        exportId: "gossip-invalid",
        exportedAtIso: "2026-07-11T11:05:00.000Z",
        audience: "public",
        sourceWindow: window,
        highlights: [detachedHighlight],
      }),
    ).toThrow("highlight eventIds must reference sourceWindow events");
  });

  it("rejects unsafe or unbounded event input", () => {
    expect(() =>
      createAiGameObservedEvent({
        eventId: "event-invalid",
        occurredAtIso: "2026-07-11T10:00:00.000Z",
        kind: "world",
        source: "world-state",
        subjectRef: "subject",
        summary: "Valid summary",
        significance: "routine",
        visibility: "private",
        tags: ["duplicate", "duplicate"],
      }),
    ).toThrow("tags must not contain duplicate values");

    expect(() =>
      createAiGameObservedEvent({
        eventId: "event-invalid",
        occurredAtIso: "2026-07-11T10:00:00.000Z",
        kind: "world",
        source: "world-state",
        subjectRef: "subject",
        summary: "Invalid\nsummary",
        significance: "routine",
        visibility: "private",
      }),
    ).toThrow("summary must not contain control characters");
  });
});
