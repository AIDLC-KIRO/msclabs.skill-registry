# Care Provider Domain - Features

## F-CP-001: Care Provider Synchronization

Fetches dentist data from TrakCare API and upserts into the local database. Matches existing records by `CarpCode`; inserts new and updates existing.

**Source**: `server/modules/careProvider.js` → `getCareProvider()`

## F-CP-002: Dental Assistant Synchronization

Fetches dental assistant data from TrakCare API (same endpoint, different input2 parameter) and upserts into local database. Matches by `AssistCode`.

**Source**: `server/modules/assistanceDentist.js` → `getAssistanceDentist()`

## F-CP-003: Service Catalog Synchronization

Fetches available dental services from TrakCare API and upserts by `SvcItemCode`. Each service includes a time duration (`SvcTimeInMinute`) used for scheduling.

**Source**: `server/modules/service.js` → `getService()`

## F-CP-004: Provider-Service Mapping Per Date

For each care provider, fetches their available services for a specific date. This mapping changes daily based on TrakCare configuration.

**Source**: `server/modules/careProviderService.js` → `getCareProviderService(dateParam)`

## F-CP-005: Provider Search (Autocomplete)

Provides typeahead search for dentists by name (case-insensitive prefix match, max 50 results) on Dashboard and Schedule pages.

**Source**: `src/pages/Dashboard/searchResource.js`, `src/pages/Schedule/searchResource.js`

## F-CP-006: Service Search (Autocomplete)

Provides typeahead search for services by description on the Schedule page.

**Source**: `src/pages/Schedule/searchService.js`

## F-CP-007: In-Memory Caching

All master data is loaded into Node.js process memory and served from cache. Cache is refreshed during scheduled sync operations.

**Source**: All four server modules → `retrieveDataToMem()` / `loadDataInMem()`
