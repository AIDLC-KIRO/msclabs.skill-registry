# Booking Domain - Business Rules

## BR-BK-001: Latest Booking Per Slot

When multiple bookings exist for the same time slot and room (due to date range overlaps), only the record with MAX(ID) is displayed. This effectively means the most recent booking overrides earlier ones.

**Source**: `server/modules/booking.js` → SQL subquery: `SELECT MAX("ID") ... GROUP BY "StartTime","EndTime","Day","Room"`

## BR-BK-002: Day-of-Week Matching

Bookings are stored with a date range (StartDate-EndDate) and a Day name. When querying for a specific date, the system checks both the date range AND the day-of-week name.

**Source**: `server/modules/booking.js` → WHERE clause: `$1::date BETWEEN "StartDate"::date AND "EndDate"::date AND "Day"=$2`

## BR-BK-003: Destructive Import

Excel upload performs a full table replacement: DELETE FROM BookingRoom + reset sequence before inserting new rows. No merge or differential update.

**Source**: `server/modules/upload.js` → `DELETE FROM public."BookingRoom"; ALTER SEQUENCE "BookingRoom_ID_seq" RESTART WITH 1`

## BR-BK-004: Upload Workcase Default

All bookings imported via Excel upload have Workcase hardcoded to 'N' (Normal). Manual bookings can specify any workcase.

**Source**: `server/modules/upload.js` → VALUES(..., 'N', ...)

## BR-BK-005: Permission Inversion Logic

The permission check uses an inverted list: a hardcoded array of assistant codes that are DENIED access. If the logged-in user's Username is in this list, they see the permission denied dialog. Everyone else has access.

**Source**: `src/pages/Calendar/FormDialog.js` → Permission check against hardcoded array

## BR-BK-006: Time Validation

- Start time cannot equal end time
- End time must be after start time
- Time is constrained to 08:00-20:00 range

**Source**: `src/pages/Calendar/FormDialog.js` → form validation

## BR-BK-007: Room 13 Exclusion

The calendar grid displays 29 rooms (1-12, 14-30). Room 13 is never shown or available for booking.

**Source**: `src/pages/Calendar/SimpleTable.js` → room array generation (skips index 12)

## BR-BK-008: Two Assistant Support

Each booking supports up to 2 assistants (AssistCode1, AssistCode2). Both are optional.

**Source**: `server/modules/booking.js` → INSERT query, `src/pages/Calendar/FormDialog.js`
