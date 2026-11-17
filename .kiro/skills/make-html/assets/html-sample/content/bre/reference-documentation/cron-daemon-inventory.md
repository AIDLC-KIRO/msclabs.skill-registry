# Cron/Daemon Inventory

## Scheduled Jobs (node-schedule via scheduler.js)

| Schedule | Task Function | Description |
|----------|--------------|-------------|
| Daily 00:01 | dailyTask | Master data refresh, log purge, monthly provider-service sync |
| Daily 07:30 | createDoctorScheduleTask | Morning doctor schedule refresh |
| Daily 11:30 | createDoctorScheduleTask | Noon doctor schedule refresh |
| Daily 16:30 | createDoctorScheduleTask | Evening doctor schedule refresh |

## Interval Tasks (setInterval)

| Interval | Task Function | Process | Description |
|----------|--------------|---------|-------------|
| 60,000ms (1 min) | taskHandleEventCall | scheduler.js | Appointment fetch + change detection + memory refresh |
| 60,000ms (1 min) | taskHandleEventCall | app.js | Same task running in main API process |

## Process Inventory (PM2 via ecosystem.config.js)

| Process | Script | Instances | Description |
|---------|--------|-----------|-------------|
| dental-dashboard-api | server/app.js | 1 | Main REST API + Socket.IO client |
| dental-dashboard-event-bridge | server/event-bridge.js | 1 | Event Bridge Socket.IO server |
| dental-dashboard-scheduler | server/scheduler.js | 1 | Scheduled task runner |

## Initialization Sequence

On startup:
1. `initTaskJobSchedule()` → Fetches master data (production only)
2. Fetches appointments for current + next month
3. Starts interval tasks
4. Registers cron jobs

## Time Window

Appointment sync only active between 06:00-22:00 Bangkok timezone. Outside this window, the interval task skips API calls.
