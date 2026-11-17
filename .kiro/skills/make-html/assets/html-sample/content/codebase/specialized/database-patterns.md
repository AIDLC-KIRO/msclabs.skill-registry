# Database Patterns

## Connection Management

### Connection Pool (`server/modules/db/index.js`)
```javascript
Pool config: {
  user: process.env.USER_DB,
  host: process.env.APP_URL_DB,
  database: process.env.DATABASE,
  password: process.env.PASSWORD_DB,
  port: process.env.PORT || 5432,
  max: process.env.PG_POOL_MAX || 10,
  idleTimeoutMillis: process.env.IDLE_TIMEOUT_MILLIS || 10000,
  connectionTimeoutMillis: process.env.CONNECTION_TIMEOUT_MILLIS || 0
}
```

### Query Execution with Retry (`server/modules/pgpool.js`)
- Max retries: 3
- Exponential backoff: 1000ms, 2000ms, 4000ms
- Logs query timing for performance monitoring
- Warns on checkout > 5 seconds

## Key Query Patterns

### CTE (Common Table Expression) Pattern
Used for doctor slot calculation:
```sql
WITH "DoctorSlot" AS (
    SELECT "DoctorCode", SUM(EXTRACT(EPOCH FROM ("TimeEnd"::time - "TimeStart"::time)) / 60) AS "SUMSLOT"
    FROM "DoctorSchedule"
    WHERE date BETWEEN "StartDate"::date AND "EndDate"::date AND "Day" = dayname
    GROUP BY "DoctorCode"
)
SELECT ... FROM "CareProvider" LEFT JOIN "DoctorSlot" ON ...
```

### Temp Table Staging Pattern
```sql
-- Step 1: Clear temp table
DELETE FROM "PatientAppointmentTemp"; ALTER SEQUENCE ... RESTART WITH 1;

-- Step 2: Insert fresh data from TrakCare
INSERT INTO "PatientAppointmentTemp" (...) VALUES (...);

-- Step 3: Detect new records
INSERT INTO "PatientAppointment" (SELECT ... FROM "Temp" LEFT JOIN "Main" WHERE "Main"."APPT_RowId" IS NULL);

-- Step 4: Detect changed records
SELECT ... FROM "PatientAppointmentTemp" EXCEPT SELECT ... FROM "PatientAppointment";

-- Step 5: Update changed records individually
UPDATE "PatientAppointment" SET ... WHERE "APPT_RowId" = ...;
```

### Correlated Subquery with CTE (Event Bridge)
```sql
WITH "RoomDetailTemp" AS (
    SELECT "CarpCode", "Room" FROM "RoomDetail" WHERE "CarpStatus"='In' AND "Room"=$1
)
UPDATE "PatientAppointment" SET "PT_Status"=$2
FROM "RoomDetailTemp"
WHERE "PatientAppointment"."HN"=$3 AND "PatientAppointment"."CarpCode" = "RoomDetailTemp"."CarpCode";
```

## Index Strategy (`CreateIndexKey-1.sql`)

### Single-Column Indexes
Applied to all foreign key columns and frequently filtered columns:
- PatientAppointment: CarpCode, AS_Date, PT_Status, HN, EN, Room, ServiceCode

### Composite Indexes
For multi-column WHERE clauses:
- DoctorSchedule: (DoctorCode, Day, StartDate, EndDate)
- PatientAppointment: (CarpCode, AS_Date), (HN, EN)
- BookingRoom: (StartDate, EndDate, Day, StartTime, EndTime, Room)
- RoomDetail: (CarpCode, CarpStatus)
- CareProviderService: (CarpCode, SvcItemCode)

## Data Lifecycle

```
TrakCare API → PatientAppointmentTemp → PatientAppointment → PatientAppointmentHistory
                (staging)                (active)              (archive - daily at 00:01)
```

## Related Documentation

- [Data Models](../reference/data-models.md)
- [Business Logic](../behavior/business-logic.md)
- [Workflows](../behavior/workflows.md)
