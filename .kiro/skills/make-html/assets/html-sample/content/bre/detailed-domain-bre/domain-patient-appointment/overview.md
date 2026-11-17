# Patient Appointment Domain

## Overview

The Patient Appointment domain manages the lifecycle of dental patient appointments from booking through arrival, processing, and end of service. It serves as the primary transactional domain of the Dental Dashboard system.

## Bounded Context

This domain owns the patient appointment lifecycle including creation (synced from TrakCare HIS), status transitions, history archival, and real-time dashboard presentation.

## Primary Entities

| Entity | Table | Description |
|--------|-------|-------------|
| PatientAppointment | PatientAppointment | Active patient appointments for the current period |
| PatientAppointmentHistory | PatientAppointmentHistory | Archived historical appointment records |
| PatientAppointmentTemp | PatientAppointmentTemp | Staging table for change detection during TrakCare sync |
| PatientStatus | PatientStatus | Lookup table for appointment status codes |

## Source Files

| File | Role | LOC |
|------|------|-----|
| server/modules/patientAppointment.js | service | 765 |
| src/pages/Dashboard/index.js | controller (UI) | 555 |
| src/pages/Dashboard/tableSearch.js | helper (UI) | 359 |
| src/pages/Schedule/index.js | controller (UI) | 242 |
| src/pages/Schedule/table.js | helper (UI) | 1388 |
| src/routes/index.js | controller (UI data hub) | 507 |

## Key Relationships

- References `CareProvider` (via CarpCode) for dentist assignment
- References `Service` (via ServiceCode) for appointment service type
- References `RoomDetail` (via Room/CarpCode) for room assignment
- References `DoctorSchedule` for workload calculation
