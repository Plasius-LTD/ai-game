# Event Recorder System

Status: Proposed  
Last updated: 2026-05-13

## Purpose

Create a canonical, server-authoritative event ledger for world and gameplay events so downstream systems can answer who did what, where it happened, when it happened, whether it was resolved, how it was resolved, and what changed in the surrounding world.

This system is the factual input plane for NPC gossip, world-state projections, analytics, moderation review, and operational replay.

## Goals

- Accept player-submitted and system-produced event inputs through one normalized contract.
- Preserve enough structure to identify participants, locations, causation, timelines, resolution, and impact.
- Support both one-shot events such as monster kills and long-lived incidents such as wars, famine, and dungeon occupation.
- Keep the canonical record replayable, auditable, and safe for downstream projection.
- Feed scheduled or micro-batched downstream processors without making those processors reconstruct raw gameplay facts.

## Non-goals

- Rendering final NPC dialogue text.
- Making clients authoritative for world history.
- Replacing low-level combat logs, traces, or metrics used only for engine diagnostics.
- Collapsing every system into one mutable table without replay support.

## Upstream producers

- Player clients submit candidate action events for their own actions.
- The game synchronization/server-authority layer validates those submissions and emits authoritative world events.
- World simulation services emit authoritative system events for spawns, despawns, ecology shifts, wars, disasters, and scheduled content.
- LiveOps or GM tooling may emit approved world-management events through the same canonical contract.

Client submissions are inputs to validation, not canonical facts. Only authoritative or derived post-validation records enter the event ledger.

## Core model

```ts
interface GameEvent {
  eventId: string;
  incidentId?: string;
  correlationId?: string;
  causationEventId?: string;
  schemaVersion: string;
  type: string;
  category:
    | "combat"
    | "exploration"
    | "world"
    | "settlement"
    | "economy"
    | "politics"
    | "ecology"
    | "magic"
    | "system";
  occurredAtEpochMs: number;
  recordedAtEpochMs: number;
  worldTime: {
    realmId: string;
    shardId?: string;
    season?: string;
    tick?: number;
  };
  source: {
    channel: "player_action" | "system" | "liveops" | "derived";
    producerId: string;
    authority: "authoritative" | "derived";
    submissionId?: string;
  };
  status: "recorded" | "active" | "resolved" | "superseded" | "expired";
  visibility: "public" | "local_public" | "faction_limited" | "party_limited" | "secret" | "system_only";
  participants: EventParticipant[];
  locations: EventLocation[];
  impact?: WorldImpact;
  resolution?: EventResolution;
  tags: string[];
  payload: Record<string, unknown>;
}
```

```ts
interface EventParticipant {
  entityId: string;
  entityType: "player" | "npc" | "monster" | "faction" | "settlement" | "dungeon" | "system";
  role:
    | "actor"
    | "target"
    | "victim"
    | "witness"
    | "beneficiary"
    | "commander"
    | "spawn_owner"
    | "resolver";
  factionId?: string;
  displayAlias?: string;
}
```

```ts
interface EventLocation {
  worldId: string;
  regionId?: string;
  settlementId?: string;
  siteId?: string;
  dungeonId?: string;
  cellId?: string;
  coordinates?: { x: number; y: number; z?: number };
  radiusMeters?: number;
}
```

## Event taxonomy

The system should use a stable top-level taxonomy with versioned typed payloads beneath it. Example event types:

- `combat.monster_spawned`
- `combat.monster_killed`
- `world.dungeon_created`
- `world.dungeon_cleared`
- `politics.war_declared`
- `politics.war_hero_recorded`
- `ecology.famine_started`
- `economy.food_surplus_recorded`

The taxonomy needs to stay boring and queryable. Richness belongs in the typed payload, not in inconsistent human-readable strings.

## Instant events and long-lived incidents

The recorder must support both:

- atomic events, such as a monster kill or a single spawn;
- incident threads, such as a war, famine, or dungeon occupation that accumulates related events over time.

`incidentId` groups related facts into one narrative thread. The append-only ledger keeps every fact immutable, while a derived incident projection holds the current state of that thread, including whether it is active or resolved.

## Resolution and world impact

Resolution must be modeled explicitly rather than inferred from missing future activity.

```ts
interface EventResolution {
  resolvedAtEpochMs: number;
  resolvedByParticipants: string[];
  resolutionType: "defeat" | "clearance" | "containment" | "negotiation" | "attrition" | "abandonment" | "system_timeout";
  summary: string;
  closingEventId?: string;
}

interface WorldImpact {
  scope: "local" | "regional" | "global";
  intensity: 1 | 2 | 3 | 4 | 5;
  dimensions: {
    security?: number;
    economy?: number;
    ecology?: number;
    politics?: number;
    morale?: number;
    magic?: number;
    population?: number;
  };
}
```

This lets the system answer:

- when a dungeon became active and when it was cleared;
- who ended a war or famine event;
- whether a hero event materially changed morale or politics;
- whether an event should matter only locally or echo regionally.

## Processing flow

1. Client or system producers emit a candidate event input.
2. The server-authoritative gameplay layer validates identity, permissions, causality, and world-state consistency.
3. Validation emits a canonical `GameEvent` into the append-only event ledger.
4. Deduplication, ordering, and schema guards run before the event is accepted into downstream projections.
5. A projector updates derived read models such as incident state, participant history, and location timelines.
6. A scheduled or micro-batched exporter publishes gossip candidate seeds for the NPC Gossip system.
7. Consumers replay from checkpoints rather than mutating the canonical ledger in place.

The ingestion and projector mechanics should reuse `@plasius/graph-events` patterns for idempotency, ordering, checkpointing, and batch safety instead of inventing a second generic event processor.

## Storage and query surfaces

The recorder needs four logical storage shapes:

- an immutable event ledger keyed by `eventId`;
- an incident projection keyed by `incidentId`;
- secondary indexes by participant, location, and time window;
- a downstream export checkpoint for gossip and other projectors.

The immutable ledger answers historical and audit questions. The projections answer current-state and query-performance questions.

## Governance and safety rules

- World state remains server authoritative, matching `plasius-ltd-site/docs/tdrs/Isekai/tdr-0018-gs-authority-and-world-event-consolidation.md`.
- Large-scale world events must remain compatible with `plasius-ltd-site/docs/Design/Isekai/05-liveops-and-event-governance.md`.
- Account identifiers, secrets, and private moderation metadata must never enter public-facing event payloads.
- Visibility classification is mandatory so downstream gossip cannot leak impossible knowledge.
- Replay must be deterministic within a schema version.
- Resolutions are additive follow-up facts plus derived projections, not destructive edits of original history.

## Output to NPC Gossip

The recorder should not generate rumors directly. It should publish structured, factual event and incident seeds that contain:

- source event ids and incident ids;
- participants and their roles;
- canonical location and scope;
- novelty and impact signals;
- visibility and resolution status.

NPC Gossip consumes those seeds and turns them into relative knowledge.

## ADR roadmap

- ADR-0002 defines the canonical event envelope and classification rules.
- ADR-0003 defines authoritative ingestion, append-only storage, and projection flow.
- ADR-0004 defines incident lifecycle, resolution, and impact modeling.
