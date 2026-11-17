# Room Management Domain

## Overview

The Room Management domain handles real-time tracking of dental treatment room assignments. It manages which dentist and assistant are currently in which room, and processes room check-in/check-out events from external systems via the Event Bridge.

## Bounded Context

This domain owns the real-time state of physical treatment rooms. It is the primary event ingestion point for room assignment changes and broadcasts state changes to connected clients.

## Primary Entities

| Entity | Table | Description |
|--------|-------|-------------|
| RoomDetail | RoomDetail | Current room assignments (provider → room mapping with status) |

## Source Files

| File | Role | LOC |
|------|------|-----|
| server/modules/roomDetail.js | service | 86 |
| server/event-bridge.js | controller (event handler) | 444 |

## Key Relationships

- References `CareProvider.CarpCode` for dentist identity
- References `AssistanceDentist.AssistCode` for assistant identity
- Referenced by Patient Appointment domain for room→provider cross-reference
- Referenced by Doctor Schedule domain for workload calculation (only active rooms)
