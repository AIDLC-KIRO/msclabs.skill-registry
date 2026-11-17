# Anti-Corruption Layers

## TrakCare API Integration Layer

The system does not implement a formal anti-corruption layer. Each module directly maps TrakCare API responses to its database schema. The transformation happens inline within each module's sync function.

### Implicit Translation Points

| Module | TrakCare Field | Local Field | Transformation |
|--------|---------------|-------------|----------------|
| careProvider.js | CarpCode | CareProvider.CarpCode | Direct mapping |
| patientAppointment.js | APPT_ArrivalDate presence | PT_Status | Derives B/A/C status from date nullability |
| patientAppointment.js | AS_SessStartTime | AS_SessStartTime | Truncated to HH:mm (5 chars) |
| doctorSchedule.js | (full schedule object) | DoctorScheduleTemp | Direct field-by-field mapping |

### Data Quality Boundary

The `PatientAppointmentTemp` and `DoctorScheduleTemp` tables serve as a data staging zone — a lightweight anti-corruption pattern where external data is buffered before being merged into the authoritative local tables via change detection.

### No Formal DTO Layer

All modules directly use the TrakCare API response object structure. If TrakCare changes its API response format, each module must be updated individually. There is no shared mapping/adapter layer.
