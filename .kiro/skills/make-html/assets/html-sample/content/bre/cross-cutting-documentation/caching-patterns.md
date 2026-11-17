# Caching Patterns

## In-Memory Caching Strategy

The Dental Dashboard uses a module-level variable caching pattern. Each server module maintains a `dataInMem` variable that holds the latest query results.

### Cache Architecture

```
Request → Express Route → Module.loadDataInMem() → Return dataInMem variable → JSON Response
                                                       ↑
Scheduler → Module.retrieveDataToMem() → DB Query → Update dataInMem
```

### Cached Data Sets

| Module | Variable | Refresh Trigger | Content |
|--------|----------|----------------|---------|
| careProvider.js | dataInMem | Daily sync + startup | All care providers (sorted by NameEN) |
| assistanceDentist.js | dataInMem | Daily sync + startup | All dental assistants |
| service.js | dataInMem | Daily sync + startup | All services |
| careProviderService.js | dataInMem | On-demand per date | Provider-service mapping for date |
| patientAppointment.js | dataInMem | Every 60s + events | Today's appointments grouped by provider |
| patientAppointment.js | dataFilterInMem | Every 60s + events | Filtered appointments (shouldInclude logic) |
| patientAppointment.js | dataPatientStatusInMem | Every 60s + events | Patient status with room mapping |
| roomDetail.js | dataInMem | On room events | Active room assignments |
| doctorSchedule.js | dataInMem | Every 60s + 3x daily | Workload metrics per room |
| booking.js | dataInMem | On date change | Bookings for current date |

### Refresh Mechanisms

1. **Scheduled refresh**: Every 60 seconds via `taskRetrieveDataToMemory()`
2. **Event-driven refresh**: Socket.IO events trigger immediate refresh of affected caches
3. **Daily refresh**: Full master data re-sync at 00:01
4. **On-demand**: Some caches refreshed on specific API calls (e.g., booking by date)

### Cache Invalidation

No explicit invalidation mechanism. Caches are overwritten on each refresh cycle. Stale data can persist for up to 60 seconds between scheduled refreshes (mitigated by event-driven refresh for room and patient status).

### No External Cache

The system does not use Redis, Memcached, or any external cache. All caching is process-local, meaning each Node.js process has its own independent cache.
