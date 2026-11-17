# Traceability Matrix

## Feature → Source File Mapping

| Feature ID | Feature | Primary Source |
|------------|---------|----------------|
| F-PA-001 | Appointment Sync | server/modules/patientAppointment.js |
| F-PA-002 | Change Detection | server/modules/patientAppointment.js |
| F-PA-003 | Status Tracking | server/event-bridge.js |
| F-PA-004 | Dashboard Display | src/pages/Dashboard/index.js |
| F-PA-005 | Schedule View | src/pages/Schedule/table.js |
| F-PA-006 | History Archival | server/modules/patientAppointment.js |
| F-PA-007 | Status Events | server/event-bridge.js |
| F-PA-008 | Filtering | server/modules/patientAppointment.js |
| F-PA-009 | Special Time Codes | src/pages/Dashboard/tableSearch.js |
| F-PA-010 | Workload Calculation | server/modules/doctorSchedule.js |
| F-CP-001 | Provider Sync | server/modules/careProvider.js |
| F-CP-002 | Assistant Sync | server/modules/assistanceDentist.js |
| F-CP-003 | Service Sync | server/modules/service.js |
| F-CP-004 | Provider-Service Map | server/modules/careProviderService.js |
| F-CP-005 | Provider Search | src/pages/Dashboard/searchResource.js |
| F-CP-006 | Service Search | src/pages/Schedule/searchService.js |
| F-CP-007 | In-Memory Cache | server/modules/*.js (all) |
| F-DS-001 | Schedule Sync | server/modules/doctorSchedule.js |
| F-DS-002 | Schedule Change Detection | server/modules/doctorSchedule.js |
| F-DS-003 | Workload Calculation | server/modules/doctorSchedule.js |
| F-DS-004 | Schedule On Date | server/modules/doctorSchedule.js |
| F-DS-005 | Multiple Daily Refreshes | server/scheduler.js |
| F-RM-001 | Room Check-In | server/event-bridge.js |
| F-RM-002 | Room Check-Out | server/event-bridge.js |
| F-RM-003 | Conflict Resolution | server/event-bridge.js |
| F-RM-004 | Broadcasting | server/event-bridge.js, server/app.js |
| F-RM-005 | Active Room Query | server/modules/roomDetail.js |
| F-RM-006 | Room Delete | server/modules/roomDetail.js |
| F-RM-007 | Change Dedup | server/event-bridge.js |
| F-BK-001 | Calendar View | src/pages/Calendar/SimpleTable.js |
| F-BK-002 | Manual Booking | src/pages/Calendar/FormDialog.js |
| F-BK-003 | Excel Import | server/modules/upload.js |
| F-BK-004 | Date Retrieval | server/modules/booking.js |
| F-BK-005 | Permission Control | src/pages/Calendar/FormDialog.js |
| F-BK-006 | Work Cases | src/pages/Calendar/FormDialog.js |
| F-BK-007 | Cell Merging | src/pages/Calendar/SimpleTable.js |
