# Common Events

## Socket.IO Events

| Event Name | Direction | Producer | Consumer | Payload |
|------------|-----------|----------|----------|---------|
| roomDetailUpdate | EB → Main API | event-bridge.js | app.js | POST body args |
| patientStatusUpdate | EB → Main API | event-bridge.js | app.js | POST body args |
| roomDetailBroadcastingEvent | Main API → EB | app.js | event-bridge.js | { message: args } |
| patientStatusBroadcastingEvent | Main API → EB | app.js | event-bridge.js | { message: args } |
| dataRoomDetail | EB → Frontend | event-bridge.js | src/routes/index.js | Room detail data |
| StatusPatient | EB → Frontend | event-bridge.js | src/routes/index.js | Patient status data |
| Trakcare | EB → Frontend | event-bridge.js | src/routes/index.js | Generic (unused) |
| init | EB → Frontend | event-bridge.js | src/routes/index.js | Connection init |

## No Domain Events / Message Bus

The application does not implement domain events, event sourcing, or a message bus pattern. All inter-process communication is via direct Socket.IO connections. There is no event persistence, replay capability, or guaranteed delivery.
