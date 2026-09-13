# ADR 001: Spherical Earth Model with Declared Radius R = 6,371,007.1809m

## Context
Map projection equations require a consistent reference Earth model to compute reference land surface areas.

## Decision
We adopted the standard spherical model with $R = 6,371,007.1809\text{ meters}$ across all analytical integrals and projection conversions.

## Consequences
Guarantees consistent denominators and removes ambiguity between ellipsoidal WGS84 and spherical D3 projection pipelines.
