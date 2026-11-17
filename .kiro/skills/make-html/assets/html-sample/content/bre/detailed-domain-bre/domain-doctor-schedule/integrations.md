# Doctor Schedule Domain - Integrations

## INT-DS-001: TrakCare Schedule API

- **Endpoint**: `GET {TRAKCARE_URL_API}/api/PTINF/getDoctorSchedule?Input1={CarpCode}&Input2={start}&Input3={end}&Input4=01DEN`
- **Authentication**: OAuth2 Bearer token
- **Frequency**: 3x daily (07:30, 11:30, 16:30) + daily at 00:01
- **Scope**: Called once per care provider per sync cycle
- **Timeout**: 10 seconds per request

## INT-DS-002: Cross-Domain Dependencies

- **Reads from**: CareProvider (list of DoctorCodes to fetch schedules for)
- **Reads from**: RoomDetail (CarpStatus='In' for workload filtering)
- **Reads from**: PatientAppointment and Service (for workload sum calculations)
- **Consumed by**: Patient Appointment domain (slot minutes for dashboard display)
- **Consumed by**: Booking domain (doctor time slots for calendar view)
