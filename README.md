# YouTrack API

A Node.js API service that fetches ticket information from YouTrack.

## Features

- Fetch ticket content and comments from YouTrack by providing a ticket number
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
{
  "status": "ok"
}
```

#### Get Ticket Information

```
GET /api/ticket/:ticketId
```

Parameters:
- `ticketId`: The YouTrack ticket ID in the format PROJECT-123

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
    "description": "Detailed description of the feature",
    "status": "Open",
    "created": "2023-01-01T12:00:00.000Z",
    "updated": "2023-01-02T14:30:00.000Z",
    "comments": [
      {
        "id": "comment-1",
        "text": "This is a comment",
        "author": "john.doe",
        "created": "2023-01-02T13:00:00.000Z"
      }
    ]
  }
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
