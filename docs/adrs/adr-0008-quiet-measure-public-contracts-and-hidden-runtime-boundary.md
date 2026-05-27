# ADR-0008: Quiet Measure public contracts and hidden runtime boundary

## Status

- Accepted
- Date: 2026-05-14
- Version: 1.0

## Context

The Isekai Player System needs a hidden character-inference layer that can shape missions, social reactions, and explicit Judgment rituals.

That layer must be discoverable through the public `@plasius/ai-*` package family for developers, evaluators, and deep players, but runtime hosts must not be forced into exposing raw hidden metrics as an ordinary UI feature.

## Decision

- Reserve `@plasius/ai-game` as the public contract boundary for Quiet Measure concepts, including hidden axes, evidence summaries, mission-probe archetypes, Judgment request/response models, and caste-title descriptors.
- Keep raw per-player scores, private inference weights, evidence retention strategy, and host-specific disclosure policy outside the public contract package.
- Model the difference between System-scoped truth and NPC/faction-scoped observed reputation explicitly so hosts do not collapse omniscient judgment into every consumer.
- Prefer structured verdicts and reason codes over freeform alignment prose in public contracts.
- Keep evaluation fixtures and regression datasets for hero-villain-mask classification in `@plasius/ai-evals` rather than embedding them into `@plasius/ai-game`.

## Alternatives Considered

- Keep Quiet Measure entirely private with no public contracts:
  - rejected because cross-package integration, public discoverability, and downstream tooling become inconsistent.
- Publish raw runtime score storage models:
  - rejected because hosts need freedom to keep player-specific hidden data private and nondisplayed.
- Put the feature primarily in `@plasius/ai` instead of `@plasius/ai-game`:
  - rejected because the domain concepts are game-specific rather than generic capability contracts.

## Consequences

- Deep technical consumers can discover that the hidden system exists without receiving a turnkey visible morality meter.
- Host applications can implement different storage, privacy, and disclosure policies while sharing one canonical contract vocabulary.
- `@plasius/ai-evals` becomes the natural home for regression fixtures that test fake heroes, fake villains, tyrants, protectors, and redemption arcs.
