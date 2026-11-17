# Shared Kernel

## Shared Infrastructure Components

### PostgreSQL Connection Pool (pgpool.js)

- **Source**: `server/modules/pgpool.js` (37 LOC)
- **Used by**: All 5 domains
- **Purpose**: Provides database query execution with exponential backoff retry (3 attempts)
- **Pattern**: Wraps `server/modules/db/index.js` which configures the pg Pool

### OAuth2 Access Token (accessToken.js)

- **Source**: `server/modules/accessToken.js` (35 LOC)
- **Used by**: care-provider, doctor-schedule, patient-appointment
- **Purpose**: Obtains OAuth2 bearer token from TrakCare for API authentication

### Job Scheduler Orchestrator (jobsh.js)

- **Source**: `server/modules/jobsh.js` (285 LOC)
- **Used by**: care-provider, doctor-schedule, patient-appointment
- **Purpose**: Orchestrates scheduled data sync tasks, coordinates refresh order

### Logger (logger.js)

- **Source**: `server/logger.js` (61 LOC)
- **Used by**: All domains
- **Purpose**: Winston-based logging with daily rotation

### Health Check (healthCheck.js)

- **Source**: `server/modules/healthCheck.js` (150 LOC)
- **Used by**: All TrakCare-integrated domains
- **Purpose**: Aggregates API health status across all TrakCare endpoints
