# Interfaces

## Module Export Interfaces

### patientAppointment (`server/modules/patientAppointment.js`)

| Export | Type | Parameters | Returns | Description |
|--------|------|-----------|---------|-------------|
| retrieveDataToMem | async function | none | void | Refresh in-memory appointment cache for today |
| loadDataInMem | async function | (req, res) | JSON response | Serve cached appointment data |
| loadDataFilterInMem | async function | (req, res) | JSON response | Serve filtered appointment data |
| loadDataAppointmentHistoryInMem | async function | (req, res) | JSON response | Serve historical appointments by date param |
| loadDataPatientStatusInMem | async function | (req, res) | JSON response | Serve patient status data |
| retrieveDataPatientStatusToMem | async function | none | void | Refresh patient status cache |
| retrievePatientStatus | async function | (req, res) | JSON response | Direct DB query for patient status |
| getAppointment | async function | (dateParam: string) | boolean | Fetch from TrakCare and stage in temp table |
| deleteAppointmentRoutes | async function | (req, res) | JSON response | Delete all appointments (route handler) |
| deletePatientAppointment | async function | none | void | Delete all appointment records |
| duplicateAppointmentToHistory | async function | none | void | Copy appointments to history table |
| validateAppointmentChangeEvent | async function | none | boolean | Detect and apply changes from temp table |
| TEST | async function | (token: string) | boolean | Test TrakCare API connectivity |

### roomDetail (`server/modules/roomDetail.js`)

| Export | Type | Parameters | Returns | Description |
|--------|------|-----------|---------|-------------|
| retrieveData | async function | (req, res) | JSON response | Direct DB query with assistant join |
| retrieveDataToMem | async function | none | void | Refresh in-memory room data |
| loadDataInMem | async function | (req, res) | JSON response | Serve cached room data |
| deleteRoomDetail | async function | (req, res) | JSON response | Delete all room records |

### jobsh (`server/modules/jobsh.js`)

| Export | Type | Parameters | Returns | Description |
|--------|------|-----------|---------|-------------|
| taskGetMasterDataFromTrakcare | async function | none | void | Full master data sync from TrakCare |
| taskIntervalGetDataFromTrakcare | async function | none | boolean | Periodic appointment sync (6am-10pm) |
| taskRetrieveDataToMemory | async function | none | void | Load all data into memory |
| taskValidateAppointmentChangeEvent | async function | none | boolean | Detect appointment changes |
| taskBackupHistory | async function | none | void | Archive and clean appointments |
| taskGetDoctorSchedule | async function | none | boolean | Fetch doctor schedules with retry |
| taskGetCareProviderService | async function | none | void | Fetch care provider services |
| taskGetAppointment | async function | none | void | Fetch all appointments (current + next month) |
| ping | async function | (req, res) | JSON response | Health ping endpoint |
| refreshInMemoryDataWhenRoomDetailUpdate | async function | none | void | Targeted refresh on room change |
| refreshInMemoryDataWhenPatientStatusUpdate | async function | none | void | Targeted refresh on status change |

### pgpool (`server/modules/pgpool.js`)

| Export | Type | Parameters | Returns | Description |
|--------|------|-----------|---------|-------------|
| execute | async function | (text: string, values: array) | QueryResult | Execute SQL with retry logic |

### healthCheck (`server/modules/healthCheck.js`)

| Export | Type | Parameters | Returns | Description |
|--------|------|-----------|---------|-------------|
| checkStatus | async function | (req, res) | JSON response | Return current health status |
| setStatus | function | (status: number) | void | Set health status (0 or 1) |

## Socket.IO Event Interface

### Event Bridge → Clients

| Event Name | Payload | Description |
|------------|---------|-------------|
| roomDetailUpdate | `{resource_id, resource, room, schedule_time, assistant, status}` | Room assignment changed |
| patientStatusUpdate | `{room, status, patientId, episodeNumber}` | Patient status changed |
| StatusPatient | `"update"` (string) | Patient status broadcast signal |
| dataRoomDetail | `{resource_id, resource, room, schedule_time, assistant, status}` | Room detail broadcast |

### Clients → Event Bridge

| Event Name | Payload | Description |
|------------|---------|-------------|
| roomDetailBroadcastingEvent | `{message: [roomDetailObject]}` | Room detail update request |
| patientStatusBroadcastingEvent | `{message: [statusObject]}` | Patient status update request |
| dataSchedule | data | Schedule data event (unused) |

## REST API Interface

See [API Reference](./api-reference.md) for complete endpoint documentation.

## Related Documentation

- [API Reference](./api-reference.md)
- [Modules](./modules.md)
- [Data Models](./data-models.md)
- [Components](../architecture/components.md)
