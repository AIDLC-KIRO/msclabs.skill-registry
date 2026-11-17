# Data Models

## Database: dental_db (PostgreSQL 14.2)

### PatientAppointment

| Column | Type | Description |
|--------|------|-------------|
| ID | SERIAL | Primary key (auto-increment) |
| PAADM_RowID | TEXT | TrakCare admission row ID |
| HN | TEXT | Hospital Number (patient identifier) |
| EN | TEXT | Episode Number |
| Name | TEXT | Patient first name |
| Surname | TEXT | Patient surname |
| MiddleName | TEXT | Patient middle name |
| Title | TEXT | Patient title |
| Sex_Code | TEXT | Gender code |
| Sex_Desc | TEXT | Gender description |
| CarpCode | TEXT | Care provider code (FK to CareProvider) |
| ServiceCode | TEXT | Service code (FK to Service) |
| AS_Date | TEXT | Appointment date (YYYY-MM-DD format stored as text) |
| AS_SessStartTime | TEXT | Session start time (HH:MM:SS format) |
| APPT_ArrivalDate | TEXT | Patient arrival date |
| APPT_ArrivalTime | TEXT | Patient arrival time |
| APPT_CancelDate | TEXT | Cancellation date |
| APPT_CancelTime | TEXT | Cancellation time |
| LocCode | TEXT | Location code |
| LocDesc | TEXT | Location description |
| APPT_RowId | TEXT | TrakCare appointment row ID (unique key for sync) |
| PAADM_VisitStatus | TEXT | Visit status from TrakCare (C=Canceled) |
| APPTStatus | TEXT | Appointment status |
| Fullname | TEXT | Full display name |
| PT_Status | TEXT | Patient status (B/A/P/H/E/C) |
| Room | TEXT | Assigned room number |
| EVTCall_Time | TIMESTAMP | Time patient was called |
| EVTEndService_Time | TIMESTAMP | Time service ended |
| CreateDate | TIMESTAMP | Record creation timestamp |
| TimeCreate | TIMESTAMP | Alternative creation timestamp |

**Indexes**: CarpCode, AS_Date, PT_Status, ServiceCode, AS_SessStartTime, HN, EN, PAADM_RowID, Room, APPT_ArrivalDate, APPT_CancelDate, APPTStatus

### PatientAppointmentTemp
Mirror of PatientAppointment (staging table for TrakCare sync). Same columns minus PT_Status, Room, EVT* timestamps.

### PatientAppointmentHistory
Mirror of PatientAppointment (archive table for historical data).

### CareProvider

| Column | Type | Description |
|--------|------|-------------|
| CarpCode | TEXT | Care provider code (PK) |
| CarpDesc | TEXT | Provider description |
| NameTH | TEXT | Thai name |
| NameEN | TEXT | English name |
| CarpRowID | TEXT | TrakCare row ID |
| CTPCP_CarPrvTp_DR | TEXT | Provider type reference |
| CarProType | TEXT | Provider type |
| ActiveDateFrom | TEXT | Active start date |
| ActiveDateTo | TEXT | Active end date |

### RoomDetail

| Column | Type | Description |
|--------|------|-------------|
| ID | SERIAL | Primary key |
| CarpCode | TEXT | Care provider code (FK) |
| AssistCode | TEXT | Assistant code (FK) |
| ScheduleTime | TEXT | Scheduled time |
| LocationCode | TEXT | Location code |
| CarpStatus | TEXT | Status: 'In' or 'Out' |
| Room | TEXT | Room number (1-30 or "Out") |
| LoginTime | TIMESTAMP | Doctor login time |
| LogoutTime | TIMESTAMP | Doctor logout time |

**Indexes**: CarpCode, AssistCode, CarpStatus, Room, composite(CarpCode, CarpStatus)

### DoctorSchedule / DoctorScheduleTemp

| Column | Type | Description |
|--------|------|-------------|
| DoctorCode | TEXT | Doctor code (FK to CareProvider) |
| Day | TEXT | Day name (Monday-Sunday) |
| TimeStart | TEXT | Shift start time |
| TimeEnd | TEXT | Shift end time |
| StartDate | TEXT | Schedule effective start date |
| EndDate | TEXT | Schedule effective end date |

### Service

| Column | Type | Description |
|--------|------|-------------|
| SvcItemCode | TEXT | Service item code (PK) |
| SvcItemDesc | TEXT | Service description |
| SvcTimeInMinute | TEXT | Service duration in minutes |

### AssistanceDentist

| Column | Type | Description |
|--------|------|-------------|
| ID | SERIAL | Primary key |
| AssistCode | TEXT | Assistant code |
| AssistDesc | TEXT | Assistant description |
| Name | TEXT | Full name |
| NameTH | TEXT | Thai name |
| NameEN | TEXT | English name |
| CareProRowID | TEXT | Linked care provider |
| CareProDesc | TEXT | Linked provider description |
| SecurityGroup | TEXT | Access group |
| ActiveDateFrom | TEXT | Active start |
| ActiveDateTo | TEXT | Active end |

### BookingRoom

| Column | Type | Description |
|--------|------|-------------|
| ID | SERIAL | Primary key |
| CarpCode | TEXT | Doctor code |
| AssistCode1 | TEXT | First assistant |
| AssistCode2 | TEXT | Second assistant |
| StartDate | TEXT | Booking start date |
| EndDate | TEXT | Booking end date |
| StartTime | TEXT | Start time |
| EndTime | TEXT | End time |
| Day | TEXT | Day of week |
| Room | TEXT | Room number |
| Workcase | TEXT | Work case type |
| CreateDate | TIMESTAMP | Creation timestamp |

### PatientStatus

| Column | Type | Description |
|--------|------|-------------|
| StatusSymbol | TEXT | Status code (B/A/P/H/E/C) |
| StatusDesc | TEXT | Status description |

### Workcase

| Column | Type | Description |
|--------|------|-------------|
| ID | SERIAL | Primary key |
| CaseSymbol | TEXT | Case identifier |

### CareProviderService

| Column | Type | Description |
|--------|------|-------------|
| CarpCode | TEXT | Care provider code |
| SvcItemCode | TEXT | Service code |
| Date | TEXT | Effective date |

## Frontend State Model (`src/routes/index.js`)

```javascript
{
  resource: [],               // CareProvider list
  data: [],                   // PatientAppointment grouped by provider {test: [...]}
  room: [],                   // Room data
  services: [],               // Service catalog
  ResourceServices: [],       // CareProviderService mappings
  CareProviderWorkload: [],   // Doctor workload/slot info
  DoctorSlot: [],            // Doctor schedule slots
  AssistDentist: [],         // Dental assistants
  roomDetail: [],            // Current room occupancy
  statusPatients: [],        // Patient status records
  appointmentFilter: "",     // Filtered appointments
  alarmTime: [[]],           // Alarm times per room (30 rooms)
  showBlinkPatient: [],      // Blink CSS classes per room
  showPatient: [],           // Patient icon CSS per room
  problemFlags: false,       // Error state
  reloadFlags: true,         // Initial load state
  externalData: null,        // Loading indicator
}
```

## Related Documentation

- [Interfaces](./interfaces.md)
- [API Reference](./api-reference.md)
- [Database Patterns](../specialized/database-patterns.md)
- [Business Logic](../behavior/business-logic.md)
