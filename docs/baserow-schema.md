# Baserow Setup and Schema

This app uses Baserow as its database through the REST API with `user_field_names=true`.
Field names must match the names below exactly, including casing.

Local Docker setup exposes Baserow at:

- Browser/API from host: `http://localhost:8080`
- App container URL: `http://host.docker.internal:8080`
- App container host override: `BASEROW_HOST_HEADER=localhost:8080`

The current local database has these table IDs:

| App table | Baserow table ID | Current rows |
| --- | ---: | ---: |
| Organizations | `654` | 5 |
| Locations | `655` | 5 |
| Users | `656` | 3 |
| Equipment | `657` | 3 |
| Tickets | `664` | 2 |
| Ticket Updates | `665` | 1 |
| Time Entries | `666` | 2 |

## Environment

Add these values to `.env` after creating the Baserow database and token:

```env
BASEROW_URL="http://localhost:8080"
BASEROW_DATABASE_TOKEN="..."
BASEROW_ORGANIZATIONS_TABLE_ID="654"
BASEROW_LOCATIONS_TABLE_ID="655"
BASEROW_USERS_TABLE_ID="656"
BASEROW_EQUIPMENT_TABLE_ID="657"
BASEROW_TICKETS_TABLE_ID="664"
BASEROW_TICKET_UPDATES_TABLE_ID="665"
BASEROW_TIME_ENTRIES_TABLE_ID="666"
BASEROW_PUBLIC_URL="http://localhost:8080"
BASEROW_JWT_SECRET="..."
```

When running the app in Docker Compose, `docker-compose.yml` overrides `BASEROW_URL` to `http://host.docker.internal:8080` and sets `BASEROW_HOST_HEADER=localhost:8080`.

The app shows demo data when Baserow environment variables are missing, but authenticated production use should configure all table IDs and `BASEROW_DATABASE_TOKEN`.

## Database Token

Create a Baserow database token with read, create, and update permissions for every table listed here. Delete permission is only required for admin user denial, which removes a pending user row.

## Organizations

Table ID: `654`

| Field | Type | Notes |
| --- | --- | --- |
| `UUID` | uuid | Baserow generated identifier field. |
| `active` | boolean | Whether the organization is active. |
| `type` | single select | Use `internal` or `client`. |
| `domain` | text | Email domain used to match pending users. |
| `primaryContact` | text | Human-readable contact name. |
| `Users` | link row | Links to rows in `Users`. Used on the client detail page. |
| `name` | text | Organization/client name. |
| `Equipment` | link row | Reverse link to equipment rows. |
| `Tickets` | link row | Reverse link to ticket rows. |
| `Locations` | link row | Reverse link to location rows. |

## Locations

Table ID: `655`

| Field | Type | Notes |
| --- | --- | --- |
| `UUID` | uuid | Baserow generated identifier field. |
| `organizationId` | link row | Links to `Organizations`. |
| `name` | text | Service location name. |
| `address` | long text | Street address or full address line. |
| `city` | text | City. |
| `state` | text | State/region. |
| `active` | boolean | Whether the location is active. |
| `Equipment` | link row | Reverse link to equipment rows. |
| `Tickets` | link row | Reverse link to ticket rows. |

Clients can have multiple linked locations. The admin client create/edit forms submit multiple location rows and create/update rows in this table.

## Users

Table ID: `656`

| Field | Type | Notes |
| --- | --- | --- |
| `email` | email | User email address. |
| `entraSubject` | text | Microsoft Entra subject identifier. |
| `active` | boolean | Pending users are inactive until approved. |
| `displayName` | text | User display name. |
| `role` | text | Expected values: `admin` or `client`. |
| `organizationId` | link row | Links to `Organizations`. |
| `Tickets` | link row | Reverse link to ticket rows. |

The app can resolve client users through either `Organizations.Users` or `Users.organizationId`.

## Equipment

Table ID: `657`

| Field | Type | Notes |
| --- | --- | --- |
| `UUID` | uuid | Baserow generated identifier field. |
| `organizationId` | link row | Links to `Organizations`. |
| `locationId` | link row | Links to `Locations`. |
| `assetTag` | text | Internal or client asset tag. |
| `deviceType` | text | Example: laptop, server, printer. |
| `make` | text | Manufacturer. |
| `model` | text | Model. |
| `serial` | text | Serial number. |
| `purchaseDate` | date | Purchase date. |
| `warrantyDate` | date | Warranty expiration date. |
| `status` | single select | `active`, `in repair`, `retired`, or `missing`. |
| `ownership` | single select | `company` or `client`. |
| `specs` | long text | Specs and operational notes. |
| `notes` | long text | Additional notes. |
| `Tickets` | link row | Reverse link to ticket rows. |

## Tickets

Table ID: `664`

| Field | Type | Notes |
| --- | --- | --- |
| `UUID` | uuid | Baserow generated identifier field. |
| `organizationId` | link row | Links to `Organizations`. |
| `equipmentId` | link row | Links to `Equipment`. |
| `locationId` | link row | Links to `Locations`. |
| `title` | text | Ticket title. |
| `description` | long text | Ticket details. |
| `priority` | single select | `low`, `normal`, `high`, or `urgent`. |
| `status` | single select | `new`, `assigned`, `in progress`, `waiting`, `resolved`, or `closed`. |
| `assignedAdminEmail` | text | Email for assigned admin. |
| `createdAt` | date | Stored as date/time by the app. |
| `updatedAt` | date | Stored as date/time by the app. |
| `TicketUpdates` | link row | Reverse link to ticket update rows. |
| `userId` | link row | Links to the requesting `Users` row. |

## Ticket Updates

Table ID: `665`

| Field | Type | Notes |
| --- | --- | --- |
| `UUID` | uuid | Baserow generated identifier field. |
| `ticketId` | link row | Links to `Tickets`. |
| `authorEmail` | text | Email for the update author. |
| `body` | long text | Update body. |
| `visibility` | single select | `public` or `internal`. |
| `createdAt` | date | Stored as date/time by the app. |
| `timeStart` | date | Optional work start date/time. |
| `timeEnd` | date | Optional work end date/time. |

## Time Entries

Table ID: `666`

| Field | Type | Notes |
| --- | --- | --- |
| `workDate` | date | Work date. |
| `adminEmail` | text | Admin email. |
| `timeIn` | date | Stored as date/time by the app. |
| `timeOut` | date | Stored as date/time by the app. |
| `lunchMinutes` | number | Lunch duration in minutes. |
| `mileage` | number | Mileage for the entry. |
| `notes` | long text | Work notes. |
| `total` | formula | Baserow-calculated total. |

## Relationship Summary

- `Organizations.Users` links organizations to users.
- `Users.organizationId` links each user back to an organization.
- `Locations.organizationId` links each location to an organization.
- `Equipment.organizationId` and `Equipment.locationId` link equipment to its client and service location.
- `Tickets.organizationId`, `Tickets.userId`, `Tickets.equipmentId`, and `Tickets.locationId` link tickets to their related records.
- `Ticket Updates.ticketId` links updates to their ticket.

## Quick Verification

Use the Baserow health endpoint to confirm the local service is running:

```powershell
curl.exe http://localhost:8080/api/_health/
```

Use the Baserow UI at `http://localhost:8080` to confirm table IDs and field names if the schema changes.
