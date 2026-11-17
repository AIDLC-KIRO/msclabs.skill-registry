# Domain Decomposition Overview

## Identified Domains

| # | Domain | Complexity | Tables Owned | Key Module |
|---|--------|-----------|--------------|------------|
| 1 | patient-appointment | large | 4 | patientAppointment.js |
| 2 | care-provider | medium | 4 | careProvider.js, assistanceDentist.js, service.js, careProviderService.js |
| 3 | doctor-schedule | medium | 2 | doctorSchedule.js |
| 4 | room-management | small | 1 | roomDetail.js, event-bridge.js |
| 5 | booking | medium | 2 | booking.js, upload.js |

## Decomposition Rationale

The decomposition follows aggregate root boundaries:
- **patient-appointment**: PatientAppointment is the core aggregate managing patient lifecycle
- **care-provider**: CareProvider is the aggregate root; assistants and services are closely related master data
- **doctor-schedule**: DoctorSchedule has its own lifecycle (separate sync, change detection)
- **room-management**: RoomDetail manages real-time state independently of planned bookings
- **booking**: BookingRoom is a planning entity distinct from real-time room state

## Files

- [bounded-contexts.md](bounded-contexts.md)
- [data-ownership.md](data-ownership.md)
- [shared-kernel.md](shared-kernel.md)
- [anti-corruption-layers.md](anti-corruption-layers.md)
- [execution-order.md](execution-order.md)
- [domain-manifest.json](domain-manifest.json)
- Service files: service-patient-appointment.md, service-care-provider.md, service-doctor-schedule.md, service-room-management.md, service-booking.md
