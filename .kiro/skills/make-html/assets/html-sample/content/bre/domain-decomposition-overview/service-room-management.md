# Service: Room Management

## Responsibilities
- Process room check-in/check-out events from external systems
- Maintain real-time room assignment state
- Resolve room conflicts (one provider per room, one room per provider)
- Broadcast state changes via Socket.IO
- Deduplicate change events using object-hash

## API Endpoints (Main Server)
| Method | Path | Handler |
|--------|------|---------|
| GET | /roomDetail | roomDetail.loadDataInMem |
| DELETE | /roomDetail | roomDetail.deleteRoomDetail |

## Event Bridge Endpoints
| Method | Path | Handler |
|--------|------|---------|
| POST | /roomDetail | Room login/logout event handler |

## Dependencies
- Direct PostgreSQL pool (event-bridge uses its own connection, not pgpool)
- CareProvider table (display name)
- AssistanceDentist table (display name)
- object-hash (change deduplication)
- Socket.IO (real-time broadcasting)

## Scaling Considerations
- Event-driven with low-latency requirements
- Small table footprint (only active 'In' records matter)
- Separate server process (port 8080) from main API (port 8081)
