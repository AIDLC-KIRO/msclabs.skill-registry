# Behavioral Diagrams

## Patient Status Update Sequence

```
OPD Queue         Event Bridge       PostgreSQL        App Service        Frontend
    │                  │                  │                 │                │
    │ POST /patientStatus                 │                 │                │
    │─────────────────►│                  │                 │                │
    │                  │ Validate fields   │                 │                │
    │                  │ Map status code   │                 │                │
    │                  │                  │                 │                │
    │                  │ UPDATE PT_Status  │                 │                │
    │                  │─────────────────►│                 │                │
    │                  │     OK           │                 │                │
    │                  │◄─────────────────│                 │                │
    │                  │                  │                 │                │
    │                  │ emit("patientStatusUpdate")        │                │
    │                  │───────────────────────────────────►│                │
    │                  │                                    │                │
    │                  │ emit("StatusPatient")              │                │
    │                  │────────────────────────────────────────────────────►│
    │                  │                                    │                │
    │  200 OK          │                  │                 │ Refresh memory │
    │◄─────────────────│                  │                 │───────────────►│
    │                  │                  │                 │                │
    │                  │                  │                 │ GET /patientAppt
    │                  │                  │                 │◄───────────────│
    │                  │                  │                 │  JSON response │
    │                  │                  │                 │───────────────►│
    │                  │                  │                 │   Re-render    │
```

## Appointment Sync Activity Diagram

```
[START: Interval Timer (60s)]
        │
        ▼
  ┌─────────────┐     No
  │ Hour 6-22?  │─────────────► [END: Skip]
  └──────┬──────┘
         │ Yes
         ▼
  ┌─────────────────┐
  │ Get OAuth Token  │
  │ from TrakCare    │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────┐
  │ GET Appointments    │
  │ from TrakCare API   │
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │ DELETE all from     │
  │ PatientApptTemp     │
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │ INSERT each record  │
  │ into ApptTemp       │
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────────┐
  │ Validate Changes:       │
  │ - INSERT new records    │
  │   (in temp, not in main)│
  │ - EXCEPT: find changed  │
  │ - UPDATE changed records│
  └────────┬────────────────┘
           │
           ▼
  ┌──────────────┐     No
  │ Changes      │─────────► [END: No refresh]
  │ detected?    │
  └──────┬───────┘
         │ Yes
         ▼
  ┌─────────────────────┐
  │ Refresh in-memory   │
  │ appointment cache   │
  └─────────────────────┘
         │
         ▼
      [END]
```

## Room Login State Machine

```
                    POST /roomDetail (Room != "Out")
    ┌──────────┐ ──────────────────────────────────────► ┌──────────┐
    │          │                                          │          │
    │   OUT    │                                          │    IN    │
    │          │ ◄────────────────────────────────────── │          │
    └──────────┘    POST /roomDetail (Room == "Out")     └──────────┘
         │                                                     │
         │         POST /roomDetail (same room, diff doctor)   │
         │         ─────────────────────────────────────►      │
         │         (Kicks current occupant to OUT first)       │

    Invariants:
    - Max 1 doctor IN per room at any time
    - Max 1 room IN per doctor at any time
    - LoginTime set on transition to IN
    - LogoutTime set on transition to OUT
```

## Related Documentation

- [Structural Diagrams](../structural/component-diagrams.md)
- [Architecture Diagrams](../architecture/system-context.md)
- [Workflows](../../behavior/workflows.md)
- [Business Logic](../../behavior/business-logic.md)
