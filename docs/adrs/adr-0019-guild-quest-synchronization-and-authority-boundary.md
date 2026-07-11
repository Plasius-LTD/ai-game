# ADR 0019: Guild-quest synchronization and authority boundary

- Status: Accepted
- Date: 2026-07-11
- Decision Makers: Plasius engineering

## Context

The Player System needs to show guild-issued quests, progress, failure state,
and reward expectations without becoming the source of guild contract truth.
The same quest can be displayed alongside internal System missions, so
advisory recommendations must not be confused with guild-owned status,
consequences, rank gates, or rewards.

## Decision

`@plasius/ai-game` owns the portable guild-quest contract boundary under
`isekai.player-system.guild-quests.enabled`. Each quest separates
`guildTruth` from `systemAnnotations`. Guild truth contains the guild contract
identity, revisioned status, objective progress, failure details, and a
preview-only reward model. System annotations contain only advisory
recommendations, synergy codes, linked mission identifiers, and reason codes.

Synchronizations carry a guild authority revision, quest upserts, and explicit
removed-quest tombstones. A reward preview is never a grant; the guild remains
the authority for eligibility, reward resolution, rank gates, and consequences.

The package validates and freezes public payloads. Runtime repositories own
feature-flag evaluation, authorization, persistence, conflict resolution, and
actual guild operations.

## Alternatives considered

- Put guild-quest models in the site: rejected because package consumers would
  duplicate authority and synchronization semantics.
- Merge System recommendations into guild status: rejected because advisory
  metadata could be mistaken for authoritative state.
- Treat an empty quest list as a full synchronization: rejected because a
  partial or failed sync could delete valid quests; tombstones make removals
  explicit.

## Consequences

- Guilds remain the source of truth while Player System consumers receive a
  stable, portable read contract.
- Consumers can recompute or discard System annotations without mutating guild
  state.
- Runtime adapters must preserve authority revisions and must not turn reward
  previews into client-side grants.
