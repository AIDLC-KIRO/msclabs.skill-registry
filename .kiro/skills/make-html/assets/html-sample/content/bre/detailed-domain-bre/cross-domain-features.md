# Cross-Domain Features

## CDF-001: Workload Dashboard

Spans: patient-appointment, doctor-schedule, room-management, care-provider

The workload dashboard combines data from all four domains:
- DoctorSchedule provides available time slots
- PatientAppointment provides booked service minutes
- RoomDetail provides active room assignments
- CareProvider provides staff identity

Workload = SUM(service_minutes) / SUM(slot_minutes), displayed as color-coded room buttons.

## CDF-002: Real-Time Event Broadcasting

Spans: room-management, patient-appointment

The Socket.IO event bridge processes room and patient status events, broadcasting changes to both the main API server (for in-memory refresh) and directly to frontend clients.

## CDF-003: TrakCare Data Synchronization

Spans: care-provider, doctor-schedule, patient-appointment

Periodic synchronization from TrakCare HIS uses a shared pattern:
1. OAuth2 token acquisition (accessToken.js)
2. API data fetch
3. Temp table staging (for schedule and appointment)
4. Change detection (EXCEPT queries or key matching)
5. Upsert to main tables
6. In-memory cache refresh

## CDF-004: Schedule/Calendar Integration

Spans: booking, doctor-schedule, care-provider

The Calendar page shows planned bookings alongside doctor available time slots, filtered by provider services.
