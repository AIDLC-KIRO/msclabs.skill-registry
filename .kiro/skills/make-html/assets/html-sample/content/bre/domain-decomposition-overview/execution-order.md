# Execution Order

## Recommended Implementation/Extraction Order

| Phase | Domain | Rationale |
|-------|--------|-----------|
| 1 | care-provider | Foundation master data; no domain dependencies |
| 2 | doctor-schedule | Depends on care-provider (DoctorCode = CarpCode) |
| 3 | room-management | Depends on care-provider (CarpCode, AssistCode) |
| 4 | patient-appointment | Depends on care-provider, doctor-schedule, room-management |
| 5 | booking | Depends on care-provider; independent of patient-appointment |

## Dependency Graph

```
care-provider (no deps)
    ↓
doctor-schedule (depends on: care-provider)
    ↓
room-management (depends on: care-provider)
    ↓
patient-appointment (depends on: care-provider, doctor-schedule, room-management)

booking (depends on: care-provider) — can be extracted in parallel with phases 2-3
```

## Notes

- **care-provider** must be first because all other domains reference its entities
- **booking** has minimal coupling and could be extracted at any point after care-provider
- **patient-appointment** is last due to its dependencies on all three preceding domains for workload calculation
