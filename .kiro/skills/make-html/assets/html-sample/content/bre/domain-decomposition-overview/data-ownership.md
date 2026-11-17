# Data Ownership

## Table Ownership Matrix

| Table | Owning Domain | Justification |
|-------|--------------|---------------|
| PatientAppointment | patient-appointment | Primary transactional entity of the domain |
| PatientAppointmentHistory | patient-appointment | Archive of the same aggregate |
| PatientAppointmentTemp | patient-appointment | Staging for appointment change detection |
| PatientStatus | patient-appointment | Lookup table for appointment status codes |
| CareProvider | care-provider | Master data for dentists |
| AssistanceDentist | care-provider | Master data for dental assistants |
| Service | care-provider | Service catalog with time durations |
| CareProviderService | care-provider | Provider-service availability mapping |
| DoctorSchedule | doctor-schedule | Doctor time slot records |
| DoctorScheduleTemp | doctor-schedule | Staging for schedule change detection |
| RoomDetail | room-management | Real-time room assignment state |
| BookingRoom | booking | Planned room schedule entries |
| Workcase | booking | Work case type lookup |

## Cross-Domain References

| Referencing Domain | Referenced Table | Referenced Domain | Purpose |
|-------------------|-----------------|-------------------|---------|
| patient-appointment | CareProvider | care-provider | Dentist identity via CarpCode |
| patient-appointment | Service | care-provider | Service description and duration |
| patient-appointment | RoomDetail | room-management | Room→provider cross-reference |
| patient-appointment | DoctorSchedule | doctor-schedule | Workload slot calculation |
| doctor-schedule | CareProvider | care-provider | List of providers to fetch schedules for |
| doctor-schedule | RoomDetail | room-management | Active room filter for workload |
| doctor-schedule | PatientAppointment | patient-appointment | Service minutes for workload |
| room-management | CareProvider | care-provider | Provider name display |
| room-management | AssistanceDentist | care-provider | Assistant name display |
| booking | CareProvider | care-provider | Dentist selection for booking |
| booking | AssistanceDentist | care-provider | Assistant selection for booking |
| booking | Workcase | booking | Work case type (owned) |
