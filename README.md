# Global Class Offering Booking System

A production-ready backend service for a global live-learning platform built with **NestJS + PostgreSQL**.

## Architecture

```
src/
├── auth/                    # JWT auth (register + login)
├── teachers/                # Teacher APIs (offerings + sessions)
├── parents/                 # Parent APIs (browse + book + view)
└── common/
    ├── entities/            # TypeORM entities (User, Offering, Session, Booking)
    ├── enums/               # UserRole, BookingStatus
    ├── guards/              # JwtAuthGuard, RolesGuard
    ├── decorators/          # @CurrentUser, @Roles
    └── filters/             # Global exception filter
```

## Database Schema

```
users       — id (uuid PK), name, email (unique), password_hash, role, timezone
offerings   — id (uuid PK), course_name, name, description, teacher_id (FK), teacher_timezone
sessions    — id (uuid PK), offering_id (FK), teacher_id (FK), start_time (timestamptz UTC), end_time (timestamptz UTC)
bookings    — id (uuid PK), parent_id (FK), offering_id (FK), status
              UNIQUE(parent_id, offering_id)
```

**All timestamps stored in UTC. Timezone conversion happens at the API layer (Luxon).**

## Key Design Decisions

### Timezone Handling
- Teachers submit session times in their local timezone (IANA e.g. `"Asia/Kolkata"`)
- Service converts to UTC before persisting via `DateTime.fromISO(time, { zone: tz })`
- Parent API responses convert UTC → parent's timezone automatically
- Every user stores their IANA timezone on registration

### Concurrency (Rule 3)
Three-layer protection against race conditions:
1. **PostgreSQL Advisory Lock** (`pg_advisory_xact_lock` per parent ID) — prevents same parent from winning two simultaneous conflicting requests
2. **SERIALIZABLE transaction** — prevents phantom reads during the conflict-check window
3. **UNIQUE constraint** on `(parent_id, offering_id)` — last-resort database guard

### Conflict Detection (Rule 2)
Interval overlap formula: `newStart < bookedEnd AND bookedStart < newEnd`
- Checked in-transaction against all confirmed bookings for the parent
- Error message shows the conflicting time in the **parent's own timezone**

### Booking Level (Rule 1)
Parents book at the **offering level** — all sessions are committed atomically.

---

## Quick Start

### 1. Start PostgreSQL
```bash
docker-compose up postgres -d
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit JWT_SECRET at minimum
```

### 3. Run the app
```bash
npm install
npm run start:dev
```

App runs at `http://localhost:3000`. TypeORM `synchronize: true` auto-creates all tables in development.

---

## API Reference

### Auth

#### Register
```
POST /api/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "TEACHER",            // "TEACHER" or "PARENT"
  "timezone": "America/New_York"  // IANA timezone
}
```

#### Login
```
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "secret123"
}
```
Both return `{ accessToken, user }`.

---

### Teacher APIs
> `Authorization: Bearer <token>` — role must be TEACHER

#### Create Offering
```
POST /api/teachers/offerings
{
  "courseName": "Minecraft Coding",
  "name": "Saturday Batch",
  "description": "8-week course for beginners"
}
```

#### Add Sessions to Offering
```
POST /api/teachers/offerings/:offeringId/sessions
{
  "sessions": [
    { "startTime": "2025-06-07T18:00:00", "endTime": "2025-06-07T19:00:00" },
    { "startTime": "2025-06-14T18:00:00", "endTime": "2025-06-14T19:00:00" }
  ]
}
```
Times are interpreted in the **teacher's registered timezone** and stored as UTC.

#### Get My Offerings
```
GET /api/teachers/offerings
```

---

### Parent APIs
> `Authorization: Bearer <token>` — role must be PARENT

#### View Available Offerings
```
GET /api/parents/offerings
```
Session times returned in **parent's registered timezone**.

#### Book an Offering
```
POST /api/parents/bookings
{
  "offeringId": "<uuid>"
}
```
Enforces: no double-booking, no time conflicts with existing bookings, no empty offerings.

#### View My Bookings
```
GET /api/parents/bookings
```

---

## Example Scenario

```
Teacher in Asia/Kolkata creates "Minecraft Coding – Saturday Batch"
  → sessions: every Saturday 6 PM–7 PM IST

Parent in America/New_York views offerings
  → sees: Saturday 8:30 AM–9:30 AM EDT

Parent books "Minecraft Coding" ✓

Parent tries to book "Roblox Design" (Saturday 9:00 AM–10:00 AM EDT)
  → 409 CONFLICT: overlaps with Minecraft session 8:30–9:30 AM EDT
```

---

## Error Format

```json
{
  "success": false,
  "statusCode": 409,
  "timestamp": "2025-06-07T10:00:00.000Z",
  "path": "/api/parents/bookings",
  "message": "Booking conflict: ..."
}
```

| Code | Meaning |
|------|---------|
| 400  | Validation / invalid timezone / offering has no sessions |
| 401  | Missing or invalid JWT |
| 403  | Wrong role |
| 404  | Offering not found |
| 409  | Already booked / time conflict |
