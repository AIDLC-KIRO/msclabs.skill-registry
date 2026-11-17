# Service: Booking

## Responsibilities
- Manage advance room schedule planning
- Support manual booking creation via calendar UI
- Support bulk import from Excel files
- Provide filtered booking data by date/day-of-week
- Enforce permission-based access control for booking creation

## API Endpoints
| Method | Path | Handler |
|--------|------|---------|
| GET | /booking | booking.loadDataInMem |
| POST | /booking | booking.CreateItem |
| POST | /upload | upload.uploadFile |

## Dependencies
- pgpool (database access)
- CareProvider table (dentist lookup/display)
- AssistanceDentist table (assistant lookup/display)
- Workcase table (work case type reference)
- exceljs (Excel file parsing for upload)

## Scaling Considerations
- Low-frequency writes (manual bookings or periodic bulk imports)
- Destructive import pattern (DELETE all + re-insert) requires careful timing
- No TrakCare dependency — fully local operation
