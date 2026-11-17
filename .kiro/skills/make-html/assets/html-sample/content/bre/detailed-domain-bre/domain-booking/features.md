# Booking Domain - Features

## F-BK-001: Calendar Booking View

Displays a time-grid (30-minute slots from 08:00-20:00) across 29 rooms showing current bookings for a selected date. Supports filtering by dentist, assistant, or service.

**Source**: `src/pages/Calendar/index.js`, `src/pages/Calendar/SimpleTable.js`

## F-BK-002: Booking Creation (Manual)

Authorized users can create new room booking entries specifying: dentist, assistants (up to 2), time range, room, work case, date range, and remark.

**Source**: `src/pages/Calendar/FormDialog.js`, `server/modules/booking.js` → `CreateItem()`

## F-BK-003: Bulk Import via Excel

Uploads an Excel file ("Physician Slot Worksheet" sheet) containing room schedule data. Clears ALL existing BookingRoom data and replaces with imported data.

**Source**: `server/modules/upload.js` → `uploadFile()`

## F-BK-004: Booking Retrieval by Date

Fetches bookings for a specific date by matching date BETWEEN StartDate and EndDate AND Day matches the day-of-week. Returns the latest booking per time slot/room (MAX ID grouping).

**Source**: `server/modules/booking.js` → `retrieveDataToMem()`

## F-BK-005: Permission-Based Access Control

Calendar booking creation is restricted. A hardcoded list of 14 assistant codes CANNOT create bookings (shown AlertDialogSlide instead). All other users CAN create bookings.

**Source**: `src/pages/Calendar/FormDialog.js` → Permission check

## F-BK-006: Work Case Categorization

Each booking is categorized by work case:
- N = Normal (default for uploads)
- S = Special Examination
- O = Other
- L = Dentist Leave

**Source**: `src/pages/Calendar/FormDialog.js`, `database-documentation/00-seed-data.json`

## F-BK-007: Cell Merging Display

Adjacent time slots with the same provider/workcase/assistants are visually merged (colspan) in the calendar table for cleaner display.

**Source**: `src/pages/Calendar/SimpleTable.js` → cell merging logic
