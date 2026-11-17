# Migration Planning - Component Order

## Dependency-Based Migration Order

Components should be migrated in the following order based on their dependency relationships and risk level:

### Phase 1: Infrastructure (No Breaking Dependencies)

| Order | Component | Rationale |
|-------|-----------|-----------|
| 1.1 | Remove dead code (modules.old/, .old files) | No runtime impact, reduces confusion |
| 1.2 | Security fixes (TLS, CORS, trust proxy) | Independent of framework versions |
| 1.3 | Upgrade axios 0.19→1.x | Used by backend only, isolated change |
| 1.4 | Upgrade node-schedule 1→2 | Scheduler module only |

### Phase 2: Build System Migration

| Order | Component | Rationale |
|-------|-----------|-----------|
| 2.1 | Migrate CRA → Vite (frontend build) | Prerequisite for React upgrade |
| 2.2 | Upgrade Webpack 4→5 (server build) | Independent of frontend |
| 2.3 | Update Babel config | Follows build tool changes |

### Phase 3: Frontend Framework Upgrade

| Order | Component | Rationale |
|-------|-----------|-----------|
| 3.1 | Remove Enzyme, ensure Testing Library works | Prerequisite for React 18 |
| 3.2 | Upgrade React 16→18 | Core framework change |
| 3.3 | Migrate @material-ui/core → @mui/material | After React 18 (MUI 5 requires React 17+) |
| 3.4 | Upgrade react-router-dom 5→6 | After React 18 (v6 requires React 16.8+ but best with 18) |
| 3.5 | Replace react-autosuggest with MUI Autocomplete | After MUI 5 migration |

### Phase 4: Frontend Architecture

| Order | Component | Rationale |
|-------|-----------|-----------|
| 4.1 | Extract state management from routes/index.js | Enables incremental component migration |
| 4.2 | Convert class components to function components | After state management extraction |
| 4.3 | Replace polling with pure event-driven updates | After hooks migration |

### Phase 5: Backend Improvements

| Order | Component | Rationale |
|-------|-----------|-----------|
| 5.1 | Extract SQL queries to separate layer | Enables testing |
| 5.2 | Add backend test coverage | Before further refactoring |
| 5.3 | Separate concerns in patientAppointment.js | After tests provide safety net |

## Migration Risk Assessment

| Phase | Risk | Mitigation |
|-------|------|-----------|
| Phase 1 | Low | Changes are isolated, easily reversible |
| Phase 2 | Medium | Build failures possible; keep CRA as fallback |
| Phase 3 | High | React 18 breaking changes, MUI API changes | Incremental, feature-flag approach |
| Phase 4 | Medium | Functional changes to state management | Strong test coverage first |
| Phase 5 | Low | Backend continues working during refactor |

## Related Documentation

- [Test Specifications](./test-specifications.md)
- [Validation Criteria](./validation-criteria.md)
- [Remediation Plan](../technical-debt/remediation-plan.md)
- [Dependencies](../architecture/dependencies.md)
