# Backend Architecture

## Overview

The backend will be a layered Express application written in TypeScript. It will expose public read endpoints and protected admin CRUD endpoints backed by PostgreSQL through Prisma.

## Folder Structure

```text
apps/api/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
    constants/
    lib/
    middleware/
    routes/
    modules/
      auth/
      profile/
      contacts/
      homestay/
      services/
      closing/
      media/
    utils/
    app.ts
    server.ts
  uploads/
```

## Layering

- Route layer: endpoint wiring, validation middleware, auth middleware
- Controller layer: HTTP request and response handling
- Service layer: business logic and ordering rules
- Repository layer: Prisma queries and persistence details

## Middleware

- JSON body parsing
- Cookie parsing
- CORS with credentials
- Helmet security headers
- Request logging
- Auth cookie verification
- Global error handler
- `multer` upload handling for image endpoints

## Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": []
  }
}
```

## Upload Strategy

- Store uploaded files on disk under `apps/api/uploads`
- Generate unique filenames
- Persist metadata in `MediaAsset`
- Serve uploads through Express static middleware
- Restrict uploads to image mime types

## Security Strategy

- Password hashing with `bcryptjs`
- JWT signed with strong secret
- JWT delivered via HTTP-only cookie
- CORS limited to allowed frontend origins
- Image type and file size checks
- No internal error details returned to clients
