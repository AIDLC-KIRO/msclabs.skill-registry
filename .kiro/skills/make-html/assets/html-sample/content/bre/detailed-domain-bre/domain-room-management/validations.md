# Room Management Domain - Validations

## VAL-RM-001: Room Detail POST Required Fields

The `/roomDetail` endpoint validates:
- ResourceId (string, provider code)
- Resource (string, provider name)
- Room (string: "1"-"12", "14"-"30", or "Out")
- AssistantId (string, assistant code)
- Assistant (string, assistant name)
- Location (string, e.g., "01DEN")

Returns HTTP 400 with specific error message if any field is missing.

**Source**: `server/event-bridge.js` → POST /roomDetail validation block

## VAL-RM-002: Room Number Range

Room values accepted: "1" through "30" (excluding "13") for check-in, or "Out" for check-out. No explicit numeric range validation is performed — the system relies on the external system sending valid room numbers.

**Source**: `server/event-bridge.js`
