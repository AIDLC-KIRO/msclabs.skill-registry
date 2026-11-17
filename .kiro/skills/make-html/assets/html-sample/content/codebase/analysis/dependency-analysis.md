# Dependency Analysis

## External Dependency Risk Matrix

### Critical Path Dependencies

| Dependency | Used By | Failure Impact |
|-----------|---------|---------------|
| pg (PostgreSQL) | All backend modules | Total system failure |
| socket.io | event-bridge, app | Real-time updates stop |
| axios | patientAppointment, careProvider, doctorSchedule | TrakCare sync fails |
| express | app, event-bridge | API unavailable |
| node-schedule | scheduler | Automated sync stops |
| react | All frontend | UI non-functional |

### Dependency Coupling

```
HIGH COUPLING (used by 5+ modules):
  pgpool.js → used by ALL business modules (8 modules)
  accessToken.js → used by 6 modules (all TrakCare integrations)
  date-fns → used by 3 modules + scheduler

MEDIUM COUPLING (used by 2-4 modules):
  socket.io → event-bridge + app-service
  axios → 6 modules (via TrakCare API calls)
  logger.js → event-bridge + jobsh

LOW COUPLING (used by 1 module):
  exceljs → upload.js only
  react-calendar → Calendar page only
  react-autosuggest → Dashboard/Schedule search
  antd → Calendar page only
```

### Outdated Dependency Risk

| Risk Level | Package | Current | Latest Stable | Breaking Changes |
|-----------|---------|---------|---------------|-----------------|
| High | react | 16.13.1 | 19.x | Hooks paradigm, concurrent mode, new JSX transform |
| High | react-scripts | 3.4.1 | Deprecated | CRA deprecated; migrate to Vite/Next |
| High | webpack | 4.42.0 | 5.x | Module federation, asset modules, new config |
| High | @material-ui/* | 4.x | @mui/* 6.x | Package rename, emotion styling, theme API |
| Medium | axios | 0.19.2 | 1.x | FormData handling, interceptor API |
| Medium | react-router-dom | 5.1.2 | 7.x | Loader pattern, Route element API |
| Medium | antd | 4.1.1 | 5.x | Design tokens, CSS-in-JS removal |

### Transitive Dependency Concerns

- `react-scripts 3.4.1` pulls in Webpack 4, Babel 7.9, Jest 24, ESLint 6 — all outdated
- `@material-ui/core 4.x` depends on `@material-ui/styles` which uses deprecated JSS
- `bulma-extensions 6.2.7` is unmaintained (last update 2019)
- `react-autosuggest 10.0.0` is unmaintained (archived repository)

## Internal Module Dependency Analysis

### Circular Dependencies: None detected

### Module Stability (Afferent/Efferent coupling)

| Module | Afferent (used by) | Efferent (uses) | Instability |
|--------|-------------------|-----------------|-------------|
| pgpool.js | 8 | 1 (db) | 0.11 (very stable) |
| accessToken.js | 6 | 2 (pgpool, axios) | 0.25 (stable) |
| jobsh.js | 2 (scheduler, app) | 8 | 0.80 (unstable - orchestrator) |
| patientAppointment.js | 2 (routes, jobsh) | 3 | 0.60 (medium) |

## Related Documentation

- [Dependencies](../architecture/dependencies.md)
- [Code Metrics](./code-metrics.md)
- [Outdated Components](../technical-debt/outdated-components.md)
