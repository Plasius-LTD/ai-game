# ADR-0002: Canonical world event envelope and classification

## Status

- Accepted
- Date: 2026-05-14
- Version: 1.0

## Context

Downstream systems (ingestion, gossip, analytics, and gameplay systems) require a stable event envelope shared across producers and consumers.

## Decision

- Define a canonical `GameWorldEventCandidate` / `GameWorldEventCanonical` envelope split.
- Explicitly include identity, causation, timestamps, location, visibility, participants, and schema version metadata.
- Keep event payloads typed by event family (`monster.*`, `dungeon.*`, `war.*`, `famine.*`, `surplus.*`) with a required severity/tone summary pattern.

## Alternatives Considered

- Unstructured JSON payload contracts: rejected because of weak typing and weak replay semantics.
- Reusing generic graph envelopes: rejected because gameplay semantics require richer visibility and actor metadata.

## Consequences

- Consumers can filter by event family, actor role, and visibility class.
- Canonical storage and downstream projections stay deterministic and testable.
