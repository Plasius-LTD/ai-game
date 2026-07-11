# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.
## [Unreleased]

- **Added**
  - Added observed-event log, recency-window, highlight-summary, and gossip-export contracts under `isekai.player-system.logs.enabled`.
  - Added defensive validation and immutable factories so gossip highlights can only reference the observed events in their source window.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.5.0] - 2026-07-11

- **Added**
  - (placeholder)
  - Added bounded Player System guidance cue contracts with explicit alert
    priority, multimodal fallback identifiers, payload-size, and frequency
    metadata under `isekai.player-system.guidance-nfr.enabled`.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.4.0] - 2026-07-10

- **Added**
  - Added adaptive System mission contracts under `isekai.player-system.missions.enabled`, including mission-definition, objective-state, player-response, player-model influence, and bounded reward-envelope payloads.

- **Changed**
  - Extended the public package surface with progression-safe mission guidance metadata, explicit audio and visual feedback channels, and reward cap semantics for Player System consumers.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.3.0] - 2026-07-10

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.2.0] - 2026-07-10

- **Added**
  - Added versioned Player System session, focus-mode, module, alert-priority, and preference-learning contracts under `isekai.player-system.core.enabled`.
  - Added identity projection and target-classification contracts under `isekai.player-system.identity.enabled`, with self/full, knowledge-gated partial, and line-of-sight-safe target payloads.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.13] - 2026-06-28

- **Added**
  - Added academy-track bridge exports that re-expose authoritative school progression, academy admission, academic mission prerequisite, and track-selection contracts from `@plasius/training`.
  - Added `createAiGameAcademicTrainingSnapshot` for frozen Player System-readable school and academy progression bundles under `isekai.training.academies.enabled`.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.12] - 2026-06-23

- **Added**
  - Added martial training bridge exports that re-expose the authoritative barracks drill, mission unlock, martial technique, and bounded anti-spell fieldcraft contracts from `@plasius/training`.
  - Added `createAiGameMartialTrainingSnapshot` for frozen Player System-readable bundles under `isekai.training.martial.enabled`.

- **Changed**
  - Updated the published `@plasius/training` dependency baseline to `^0.1.5` so ai-game consumes the released martial authority surface.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.11] - 2026-06-23

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed the published dependency baselines to `@plasius/training@^0.1.4` and `@types/node@^26.0.0`, then regenerated the package lock from a clean install.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.10] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.9] - 2026-06-22

- **Added**
  - Added Player System-readable training bridge contracts that re-export canonical institutional progression state from `@plasius/training` and bundle stage-gated eligibility, trust markers, and specialization recommendations.

- **Changed**
  - Extended the public package surface to consume the published `@plasius/training` authority boundary instead of redefining institution, trust, or specialization vocabulary locally.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.8] - 2026-06-22
- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.7] - 2026-06-14

- **Added**
  - Implemented canonical world event contracts with candidate and canonical envelopes, taxonomy, payload typing, and visibility classes.
  - Added authoritative ingestion interfaces and replay-safe projection/checkpoint contracts.
  - Added incident lifecycle, resolution link, and impact vector models.
  - Added structured gossip topic contracts with lifecycle, confidence, and perspective projection projections.
  - Added Quiet Measure public contracts for hidden-axis summaries, derived reads, mission probe metadata, and Judgment eligibility or verdict responses under `isekai.player-system.quiet-measure.enabled`.
  - Documented the Quiet Measure hidden-runtime boundary so hosts can expose title-plus-verdict outputs without publishing raw per-player score storage.

- **Changed**
  - Extended the public package surface to include the Quiet Measure contract family alongside world-event and gossip exports while keeping host-private runtime weights out of the package API.

- **Fixed**
  - Hardened Quiet Measure runtime validation and defensive copying for public Judgment request, title, dominant-read, and reason-code payloads.

- **Security**
  - (placeholder)

## [0.1.2] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed dependencies to the latest stable published versions.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.1] - 2026-05-13

- Added initial public package scaffold with governance, legal, docs, build, test, and pack-check baselines.


[0.1.1]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.1
[0.1.2]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.2
[0.1.7]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.7
[0.1.8]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.8
[0.1.9]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.9
[0.1.10]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.10
[0.1.11]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.11
[0.1.12]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.12
[0.1.13]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.1.13
[0.2.0]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.2.0
[0.3.0]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.3.0
[0.4.0]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.4.0
[0.5.0]: https://github.com/Plasius-LTD/ai-game/releases/tag/v0.5.0
