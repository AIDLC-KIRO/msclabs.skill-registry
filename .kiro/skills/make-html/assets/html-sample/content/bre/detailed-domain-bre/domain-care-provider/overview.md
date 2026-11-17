# Care Provider Domain

## Overview

The Care Provider domain manages master data for dental staff (dentists and dental assistants) and the service catalog. It synchronizes personnel and service data from the TrakCare HIS and maintains a mapping of which services each provider can perform on a given date.

## Bounded Context

This domain owns the identity and capabilities of dental care staff. It is a master data domain — primarily read-heavy with periodic sync updates.

## Primary Entities

| Entity | Table | Description |
|--------|-------|-------------|
| CareProvider | CareProvider | Dentists/doctors master data |
| AssistanceDentist | AssistanceDentist | Dental assistants master data |
| Service | Service | Dental services catalog with time durations |
| CareProviderService | CareProviderService | Provider-service mapping per date (what services a provider can do on a given day) |

## Source Files

| File | Role | LOC |
|------|------|-----|
| server/modules/careProvider.js | service | 151 |
| server/modules/assistanceDentist.js | service | 147 |
| server/modules/service.js | service | 122 |
| server/modules/careProviderService.js | service | 226 |
| src/pages/Dashboard/searchResource.js | helper (UI) | 213 |
| src/pages/Schedule/searchResource.js | helper (UI) | 205 |
| src/pages/Schedule/searchService.js | helper (UI) | 202 |

## Key Relationships

- `CareProvider.CarpCode` is referenced by PatientAppointment, DoctorSchedule, RoomDetail, BookingRoom
- `AssistanceDentist.AssistCode` is referenced by RoomDetail, BookingRoom
- `Service.SvcItemCode` is referenced by PatientAppointment (as ServiceCode), CareProviderService
- `CareProviderService` joins CareProvider and Service for date-specific availability
