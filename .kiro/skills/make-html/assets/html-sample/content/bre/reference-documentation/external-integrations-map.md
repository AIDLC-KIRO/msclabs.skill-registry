# External Integrations Map

## TrakCare Hospital Information System (HIS)

### Connection Details
- **Base URL** (dev/test): `http://trakcare-host/dentaldashboardapi`
- **Base URL** (prod): Same (configured via TRAKCARE_URL_API env var)
- **Authentication**: OAuth2 Password Grant (POST /token)
- **Credentials**: DENTALDB / DEN#T$ALD%B (from env vars)

### API Endpoints

| # | Endpoint | Method | Used By | Data Flow |
|---|----------|--------|---------|-----------|
| 1 | /token | POST | accessToken.js | Outbound (get token) |
| 2 | /api/PTINF/GetCareProviderByLocation?input1=01DEN&input2=dentist | GET | careProvider.js | Inbound (sync providers) |
| 3 | /api/PTINF/GetCareProviderByLocation?input1=01DEN&input2=assist_dentist | GET | assistanceDentist.js | Inbound (sync assistants) |
| 4 | /api/PTINF/GetServiceByLocationCode?input1=01DEN | GET | service.js | Inbound (sync services) |
| 5 | /api/PTINF/GetServiceByLocationAndCareProviderCode | GET | careProviderService.js | Inbound (sync provider-services) |
| 6 | /api/PTINF/GetAppointmentNoGroupBy?input1=01DEN&input2={date} | GET | patientAppointment.js | Inbound (sync appointments) |
| 7 | /api/PTINF/getDoctorSchedule | GET | doctorSchedule.js | Inbound (sync schedules) |
| 8 | /api/PTINF/getLogonTrakcare?input1={user}&input2={pass} | GET | signonTrakcare.js | Outbound (auth user) |

### Integration Characteristics
- **Protocol**: HTTP/HTTPS (TLS verification disabled)
- **Timeout**: 10 seconds per request
- **Retry**: 3 attempts per request
- **Authentication**: Bearer token with per-session expiry
- **Data freshness**: 60-second polling for appointments, daily for master data

## External System → Event Bridge

### Room Detail Events
- **Source**: Unknown external system (likely hospital middleware)
- **Protocol**: HTTP POST to Event Bridge port 8080
- **Path**: /roomDetail
- **Frequency**: On-demand (event-driven)

### Patient Status Events
- **Source**: Unknown external system (likely nurse station application)
- **Protocol**: HTTP POST to Event Bridge port 8080
- **Path**: /patientStatus
- **Frequency**: On-demand (event-driven)

## Frontend WebSocket Connection
- **Protocol**: WebSocket (ws:// in dev, wss:// in prod)
- **Endpoint**: Event Bridge Socket.IO server
- **Dev**: ws://app-host-dev:8080
- **Prod**: wss://app-host.CUSTOMER_DOMAIN:8443
