# Service: Care Provider

## Responsibilities
- Synchronize dentist master data from TrakCare
- Synchronize dental assistant master data from TrakCare
- Synchronize service catalog from TrakCare
- Maintain provider-service availability mapping per date
- Provide cached master data to API consumers

## API Endpoints
| Method | Path | Handler |
|--------|------|---------|
| GET | /careProvider | careProvider.loadDataInMem |
| GET | /assistDentist | assistanceDentist.loadDataInMem |
| GET | /service | service.loadDataInMem |
| GET | /careProviderServiceOnDate | careProviderService.loadDataInMemOnDate |

## Dependencies
- pgpool (database access)
- accessToken (OAuth2 for TrakCare)

## Scaling Considerations
- Read-heavy with infrequent writes (daily sync)
- Provider-service mapping can be expensive (N API calls × M providers)
- All data served from process memory
