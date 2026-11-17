# Service: Patient Appointment

## Responsibilities
- Synchronize appointment data from TrakCare HIS
- Detect and apply appointment changes (new, modified)
- Manage patient status transitions
- Provide in-memory cached appointment data to API consumers
- Archive historical appointment data

## API Endpoints
| Method | Path | Handler |
|--------|------|---------|
| GET | /patientAppointment | loadDataInMem |
| GET | /patientAppointmentFilter | loadDataFilterInMem |
| GET | /patientAppointmentHistory/:date | loadDataAppointmentHistoryInMem |
| GET | /patientStatus | loadDataPatientStatusInMem |
| DELETE | /patientAppointment | deleteAppointmentRoutes |

## Event Bridge Endpoints
| Method | Path | Handler |
|--------|------|---------|
| POST | /patientStatus | Patient status update (Call/Hold/End Service) |

## Dependencies
- pgpool (database access)
- accessToken (OAuth2 for TrakCare)
- CareProvider table (provider identity)
- Service table (service duration)
- RoomDetail table (room→provider mapping)
- DoctorSchedule table (slot calculation)

## Scaling Considerations
- In-memory cache serves all reads; refresh every 60 seconds
- Heavy write operations during sync (bulk insert/update)
- PatientAppointmentTemp used for atomic change detection
