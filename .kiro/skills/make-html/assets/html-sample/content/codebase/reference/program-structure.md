# Program Structure

## Directory Layout

```
dental-dashboard/
├── server/                          # Backend (Node.js/Express)
│   ├── app.js                       # Main API service entry point (Port 8081)
│   ├── event-bridge.js              # Real-time event hub entry point (Port 8080)
│   ├── scheduler.js                 # Background task scheduler entry point
│   ├── logger.js                    # Logging utility (rolling file)
│   ├── swagger.json                 # API documentation spec
│   ├── test.js                      # Test utilities
│   ├── configs/
│   │   └── schedule-config.js       # Scheduler timing configuration
│   ├── middlewares/
│   │   └── index.js                 # CORS and header configuration
│   ├── modules/                     # Active business logic modules
│   │   ├── db/index.js              # PostgreSQL connection pool
│   │   ├── pgpool.js                # Query execution with retry
│   │   ├── accessToken.js           # OAuth token management (TrakCare)
│   │   ├── assistanceDentist.js     # Dental assistant data
│   │   ├── booking.js               # Room booking CRUD
│   │   ├── careProvider.js          # Doctor/provider data
│   │   ├── careProviderService.js   # Doctor-service mapping
│   │   ├── doctorSchedule.js        # Doctor schedule management
│   │   ├── healthCheck.js           # System health status
│   │   ├── jobsh.js                 # Task orchestration
│   │   ├── patientAppointment.js    # Patient appointment logic
│   │   ├── roomDetail.js            # Room occupancy management
│   │   ├── service.js               # Dental services catalog
│   │   ├── signonTrakcare.js        # TrakCare authentication
│   │   └── upload.js                # File upload handler
│   ├── modules.old/                 # Legacy backup (16 files, inactive)
│   └── routes/
│       └── index.js                 # API route definitions
├── src/                             # Frontend (React)
│   ├── index.js                     # React app entry point
│   ├── App.js                       # Root component (navbar)
│   ├── AppAssis.js                  # Assistant variant of App
│   ├── setupProxy.js                # Development proxy config
│   ├── serviceWorker.js             # PWA service worker
│   ├── Home/
│   │   └── index.js                 # Home page component
│   ├── routes/
│   │   ├── index.js                 # Main routing + state management
│   │   └── LinearIndeterminate.js   # Loading indicator
│   └── pages/
│       ├── About/index.js           # About page
│       ├── Calendar/                # Room booking calendar
│       │   ├── index.js             # Calendar main component
│       │   ├── AlertDialogSlide.js  # Confirmation dialog
│       │   ├── FormDialog.js        # Booking form dialog
│       │   ├── SimpleTable.js       # Booking table
│       │   └── index.test.js        # Calendar tests
│       ├── Dashboard/               # Real-time dashboard
│       │   ├── index.js             # Dashboard main component
│       │   ├── table.js             # Appointment table
│       │   ├── tableSearch.js       # Searchable table
│       │   ├── searchResource.js    # Resource autocomplete
│       │   └── styles.js            # MUI styles
│       ├── Login/
│       │   └── index.js             # Login page
│       ├── Logout/
│       │   └── index.js             # Logout handler
│       └── Schedule/                # Schedule view
│           ├── index.js             # Schedule main component
│           ├── table.js             # Schedule table
│           ├── searchResource.js    # Resource search
│           ├── searchService.js     # Service search
│           └── selectTime.js        # Time selection
├── webpack.config.js                # Server-side webpack bundle config
├── ecosystem.config.js              # PM2 process manager config
├── package.json                     # NPM dependencies and scripts
├── dental-db-20241224.sql           # Database dump (PostgreSQL 14.2)
├── CreateIndexKey-1.sql             # Database index definitions
├── sonar-project.properties         # SonarQube config
└── .env*                            # Environment configurations
```

## File Statistics

| Category | Files | Approx. LOC |
|----------|-------|-------------|
| Backend (server/) | 25 active | ~3,500 |
| Frontend (src/) | 28 | ~4,000 |
| Configuration | 8 | ~300 |
| SQL | 2 | ~23,000 |
| Legacy (modules.old/) | 16 | ~2,500 |
| **Total (active)** | **63** | **~7,800** |

## Related Documentation

- [Modules](./modules.md)
- [Components](../architecture/components.md)
- [System Overview](../architecture/system-overview.md)
