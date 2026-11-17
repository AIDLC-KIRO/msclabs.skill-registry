# Common Error Codes

## HTTP Error Responses

| Code | Context | Message | Source |
|------|---------|---------|--------|
| 400 | POST /roomDetail | "ResourceId is required" (and other field messages) | event-bridge.js |
| 400 | POST /patientStatus | "TransactionId is required" (and other field messages) | event-bridge.js |
| 401 | API Key validation | "Unauthorized, invalid API key" | app.js apiKeyMiddleware |
| 401 | POST /logonTrakcare | "wrong" | signonTrakcare.js |
| 403 | IP filter | "Forbidden, IP not allowed" | app.js ipFilterMiddleware |
| 429 | Rate limiting | "Too many requests, please try again later." | app.js rateLimit |
| 500 | Global error handler | "Something went wrong!" | app.js error middleware |
| 502 | POST /logonTrakcare | "error" | signonTrakcare.js |

## No Custom Error Code System

The application does not define a structured error code taxonomy. Errors are communicated via HTTP status codes and simple string messages. No error IDs or machine-readable error codes are used.
