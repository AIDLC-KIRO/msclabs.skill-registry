# Event Publishing Patterns

## Architecture

The Dental Dashboard uses a dual-server event architecture:
- **Event Bridge** (port 8080): Socket.IO server that receives HTTP POSTs from external systems and broadcasts via WebSocket
- **Main API** (port 8081): Socket.IO client that listens to Event Bridge and re-broadcasts to frontend clients

## Event Flow

```
External System → HTTP POST → Event Bridge → Socket.IO emit → Main API → Socket.IO emit → Frontend
```

## Events

### Room Detail Update

| Stage | Event Name | Payload |
|-------|-----------|---------|
| Event Bridge → Main API | `roomDetailUpdate` | `args` (original POST data) |
| Main API → Frontend | `roomDetailBroadcastingEvent` → `dataRoomDetail` | `{ message: args }` |

**Trigger**: POST /roomDetail on Event Bridge

### Patient Status Update

| Stage | Event Name | Payload |
|-------|-----------|---------|
| Event Bridge → Main API | `patientStatusUpdate` | `args` (original POST data) |
| Main API → Frontend | `patientStatusBroadcastingEvent` → `StatusPatient` | `{ message: args }` |

**Trigger**: POST /patientStatus on Event Bridge

## Deduplication

The Event Bridge uses `object-hash` to compute a hash of the database query result after each POST. If the hash matches the previously stored hash, the Socket.IO event is NOT emitted. This prevents broadcasting no-op updates.

## Frontend Event Consumption

`src/routes/index.js` listens for:
- `dataRoomDetail`: Triggers immediate room data refresh
- `StatusPatient`: Triggers immediate patient status refresh
- `Trakcare`: Generic TrakCare event (currently unused)
- `init`: Connection initialization event

## No Message Queue

The system does NOT use a message queue (RabbitMQ, Kafka, etc.). All event propagation is synchronous Socket.IO. If the Main API server is disconnected from the Event Bridge, events are lost.
