# ADR-0005: Structured Gossip Topics as the Output Boundary

## Status

- Proposed
- Date: 2026-05-13
- Version: 1.0

## Context

NPC gossip needs to feed natural-language chat, but storing only pre-rendered sentences would make localization, style variation, correction handling, and moderation harder. Downstream dialogue systems need structured facts, not frozen lines.

## Decision

- Make `GossipTopic` the canonical output of the gossip subsystem rather than finalized text.
- Each topic must reference source events or incidents and include structured facts, salience, freshness, certainty, visibility, and speech hints.
- Keep tone and wording as hints for the dialogue layer instead of committing to one sentence form.
- Roll out structured topic publication behind `ai.game.npc-gossip.topics.enabled`, evaluated server side, with local env override break-glass only.

## Consequences

- Dialogue generation can vary phrasing by NPC, language, and context without losing grounding.
- Corrections and resolutions update structured facts rather than requiring string surgery.
- Consumers must perform an extra rendering step to turn topics into final utterances.
- Topic schemas become a public contract that needs version discipline.
