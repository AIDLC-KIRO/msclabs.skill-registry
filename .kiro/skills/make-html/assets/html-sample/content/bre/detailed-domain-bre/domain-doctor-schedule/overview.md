# Doctor Schedule Domain

## Overview

The Doctor Schedule domain manages dentist time slot scheduling. It synchronizes schedule data from TrakCare HIS and provides workload calculations that feed the real-time dashboard.

## Bounded Context

This domain owns doctor availability time slots and is responsible for calculating workload metrics (service utilization vs available capacity).

## Primary Entities

| Entity | Table | Description |
|--------|-------|-------------|
| DoctorSchedule | DoctorSchedule | Main schedule records (time slots per day per doctor) |
| DoctorScheduleTemp | DoctorScheduleTemp | Staging table for change detection during TrakCare sync |

## Source Files

| File | Role | LOC |
|------|------|-----|
| server/modules/doctorSchedule.js | service | 339 |

## Key Relationships

- References `CareProvider.CarpCode` as `DoctorCode`
- Referenced by Patient Appointment domain for workload calculation
- Referenced by Booking domain for calendar display of doctor slots
