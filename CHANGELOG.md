# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

## [Unreleased]

- **Added**
  - Implemented canonical world event contracts with candidate and canonical envelopes, taxonomy, payload typing, and visibility classes.
  - Added authoritative ingestion interfaces and replay-safe projection/checkpoint contracts.
  - Added incident lifecycle, resolution link, and impact vector models.
  - Added structured gossip topic contracts with lifecycle, confidence, and perspective projection projections.
  - Documented the public `@plasius/ai-game` contract boundary for Quiet Measure hidden-character inference, mission probes, and Judgment verdict models while keeping raw runtime scores host-private by default.
  - Added Player System Points Store ledger, spend-policy, authority-boundary, and proto-social devolution contracts for `PP`, `ESP`, `TIS`, and `DIS`.

- **Changed**
  - Extended public package surface to include all world-event, gossip, and points-store contract families needed by `ai-game` and Player System consumers.
  - Moved npm publication to a protected-main-safe release-prep PR workflow with reconciled package, tag, and npm version state.

- **Fixed**
  - Preserved release-branch version and changelog edits so protected-main publish runs can complete from prepared metadata on `main`.
  - Detected unpublished prepared releases from `main` metadata instead of merge-commit titles so merged release PRs actually publish.
  - Promoted `Unreleased` changelog entries into versioned release sections with shell-compatible heading detection.

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
