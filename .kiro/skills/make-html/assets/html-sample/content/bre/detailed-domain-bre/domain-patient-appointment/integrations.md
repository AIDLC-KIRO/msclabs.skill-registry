# Patient Appointment Domain - Integrations

## INT-PA-001: TrakCare Appointment API

- **Endpoint**: `GET {TRAKCARE_URL_API}/api/PTINF/GetAppointmentNoGroupBy?input1=01DEN&input2={date}`
- **Authentication**: OAuth2 Bearer token (obtained via accessToken module)
- **Frequency**: Every 60 seconds (via scheduler interval task)
- **Response**: Array of appointment objects with patient demographics, service codes, dates, and status fields
- **Error Handling**: Retry up to 3 times; sets health check flag to DOWN on persistent failure

## INT-PA-002: Socket.IO Event Bridge (Outbound)

- **Event**: `patientStatusUpdate` emitted when patient status changes
- **Consumer**: Main API server (app.js) listens and refreshes in-memory data
- **Event**: `patientStatusBroadcastingEvent` → `StatusPatient` forwarded to connected frontend clients

## INT-PA-003: Socket.IO Frontend (Inbound)

- **Event**: `StatusPatient` received by React frontend (routes/index.js)
- **Action**: Triggers immediate data refresh (bypasses 6-second polling interval)

## INT-PA-004: Cross-Domain Dependencies

- **CareProvider domain**: Uses `CarpCode` to identify the dentist assigned to each appointment
- **Service domain**: Uses `ServiceCode` to look up service description and duration (`SvcTimeInMinute`)
- **Room Management domain**: Uses `RoomDetail` to cross-reference room→provider mapping
- **Doctor Schedule domain**: Uses `DoctorSchedule` for workload calculation (slot minutes)
