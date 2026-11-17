# Room Management Domain - Features

## F-RM-001: Room Check-In (Login)

External system sends POST /roomDetail with room assignment data. The system:
1. Sets any existing 'In' records for the same room OR same provider to 'Out'
2. Inserts new record with CarpStatus='In' and LoginTime=CURRENT_TIMESTAMP

**Source**: `server/event-bridge.js` → POST /roomDetail handler

## F-RM-002: Room Check-Out (Logout)

When Room="Out" is received, sets the provider's current record to CarpStatus='Out' with LogoutTime=CURRENT_TIMESTAMP.

**Source**: `server/event-bridge.js` → POST /roomDetail (Room="Out" branch)

## F-RM-003: Room Conflict Resolution

When a provider logs into a room, any OTHER provider already 'In' that room is automatically logged out. Similarly, if the same provider is 'In' another room, they are logged out of the previous room first.

**Source**: `server/event-bridge.js` → room conflict UPDATE query

## F-RM-004: Real-Time Broadcasting

Room changes are broadcast via Socket.IO:
1. Event bridge emits `roomDetailUpdate`
2. Main API server receives and refreshes in-memory data
3. Main API server emits `roomDetailBroadcastingEvent`
4. Frontend receives `dataRoomDetail` event and refreshes display

**Source**: `server/event-bridge.js`, `server/app.js`

## F-RM-005: Active Room Query

Returns all currently active room assignments (CarpStatus='In') with care provider and assistant details for the dashboard bottom table.

**Source**: `server/modules/roomDetail.js` → `retrieveDataToMem()`

## F-RM-006: Room Detail Delete

Administrative endpoint to clear all room assignments (used for system reset).

**Source**: `server/modules/roomDetail.js` → `deleteRoomDetail()`

## F-RM-007: Change Deduplication

Uses `object-hash` to compare current room state with previous hash. Only broadcasts if the hash differs, preventing duplicate Socket.IO events.

**Source**: `server/event-bridge.js` → hash comparison logic
