# Booking Domain

## Overview

The Booking domain manages advance scheduling of dentists and assistants to treatment rooms. It provides a calendar-based interface for creating work schedules, supports bulk import via Excel upload, and handles work case categorization.

## Bounded Context

This domain owns the advance planning of room assignments (as opposed to real-time room tracking in the Room Management domain). It represents "planned" schedules vs "actual" room states.

## Primary Entities

| Entity | Table | Description |
|--------|-------|-------------|
| BookingRoom | BookingRoom | Scheduled room assignments per day/time/room |
| Workcase | Workcase | Lookup table for work case types (Normal, Special, Leave, Other) |

## Source Files

| File | Role | LOC |
|------|------|-----|
| server/modules/booking.js | service | 104 |
| server/modules/upload.js | service | 93 |
| src/pages/Calendar/index.js | controller (UI) | 404 |
| src/pages/Calendar/SimpleTable.js | helper (UI) | 601 |
| src/pages/Calendar/FormDialog.js | helper (UI) | 718 |
| src/pages/Calendar/AlertDialogSlide.js | helper (UI) | 56 |

## Key Relationships

- References `CareProvider.CarpCode` for dentist assignment
- References `AssistanceDentist.AssistCode` for assistant assignments (AssistCode1, AssistCode2)
- References `Workcase.CaseSymbol` for work case type
- Read by Dashboard for room color context
