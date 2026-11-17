# Validation Criteria

## Migration Success Criteria

### Functional Validation

| Criterion | Description | How to Validate |
|-----------|-------------|-----------------|
| F-001 | All 19 API endpoints return correct data structure | Automated API test suite |
| F-002 | Socket.IO events fire and propagate correctly | Integration test with mock OPD |
| F-003 | Patient status lifecycle works end-to-end | Simulate B→A→P→H→E flow |
| F-004 | Room login/logout correctly updates DB and emits events | POST tests + WebSocket listener |
| F-005 | Scheduler runs tasks at configured times | Log verification in test environment |
| F-006 | Dashboard displays real-time updates within 6 seconds | Frontend E2E test |
| F-007 | Alarm/blink logic triggers after 10-minute threshold | Time-mock test |
| F-008 | Calendar booking CRUD operations work | API + UI test |
| F-009 | TrakCare sync correctly stages and promotes data | Temp table diff verification |
| F-010 | Health check accurately reflects TrakCare connectivity | Mock API failure test |

### Non-Functional Validation

| Criterion | Description | Threshold |
|-----------|-------------|-----------|
| NF-001 | API response time from in-memory cache | < 50ms (p95) |
| NF-002 | Event Bridge POST processing time | < 200ms (p95) |
| NF-003 | Frontend initial load time | < 3 seconds |
| NF-004 | Memory usage under normal load | < 512MB per service |
| NF-005 | WebSocket connection stability | No disconnects under normal operation |
| NF-006 | Database connection pool utilization | < 80% of max pool |

### Regression Checks

| Check | Description |
|-------|-------------|
| R-001 | No increase in error rate after migration |
| R-002 | All existing Swagger-documented endpoints still functional |
| R-003 | Production environment variables still valid |
| R-004 | PM2 ecosystem config still valid for deployment |
| R-005 | Log rotation continues working |
| R-006 | Database indexes still applied correctly |

### Security Validation

| Check | Description |
|-------|-------------|
| S-001 | API key authentication still enforced |
| S-002 | Rate limiting functional |
| S-003 | Helmet headers present in responses |
| S-004 | IP filtering active (if configured) |
| S-005 | No new security vulnerabilities introduced (npm audit) |

## Acceptance Criteria Format

Each migration phase is complete when:
1. All functional tests pass for affected components
2. No regression in unaffected components
3. Build completes without errors
4. Application starts and serves requests
5. Real-time updates flow correctly
6. No new npm audit vulnerabilities introduced

## Related Documentation

- [Component Order](./component-order.md)
- [Test Specifications](./test-specifications.md)
- [Security Patterns](../analysis/security-patterns.md)
- [Error Handling](../behavior/error-handling.md)
