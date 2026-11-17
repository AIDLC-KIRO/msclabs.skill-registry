# Bounded Contexts

## patient-appointment

**Boundary**: Manages the lifecycle of dental patient appointments from creation through status transitions to archival.

**Aggregate Root**: PatientAppointment (identified by APPT_RowId)

**Justification**: PatientAppointment, PatientAppointmentHistory, and PatientAppointmentTemp share a single aggregate root (the appointment). PatientStatus is a value-object lookup within this context. The appointment's lifecycle (sync → validate → status transitions → archive) forms a cohesive transactional boundary.

## care-provider

**Boundary**: Manages identity and capabilities of dental staff (dentists, assistants) and the service catalog.

**Aggregate Root**: CareProvider (identified by CarpCode)

**Justification**: CareProvider, AssistanceDentist, Service, and CareProviderService are all master data entities managed together during sync. CareProviderService is a junction entity linking providers to services. All four share the same sync lifecycle and are queried together.

## doctor-schedule

**Boundary**: Manages doctor time slot availability and workload metrics.

**Aggregate Root**: DoctorSchedule (identified by composite key: FieldRow + DoctorCode + Day + StartDate + EndDate + TimeStart + TimeEnd)

**Justification**: DoctorSchedule and DoctorScheduleTemp share a lifecycle separate from CareProvider. They are synced independently (3x daily vs 1x daily), have their own change detection pattern, and own the workload calculation logic.

## room-management

**Boundary**: Manages real-time state of physical treatment rooms.

**Aggregate Root**: RoomDetail (identified by CarpCode + Room combination when CarpStatus='In')

**Justification**: RoomDetail manages ephemeral, event-driven state that changes in real-time. Its lifecycle (event → conflict resolution → broadcast) is fundamentally different from planned bookings.

## booking

**Boundary**: Manages advance planning of room schedules.

**Aggregate Root**: BookingRoom (identified by ID, latest per slot/room via MAX)

**Justification**: BookingRoom operates on a planning horizon (date ranges, day-of-week), while RoomDetail operates in real-time. They serve different business purposes despite both referencing rooms. Workcase is a value-object within this context.
