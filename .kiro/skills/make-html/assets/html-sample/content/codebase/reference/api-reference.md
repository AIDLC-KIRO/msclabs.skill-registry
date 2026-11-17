# API Reference

## App Service (Port 8081)

Base URL: `http://localhost:8081` (development) | Production via reverse proxy

### Authentication
- API Key required in header: `x-api-key`
- IP whitelist filtering via `ALLOWED_IPS` environment variable

---

### GET /careProvider
Returns list of all care providers (doctors) from in-memory cache.

**Response**: `{resource: [{CarpCode, CarpDesc, NameTH, NameEN, ...}]}`

### GET /assistDentist
Returns list of dental assistants from in-memory cache.

**Response**: `{assistant: [{AssistCode, AssistDesc, NameTH, NameEN, ...}]}`

### GET /service
Returns dental services catalog from in-memory cache.

**Response**: `{services: [{SvcItemCode, SvcItemDesc, SvcTimeInMinute, ...}]}`

### GET /patientAppointment
Returns today's appointments grouped by care provider.

**Response**: `{test: [{resourceId, resourceName, resourceNameTH, resourceSchedule: [...]}]}`

### GET /patientAppointmentFilter
Returns filtered appointments (excludes providers with only canceled appointments and no schedule).

**Response**: Same structure as /patientAppointment

### GET /patientAppointmentHistory/:date
Returns appointments for a specific date.

**Parameters**: `date` (path) - Date in YYYY-MM-DD format

**Response**: `{test: [{resourceId, resourceName, resourceNameTH, resourceSchedule: [...]}]}`

### GET /patientStatus
Returns current patient status records for today.

**Response**: `[{id, patient_id, status, room, date_appointment, time_appointment, time_register, service_id, resource_id, location}]`

### DELETE /patientAppointment
Deletes all patient appointment records.

**Response**: `{Code: 200, Message: "OK", Status: true}` or `{Code: 400, Message: "Bad Request", Status: false}`

### GET /roomDetail
Returns current room occupancy from in-memory cache.

**Response**: `[{id, resource_id, resource, room, schedule_time, location}]`

### DELETE /roomDetail
Deletes all room detail records.

**Response**: `{Code: 200, Message: "OK", Status: true}`

### GET /doctorScheduleOnDate
Returns doctor schedules for a specific date.

**Query Parameters**: `date` - Date in YYYY-MM-DD format

**Response**: Doctor schedule data with time slots

### GET /careProviderWorkload
Returns care provider workload (slot sums) from in-memory cache.

### GET /careProviderServiceOnDate
Returns care provider services for a specific date.

**Query Parameters**: `date` - Date in YYYY-MM-DD format

### POST /logonTrakcare
Authenticates against TrakCare system.

**Body**: `{username, password}`

**Response**: Authentication token or error

### GET /healthCheck
Returns system health status.

**Response**: `{status: 0|1}` (0 = TrakCare unreachable, 1 = healthy)

### GET /ping
Simple ping endpoint.

**Response**: `"PONG"`

### POST /upload
Handles file upload.

**Body**: Multipart form data with file

### GET /booking
Returns booking room data from in-memory cache.

### POST /booking
Creates a new room booking.

**Body**: Booking details (CarpCode, AssistCode1, AssistCode2, Room, StartDate, EndDate, etc.)

---

## Event Bridge (Port 8080)

### POST /roomDetail
Updates room assignment (doctor login/logout).

**Body**:
```json
{
  "TransactionId": "string",
  "ResourceId": "string (CarpCode)",
  "Resource": "string (doctor name)",
  "Room": "string (1-30 or 'Out')",
  "AssistantId": "string (AssistCode)",
  "Assistant": "string (assistant name)",
  "ScheduleTime": "string",
  "Location": "string (location code)"
}
```

**Response**: `{Code: 200, Message: "OK", Status: true}` (201 on success)

### POST /patientStatus
Updates patient visit status.

**Body**:
```json
{
  "TransactionId": "string",
  "PatientId": "string (HN)",
  "EpisodeNumber": "string (EN)",
  "Room": "string (room number)",
  "PatientStatus": "string (Call|Hold|End Service|Booked|Arrived|Cancel)",
  "Location": "string"
}
```

**Response**: `{Code: 200, Message: "OK", Status: true}`

---

## Swagger Documentation

Available at: `http://localhost:8081/api-docs`

Defined in: `server/swagger.json` (Swagger 2.0 spec)

## Related Documentation

- [Interfaces](./interfaces.md)
- [Data Models](./data-models.md)
- [Business Logic](../behavior/business-logic.md)
- [Workflows](../behavior/workflows.md)
