# ADR 0021: Preserve AI-game rollout keys across the training 1.x upgrade

Status: Accepted

## Context

Dependency Task #6 under Plasius-LTD/plasius-ltd-site#293 upgrades the bridge
from training 0.2 to the published training 1.0.2 package. The upstream package
renamed its rollout constants from `isekai.training.*` to `harmony.training.*`.
Re-exporting those constants changed AI-game's existing public string values
and failed its contract tests, even though the authority types and helpers
remain compatible.

## Decision

Continue using the canonical training package for all institutions, trust,
specialization types, validation, and construction. Keep the three established
AI-game training rollout identifiers as explicit compatibility constants at the
bridge boundary. The bridge does not evaluate flags or duplicate authority
logic. A separate, intentional API migration is required to rename these keys.

The dependency wave inherits `ops.dependency-refresh.latest-stable.2026-05.enabled`
from the parent Feature; application rollout remains site-controlled. Direct
training consumers retain training's new Harmony keys.

## Alternatives and consequences

Adopting the new string values would silently change configured rollout gates.
Keeping the old dependency would leave consumers behind the verified upstream
release. Explicit compatibility constants allow the upgrade without either
behavior. Existing callers and their rollout configuration remain unchanged.

## Validation and rollback

A regression test checks the upstream 1.x key and all three stable bridge keys.
Existing training behavior tests, typecheck, build, lint, coverage and package
checks verify the upgrade. Every changed source file must appear in LCOV.
Rollback pins the prior published AI-game version; existing flag keys require
no operator migration.
