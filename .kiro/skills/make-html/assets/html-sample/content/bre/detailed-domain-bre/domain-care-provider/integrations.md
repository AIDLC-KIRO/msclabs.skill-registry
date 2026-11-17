# Care Provider Domain - Integrations

## INT-CP-001: TrakCare Care Provider API

- **Endpoint**: `GET {TRAKCARE_URL_API}/api/PTINF/GetCareProviderByLocation?input1=01DEN&input2=dentist`
- **Authentication**: OAuth2 Bearer token
- **Frequency**: Daily (00:01) + on application startup
- **Response**: Array of care provider objects

## INT-CP-002: TrakCare Assistant API

- **Endpoint**: `GET {TRAKCARE_URL_API}/api/PTINF/GetCareProviderByLocation?input1=01DEN&input2=assist_dentist`
- **Authentication**: OAuth2 Bearer token
- **Frequency**: Daily (00:01) + on application startup
- **Response**: Array of assistant objects

## INT-CP-003: TrakCare Service API

- **Endpoint**: `GET {TRAKCARE_URL_API}/api/PTINF/GetServiceByLocationCode?input1=01DEN`
- **Authentication**: OAuth2 Bearer token
- **Frequency**: Daily (00:01) + on application startup
- **Response**: Array of service objects with item codes, descriptions, time durations

## INT-CP-004: TrakCare Provider-Service API

- **Endpoint**: `GET {TRAKCARE_URL_API}/api/PTINF/GetServiceByLocationAndCareProviderCode?Input1={CarpCode}&Input2=01den&Input3={date}`
- **Authentication**: OAuth2 Bearer token
- **Frequency**: 1st of each month (for current + next month dates)
- **Response**: Array of services available to that provider on that date

## INT-CP-005: Cross-Domain Consumers

- **Patient Appointment domain**: reads CareProvider.CarpCode/CarpDesc and Service.SvcItemCode/SvcItemDesc/SvcTimeInMinute
- **Doctor Schedule domain**: reads CareProvider.CarpCode for schedule fetching
- **Room Management domain**: reads CareProvider and AssistanceDentist for room assignments
- **Booking domain**: reads CareProvider, AssistanceDentist, and Service for booking creation
