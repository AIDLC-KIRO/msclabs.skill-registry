# Authentication & Authorization

## Authentication Mechanism

### User Authentication (Frontend → Backend)
- **Method**: POST /logonTrakcare with username/password
- **Backend validation**: Proxies credentials to TrakCare API (`getLogonTrakcare?input1={user}&input2={pass}`)
- **Bypass account**: Username `DSG/CTS-CS-AdvancedServices` always returns "admin" without TrakCare validation
- **Session storage**: Role stored in browser `sessionStorage.setItem("Authentication", role)`
- **Session fields**: Authentication (role), checkLogin (flag), Username (user ID)

### API Authentication (External → Event Bridge)
- **API Key**: Optional, enabled via `ENABLE_API_KEY=true` env var
- **Header**: `x-api-key` in request header
- **IP Filtering**: Configurable via `ALLOWED_IPS` env var (comma-separated or "any")

### TrakCare API Authentication (Backend → TrakCare)
- **Method**: OAuth2 Password Grant
- **Endpoint**: POST {TRAKCARE_URL_API}/token
- **Credentials**: TRAKCARE_API_USERNAME / TRAKCARE_API_PASSWORD from env
- **Token usage**: Bearer token in Authorization header for all TrakCare API calls

## Authorization / Roles

| Role | Access | Navigation |
|------|--------|-----------|
| admin | Full access | Dashboard, Schedule, Calendar, Logout |
| assistant | Dashboard only | Dashboard, Logout |

### Calendar Booking Permissions
- Hardcoded denied-access list of 14 assistant codes in `FormDialog.js`
- Users in this list see "Permission Denied" dialog
- All other authenticated users can create bookings

## Security Controls
- Helmet middleware (HTTP security headers)
- Rate limiting (1000 requests/second per IP)
- CORS configured (all origins allowed in current config)
- Compression middleware enabled
- TLS rejection disabled (`NODE_TLS_REJECT_UNAUTHORIZED = "0"`) — security concern
