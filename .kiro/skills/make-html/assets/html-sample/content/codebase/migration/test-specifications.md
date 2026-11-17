# Test Specifications

## Critical Path Test Cases

### 1. Patient Status Lifecycle

| Test ID | Scenario | Input | Expected Output |
|---------|----------|-------|----------------|
| PS-001 | New patient booked | TrakCare appointment with no arrival/cancel | Status = "Booked" |
| PS-002 | Patient arrives | APPT_ArrivalDate set | Status = "Arrived" |
| PS-003 | Patient called | POST /patientStatus {PatientStatus: "Call"} | Status = "Processing", EVTCall_Time set |
| PS-004 | Patient on hold | POST /patientStatus {PatientStatus: "Hold"} | Status = "Hold" |
| PS-005 | Service complete | POST /patientStatus {PatientStatus: "End Service"} | Status = "End Service", EVTEndService_Time set |
| PS-006 | Appointment canceled | PAADM_VisitStatus = 'C' | Status = "Canceled" |
| PS-007 | Guard: no double-call | Call patient already Processing | No change (PT_Status NOT IN check) |

### 2. Room Management

| Test ID | Scenario | Input | Expected Output |
|---------|----------|-------|----------------|
| RM-001 | Doctor login | POST /roomDetail {Room: "5", ResourceId: "DR001"} | Insert with CarpStatus='In' |
| RM-002 | Doctor logout | POST /roomDetail {Room: "Out", ResourceId: "DR001"} | Update CarpStatus='Out', LogoutTime set |
| RM-003 | Room takeover | POST /roomDetail {Room: "5", ResourceId: "DR002"} (DR001 already in 5) | DR001 → Out, DR002 → In |
| RM-004 | Doctor room change | POST /roomDetail {Room: "7", ResourceId: "DR001"} (DR001 in room 5) | Room 5 → Out, Room 7 → In |
| RM-005 | Missing fields | POST /roomDetail without ResourceId | 400 Bad Request |

### 3. Appointment Sync

| Test ID | Scenario | Input | Expected Output |
|---------|----------|-------|----------------|
| AS-001 | New appointment detected | Record in temp not in main | INSERT into PatientAppointment |
| AS-002 | Changed appointment | Different fields in temp vs main | UPDATE in PatientAppointment |
| AS-003 | No changes | Identical records | ch_evt = false, no updates |
| AS-004 | TrakCare unavailable | API returns error | resStatus = false, health = 0 |
| AS-005 | Outside clinic hours | Current hour < 6 or > 22 | Skip sync entirely |

### 4. Dashboard Display

| Test ID | Scenario | Input | Expected Output |
|---------|----------|-------|----------------|
| DD-001 | Alarm trigger | Patient arrived, 10+ min waiting, no Processing after | Blink CSS class applied |
| DD-002 | No alarm | Patient arrived < 10 min ago | No blink |
| DD-003 | Walk-in filter | Appointment minute = "04"/"09"/"07" | Excluded from alarm logic |
| DD-004 | Provider filter | Doctor with only canceled appointments, no schedule | Not displayed |
| DD-005 | Error state | Health check returns 0 | Error banner shown |

### 5. API Endpoints

| Test ID | Scenario | Expected |
|---------|----------|----------|
| API-001 | GET /ping | 200 "PONG" |
| API-002 | GET /healthCheck | 200 {status: 0 or 1} |
| API-003 | GET /patientAppointment | 200 with {test: [...]} structure |
| API-004 | DELETE /patientAppointment | 200 {Code: 200, Message: "OK"} |
| API-005 | GET /roomDetail | 200 with array of room objects |

## Integration Test Cases

| Test ID | Flow | Systems Involved |
|---------|------|-----------------|
| INT-001 | Full patient flow: Book → Arrive → Call → End Service | TrakCare + Event Bridge + App + Frontend |
| INT-002 | Doctor login → patient call → patient status reflected in dashboard | Event Bridge + App + Frontend |
| INT-003 | Scheduler daily task → fresh data in memory → API returns new data | Scheduler + DB + App |

## Related Documentation

- [Component Order](./component-order.md)
- [Validation Criteria](./validation-criteria.md)
- [Business Logic](../behavior/business-logic.md)
- [API Reference](../reference/api-reference.md)
