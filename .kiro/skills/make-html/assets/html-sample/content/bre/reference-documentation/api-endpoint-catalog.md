# API Endpoint Catalog

## Main API Server (Port 8081)

| Method | Path | Module | Description |
|--------|------|--------|-------------|
| GET | /doctorScheduleOnDate | doctorSchedule | Doctor schedule slots for date |
| GET | /careProviderWorkload | doctorSchedule | Workload metrics per room |
| GET | /careProviderServiceOnDate | careProviderService | Services per provider for date |
| GET | /careProvider | careProvider | All care providers |
| GET | /healthCheck | healthCheck | System health status |
| GET | /ping | jobsh | Simple ping/pong |
| GET | /assistDentist | assistanceDentist | All dental assistants |
| GET | /patientAppointmentHistory/:date | patientAppointment | Historical appointments by date |
| GET | /patientAppointment | patientAppointment | Current appointments |
| GET | /patientAppointmentFilter | patientAppointment | Filtered appointments |
| GET | /patientStatus | patientAppointment | Patient status data |
| DELETE | /patientAppointment | patientAppointment | Delete all appointments |
| POST | /logonTrakcare | signonTrakcare | User authentication |
| GET | /roomDetail | roomDetail | Active room assignments |
| DELETE | /roomDetail | roomDetail | Clear all room details |
| GET | /service | service | Service catalog |
| POST | /upload | upload | Excel file upload |
| GET | /booking | booking | Bookings for date |
| POST | /booking | booking | Create booking entry |

## Event Bridge Server (Port 8080)

| Method | Path | Description |
|--------|------|-------------|
| POST | /roomDetail | Room check-in/check-out event |
| POST | /patientStatus | Patient status change event |

## Swagger Documentation

Available at `/api-docs` on the main server (port 8081).
