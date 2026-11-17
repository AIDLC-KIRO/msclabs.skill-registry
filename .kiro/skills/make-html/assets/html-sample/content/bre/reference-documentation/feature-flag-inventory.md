# Feature Flag Inventory

## No Feature Flag System

The Dental Dashboard does not implement a feature flag system. There are no runtime toggles, gradual rollout mechanisms, or A/B testing infrastructure.

## Conditional Behavior via Environment Variables

The following environment variables act as simple on/off toggles:

| Variable | Values | Effect |
|----------|--------|--------|
| ENABLE_API_KEY | "true" / "false" | Enables/disables API key validation middleware |
| ALLOWED_IPS | "any" / comma-separated IPs | Controls IP filtering (any = disabled) |
| NODE_ENV | development / test / production | Controls initialization behavior (master data fetch only in production) |

## Build-Time Configuration

No compile-time feature flags, conditional compilation, or feature modules exist. All code paths are always present in all builds.
