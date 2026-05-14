# ADR-0004: Incident lifecycle, resolution, and world impact vectors

## Status

- Accepted
- Date: 2026-05-14
- Version: 1.0

## Context

Long-lived world effects (war, famine, supply disruptions) need stable lifecycle and impact modeling.

## Decision

- Represent incidents with explicit lifecycle states and resolution metadata.
- Define a bounded numeric impact vector with clamped values and scope.
- Include source event references and optional superseding links to preserve causality.

## Alternatives Considered

- Event-only logging without explicit incidents: rejected because downstream analytics and gameplay effects need stateful summaries.
- Ad-hoc numeric metadata maps: rejected in favor of constrained impact vectors.

## Consequences

- Incident queries can identify active/resolved/superseded/expired state consistently.
- Impact ordering and deterministic ranking can be implemented from a shared contract.
