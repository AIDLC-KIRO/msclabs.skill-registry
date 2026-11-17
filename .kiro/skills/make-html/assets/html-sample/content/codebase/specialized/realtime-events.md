# Real-time Events (Socket.IO)

## Architecture

```
┌─────────────┐         ┌───────────────────────┐         ┌──────────────┐
│ OPD Queue   │──POST──►│   Event Bridge :8080  │◄──WS───►│  Frontend    │
│ (External)  │         │   (Socket.IO Server)  │         │  (Client)    │
└─────────────┘         └───────────┬───────────┘         └──────────────┘
                                    │
                               WS (client)
                                    │
                        ┌───────────▼───────────┐
                        │   App Service :8081   │
                        │   (Socket.IO Client)  │
                        └───────────────────────┘
```

## Server Events (Event Bridge emits)

### `roomDetailUpdate`
**Trigger**: POST /roomDetail endpoint processes a room login/logout
**Payload**:
```json
{
  "resource_id": "DR001",
  "resource": "Dr. Smith",
  "room": "5",
  "schedule_time": "09:00-12:00",
  "assistant": "Nurse A",
  "status": "In" | "Out"
}
```
**Subscribers**: App Service (refreshes room memory cache), Frontend (updates room grid)

### `patientStatusUpdate`
**Trigger**: POST /patientStatus endpoint updates patient status
**Payload**:
```json
{
  "room": "5",
  "status": "P" | "H" | "E" | "B" | "A" | "C",
  "patientId": "HN12345",
  "episodeNumber": "EN001"
}
```
**Subscribers**: App Service (refreshes appointment memory cache), Frontend (triggers data fetch)

### `StatusPatient`
**Trigger**: patientStatusBroadcastingEvent with new hash
**Payload**: `"update"` (string signal)
**Subscribers**: Frontend (triggers handleDataUpdate)

### `dataRoomDetail`
**Trigger**: roomDetailBroadcastingEvent with new hash
**Payload**: Room detail object
**Subscribers**: Frontend (triggers handleDataUpdate)

## Client Events (Sent to Event Bridge)

### `roomDetailBroadcastingEvent`
**Sender**: App Service
**Payload**: `{message: [roomDetailArray]}`
**Purpose**: Broadcast room changes to all connected frontends
**Deduplication**: object-hash comparison with `previousRoomDetailHash`

### `patientStatusBroadcastingEvent`
**Sender**: App Service
**Payload**: `{message: [patientStatusArray]}`
**Purpose**: Broadcast patient status changes to all frontends
**Deduplication**: object-hash comparison with `previousPatientStatusHash`

## Frontend Socket.IO Handling (`src/routes/index.js`)

```javascript
// Connection
const socket = io(process.env.REACT_APP_EVENT_BRIDGE_ENDPOINT, {});

// Listeners
socket.on("dataRoomDetail", () => this.handleDataUpdate());
socket.on("StatusPatient", () => this.handleDataUpdate());
socket.on("Trakcare", (msg) => { if (msg == "failed") this.setState({problemFlags: true}); });
socket.on("init", () => { /* optional page reload */ });
```

## Event Deduplication

The Event Bridge uses `object-hash` to prevent processing duplicate events:
```javascript
const currentHash = hash(incomingObject);
if (currentHash !== previousHash) {
  previousHash = currentHash;
  // Process and broadcast
}
// Else: silently ignore duplicate
```

## Connection Configuration

### Server (Event Bridge)
```javascript
const options = {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }
};
const io = require("socket.io")(httpServer, options);
```

### Client (Frontend)
```javascript
const socket = io(process.env.REACT_APP_EVENT_BRIDGE_ENDPOINT, {});
// Default Socket.IO reconnection is enabled
```

### Client (App Service)
```javascript
const ioClient = require("socket.io-client");
const socket = ioClient(process.env.APP_INTERFACE_EVENT_BRIDGE_HTTP_ENDPOINT);
```

## Related Documentation

- [Workflows](../behavior/workflows.md)
- [Components](../architecture/components.md)
- [Interfaces](../reference/interfaces.md)
