# Service: Doctor Schedule

## Responsibilities
- Synchronize doctor schedule data from TrakCare (per provider, per date range)
- Detect schedule changes (new entries, removed entries)
- Calculate workload metrics (service utilization vs capacity)
- Provide schedule slots for calendar/schedule views

## API Endpoints
| Method | Path | Handler |
|--------|------|---------|
| GET | /doctorScheduleOnDate | getDoctorScheduleOnDate |
| GET | /careProviderWorkload | loadDataInMem |

## Dependencies
- pgpool (database access)
- accessToken (OAuth2 for TrakCare)
- CareProvider table (list of doctors to fetch)
- RoomDetail table (active room filter for workload)
- PatientAppointment table (service minutes for workload)
- Service table (SvcTimeInMinute)

## Scaling Considerations
- Sync is O(providers × days) - potentially expensive
- Workload calculation involves complex multi-table CTE query
- Refreshed 3x daily + on-demand
