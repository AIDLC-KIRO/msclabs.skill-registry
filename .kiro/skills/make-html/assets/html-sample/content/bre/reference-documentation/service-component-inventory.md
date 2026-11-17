# Service/Component Inventory

## Backend Services (server/modules/)

| # | Service Name | File | LOC | Purpose |
|---|-------------|------|-----|---------|
| 1 | PatientAppointment | server/modules/patientAppointment.js | 765 | Appointment CRUD, sync, change detection |
| 2 | DoctorSchedule | server/modules/doctorSchedule.js | 339 | Schedule sync, workload calculation |
| 3 | EventBridge | server/event-bridge.js | 444 | Real-time event processing server |
| 4 | JobScheduler | server/modules/jobsh.js | 285 | Task orchestration |
| 5 | CareProviderService | server/modules/careProviderService.js | 226 | Provider-service mapping |
| 6 | Scheduler | server/scheduler.js | 181 | Cron job runner |
| 7 | App | server/app.js | 198 | Express application setup |
| 8 | CareProvider | server/modules/careProvider.js | 151 | Provider master data sync |
| 9 | HealthCheck | server/modules/healthCheck.js | 150 | API health monitoring |
| 10 | AssistanceDentist | server/modules/assistanceDentist.js | 147 | Assistant master data sync |
| 11 | Service | server/modules/service.js | 122 | Service catalog sync |
| 12 | Booking | server/modules/booking.js | 104 | Booking management |
| 13 | Upload | server/modules/upload.js | 93 | Excel file import |
| 14 | RoomDetail | server/modules/roomDetail.js | 86 | Room assignment queries |
| 15 | SignonTrakcare | server/modules/signonTrakcare.js | 63 | User authentication |
| 16 | Logger | server/logger.js | 61 | Logging configuration |
| 17 | Routes | server/routes/index.js | 60 | Route definitions |
| 18 | PGPool | server/modules/pgpool.js | 37 | Database connection pool |
| 19 | AccessToken | server/modules/accessToken.js | 35 | OAuth2 token management |
| 20 | Middlewares | server/middlewares/index.js | 17 | CORS middleware |
| 21 | ScheduleConfig | server/configs/schedule-config.js | 10 | Schedule configuration |
| 22 | DBIndex | server/modules/db/index.js | 66 | PostgreSQL pool setup |

## Frontend Components (src/)

| # | Component | File | LOC | Purpose |
|---|-----------|------|-----|---------|
| 1 | ScheduleTable | src/pages/Schedule/table.js | 1388 | 15-min time grid view |
| 2 | FormDialog | src/pages/Calendar/FormDialog.js | 718 | Booking creation form |
| 3 | SimpleTable | src/pages/Calendar/SimpleTable.js | 601 | Calendar booking grid |
| 4 | Dashboard | src/pages/Dashboard/index.js | 555 | Main dashboard view |
| 5 | RoutesDataHub | src/routes/index.js | 507 | Central data fetching |
| 6 | CalendarPage | src/pages/Calendar/index.js | 404 | Calendar page controller |
| 7 | TableSearch | src/pages/Dashboard/tableSearch.js | 359 | Appointment detail table |
| 8 | DashboardTable | src/pages/Dashboard/table.js | 280 | Room assignment table |
| 9 | SchedulePage | src/pages/Schedule/index.js | 242 | Schedule page controller |
| 10 | DashSearchResource | src/pages/Dashboard/searchResource.js | 213 | Dentist autocomplete |
| 11 | SchedSearchResource | src/pages/Schedule/searchResource.js | 205 | Dentist autocomplete |
| 12 | SearchService | src/pages/Schedule/searchService.js | 202 | Service autocomplete |
| 13 | Login | src/pages/Login/index.js | 153 | Login page |
| 14 | App | src/App.js | 122 | Admin app shell |
| 15 | Home | src/Home/index.js | 72 | Auth routing gate |
