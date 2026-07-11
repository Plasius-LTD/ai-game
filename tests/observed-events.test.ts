import { describe, expect, it } from "vitest";

import {
  AI_GAME_OBSERVED_EVENT_LOG_CONTRACT_VERSION,
  AI_GAME_OBSERVED_EVENT_LOG_FEATURE_FLAG_ID,
  createAiGameGossipExport,
  createAiGameObservedEvent,
  createAiGameObservedEventHighlightSummary,
  createAiGameObservedEventRecencyWindow,
  assertAiGameObservedEventLogContractVersion,
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

  it("covers the defensive validation boundary", () => {
    expect(() => assertAiGameObservedEventLogContractVersion("2.0")).toThrow(
      "contractVersion must be 1.0",
    );
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        eventId: " ",
      }),
    ).toThrow("eventId must be a non-empty string");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        occurredAtIso: "not-a-date",
      }),
    ).toThrow("occurredAtIso must be an ISO-8601 timestamp");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        summary: "x".repeat(501),
      }),
    ).toThrow("summary must be 500 characters or fewer");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        kind: "unknown",
      }),
    ).toThrow("kind must be one of");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        source: "database",
      }),
    ).toThrow("source must be one of");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        significance: "certain",
      }),
    ).toThrow("significance must be one of");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        visibility: "global",
      }),
    ).toThrow("visibility must be one of");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        tags: Array.from({ length: 21 }, (_, index) => `tag-${index}`),
      }),
    ).toThrow("tags must contain 20 items or fewer");
    expect(() =>
      createAiGameObservedEvent({
        ...eventOne,
        tags: ["x".repeat(65)],
      }),
    ).toThrow("tags[0] must be 64 characters or fewer");
  });

  it("rejects invalid recency, highlight, and export boundaries", () => {
    expect(() =>
      createAiGameObservedEventRecencyWindow({
        windowId: "window-invalid",
        startsAtIso: "2026-07-11T09:00:00.000Z",
        endsAtIso: "2026-07-11T11:00:00.000Z",
        events: [
          createAiGameObservedEvent({
            ...eventOne,
            eventId: "event-outside",
            occurredAtIso: "2026-07-11T12:00:00.000Z",
          }),
        ],
      }),
    ).toThrow("must occur inside the recency window");

    expect(() =>
      createAiGameObservedEventRecencyWindow({
        windowId: "window-too-large",
        startsAtIso: "2026-07-11T09:00:00.000Z",
        endsAtIso: "2026-07-11T11:00:00.000Z",
        events: Array.from({ length: 101 }, (_, index) => ({
          ...eventOne,
          eventId: `event-${index}`,
        })),
      }),
    ).toThrow("events must contain 100 items or fewer");

    expect(() =>
      createAiGameObservedEventHighlightSummary({
        contractVersion: "2.0",
        summaryId: "summary-invalid",
        windowId: "window-1",
        title: "Invalid version",
        summary: "Invalid version",
        significance: "notable",
        eventIds: [eventOne.eventId],
      }),
    ).toThrow("contractVersion must be 1.0");
    expect(() =>
      createAiGameObservedEventHighlightSummary({
        summaryId: "summary-invalid",
        windowId: "window-1",
        title: "Invalid significance",
        summary: "Invalid significance",
        significance: "certain",
        eventIds: [eventOne.eventId],
      }),
    ).toThrow("significance must be one of");
    expect(() =>
      createAiGameObservedEventHighlightSummary({
        summaryId: "summary-invalid",
        windowId: "window-1",
        title: "Empty references",
        summary: "Empty references",
        significance: "notable",
        eventIds: [],
      }),
    ).toThrow("eventIds must contain at least one event id");

    const window = createAiGameObservedEventRecencyWindow({
      windowId: "window-1",
      startsAtIso: "2026-07-11T09:00:00.000Z",
      endsAtIso: "2026-07-11T11:00:00.000Z",
      events: [eventOne],
    });
    const wrongWindowHighlight = createAiGameObservedEventHighlightSummary({
      summaryId: "summary-wrong-window",
      windowId: "window-2",
      title: "Wrong window",
      summary: "Wrong window",
      significance: "notable",
      eventIds: [eventOne.eventId],
    });
    expect(() =>
      createAiGameGossipExport({
        exportId: "gossip-invalid",
        exportedAtIso: "2026-07-11T11:05:00.000Z",
        audience: "public",
        sourceWindow: window,
        highlights: [wrongWindowHighlight],
      }),
    ).toThrow("highlight windowId must match sourceWindow windowId");
    expect(() =>
      createAiGameGossipExport({
        contractVersion: "2.0",
        exportId: "gossip-invalid",
        exportedAtIso: "2026-07-11T11:05:00.000Z",
        audience: "public",
        sourceWindow: window,
        highlights: [],
      }),
    ).toThrow("contractVersion must be 1.0");
    expect(() =>
      createAiGameGossipExport({
        exportId: "gossip-invalid",
        exportedAtIso: "2026-07-11T11:05:00.000Z",
        audience: "admin",
        sourceWindow: window,
        highlights: [],
      }),
    ).toThrow("audience must be one of");
    expect(() =>
      createAiGameGossipExport({
        exportId: "gossip-duplicate-highlights",
        exportedAtIso: "2026-07-11T11:05:00.000Z",
        audience: "public",
        sourceWindow: window,
        highlights: [
          createAiGameObservedEventHighlightSummary({
            summaryId: "same-summary",
            windowId: window.windowId,
            title: "Duplicate one",
            summary: "Duplicate one",
            significance: "notable",
            eventIds: [eventOne.eventId],
          }),
          createAiGameObservedEventHighlightSummary({
            summaryId: "same-summary",
            windowId: window.windowId,
            title: "Duplicate two",
            summary: "Duplicate two",
            significance: "notable",
            eventIds: [eventOne.eventId],
          }),
        ],
      }),
    ).toThrow("highlights must not contain duplicate values");
  });
});
