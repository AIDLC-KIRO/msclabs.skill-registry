# Doctor Schedule Domain - Sequence Diagram

```mermaid
sequenceDiagram
    participant Scheduler as scheduler.js
    participant DS as doctorSchedule.js
    participant CP as careProvider.js
    participant TrakCare as TrakCare API
    participant DB as PostgreSQL

    Note over Scheduler: 3x daily (07:30, 11:30, 16:30)
    Scheduler->>DS: getDoctorSchedule(startDate, endDate)
    DS->>DB: DELETE FROM DoctorScheduleTemp; RESTART SEQUENCE
    DS->>CP: Get provider list
    CP-->>DS: CareProvider[] (CarpCodes)
    
    loop Each CareProvider
        DS->>TrakCare: GET /getDoctorSchedule?Input1={CarpCode}&Input2={start}&Input3={end}&Input4=01DEN
        TrakCare-->>DS: Schedule entries
        loop Each schedule entry
            DS->>DB: INSERT INTO DoctorScheduleTemp
        end
    end

    DS->>DS: validateDoctorScheduleChangeEvent(start, end)
    DS->>DB: INSERT new (temp LEFT JOIN main WHERE NULL)
    DS->>DB: SELECT from main EXCEPT temp (detect removed)
    DS->>DB: DELETE removed entries
    DS->>DS: retrieveDataToMem()
    DS->>DB: CTE workload query (DoctorSchedule + RoomDetail + PatientAppointment + Service)
```
