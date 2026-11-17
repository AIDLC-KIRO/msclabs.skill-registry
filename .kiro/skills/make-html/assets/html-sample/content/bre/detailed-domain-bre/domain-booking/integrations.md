# Booking Domain - Integrations

## INT-BK-001: REST API Endpoints

- **GET /booking?date={date}**: Returns bookings for specified date (in-memory cache)
- **POST /booking**: Creates a new booking entry
- **POST /upload**: Bulk import from Excel file

## INT-BK-002: Cross-Domain Dependencies

- **Reads from**: CareProvider (for dentist selection and display)
- **Reads from**: AssistanceDentist (for assistant selection and display)
- **Reads from**: Workcase (for work case type display/validation)
- **Reads from**: CareProviderService (for service filtering in calendar view)

## INT-BK-003: No External System Integration

Unlike other domains, the Booking domain does NOT integrate with TrakCare API. All data is managed locally through the UI or Excel upload.
