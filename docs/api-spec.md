# API Specification

## API Conventions

- Base prefix: `/api/v1`
- Resource names use plural nouns where appropriate
- Responses use a consistent envelope
- Admin routes require auth cookie
- Public routes return only active and visible content

## Auth Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Public Endpoints

- `GET /api/v1/public/site-content`
- `GET /api/v1/public/profile`
- `GET /api/v1/public/contacts`
- `GET /api/v1/public/homestay`
- `GET /api/v1/public/services`
- `GET /api/v1/public/closing`

## Admin Endpoints

### Profile

- `GET /api/v1/admin/profile`
- `PUT /api/v1/admin/profile`

### Contacts

- `GET /api/v1/admin/contacts`
- `POST /api/v1/admin/contacts`
- `GET /api/v1/admin/contacts/:contactId`
- `PATCH /api/v1/admin/contacts/:contactId`
- `DELETE /api/v1/admin/contacts/:contactId`

### Homestay

- `GET /api/v1/admin/homestay`
- `PUT /api/v1/admin/homestay`

### Homestay Images

- `GET /api/v1/admin/homestay-images`
- `POST /api/v1/admin/homestay-images`
- `PATCH /api/v1/admin/homestay-images/:imageId`
- `DELETE /api/v1/admin/homestay-images/:imageId`

### Services

- `GET /api/v1/admin/services`
- `POST /api/v1/admin/services`
- `GET /api/v1/admin/services/:serviceId`
- `PATCH /api/v1/admin/services/:serviceId`
- `DELETE /api/v1/admin/services/:serviceId`

### Closing

- `GET /api/v1/admin/closing`
- `PUT /api/v1/admin/closing`

### Media

- `GET /api/v1/admin/media`
- `POST /api/v1/admin/media`
- `PATCH /api/v1/admin/media/:mediaId`
- `DELETE /api/v1/admin/media/:mediaId`

## Validation Strategy

- `zod` schemas for body, params, and query
- Shared allowed platform values for contact methods
- URL and file validation at the API boundary
