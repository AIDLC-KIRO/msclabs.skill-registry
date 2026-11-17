# Coupling Hotspots

## High Coupling: jobsh.js (Orchestrator)

`server/modules/jobsh.js` imports and directly calls functions from 7 other modules:
- careProvider, assistanceDentist, service, careProviderService
- patientAppointment, doctorSchedule, healthCheck

This creates a central coordination point. Any change to a module's exported function signature requires updating jobsh.js.

**Impact on decomposition**: If domains are separated into microservices, this orchestrator must be replaced with an event-driven or saga-based coordination pattern.

## High Coupling: event-bridge.js (Multi-Domain Writer)

`server/event-bridge.js` directly writes to tables owned by two different domains:
- RoomDetail (room-management domain)
- PatientAppointment (patient-appointment domain)

**Impact on decomposition**: Would need to be split into domain-specific event handlers or use inter-service API calls.

## High Coupling: doctorSchedule.js Workload Query

The workload calculation CTE in `doctorSchedule.js` joins 4 tables from 3 domains in a single query:
- DoctorSchedule (own), RoomDetail (room-management), PatientAppointment (patient-appointment), Service (care-provider)

**Impact on decomposition**: Requires a materialized view, data replication, or a dedicated analytics/reporting service.

## Medium Coupling: Frontend routes/index.js

`src/routes/index.js` fetches data from all 5 domains and passes it down as props. It is the single data-loading point for the entire frontend.

**Impact on decomposition**: In a microservices architecture, this would become a BFF (Backend-For-Frontend) or API gateway.

## Low Coupling: booking.js

The booking module has minimal coupling — it only reads from CareProvider, AssistanceDentist, and Workcase via SQL JOINs. No direct module imports from other domain services.
