# ADR-0006: Perspective-gated relative knowledge projection

## Status

- Accepted
- Date: 2026-05-14
- Version: 1.0

## Context

Gossip needs to be constrained by locality, faction, and witness confidence.

## Decision

- Add projection envelopes for segment and NPC modes.
- Require witness channels, locality, faction, and relationship context as first-class fields.
- Require confidence and audience segment controls before topic becomes visible in an NPC projection.

## Alternatives Considered

- Global visibility model: rejected to prevent omniscience and data leakage.
- Ad-hoc projection filtering in consumers: rejected because this logic belongs in a shared contract boundary.

## Consequences

- Projection rules are testable and centrally documented.
- Consumers can enforce “secret/non-public” states without duplicating domain-specific checks.
