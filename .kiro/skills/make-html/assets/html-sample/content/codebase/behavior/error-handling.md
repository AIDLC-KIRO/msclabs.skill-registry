> ⚠️ **Early Access**: Behavior documentation is in early access. Please review critically.

# Error Handling

## Backend Error Handling Patterns

### Database Query Errors (`server/modules/pgpool.js`)

**Pattern**: Retry with exponential backoff
- Max retries: 3
- Base delay: 1000ms (doubles each retry)
- On final failure: throws error to caller
- Connection checkout timeout warning at 5 seconds

### Event Bridge Database Errors (`server/event-bridge.js`)

**Pattern**: Try/catch with client release in `finally` block
- POST /roomDetail: Returns 500 "Internal Server Error" on DB failure
- POST /patientStatus: Returns 500 "Update Patient Status Error" on DB failure
- Always releases connection via `client.release()` in finally

### Module-Level Error Handling (`server/modules/patientAppointment.js`)

**Pattern**: Async IIFE with `.catch()` (legacy pattern)
```javascript
await (async () => {
  await pg_pool.execute(text, values);
})().catch((err) => {
  console.log(err.stack);
  resStatus = false;
});
```

- Errors are logged to console but generally swallowed
- `resStatus` flag tracks success/failure for upstream callers
- No structured error responses in internal functions

### Route Handler Errors

| Endpoint | Error Code | Response |
|----------|-----------|----------|
| DELETE /patientAppointment | 400 | `{Code: 400, Message: "Bad Request", Status: false}` |
| DELETE /roomDetail | 400 | `{Code: 400, Message: "Bad Request", Status: false}` |
| POST /roomDetail (event bridge) | 400/500 | Structured JSON response |
| POST /patientStatus (event bridge) | 400/500 | Structured JSON response |
| GET /roomDetail (retrieve) | 501 | Empty object `{}` |

### TrakCare API Errors (`server/modules/patientAppointment.js`, `getAppointment`)

**Pattern**: Return boolean status flag
- Token undefined → returns `false`
- API call fails → catches error, returns `false`
- Caller uses flag to update health check status

### Health Check Status (`server/modules/healthCheck.js`)

- Status 1: All systems operational (TrakCare API responding)
- Status 0: TrakCare API unreachable
- Frontend displays error alert when health_check.status === 0

## Frontend Error Handling

### Component Mount Errors (`src/routes/index.js`)

**Pattern**: Try/catch with error state flag
```javascript
try {
  // Fetch all APIs...
} catch (error) {
  console.error("Error:", error);
  this.setState({ problemFlags: true, externalData: 1 });
}
```

- Sets `problemFlags: true` → renders error alert with Thai message
- Preserves logout route even in error state

### Data Update Errors (`src/routes/index.js`, `handleDataUpdate`)

**Pattern**: Sets problem flag on any fetch failure
- `problemFlags: true` triggers error banner display
- No retry mechanism at frontend level (relies on 6s polling interval)

### Socket.IO Error Events

- `Trakcare` event with "failed" message → sets problemFlags
- No automatic reconnection handling beyond Socket.IO defaults

## Error Propagation Flow

```
TrakCare API failure
  → patientAppointment.getAppointment returns false
  → healthCheck.setStatus(0)
  → Frontend /healthCheck returns {status: 0}
  → Frontend sets problemFlags = true
  → Error banner displayed to user (Thai: "เกิดข้อผิดพลาดขึ้นภายในระบบ")
```

## Missing Error Handling

1. **No global error handler** in Express (unhandled rejections silently fail)
2. **No request timeout** on TrakCare API calls (axios default is no timeout)
3. **No circuit breaker** for repeated TrakCare failures
4. **No dead letter queue** for failed Socket.IO events
5. **No validation of SQL query parameters** beyond what pg parameterization provides

## Related Documentation

- [Business Logic](./business-logic.md)
- [Decision Logic](./decision-logic.md)
- [Security Patterns](../analysis/security-patterns.md)
- [Maintenance Burden](../technical-debt/maintenance-burden.md)
