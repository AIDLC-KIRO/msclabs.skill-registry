# Room Management Domain - Business Rules

## BR-RM-001: Single Active Assignment Per Room

A room can have at most one provider with CarpStatus='In' at any time. When a new provider logs in, the previous occupant is automatically set to 'Out'.

**Source**: `server/event-bridge.js` → conflict resolution UPDATE

## BR-RM-002: Single Active Room Per Provider

A provider can only be 'In' one room at a time. Logging into a new room automatically logs them out of any previous room.

**Source**: `server/event-bridge.js` → WHERE clause: `"CarpStatus"='In' AND ("Room"=$1 OR "CarpCode"=$2)`

## BR-RM-003: Room Numbering Convention

The system supports 29 treatment rooms: rooms 1-12 and 14-30. Room 13 is permanently skipped (not used).

**Source**: `src/pages/Calendar/SimpleTable.js`, `src/pages/Dashboard/index.js`

## BR-RM-004: Room Status Values

`CarpStatus` has exactly two values:
- 'In': provider is currently in this room
- 'Out': provider has left this room

**Source**: `server/event-bridge.js`, `server/modules/roomDetail.js` SQL queries

## BR-RM-005: Timestamp Tracking

- `LoginTime` is set to CURRENT_TIMESTAMP when CarpStatus transitions to 'In'
- `LogoutTime` is set to CURRENT_TIMESTAMP when CarpStatus transitions to 'Out'

**Source**: `server/event-bridge.js` → INSERT and UPDATE queries

## BR-RM-006: Dashboard Color Coding by Room

Room buttons on the dashboard are colored based on workload percentage of the provider in that room:
- 0% (no patient) → Pink
- 1-30% → Green (Available)
- 31-60% → Yellow (Some Appointment)
- 61-99% → Orange (Full Appointment)
- ≥100% → Red (Overbooking)

**Source**: `src/pages/Dashboard/index.js` → `calStatusRoom()`
