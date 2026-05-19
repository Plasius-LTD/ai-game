# ADR-0007: Gossip spread, decay, correction, and resolution

## Status

- Accepted
- Date: 2026-05-14
- Version: 1.0

## Context

Rumors should decay, be corrected, and resolve with preserved lineage.

## Decision

- Add explicit topic statuses for active, corrected, resolved, and stale topics.
- Preserve lineage through replacement/supersession references.
- Expose expiration windows and projection status to allow deterministic age-based behavior.

## Alternatives Considered

- Blind overwrite of prior topics: rejected because it loses correction/audit trace.
- Hard delete on correction: rejected because consumers need traceability and rollbacks.

## Consequences

- Gossip pipelines can model correction and resolution without ambiguity.
- Consumers can report or render rumor lineage and freshness metadata.
