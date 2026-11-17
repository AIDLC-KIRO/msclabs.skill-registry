# Dead Code / Decomposition Notes

## Dead Code Identified

### server/modules.old/ Directory

The entire `server/modules.old/` directory contains copies of the active modules. These appear to be backup copies before a refactoring:
- Identical files to `server/modules/` (same LOC counts)
- Exception: `modules.old/healthCheck.js` is 131 LOC vs `modules/healthCheck.js` at 150 LOC (older version)

**Recommendation**: Remove `modules.old/` entirely — it is unused dead code.

### server/modules/patientAppointment.js.old

A backup copy of the patient appointment module exists alongside the active version.

**Recommendation**: Remove.

### Unused Functions

| Module | Function | Status |
|--------|----------|--------|
| assistanceDentist.js | deleteAssistanceDentist | Empty function (no-op) |
| service.js | deleteService | Empty function (no-op) |
| careProvider.js | deleteCareProvider | Empty function (no-op) |
| careProviderService.js | deleteCareProviderService | Empty function (no-op) |
| careProviderService.js | retrieveDataToMem | Empty function (no-op) |
| healthCheck.js | getStatus | Empty function (no-op) |

### Frontend Dead Code

| File | Issue |
|------|-------|
| src/pages/About/index.js | Uses `class` instead of `className` (bug), never linked from navigation |
| src/index.css.old | Backup CSS file |
| src/pages/Dashboard/styles.js | Appears unused (older style definitions) |

## Impact on Decomposition

The dead code has no impact on domain boundaries. The `modules.old/` directory can be safely removed without affecting any active functionality. The empty delete functions suggest planned but unimplemented administrative features.
