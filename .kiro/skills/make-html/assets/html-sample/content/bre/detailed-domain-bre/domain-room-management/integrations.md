# Room Management Domain - Integrations

## INT-RM-001: Event Bridge HTTP Endpoint (Inbound)

- **Endpoint**: `POST /roomDetail` on Event Bridge server (port 8080)
- **Consumer**: External hospital system (likely TrakCare or a middleware)
- **Payload**: JSON with TransactionId, ResourceId, Resource, Room, AssistantId, Assistant, ScheduleTime, Location
- **Protocol**: HTTP POST with JSON body

## INT-RM-002: Socket.IO Broadcasting (Outbound)

- **Event**: `roomDetailUpdate` emitted to all connected Socket.IO clients
- **Primary consumer**: Main API server (app.js) for in-memory refresh
- **Secondary event**: `roomDetailBroadcastingEvent` → `dataRoomDetail` to frontend

## INT-RM-003: Cross-Domain Consumers

- **Patient Appointment domain**: reads RoomDetail to find provider by room for status updates (CTE in patientStatus handler)
- **Doctor Schedule domain**: reads RoomDetail.CarpStatus='In' for workload calculation scope
- **Dashboard frontend**: reads room assignments for the bottom table display
