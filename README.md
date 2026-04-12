# YouTrack API

A Node.js API service for interacting with YouTrack tickets.

## Features

- Fetch ticket content and comments by ticket ID
- Create a ticket as a subtask of an existing ticket
- Update the description of an existing ticket (Markdown supported)
- Fetch tickets changed within a date range
- Health endpoint for monitoring
- Environment variable configuration
- Error handling

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- YouTrack instance with API access

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd youtrack-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` template:

   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your YouTrack credentials:

   ```
   YOUTRACK_BASE_URL=https://youtrack.yourcompany.com
   YOUTRACK_API_TOKEN=your_permanent_token_here
   PORT=3000
   NODE_ENV=development
   ```

   You can generate a permanent token in YouTrack by going to your profile > Authentication > New Token.

## Usage

### Starting the server

```
npm run build
npm start
```

For development with auto-reload:

```
npm run dev
```

### API Endpoints

#### Health Check

```
GET /health
```

Example:

```
curl http://localhost:3000/health
```

Response:

```json
{ "status": "ok" }
```

---

#### Get Ticket Information

```
GET /api/ticket/:ticketId
```

Parameters:

- `ticketId`: The YouTrack ticket ID in the format `PROJECT-123`

Example:

```
curl http://localhost:3000/api/ticket/PROJECT-123
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "PROJECT-123",
    "summary": "Implement new feature",
    "description": "Detailed description",
    "created": "1/1/2024, 12:00:00 PM",
    "updated": "1/2/2024, 2:30:00 PM",
    "comments": [
      {
        "id": "comment-1",
        "text": "This is a comment",
        "author": "john.doe",
        "created": "1/2/2024, 1:00:00 PM"
      }
    ]
  }
}
```

---

#### Create Subtask

Creates a new ticket as a subtask of an existing ticket. The new ticket is always created with `Type = "User Story / New Feature"` and `Stage = "Backlog"`. The `Project`, `Stakeholder`, and `Technical object` custom fields are automatically inherited from the parent ticket.

```
POST /api/ticket/:parentTicketId/subtask
```

Parameters:

- `parentTicketId`: The parent ticket ID in the format `PROJECT-123`

Body (JSON):
| Field | Required | Description |
|---|---|---|
| `title` | Yes | Title of the new ticket |
| `description` | No | Description in Markdown format |

Example (PowerShell):

```powershell
curl.exe -X POST http://localhost:3000/api/ticket/PROJECT-123/subtask `
  -H "Content-Type: application/json" `
  -d '{"title": "My new feature", "description": "**Some** markdown description"}'
```

Example (CMD):

```cmd
curl -X POST http://localhost:3000/api/ticket/PROJECT-123/subtask -H "Content-Type: application/json" -d "{\"title\": \"My new feature\", \"description\": \"**Some** markdown description\"}"
```

Response (`201 Created`):

```json
{
  "status": "success",
  "data": {
    "id": "PROJECT-124",
    "parentId": "PROJECT-123",
    "warnings": []
  }
}
```

The `warnings` array is empty on full success. Non-fatal issues (e.g. failed subtask link) are reported there instead of returning an error.

---

#### Update Ticket Description

Sets (or replaces) the description of an existing ticket. The ticket must exist. Accepts plain text or Markdown.

```
PATCH /api/ticket/:ticketId/description
```

Parameters:

- `ticketId`: The ticket ID in the format `PROJECT-123`

Body (JSON):
| Field | Required | Description |
|---|---|---|
| `description` | Yes | New description — plain text or Markdown |

Example (PowerShell):

```powershell
curl.exe -X PATCH http://localhost:3000/api/ticket/PROJECT-123/description `
  -H "Content-Type: application/json" `
  -d '{"description": "## Overview\nThis ticket tracks the new payment flow.\n\n- Step 1\n- Step 2"}'
```

Example (CMD):

```cmd
curl -X PATCH http://localhost:3000/api/ticket/PROJECT-123/description -H "Content-Type: application/json" -d "{\"description\": \"## Overview\nThis ticket tracks the new payment flow.\"}"
```

Response (`200 OK`):

```json
{
  "status": "success",
  "data": {
    "id": "PROJECT-123"
  }
}
```

---

#### Get Tickets Changed in Date Range

```
GET /api/tickets/changes/:from/:to
```

Parameters:

- `from`: Start date in `YYYY-MM-DD` format
- `to`: End date in `YYYY-MM-DD` format

Example:

```
curl http://localhost:3000/api/tickets/changes/2024-01-01/2024-01-31
```

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": "PROJECT-123",
      "summary": "Implement new feature",
      "description": "Detailed description",
      "created": "1/1/2024, 12:00:00 PM",
      "updated": "1/15/2024, 9:00:00 AM",
      "comments": []
    }
  ]
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad Request (e.g., invalid ticket ID format)
- `401`: Unauthorized (invalid API token)
- `404`: Not Found (ticket doesn't exist)
- `500`: Internal Server Error

Example error response:

```json
{
  "status": "error",
  "message": "Ticket PROJECT-999 not found"
}
```

## Development

### Running Tests

```
npm test
```

### Building for Production

```
npm run build
```

This will compile TypeScript files to JavaScript in the `dist` directory.

## License

[MIT](LICENSE)
