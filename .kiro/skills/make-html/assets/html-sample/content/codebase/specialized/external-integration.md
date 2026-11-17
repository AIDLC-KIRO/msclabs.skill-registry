# External Integration - TrakCare

## Overview

The dental dashboard integrates with **TrakCare** (InterSystems), a Hospital Information System (HIS), to synchronize patient appointments, care provider information, services, and doctor schedules.

## Authentication

### OAuth2 Token Flow (`server/modules/accessToken.js`)
1. POST to TrakCare login endpoint with credentials
2. Receive access_token (Bearer token)
3. Token cached and reused until expiry
4. Re-authentication on token failure

**Credentials** (from environment variables):
- `TRAKCARE_API_USERNAME`
- `TRAKCARE_API_PASSWORD`
- `TRAKCARE_URL_API` (base URL)

## API Endpoints Used

### Patient Appointments
```
GET {TRAKCARE_URL_API}/api/PTINF/GetAppointmentNoGroupBy?input1=01DEN&input2={date}
```
- `input1`: Location code (01DEN = Dental Department)
- `input2`: Date in YYYY-MM-DD format
- Returns: Array of appointment objects

### Care Providers
```
GET {TRAKCARE_URL_API}/api/PTINF/GetCareProvider?input1=01DEN
```
- Returns: List of doctors/care providers for dental department

### Services
```
GET {TRAKCARE_URL_API}/api/PTINF/GetService?input1=01DEN
```
- Returns: Dental service catalog with duration information

### Dental Assistants
```
GET {TRAKCARE_URL_API}/api/PTINF/GetAssistanceDentist?input1=01DEN
```
- Returns: List of dental assistants

### Doctor Schedules
```
GET {TRAKCARE_URL_API}/api/PTINF/GetDoctorSchedule?input1=01DEN&input2={startDate}&input3={endDate}
```
- Returns: Doctor schedule entries for date range

### Care Provider Services
```
GET {TRAKCARE_URL_API}/api/PTINF/GetCareProviderService?input1=01DEN&input2={date}
```
- Returns: Services each doctor provides on a given date

### Authentication
```
POST {TRAKCARE_URL_API}/api/iam/login
Body: {username, password}
```
- Returns: `{access_token, token_type, expires_in}`

## Data Mapping (TrakCare → PostgreSQL)

| TrakCare Field | DB Column | Notes |
|---------------|-----------|-------|
| PAADM_RowID | PAADM_RowID | Admission ID |
| HN | HN | Hospital Number |
| EN | EN | Episode Number |
| Name, Surname, MiddleName | Name, Surname, MiddleName | Split names |
| CarpCode | CarpCode | Care provider code |
| ServiceCode | ServiceCode | Service code |
| AS_Date | AS_Date | Appointment date |
| AS_SessStartTime | AS_SessStartTime | Session time |
| APPT_ArrivalDate/Time | APPT_ArrivalDate/Time | Arrival timestamps |
| APPT_CancelDate/Time | APPT_CancelDate/Time | Cancel timestamps |
| APPT_RowId | APPT_RowId | Unique appointment ID (sync key) |
| PAADM_VisitStatus | PAADM_VisitStatus | Visit status |

## Sync Strategy

### Initial Load (Scheduler startup)
1. Fetch ALL master data (care providers, services, assistants, schedules)
2. Fetch appointments for current + next month (day by day)
3. Load everything into memory cache

### Periodic Sync (every 60 seconds, 6am-10pm)
1. Fetch today's appointments only
2. Stage in temp table
3. Diff against main table
4. Apply changes (insert new, update changed)
5. Refresh memory cache if changes detected

### Daily Refresh (00:01)
1. Archive current appointments to history
2. Delete current appointments
3. Full master data refresh
4. Full appointment fetch for current + next month

## Error Handling

- **Token expired**: Re-authenticate and retry
- **API unreachable**: Set health check to 0, log error, continue with stale data
- **Retry logic**: 3 retries with exponential backoff for doctor schedule fetch
- **No circuit breaker**: Failed requests continue attempting on each interval

## Security Considerations

- `NODE_TLS_REJECT_UNAUTHORIZED = "0"` in event-bridge.js (TrakCare may use self-signed cert)
- Bearer token sent via Authorization header
- Credentials stored in environment variables
- No request timeout configured on axios calls

## Related Documentation

- [Workflows](../behavior/workflows.md)
- [Business Logic](../behavior/business-logic.md)
- [Security Patterns](../analysis/security-patterns.md)
- [API Reference](../reference/api-reference.md)
