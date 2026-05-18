# ADR-0005: Structured gossip topics as output boundary

## Status

- Accepted
- Date: 2026-05-14
- Version: 1.0

## Context

NPC dialogue must be driven from structured content, not pre-rendered prose.

## Decision

- Define gossip topics with source references, certainty, salience, certainty and speech hints.
- Model source lineage and expiry explicitly so downstream generators can choose rendering shape.

## Alternatives Considered

- Pre-generated dialogue strings as contract: rejected to avoid localization and moderation lock-in.
- Domain-agnostic freeform payload: rejected because moderation and projection rules become inconsistent.

## Consequences

- Dialogue/NPC rendering can generate language locally and safely from structured facts.
- Source/event linkage remains stable across systems.
