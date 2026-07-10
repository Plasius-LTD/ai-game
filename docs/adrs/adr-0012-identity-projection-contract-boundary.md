# ADR 0012: Identity projection and target-classification contract boundary

## Status

Accepted

## Context

The Player System needs to expose self-state and line-of-sight target overlays
without making the UI or `@plasius/ai-game` the authority for identity truth.
Target knowledge is not uniform: some targets are fully known, some are only
partially understood, and occluded targets must not leak hidden fields.

## Decision

`@plasius/ai-game` owns the versioned, dependency-free projection contract
behind `isekai.player-system.identity.enabled`. The identity-card system remains
the authority owner and these payloads are projection-only.

- Self projections are always `self` / full-read payloads.
- Target projections use `allied`, `neutral`, `unknown`, and `unfriendly`
  categories.
- A target receives a full read only when it is in line of sight and its
  knowledge state is full.
- Partial or unknown knowledge redacts fields to `Unknown`.
- Missing line of sight marks a target `occluded`, forces a partial read, and
  redacts fields to `Withheld`.

Consumers must filter through `selectAiGameVisibleIdentityTargets()` before
rendering target surfaces. No hidden score, authority mutation, credential, or
raw identity source data belongs in this boundary.

## Alternatives considered

1. Reuse the site’s identity-card implementation directly. Rejected because it
   would couple a reusable package to site runtime code and make cross-package
   consumers depend on the authority implementation.
2. Return all target fields and let consumers redact them. Rejected because
   consumer-side redaction is easy to omit and risks omniscient disclosure.
3. Collapse partial and occluded targets into one state. Rejected because
   line-of-sight is an independent visibility gate needed by combat-safe UI and
   target selection.

## Consequences

The runtime, interface, and site can share one vocabulary for self reads,
target categories, knowledge gates, and line-of-sight semantics. Factories
fail closed and return immutable snapshots, while authority ownership stays
outside this package.

## Validation

Tests cover all category and gate states, full/partial/occluded reads,
redaction values, visible-target selection, immutability, version checks, and
malformed input rejection.
