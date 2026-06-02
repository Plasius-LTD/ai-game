# ADR-0003: Authoritative Ingestion, Append-Only Ledger, and Projections

## Status

- Proposed
- Date: 2026-05-13
- Version: 1.0

## Context

Players, world simulation, and operational tooling all need to feed the same event system, but client claims cannot become canonical history without validation. The system also needs replay, auditability, idempotency, and safe downstream batching for gossip and other consumers.

## Decision

- Treat player-originated submissions as candidate inputs that must be validated by the server-authoritative gameplay layer before they become canonical events.
- Store accepted canonical events in an append-only ledger.
- Build mutable read models and downstream exports through projector pipelines instead of editing historical records in place.
- Reuse `@plasius/graph-events` style idempotency, ordering, checkpointing, and batch processing patterns where generic primitives already exist.
- Roll out ingestion and projector behavior behind `ai.game.event-recorder.ingestion.enabled`, evaluated server side, with local env override break-glass only.

## Consequences

- Replay and audit become straightforward because history is immutable.
- Downstream systems can rebuild derived state after bugs or schema changes.
- Storage and projector complexity increase because the system now keeps both facts and projections.
- Validation remains the boundary that protects world authority from bad or duplicated client input.
