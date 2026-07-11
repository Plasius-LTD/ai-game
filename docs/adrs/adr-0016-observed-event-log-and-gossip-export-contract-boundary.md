# ADR 0016: Observed event log and gossip export contract boundary

- Status: Accepted
- Date: 2026-07-11
- Decision Makers: Plasius engineering
- Architecture anchors: ADR 0063, TDR 0031

## Context

The Player System needs a portable basis for recent player-observed events,
highlight summaries, and gossip exports. Consumers must be able to share the
same observation records without treating a derived gossip summary as a new
source of truth. The public package must also avoid carrying raw player
telemetry, account identifiers, or host-specific storage details.

## Decision

`@plasius/ai-game` owns the public contract family under
`isekai.player-system.logs.enabled`:

- `AiGameObservedEvent` is the bounded, privacy-safe observation record.
- `AiGameObservedEventRecencyWindow` is the time-bounded collection of those
  records and validates that every event falls inside the window.
- `AiGameObservedEventHighlightSummary` references event IDs from one window
  rather than copying a second event representation.
- `AiGameGossipExport` contains one recency window and summaries that must
  reference events in that same window.

Factories validate vocabulary, timestamps, identifier/text bounds, duplicate
IDs, window membership, and detached summary references. Returned objects and
arrays are defensively copied and frozen. Runtime persistence, privacy policy
enforcement, audience authorization, feature-flag evaluation, and gossip
generation remain owned by the consuming service.

## Alternatives considered

- Let each Player System consumer define its own event shape: rejected because
  recency and gossip consumers would drift in field meaning and visibility
  handling.
- Make gossip summaries self-contained copies of event payloads: rejected
  because duplicated event truth could diverge from the observation log.
- Publish raw telemetry or account identifiers: rejected because the public
  package must remain privacy-safe and portable across hosts.

## Consequences

- `ai-game` consumers share one event basis for logs, highlights, and gossip
  transport.
- A gossip export is traceable to recent observations without exposing host
  storage or private runtime metadata.
- Consumers must perform audience authorization and feature-flag evaluation
  before presenting or persisting an export.
