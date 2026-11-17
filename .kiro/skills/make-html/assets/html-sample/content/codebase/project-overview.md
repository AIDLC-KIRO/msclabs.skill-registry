# Project Overview

## Identity

| Field | Value |
|-------|-------|
| Name | dental-dashboard-app |
| Version | 1.1.0 |
| Description | Dental Dashboard App - Real-time dental clinic operations management |
| Author | AUTHOR_REDACTED |
| License | Proprietary |

## Purpose

A real-time dental clinic dashboard that enables clinic staff to:
- View and manage patient appointments by doctor/care provider
- Monitor room occupancy and doctor login/logout status
- Track patient status through the visit lifecycle (Booked → Arrived → Processing → Hold → End Service)
- Schedule and manage doctor availability
- Book rooms with dental assistants
- Receive real-time alerts for patients waiting beyond threshold (10 minutes)

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 16.13.1 |
| UI Framework | Material UI | 4.9.9 |
| CSS Framework | Bulma | 0.8.1 |
| Routing | React Router DOM | 5.1.2 |
| Real-time Client | Socket.IO Client | 4.8.0 |
| Backend | Express.js | 4.21.0 |
| Real-time Server | Socket.IO | 4.8.0 |
| Database | PostgreSQL | 14.2 |
| DB Driver | pg | 8.7.3 |
| Process Manager | PM2 | via ecosystem.config.js |
| Bundler | Webpack | 4.42.0 |
| Transpiler | Babel | 7.9.0 |
| Scheduler | node-schedule | 1.3.2 |

## Architecture Summary

The application consists of 3 microservices managed by PM2:

1. **app-service** (Port 8081) - Express REST API, serves data from in-memory cache, cluster mode
2. **event-bridge-service** (Port 8080) - Socket.IO server handling real-time room/patient status updates from OPD Queue system
3. **scheduler-service** - Cron jobs for syncing master data from TrakCare, refreshing appointments (active 6am-10pm)

## Deployment Model

- PM2 manages all 3 services with log rotation (10MB max, 30-day retention)
- Webpack bundles server code into `dist/` directory (3 entry points)
- React frontend served separately on port 3001 (development) or as static build
- Environment-specific configs via `.env.*` files
- Production deployment uses HTTPS with WSS for WebSocket

## External System Integration

- **TrakCare**: Hospital Information System providing patient data, appointments, care provider information, and doctor schedules via REST API
- Data is synced periodically (every 60 seconds during clinic hours) and cached in-memory for fast access

## Related Documentation

- [System Overview](./architecture/system-overview.md)
- [Components](./architecture/components.md)
- [Technical Debt Report](./technical-debt-report.md)
- [API Reference](./reference/api-reference.md)
