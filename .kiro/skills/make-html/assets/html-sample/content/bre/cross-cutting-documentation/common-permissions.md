# Common Permissions

## Role-Based Access

| Role | Dashboard | Schedule | Calendar | Booking Create |
|------|-----------|----------|----------|---------------|
| admin | Yes | Yes | Yes | Conditional |
| assistant | Yes | No | No | No |

## Booking Permission (Calendar)

Booking creation is controlled by an inverted deny-list. The following assistant codes are DENIED booking access (all others are permitted):

```
Hardcoded in src/pages/Calendar/FormDialog.js
```

This is a client-side-only check with no server-side enforcement.

## API-Level Security

| Control | Scope | Configuration |
|---------|-------|---------------|
| API Key | All routes on main server | ENABLE_API_KEY env var (default: false) |
| IP Filter | All routes | ALLOWED_IPS env var (default: "any") |
| Rate Limit | All routes | 1000 requests/second per IP |
| CORS | All routes | Origin: * (all allowed) |

## No Fine-Grained RBAC

The system does not implement fine-grained permissions, resource-level access control, or permission inheritance. The two roles (admin/assistant) are the entire authorization model.
