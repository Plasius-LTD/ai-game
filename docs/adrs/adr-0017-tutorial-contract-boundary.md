# ADR 0017: Tutorial contract boundary

- Status: Accepted
- Date: 2026-07-11
- Decision Makers: Plasius engineering

## Context

The Player System needs portable tutorial contracts for first-contact
onboarding, contextual coaching, advanced progression gates, and replay. The
Tutorial System must teach per-action capabilities without becoming a permanent
foreground layer or overwhelming active combat. The rollout is controlled by
`isekai.player-system.tutorial.enabled`.

## Decision

`@plasius/ai-game` owns immutable, versioned contracts for tutorial steps,
progression state, prerequisite markers, contextual triggers, and tutorial
tracks. The public model:

- uses the five-stage evolution ladder from Stage 1 onboarding through Stage 5
  divine-dominion surfaces;
- supports awakening, first-action, explicit-request, and progression-gated
  triggers;
- keeps combat safety explicit per step and trigger so active combat can use
  reduced coaching only;
- represents `not-started`, `active`, `dormant`, `completed`, and `declined`
  progression states;
- records replayability, replay count, trigger timestamps, and completed step
  IDs; and
- models school, apprenticeship, academy, guild, divine, and spellcraft
  prerequisite markers without owning their authority.

Factories validate supported values, immutable nested arrays, positive sequence
numbers, non-negative counters, ISO timestamps, collection bounds, unique IDs,
and all step/prerequisite/trigger/progression references.

## Alternatives considered

- A monolithic linear tutorial payload: rejected because the TDR requires
  per-action and per-capability coaching with contextual resurfacing.
- Permanent foreground guidance: rejected because it would dominate the play
  experience and conflict with combat readability.
- Site-local tutorial state: rejected because Player System consumers need one
  portable progression and replay vocabulary.

## Consequences

Hosts can implement dormant contextual coaching and replay without inventing
their own progression or gating semantics. Institutional and progression
systems remain authoritative for prerequisite satisfaction; this package only
transports bounded markers and consumer-facing state. Incompatible payload
changes require a new contract version and ADR.

## Validation

Unit tests cover stage and trigger guards, prerequisite markers, combat-safe
steps, dormant/replay state, malformed metadata, reference integrity,
immutability, and collection bounds. Package lint, typecheck, coverage, build,
pack, audit, CI, and CD remain release gates.

## Related decisions

- ADR 0065: Tutorial Mode Operates as a Dormant Contextual Coach
- TDR-0033: Tutorial System Contextual Coaching and Combat Limits
