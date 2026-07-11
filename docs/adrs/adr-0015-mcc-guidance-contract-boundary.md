# ADR 0015: MCC guidance contract boundary

- Status: Accepted
- Date: 2026-07-11
- Decision Makers: Plasius engineering

## Context

The Player System needs a portable contract for declared MCC growth direction,
bounded readiness and warnings, and spellcraft guidance. Consumers must be able
to render and route guidance without copying MCC feasibility rules or exposing
raw internal telemetry. The feature is rolled out by
`isekai.player-system.mcc-guidance.enabled`.

## Decision

`@plasius/ai-game` owns immutable, versioned bridge payloads for:

- focus targets that reuse the authoritative training package's
  `internalized`, `externalized`, and `hybrid` vocabulary;
- bounded `stable`, `pressured`, and `restricted` readiness bands with explicit
  thermal, fatigue, chaos-pressure, target-burden, stage-gate, and
  death-impairment warnings; and
- spellcraft recommendations and advisory payloads that retain readiness,
  prerequisites, target burden, complexity, chaos pressure, and fatigue state.

Spellcraft payloads are explicitly `preview-only` and identify
`spellcraft-system` as the authoritative owner. The package does not validate
spell feasibility, mutate MCC state, or author spells.

Factories defensively validate supported vocabularies, contract versions,
bounded influence weights, warning severity consistency, focus references, and
snapshot cardinality, then freeze returned payloads and nested arrays.

## Alternatives considered

- Keep MCC guidance site-local: rejected because Player System consumers would
  duplicate growth, readiness, and advisory semantics.
- Reimplement training-track values in this package: rejected because the
  published `@plasius/training` package is the authority for those values.
- Return raw MCC telemetry or mark spellcraft as approved: rejected because it
  would expose hidden implementation detail and collapse advisory guidance into
  authoritative spell validation.

## Consequences

Consumers receive a stable, dependency-light vocabulary for guidance and can
render bounded warnings consistently. MCC and Spell Crafting System owners keep
authority over feasibility, state mutation, and spell authoring. Incompatible
payload changes require a new contract version and ADR.

## Validation

Unit tests cover vocabulary guards, bounded focus influence, warning severity
derivation, advisory-only ownership, reference validation, and immutable
snapshots. Package lint, typecheck, coverage, build, pack, and dependency audit
remain release gates.

## Related decisions

- ADR 0064: MCC Guidance and Spellcraft Steering Flow Through the Player System
- TDR-0032: MCC Guidance and Core Growth Steering
