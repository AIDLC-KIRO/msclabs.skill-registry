# Care Provider Domain - Workflows

## WF-CP-001: Master Data Sync Workflow

```
1. Scheduler triggers taskGetMasterDataFromTrakcare() (daily at 00:01 or on startup)
2. Obtain OAuth2 access token from TrakCare
3. Sequential sync:
   a. getCareProvider() - fetch and upsert dentists
   b. getService() - fetch and upsert service catalog
   c. getAssistanceDentist() - fetch and upsert dental assistants
4. Parallel fetch: getDoctorSchedule() (handled by Doctor Schedule domain)
5. Refresh all in-memory caches
```

## WF-CP-002: Provider-Service Daily Sync

```
1. Triggered by taskGetCareProviderService() (1st of each month or on demand)
2. For each care provider (fetched from CareProvider table):
   a. Call TrakCare API: GetServiceByLocationAndCareProviderCode?Input1={CarpCode}&Input2=01den&Input3={date}
   b. For each service in response (where SvcItemCode is not undefined):
      - INSERT into CareProviderService (CarpCode, SvcItemCode, SvcMaxAllow, SvcRemainder, Date)
3. If any API call fails: set retry flag, continue with remaining providers
4. Refresh in-memory cache
```

## WF-CP-003: Provider Search Flow

```
1. User types in autocomplete field on Dashboard or Schedule
2. Filter suggestions by case-insensitive prefix match against provider Name
3. Apply lodash deburr() for accent-insensitive matching
4. Show max 50 results in dropdown
5. On selection: callback to parent with CarpCode
6. On clear: callback with empty string (removes filter)
```
