# ADR-0010: Training contracts are consumed from `@plasius/training`

## Status

Accepted

## Context

Story `Plasius-LTD/plasius-ltd-site#421` needs Player System-readable training-state, institutional eligibility, trust-marker, and specialization recommendation contracts.

The institutional authority boundary already exists in the published `@plasius/training` package. Duplicating institution, trust, or track vocabulary inside `@plasius/ai-game` would create two competing sources of truth for the same progression model.

## Decision

`@plasius/ai-game` consumes the published `@plasius/training` package and re-exports the canonical training-state vocabulary from that dependency.

`@plasius/ai-game` adds only the bridge-layer contracts that are specific to Player System consumption:

- stage-gated institutional eligibility
- trust markers
- specialization recommendations
- a frozen snapshot bundle that packages progression plus bridge metadata

## Alternatives considered

1. Recreate the training enums and progression record locally in `@plasius/ai-game`.
   Rejected because it would drift from the authoritative package and violate the reuse-first rule.
2. Move all Player System recommendation shapes into `@plasius/training`.
   Rejected for now because the recommendation bundle is a consumer-facing bridge concern, not the core institutional authority boundary.

## Consequences

- Institutional vocabulary stays canonical in one published package.
- Player System consumers can depend on `@plasius/ai-game` for a ready-to-read bridge surface without redefining training doctrine.
- Dependency management must now verify compatibility with the published `@plasius/training` package during build and release checks.
