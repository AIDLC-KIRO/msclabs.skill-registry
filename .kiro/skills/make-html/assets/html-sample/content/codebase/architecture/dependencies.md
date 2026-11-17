# Dependencies

## External Dependencies (Production)

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| react | ^16.13.1 | UI framework | **High** - EOL, upgrade to 18/19 |
| react-dom | ^16.13.1 | React DOM rendering | **High** - EOL |
| react-scripts | 3.4.1 | CRA build tooling | **High** - Deprecated |
| @material-ui/core | ^4.9.9 | UI component library | **High** - EOL (now @mui/material 5/6) |
| @material-ui/icons | ^4.9.1 | Material icons | **High** - EOL |
| @material-ui/lab | ^4.0.0-alpha.48 | Material lab components | **High** - EOL |
| express | ^4.21.0 | HTTP server framework | Current |
| socket.io | ^4.8.0 | WebSocket server | Current |
| socket.io-client | ^4.8.0 | WebSocket client | Current |
| pg | ^8.7.3 | PostgreSQL client | Current |
| axios | ^0.19.2 | HTTP client | **Medium** - v1.x available |
| react-router-dom | ^5.1.2 | Client routing | **Medium** - v6 available |
| antd | ^4.1.1 | UI component library | **Medium** - v5 available |
| bulma | ^0.8.1 | CSS framework | **Medium** - v1.0 available |
| node-schedule | ^1.3.2 | Cron scheduler | **Medium** - v2.x available |
| node-fetch | ^2.7.0 | HTTP fetch for Node | Current (for Node <18) |
| cors | ^2.8.5 | CORS middleware | Current |
| exceljs | ^3.8.2 | Excel file handling | **Medium** - v4.x available |
| express-fileupload | ^1.1.7-alpha.2 | File upload middleware | **Medium** - Alpha version |
| http-proxy-middleware | ^3.0.3 | Dev proxy | Current |
| concurrently | ^5.1.0 | Parallel npm scripts | Current |
| nodemon | ^2.0.2 | Dev auto-restart | **Low** - v3.x available |
| react-calendar | ^2.19.2 | Calendar widget | **Medium** - v5.x available |
| react-autosuggest | ^10.0.0 | Autocomplete | Unmaintained |
| react-simple-timefield | ^3.0.0 | Time input | Current |
| react-test-renderer | ^16.13.1 | Test utility | Matches React version |
| simple-node-logger | ^18.12.24 | Logging | Current |
| swagger-ui-express | ^4.6.3 | API docs UI | Current |
| rimraf | ^6.0.1 | Directory cleanup | Current |
| bulma-extensions | ^6.2.7 | Bulma plugins | Unmaintained |
| autosuggest-highlight | ^3.1.1 | Search highlighting | Current |

## External Dependencies (Development)

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| webpack | 4.42.0 | Module bundler | **High** - EOL, v5 stable |
| webpack-cli | ^3.3.12 | Webpack CLI | **High** - v5 for Webpack 5 |
| @babel/core | ^7.9.0 | JS transpiler | **Low** - newer minor available |
| @babel/cli | ^7.8.4 | Babel CLI | Current |
| @babel/node | ^7.8.7 | Babel node runner | Current |
| @testing-library/react | ^9.5.0 | React testing | **Low** - v14+ available |
| enzyme | ^3.11.0 | React testing | **High** - Unmaintained |
| enzyme-adapter-react-16 | ^1.15.2 | Enzyme adapter | Tied to React 16 |
| clean-webpack-plugin | ^4.0.0 | Build cleanup | Current |
| express-rate-limit | ^7.4.0 | Rate limiting | Current |
| helmet | ^7.1.0 | Security headers | Current |
| morgan | ^1.10.0 | HTTP logging | Current |
| nodemon-webpack-plugin | ^4.8.2 | Dev tooling | Current |
| object-hash | ^3.0.0 | Object hashing | Current |
| rotating-file-stream | ^3.2.5 | Log rotation | Current |
| wait-on | ^4.0.2 | Port waiting | Current |
| webpack-bundle-analyzer | ^4.10.2 | Bundle analysis | Current |
| webpack-node-externals | ^1.7.2 | Node externals | **Low** - v3.x available |
| winston | ^3.14.2 | Logging | Current |
| winston-daily-rotate-file | ^5.0.0 | Log rotation | Current |

## Internal Module Dependencies

```
server/app.js
├── server/routes/index.js
│   ├── server/modules/doctorSchedule.js
│   ├── server/modules/careProviderService.js
│   ├── server/modules/healthCheck.js
│   ├── server/modules/jobsh.js
│   ├── server/modules/assistanceDentist.js
│   ├── server/modules/patientAppointment.js
│   ├── server/modules/signonTrakcare.js
│   ├── server/modules/roomDetail.js
│   ├── server/modules/careProvider.js
│   ├── server/modules/service.js
│   ├── server/modules/upload.js
│   └── server/modules/booking.js
├── server/middlewares/index.js
├── server/modules/jobsh.js (for event handlers)
└── server/logger.js

server/modules/jobsh.js (Job Scheduler)
├── server/modules/service.js
├── server/modules/careProvider.js
├── server/modules/assistanceDentist.js
├── server/modules/careProviderService.js
├── server/modules/doctorSchedule.js
├── server/modules/roomDetail.js
├── server/modules/patientAppointment.js
├── server/modules/healthCheck.js
└── server/logger.js

server/modules/patientAppointment.js
├── server/modules/accessToken.js
└── server/modules/pgpool.js
    └── server/modules/db/index.js

src/routes/index.js (Frontend State Hub)
├── src/pages/Dashboard/index.js
├── src/pages/Schedule/index.js
├── src/pages/Calendar/index.js
└── socket.io-client (Event Bridge connection)
```

## Related Documentation

- [System Overview](./system-overview.md)
- [Components](./components.md)
- [Dependency Analysis](../analysis/dependency-analysis.md)
- [Outdated Components](../technical-debt/outdated-components.md)
