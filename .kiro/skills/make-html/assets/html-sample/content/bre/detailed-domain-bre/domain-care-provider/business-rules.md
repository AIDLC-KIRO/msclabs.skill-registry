# Care Provider Domain - Business Rules

## BR-CP-001: Upsert by Code

Care providers are matched by `CarpCode`, assistants by `AssistCode`, services by `SvcItemCode`. If a matching record exists in the database, it is updated; otherwise a new record is inserted.

**Source**: `server/modules/careProvider.js`, `assistanceDentist.js`, `service.js`

## BR-CP-002: Location Code Fixed to 01DEN

All API calls use the hardcoded location code `01DEN` (dental department). The system only manages providers for this single location.

**Source**: All TrakCare API calls use `input1=01DEN`

## BR-CP-003: Provider Type Differentiation

Dentists and assistants share nearly identical data structures but are distinguished by:
- API parameter: `input2=dentist` for CareProvider, `input2=assist_dentist` for AssistanceDentist
- Different tables and code fields (CarpCode vs AssistCode)

**Source**: `server/modules/careProvider.js`, `server/modules/assistanceDentist.js`

## BR-CP-004: Duplicate Prevention in Batch

During sync, a local dedup array prevents inserting the same provider twice within a single batch. This handles cases where TrakCare returns duplicate entries.

**Source**: `server/modules/careProvider.js` → getCareProvider() dedup logic

## BR-CP-005: Service Duration Requirement

Each service MUST have a `SvcTimeInMinute` value. This is used for:
- Schedule grid slot allocation (timeOfService / 15 = number of 15-min slots)
- Workload calculation (sum of service minutes / sum of slot minutes)

**Source**: `server/modules/service.js`, referenced in schedule and workload calculations

## BR-CP-006: Provider-Service Date Specificity

Care provider service mappings are date-specific. A provider may offer different services on different days based on TrakCare configuration. Only INSERT is performed (no update), as mappings are date-stamped.

**Source**: `server/modules/careProviderService.js` → `getCareProviderService()`

## BR-CP-007: API Response Validation

During provider-service sync, records with undefined `SvcItemCode` in the API response are skipped (not inserted).

**Source**: `server/modules/careProviderService.js`

## BR-CP-008: Sorted Display Order

All provider and service lists are ordered alphabetically by `NameEN` (providers) or `SvcItemDesc` (services) for consistent display.

**Source**: SQL queries in all modules use `ORDER BY "NameEN" ASC` or `ORDER BY "SvcItemDesc" ASC`
