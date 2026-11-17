# Code Metrics

## Project Size

| Metric | Value |
|--------|-------|
| Total source LOC (active) | ~7,800 |
| Total LOC (incl. SQL, legacy) | ~85,399 |
| Active source files | 63 |
| Legacy/backup files | 16 |
| External dependencies (production) | 32 |
| External dependencies (dev) | 18 |
| Database tables | 13 |
| API endpoints | 19 |
| Socket.IO events | 6 |

## File Size Distribution

| File | LOC | Complexity |
|------|-----|-----------|
| server/modules/patientAppointment.js | ~450 | High |
| src/routes/index.js | ~350 | High |
| server/event-bridge.js | ~310 | Medium |
| server/modules/jobsh.js | ~230 | Medium |
| server/modules/doctorSchedule.js | ~200 | Medium |
| src/pages/Dashboard/index.js | ~200 | Medium |
| src/pages/Calendar/index.js | ~180 | Medium |
| src/pages/Schedule/index.js | ~150 | Medium |

## Language Distribution

| Language | Files | Percentage |
|----------|-------|-----------|
| JavaScript (ES6+) | 55 | 87% |
| CSS | 6 | 10% |
| JSON (config) | 3 | 3% |

## Test Coverage

| Test File | Coverage Area |
|-----------|--------------|
| src/pages/Calendar/index.test.js | Calendar component rendering |
| src/setupTests.js | Test environment setup |

**Coverage Assessment**: Minimal - only 1 test file for entire frontend. No backend tests present.

## Related Documentation

- [Complexity Analysis](./complexity-analysis.md)
- [Dependency Analysis](./dependency-analysis.md)
- [Program Structure](../reference/program-structure.md)
