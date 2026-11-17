# Security Patterns

## Implemented Security Controls

### 1. Helmet (HTTP Security Headers)
**Location**: `server/app.js`, `server/event-bridge.js`
- Sets security-related HTTP headers (X-Frame-Options, CSP, HSTS, etc.)
- Applied globally to both services

### 2. Rate Limiting
**Location**: `server/app.js`, `server/event-bridge.js`
- App service: Configured via express-rate-limit
- Event bridge: 1000 requests per second per IP
- Custom key generator handles IPv6 loopback mapping

### 3. API Key Authentication
**Location**: `server/app.js`
- `ENABLE_API_KEY` environment variable controls enforcement
- Checked via `x-api-key` header
- Single shared key from `API_KEY` environment variable

### 4. IP Whitelist Filtering
**Location**: `server/app.js`
- `ALLOWED_IPS` environment variable defines allowed source IPs
- Restricts access to known internal network addresses

### 5. Parameterized SQL Queries
**Location**: All `server/modules/*.js` files
- All database queries use `$1, $2, ...` parameter placeholders
- Prevents SQL injection via pg driver's parameterized query support

### 6. CORS Configuration
**Location**: `server/middlewares/index.js`, `server/event-bridge.js`
- App service: `origin: "*"` (overly permissive)
- Event bridge: `ALLOWED_ORIGINS` env var or fallback to `"*"`

## Security Vulnerabilities Identified

### High Risk

1. **TLS Certificate Validation Disabled**
   - **Location**: `server/event-bridge.js`, line: `process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`
   - **Impact**: Man-in-the-middle attacks possible on all HTTPS connections from this process
   - **Context**: Likely set to work with self-signed certificates on internal TrakCare server

2. **CORS Wildcard Origin**
   - **Location**: `server/middlewares/index.js` → `origin: "*"`
   - **Impact**: Any domain can make authenticated requests to the API
   - **Context**: Should be restricted to the known frontend domain

### Medium Risk

3. **Credentials in Environment Files**
   - **Location**: `.env`, `.env.production`, `.env.test`
   - **Files**: Contain database passwords, API keys, TrakCare credentials
   - **Note**: `.env` files are in `.gitignore` but `.env.production` appears to be committed

4. **No Request Body Size Limit**
   - **Location**: `server/event-bridge.js` (bodyParser without size limit)
   - **Impact**: Large payload DoS attacks possible

5. **Trust Proxy Configuration**
   - **Location**: `server/event-bridge.js` → `app.set("trust proxy", (ip) => true)`
   - **Impact**: Trusts ALL proxies, allowing IP spoofing for rate limiting bypass

### Low Risk

6. **Session Storage for Auth**
   - **Location**: `src/pages/Login/index.js`, `src/pages/Logout/index.js`
   - **Note**: Uses sessionStorage (cleared on tab close) — adequate for internal dashboard

7. **No CSRF Protection**
   - POST endpoints accept requests without CSRF tokens
   - Partially mitigated by API key requirement

## Security Architecture Diagram

```
[External OPD Queue]
     │
     │ POST (no auth beyond IP filter)
     ▼
[Event Bridge :8080]  ←── Helmet + Rate Limit + IP Trust (all)
     │
     │ Socket.IO (CORS: *)
     ▼
[App Service :8081]   ←── Helmet + Rate Limit + API Key + IP Filter
     │
     │ Socket.IO client
     ▼
[React Frontend :3001] ←── Session Storage auth
```

## Related Documentation

- [Error Handling](../behavior/error-handling.md)
- [Tech Debt](./tech-debt.md)
- [Remediation Plan](../technical-debt/remediation-plan.md)
