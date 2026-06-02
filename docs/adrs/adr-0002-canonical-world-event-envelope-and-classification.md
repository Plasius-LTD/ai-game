# ADR-0002: Canonical World Event Envelope and Classification

## Status

- Proposed
- Date: 2026-05-13
- Version: 1.0

## Context

The game needs one fact model for player actions and system world changes so downstream systems can answer who acted, what happened, where it happened, and why the event matters. Without a shared contract, NPC gossip, analytics, and liveops tooling will all invent incompatible event shapes.

## Decision

- Introduce an immutable `GameEvent` envelope with stable fields for ids, causation, timestamps, type, category, visibility, participants, locations, typed payload, and optional impact and resolution summaries.
- Classify events with a queryable taxonomy such as combat, exploration, world, economy, politics, ecology, magic, and system.
- Separate canonical entity ids from outward-facing aliases so public consumers do not depend on account identifiers.
- Persist only authoritative or derived canonical events in the world ledger; raw client submissions remain validation inputs, not historical facts.
- Roll out this contract behind `ai.game.event-recorder.contracts.enabled`, evaluated server side, with any local env override treated as break-glass only.

## Consequences

- Producers and consumers share one factual event shape.
- Event search and projection can use consistent participant and location roles.
- Schema evolution must be handled through versioned payloads and compatibility rules.
- New event families can extend the taxonomy without breaking older consumers that only inspect the stable envelope.
