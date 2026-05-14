# ADR-0003: Authoritative ingestion, append-only ledger, and projector interfaces

## Status

- Accepted
- Date: 2026-05-14
- Version: 1.0

## Context

Candidate submissions and canonical events must remain authoritative and replay-safe for downstream consumers.

## Decision

- Split contract into candidate and canonical forms.
- Add validation receipt and commit interfaces for candidate flow.
- Add projector-facing checkpoint interfaces to represent deterministic replay progress independent of domain-specific storage.
- Require downstream consumers to use explicit checkpoint stores instead of implicit idempotency assumptions.

## Alternatives Considered

- Immediate-upsert-only persistence: rejected because it cannot support strict replay/validation guarantees.
- No explicit checkpoint contracts: rejected due auditability and restart safety needs.

## Consequences

- Ingestion paths can clearly distinguish accepted vs pending candidate events.
- Replay behavior is explicit and can be shared via generic graph primitives.
