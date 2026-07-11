# ADR 0018: Apprenticeship handoff contract boundary

## Status

Accepted

## Context

The Player System needs to route an apprentice from sponsorship and supervised
practice into spellcraft, item-crafting, or dungeon-crafting workflows. Training
authority belongs to `@plasius/training`, and execution authority belongs to the
destination system. A Player System contract must therefore carry enough
evidence to start a downstream request without becoming a second source of
truth or approving the requested work.

## Decision

`@plasius/ai-game` publishes versioned apprenticeship bridge contracts under
`isekai.training.apprenticeship.enabled`:

- sponsorship records identify the pseudonymous apprentice, sponsor, institution,
  discipline, and limited scope;
- supervision records identify the active supervisor and checkpoint model;
- readiness records carry trust, track, prerequisites, and the fail-closed state;
- handoff envelopes are request-only and target exactly one authoritative system:
  `spellcraft-system`, `item-crafting-system`, or `dungeon-crafting-system`.

Handoffs contain correlation/request IDs, opaque subject IDs, and downstream-facing
intent. They do not contain secrets, hidden System state, authority decisions, or
execution results. The receiving system remains responsible for validation,
authorization, mutation, and final outcome.

## Alternatives considered

1. Put the full apprenticeship model in `@plasius/ai-game` — rejected because
   `@plasius/training` already owns institutional progression and trust.
2. Let the Player System call each crafting system with bespoke payloads —
   rejected because it would duplicate boundary and rollout semantics across
   consumers.
3. Publish a generic untyped map — rejected because downstream contracts need
   stable, validated target-specific fields and explicit authority ownership.

## Consequences

- Consumers get one stable bridge surface and one inherited rollout key.
- Downstream systems can evolve their authoritative schemas without making
  `@plasius/ai-game` an execution dependency.
- Opaque subject identifiers and bounded arrays make the public payload suitable
  for privacy-safe routing and replay diagnostics.
- Each destination package still needs its own authoritative implementation and
  release before a handoff is executable in production.

## Validation and rollback

Factory tests validate version, identifiers, timestamps, enums, readiness gates,
immutability, and target routing. Disabling
`isekai.training.apprenticeship.enabled` is the rollback path; consumers must
fail closed and keep their authority-side state unchanged.
