# Care Provider Domain - Validations

## VAL-CP-001: API Response Structure

During sync, each record from TrakCare API is expected to have:
- CareProvider: CarpCode (required), CarpDesc, NameTH, NameEN, CTLOC_Code
- AssistanceDentist: AssistCode (required), AssistDesc, NameTH, NameEN
- Service: SvcItemCode (required), SvcItemDesc, SvcTimeInMinute

Records without required fields may cause database constraint violations (NOT NULL on key columns).

## VAL-CP-002: SvcItemCode Null Check

In `getCareProviderService()`, records from TrakCare where `SvcItemCode` is undefined are explicitly skipped before INSERT.

**Source**: `server/modules/careProviderService.js`

## VAL-CP-003: Request Timeout

All TrakCare API calls for provider-service mapping have a 10-second timeout. If exceeded, the call is treated as failed and triggers retry logic.

**Source**: `server/modules/careProviderService.js`
