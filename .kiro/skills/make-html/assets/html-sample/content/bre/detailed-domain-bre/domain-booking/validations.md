# Booking Domain - Validations

## VAL-BK-001: Form Field Validation

The FormDialog validates before submission:
- Start time ≠ End time (helperText: error message)
- End time > Start time (helperText2: error message)
- Workcase must be selected (helperText3: error message)
- Dentist (Resource) must be selected (helperText4: error message)

**Source**: `src/pages/Calendar/FormDialog.js`

## VAL-BK-002: Permission Check

User's `sessionStorage.getItem("Username")` is checked against a hardcoded denied-access list of 14 assistant codes. No server-side permission enforcement for booking creation.

**Source**: `src/pages/Calendar/FormDialog.js`

## VAL-BK-003: Excel Structure Expectation

Upload expects:
- File in `req.files.test.data`
- Worksheet named "Physician Slot Worksheet"
- Specific column layout (PhysicianCode, Name, Day, Times, Dates, AssistantCode, Name, Room)
- Header row skipped (rowNum > 1)

No explicit validation of sheet name or column count; missing worksheet causes runtime error.

**Source**: `server/modules/upload.js`
