# Architecture & System Design

```text
Natural Earth 1:50m + World Bank WDI + OWID CO2
                   │
         Python fetch & validation (ETL)
                   │
       Canonical Geo entities + observations
                   │
        Node / TS shared-geo analytics
                   │
      Python independent verification gates
                   │
         Immutable Release (<release_id>)
           ┌───────┴────────┬──────────────┐
     Parquet & SQLite   TopoJSON / JSON   Manifest
           │                │
     FastAPI Backend   Vite / React Web
           │                │
           └────────┬───────┘
          DataProvider Layer
           (HTTP / Snapshot)
                    │
         10 Interactive Features
```

## DataProvider Abstraction

The frontend consumes data exclusively through a strongly typed `DataProvider` interface:
- `HttpDataProvider`: Calls the FastAPI analytical server over HTTP.
- `SnapshotDataProvider`: Reads directly from pre-packaged, immutable JSON releases in `apps/web/public/data/<release_id>/`.
- `createDataProvider()`: Probes the API health endpoint with a 1500ms timeout on startup. If the API is sleeping or unreachable, it immediately activates the offline snapshot mode without blocking or crashing the UI.
