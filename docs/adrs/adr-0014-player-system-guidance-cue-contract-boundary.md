# ADR 0014: Player System guidance cue contract boundary

- Status: Accepted
- Date: 2026-07-11
- Decision Makers: Plasius engineering

## Context

The Player System guidance shell needs shared contracts for multimodal cues,
but the site must not invent cue priority, fallback, or delivery-budget
semantics independently. Missing audio or narration must leave an accessible
non-audio path, while payload and frequency assumptions must remain bounded for
client performance planning.

## Decision

`@plasius/ai-game` owns the portable guidance-cue metadata contract under
`isekai.player-system.guidance-nfr.enabled`. Cues reuse the existing alert
priority vocabulary and identify their source, matching fallback behavior,
maximum payload size, and maximum occurrences per minute. The package exposes
the three supported fallback mappings for voice, narration, and speech
capture, and validates source/fallback alignment and budget bounds.

The package owns contract vocabulary and validation only. Site/runtime
repositories own feature-flag evaluation, user-facing translations, live
telemetry, and actual rendering or speech delivery.

## Alternatives considered

- Keep cue metadata site-local: rejected because downstream Player System
  consumers would reinterpret fallback and budget semantics independently.
- Expose raw audio provider details: rejected because provider topology and
  operational details are not portable public contract data.
- Allow unbounded payload and frequency values: rejected because consumers
  could not enforce predictable shell performance assumptions.

## Consequences

- Consumers receive a stable, reusable contract for priority, fallback, and
  bounded delivery assumptions.
- The shared package does not leak runtime topology or account/player data.
- Site and runtime implementations must keep their symbolic mappings aligned
  with the published fallback identifiers.
