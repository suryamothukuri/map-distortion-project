# ADR 002: Dual DataProvider Architecture for Zero-Cost Resilience

## Context
Free-tier cloud backends sleep when inactive, causing 60-second cold starts.

## Decision
Implemented a unified `DataProvider` interface with `HttpDataProvider` and `SnapshotDataProvider`. Probing checks the live API on startup with a 1500ms timeout and falls back seamlessly to the immutable offline snapshot.

## Consequences
Visitors always experience instant, zero-latency rendering with 100% feature parity.
