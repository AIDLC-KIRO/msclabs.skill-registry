# Room Management Domain - Workflows

## WF-RM-001: Room Login Workflow

```
1. External system POSTs to Event Bridge /roomDetail:
   { TransactionId, ResourceId, Resource, Room, AssistantId, Assistant, ScheduleTime, Location }
2. Validate all required fields (return 400 if missing)
3. If Room = "Out":
   a. UPDATE RoomDetail SET CarpStatus='Out', LogoutTime=NOW() WHERE CarpCode={ResourceId}
4. If Room = number (1-30):
   a. UPDATE all existing 'In' records WHERE Room={Room} OR CarpCode={ResourceId} → SET 'Out', LogoutTime=NOW()
   b. INSERT new RoomDetail (CarpCode, AssistCode, ScheduleTime, LocationCode, CarpStatus='In', Room, LoginTime=NOW())
5. Compute hash of result
6. If hash != previous hash:
   a. Emit 'roomDetailUpdate' via Socket.IO
   b. Update stored hash
7. Return 200 with affected row count
```

## WF-RM-002: Room State Refresh

```
1. Main API server (app.js) receives Socket.IO 'roomDetailUpdate' event
2. Calls refreshInMemoryDataWhenRoomDetailUpdate()
3. Re-queries RoomDetail WHERE CarpStatus='In' with CareProvider JOIN
4. Updates in-memory cache
5. Emits 'roomDetailBroadcastingEvent' to frontend clients
6. Frontend receives 'dataRoomDetail', triggers state update
```
