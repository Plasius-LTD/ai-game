# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.
## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

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
