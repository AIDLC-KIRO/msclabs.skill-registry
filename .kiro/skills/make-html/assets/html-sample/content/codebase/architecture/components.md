# Components

## Service Components

### 1. App Service (`server/app.js`)
**Port**: 8081 | **Mode**: Cluster (PM2)

The main REST API service that:
- Serves all frontend data requests from in-memory cache
- Provides Swagger UI documentation at `/api-docs`
- Connects as a Socket.IO client to Event Bridge for real-time event forwarding
- Applies security middleware (Helmet, rate limiting, API key validation, IP filtering)
- Triggers in-memory data refresh when events are received

**Key middleware chain**: CORS → Helmet → Rate Limit → API Key Check → IP Filter → Morgan Logger → Routes

### 2. Event Bridge (`server/event-bridge.js`)
**Port**: 8080 | **Mode**: Fork (single instance)

Real-time event processing hub that:
- Receives POST requests from external OPD Queue system (room login/logout, patient status updates)
- Writes state changes directly to PostgreSQL
- Broadcasts Socket.IO events to all connected clients (frontend + app-service)
- Deduplicates events using object-hash comparison
- Provides its own Express server with security (Helmet, rate limiting)

### 3. Scheduler Service (`server/scheduler.js`)
**Mode**: Fork (single instance)

Background task orchestrator that:
- Runs daily master data refresh at 00:01 (care providers, services, assistants, doctor schedules)
- Refreshes doctor schedules at 07:30, 11:30, 16:30
- Syncs appointment data every 60 seconds (6am-10pm only)
- Backs up appointment history and purges old data at midnight
- Purges log files older than 90 days

## Frontend Components

### 4. Routes Controller (`src/routes/index.js`)
Central state management component (React class component) that:
- Fetches all initial data from 11 API endpoints on mount
- Manages WebSocket connections for real-time updates
- Polls API every 6 seconds for data freshness
- Implements alarm/blink logic for patient waiting time alerts
- Routes to Dashboard, Schedule, Calendar, and Logout views

### 5. Dashboard Page (`src/pages/Dashboard/index.js`)
Main real-time view displaying:
- 30 room grid with doctor/assistant assignments
- Patient appointment timelines per doctor
- Visual indicators (blinking) for patients waiting > 10 minutes
- Color-coded patient status (Processing, Hold, End Service, Arrived, Booked)

### 6. Schedule Page (`src/pages/Schedule/index.js`)
Schedule management view with:
- Doctor appointment list with filtering
- Resource search (autosuggest)
- Service search
- Time-based scheduling grid

### 7. Calendar Page (`src/pages/Calendar/index.js`)
Room booking management:
- Calendar-based date selection
- Room booking form (doctor, assistant, room, time, workcase)
- Booking table with existing reservations
- CRUD operations for bookings

### 8. Login/Logout (`src/pages/Login/`, `src/pages/Logout/`)
- TrakCare authentication integration
- Session management (sessionStorage)
- Credential-based login form

## Backend Modules

### 9. Database Pool (`server/modules/db/index.js`, `server/modules/pgpool.js`)
- PostgreSQL connection pool with configurable max connections
- Query execution wrapper with timing logs
- Retry logic with exponential backoff (3 retries, 1000ms base)
- Connection checkout timeout warnings

### 10. Job Scheduler (`server/modules/jobsh.js`)
Task orchestration module providing:
- `taskGetMasterDataFromTrakcare` - Full master data sync
- `taskIntervalGetDataFromTrakcare` - Periodic appointment sync
- `taskRetrieveDataToMemory` - Load all data into memory cache
- `taskValidateAppointmentChangeEvent` - Change detection
- `taskBackupHistory` - Appointment archival

### 11. Patient Appointment (`server/modules/patientAppointment.js`)
Core business logic for:
- In-memory appointment data management
- TrakCare API data fetching and staging
- Change event validation (temp table diff)
- Status mapping (Booked/Arrived/Processing/Hold/End Service/Canceled)
- History archival

### 12. Other Modules
- `careProvider.js` - Doctor/care provider data management
- `careProviderService.js` - Doctor-service mapping
- `doctorSchedule.js` - Doctor schedule management with temp table validation
- `roomDetail.js` - Room occupancy tracking
- `service.js` - Dental services catalog
- `assistanceDentist.js` - Dental assistant data
- `booking.js` - Room booking CRUD
- `signonTrakcare.js` - TrakCare authentication
- `upload.js` - File upload handling
- `healthCheck.js` - System health monitoring
- `accessToken.js` - OAuth token management for TrakCare

## Related Documentation

- [System Overview](./system-overview.md)
- [Dependencies](./dependencies.md)
- [Modules Reference](../reference/modules.md)
- [API Reference](../reference/api-reference.md)
