# Doctor Schedule Domain - Validations

## VAL-DS-001: Schedule Date Range Validation

The `getDoctorScheduleOnDate` endpoint accepts query parameters `date` and uses it in a BETWEEN clause with StartDate and EndDate. No explicit format validation.

## VAL-DS-002: API Timeout

TrakCare schedule API calls have a 10-second timeout per provider request.

## VAL-DS-003: Composite Key Integrity

New schedule entries are only inserted when the full composite key (FieldRow, DoctorCode, Day, StartDate, EndDate, TimeStart, TimeEnd) does not match any existing record.
