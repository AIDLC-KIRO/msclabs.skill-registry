# Error Handling Patterns

## Backend Error Handling

### Database Query Retry (pgpool.js)
- **Pattern**: Exponential backoff with 3 retries
- **Base delay**: 1000ms, doubling each attempt (1s, 2s, 4s)
- **On failure**: Logs query text and error stack, throws on final failure

### TrakCare API Retry (accessToken.js, all modules)
- **Pattern**: Simple retry up to 3 attempts
- **On undefined result**: Retries immediately
- **On persistent failure**: Returns undefined, sets health check flag to DOWN

### Express Global Error Handler (app.js)
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
```

### Event Bridge Error Handling
- **Validation errors**: Return HTTP 400 with specific field error message
- **Database errors**: Caught per operation, logged, return HTTP 500
- **Socket.IO errors**: Silently caught, do not crash server

## Frontend Error Handling

### API Call Failures
- No global error boundary
- Individual fetch calls wrapped in try/catch
- Health check status displayed as warning flag (`problemFlags`)
- System error shown in Thai: "เกิดข้อผิดพลาดกับระบบ กรุณาติดต่อผู้ดูแลระบบ"

### Authentication Errors
- 401 from /logonTrakcare → "Signon failed" message
- 502 from /logonTrakcare → System error alert in Thai

## Health Check Mechanism
- `healthCheck.js` tests all 6 TrakCare API endpoints
- Each endpoint retried 3 times before marking as failed
- Overall status: 1 (UP) only if ALL endpoints pass
- Frontend polls `/healthCheck` and shows warning banner if status=0
