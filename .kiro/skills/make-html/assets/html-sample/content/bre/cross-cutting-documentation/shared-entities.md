# Shared Entities

## CareProvider

- **Table**: `CareProvider`
- **Owning Domain**: care-provider
- **Used by**: patient-appointment (CarpCode in appointments), doctor-schedule (DoctorCode), room-management (CarpCode in room assignments), booking (CarpCode in bookings)
- **Shared fields consumed**: CarpCode (identifier), CarpDesc (display name), NameTH, NameEN

## Service

- **Table**: `Service`
- **Owning Domain**: care-provider
- **Used by**: patient-appointment (ServiceCode → SvcItemCode, SvcTimeInMinute for workload), booking (service filtering in calendar), doctor-schedule (SvcTimeInMinute for workload)
- **Shared fields consumed**: SvcItemCode (identifier), SvcItemDesc (display), SvcTimeInMinute (duration)

## AssistanceDentist

- **Table**: `AssistanceDentist`
- **Owning Domain**: care-provider
- **Used by**: room-management (AssistCode in room assignments), booking (AssistCode1/2 in bookings)
- **Shared fields consumed**: AssistCode (identifier), AssistDesc (display name), NameTH, NameEN
